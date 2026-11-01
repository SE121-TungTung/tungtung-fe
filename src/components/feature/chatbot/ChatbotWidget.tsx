import React, { useState, useRef, useEffect } from 'react'
import { publicApi } from '@/lib/public'
import { API, getAccessToken } from '@/lib/api'
import type { ChatbotSourceCitation } from '@/lib/chatbot'
import { useSession } from '@/stores/session.store'
import { useNavigate } from 'react-router-dom'
import RobotIcon from '@/assets/Robot.svg'
import BookOpenIcon from '@/assets/Book Open.svg'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import s from './ChatbotWidget.module.css'

interface Message {
    role: 'user' | 'assistant'
    content: string
    sources?: ChatbotSourceCitation[]
}

const WidgetCitationBadge = ({
    sources,
}: {
    sources: ChatbotSourceCitation[]
}) => {
    const [open, setOpen] = useState(false)
    const [activeIdx, setActiveIdx] = useState(0)

    if (!sources || sources.length === 0) return null

    return (
        <div className={s.citationBox}>
            <button
                type="button"
                className={s.citationBadge}
                onClick={() => setOpen((prev) => !prev)}
            >
                <img
                    src={BookOpenIcon}
                    alt=""
                    className={s.citationIcon}
                    aria-hidden="true"
                />
                <span>Nguồn trích dẫn ({sources.length})</span>
            </button>
            {open && sources[activeIdx] && (
                <div className={s.citationDropdown}>
                    <div className={s.citationPills}>
                        {sources.map((src, idx) => (
                            <button
                                key={`${src.doc_id}-${idx}`}
                                type="button"
                                className={`${s.citationPillItem} ${activeIdx === idx ? s.citationPillActive : ''}`}
                                onClick={() => setActiveIdx(idx)}
                            >
                                [{idx + 1}] {src.title}
                            </button>
                        ))}
                    </div>
                    <div className={s.citationCard}>
                        <div className={s.citationCardTitle}>
                            {sources[activeIdx].title}
                        </div>
                        <p className={s.citationCardSnippet}>
                            &ldquo;{sources[activeIdx].snippet}&rdquo;
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ChatbotWidget() {
    const navigate = useNavigate()
    const { isAuthenticated, user } = useSession()

    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [quotaExceeded, setQuotaExceeded] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, quotaExceeded])

    const handleSend = async () => {
        if (!input.trim() || quotaExceeded || isLoading) return

        const userMessage = input.trim()
        setInput('')

        const newHistory: Message[] = [
            ...messages,
            { role: 'user', content: userMessage },
        ]
        setMessages([
            ...newHistory,
            { role: 'assistant', content: '', sources: [] },
        ])
        setIsLoading(true)

        try {
            const accessToken = getAccessToken()
            const streamUrl = `${API.replace(/\/$/, '')}/api/v1/public/chatbot/ask/stream`

            const response = await fetch(streamUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : {}),
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-6).map((m) => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        content: m.content,
                    })),
                    retrieval_mode: 'hybrid_rerank',
                }),
            })

            if (response.status === 429) {
                setQuotaExceeded(true)
                setMessages(newHistory)
                return
            }

            if (response.ok && response.body) {
                const reader = response.body.getReader()
                const decoder = new TextDecoder('utf-8')
                let buffer = ''

                while (true) {
                    const { value, done } = await reader.read()
                    if (done) break

                    buffer += decoder.decode(value, { stream: true })
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || ''

                    for (const line of lines) {
                        const cleanLine = line.trim()
                        if (cleanLine.startsWith('data: ')) {
                            try {
                                const parsed = JSON.parse(
                                    cleanLine.substring(6)
                                )
                                if (
                                    parsed.sources &&
                                    Array.isArray(parsed.sources)
                                ) {
                                    setMessages((prev) => {
                                        const next = [...prev]
                                        const last = next[next.length - 1]
                                        if (last && last.role === 'assistant') {
                                            last.sources = parsed.sources
                                        }
                                        return next
                                    })
                                }
                                if (parsed.text) {
                                    setMessages((prev) => {
                                        const next = [...prev]
                                        const last = next[next.length - 1]
                                        if (last && last.role === 'assistant') {
                                            last.content += parsed.text
                                        }
                                        return next
                                    })
                                }
                            } catch {
                                // ignore malformed chunk
                            }
                        }
                    }
                }
            } else {
                const fallback = await publicApi.chatbotAsk(
                    userMessage,
                    messages
                )
                setMessages([
                    ...newHistory,
                    {
                        role: 'assistant',
                        content:
                            fallback?.reply ||
                            'Xin lỗi, tôi không thể trả lời lúc này.',
                        sources: fallback?.sources || [],
                    },
                ])
            }
        } catch (error: unknown) {
            const errObj = error as { status?: number; message?: string }
            if (errObj?.status === 429 || errObj?.message?.includes('429')) {
                setQuotaExceeded(true)
                setMessages(newHistory)
            } else {
                setMessages([
                    ...newHistory,
                    {
                        role: 'assistant',
                        content: 'Có lỗi xảy ra khi kết nối với máy chủ.',
                    },
                ])
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend()
        }
    }

    const renderCTA = () => {
        if (!quotaExceeded) return null

        const isGuestStudent = isAuthenticated && user?.role === 'guest_student'
        const limit = isGuestStudent ? 10 : 5
        const message = `Bạn đã hết lượt hỏi miễn phí hôm nay (${limit}/${limit}).`
        const ctaText = isGuestStudent
            ? 'Liên hệ nâng cấp khóa học'
            : 'Đăng ký để mở khóa thêm lượt'
        const onClickAction = () => navigate(isGuestStudent ? '/' : '/login')

        return (
            <div className={s.ctaOverlay}>
                <div className={s.ctaBox}>
                    <p className={s.ctaMessage}>{message}</p>
                    <button className={s.ctaButton} onClick={onClickAction}>
                        {ctaText}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={s.widgetContainer}>
            {isOpen ? (
                <div className={s.chatWindow}>
                    <div className={s.chatHeader}>
                        <div className={s.headerTitleWrap}>
                            <h4>TungTung AI Assistant</h4>
                            <span className={s.headerBadge}>Hybrid RAG</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={s.closeBtn}
                            aria-label="Đóng"
                        >
                            &times;
                        </button>
                    </div>

                    <div className={s.chatBody}>
                        {messages.length === 0 && (
                            <div className={s.emptyState}>
                                Xin chào! Tôi có thể giúp gì cho bạn về lộ trình
                                khóa học IELTS, học phí và quy chế học vụ hôm
                                nay?
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${s.messageWrapper} ${msg.role === 'user' ? s.userMsg : s.aiMsg}`}
                            >
                                <div className={s.messageBubble}>
                                    {msg.role === 'assistant' ? (
                                        <>
                                            <div className={s.markdownBody}>
                                                {msg.content ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[
                                                            remarkGfm,
                                                        ]}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                ) : isLoading &&
                                                  idx ===
                                                      messages.length - 1 ? (
                                                    <span>
                                                        Đang phản hồi...
                                                    </span>
                                                ) : null}
                                            </div>
                                            {msg.sources &&
                                                msg.sources.length > 0 && (
                                                    <WidgetCitationBadge
                                                        sources={msg.sources}
                                                    />
                                                )}
                                        </>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                        {renderCTA()}
                    </div>

                    <div className={s.chatFooter}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập câu hỏi về IELTS, học phí..."
                            disabled={quotaExceeded || isLoading}
                            className={s.inputField}
                        />
                        <button
                            onClick={handleSend}
                            disabled={
                                !input.trim() || quotaExceeded || isLoading
                            }
                            className={s.sendBtn}
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className={s.floatingBtn}
                    title="Chat với AI"
                    aria-label="Chat với AI"
                >
                    <img src={RobotIcon} alt="Chatbot" />
                </button>
            )}
        </div>
    )
}
