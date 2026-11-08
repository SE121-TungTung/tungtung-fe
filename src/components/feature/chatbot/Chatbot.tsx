import React, { useState, useRef, useEffect, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Chatbot.module.css'
import { API, getAccessToken } from '@/lib/api'
import type {
    AgentToolCallEvent,
    AgentUiActionEvent,
    ChatbotSourceCitation,
    RetrievalMode,
} from '@/lib/chatbot'
import { useSession } from '@/stores/session.store'
import CloseIcon from '@/assets/X Mark.svg'
import SendIcon from '@/assets/Send Paper Plane.svg'
import ResetIcon from '@/assets/Refresh History.svg'
import BookOpenIcon from '@/assets/Book Open.svg'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatbotProps {
    isOpen: boolean
    onClose: () => void
}

interface ChatMessage {
    text: string
    sender: 'user' | 'bot'
    sources?: ChatbotSourceCitation[]
    toolCalls?: AgentToolCallEvent[]
    uiActions?: AgentUiActionEvent[]
    fallbackNotice?: string
}

const STORAGE_KEY = 'tungtung_chat_history_v2'
const MAX_HISTORY_SEND = 6

const CitationBadgeGroup = ({
    sources,
}: {
    sources: ChatbotSourceCitation[]
}) => {
    const [expanded, setExpanded] = useState(false)
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

    if (!sources || sources.length === 0) return null

    return (
        <div className={s.citationWrapper}>
            <button
                type="button"
                className={`${s.citationBadgeBtn} ${expanded ? s.citationBadgeActive : ''}`}
                onClick={() => {
                    setExpanded((prev) => !prev)
                    if (!expanded && selectedIdx === null) {
                        setSelectedIdx(0)
                    }
                }}
            >
                <img
                    src={BookOpenIcon}
                    alt=""
                    className={s.citationIcon}
                    aria-hidden="true"
                />
                <span>Nguồn trích dẫn ({sources.length})</span>
            </button>

            {expanded && (
                <div className={s.citationPanel}>
                    <div className={s.citationTabs}>
                        {sources.map((src, idx) => (
                            <button
                                key={`${src.doc_id}-${idx}`}
                                type="button"
                                className={`${s.citationTab} ${selectedIdx === idx ? s.citationTabActive : ''}`}
                                onClick={() => setSelectedIdx(idx)}
                            >
                                [{idx + 1}] {src.title}
                            </button>
                        ))}
                    </div>
                    {selectedIdx !== null && sources[selectedIdx] && (
                        <div className={s.citationDetail}>
                            <div className={s.citationDetailHeader}>
                                <span className={s.citationDocTitle}>
                                    {sources[selectedIdx].title}
                                </span>
                                <span className={s.citationCategoryTag}>
                                    {sources[selectedIdx].doc_category ===
                                    'learning'
                                        ? 'Học thuật IELTS'
                                        : 'Quy chế & Học vụ'}
                                </span>
                            </div>
                            <p className={s.citationSnippet}>
                                &ldquo;{sources[selectedIdx].snippet}&rdquo;
                            </p>
                            <div className={s.citationMeta}>
                                <span>
                                    Tệp: {sources[selectedIdx].filename}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const AgentToolStatusList = ({
    toolCalls,
}: {
    toolCalls?: AgentToolCallEvent[]
}) => {
    if (!toolCalls || toolCalls.length === 0) return null

    return (
        <div className={s.toolStatusList}>
            {toolCalls.map((tc, idx) => {
                const isRunning = tc.status === 'running'
                return (
                    <div
                        key={`${tc.tool}-${idx}`}
                        className={`${s.toolStatusPill} ${isRunning ? s.toolStatusRunning : s.toolStatusDone}`}
                    >
                        <span
                            className={
                                isRunning ? s.toolSpinnerDot : s.toolCheckDot
                            }
                            aria-hidden="true"
                        />
                        <span>{tc.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

const AgentNavigationBadges = ({
    uiActions,
    onNavigate,
}: {
    uiActions?: AgentUiActionEvent[]
    onNavigate: (route: string) => void
}) => {
    if (!uiActions || uiActions.length === 0) return null

    return (
        <div className={s.uiActionList}>
            {uiActions.map((act, idx) => (
                <button
                    key={`${act.route_key}-${idx}`}
                    type="button"
                    className={s.uiActionBtn}
                    onClick={() => onNavigate(act.route)}
                >
                    <span>Đã chuyển đến: {act.label}</span>
                    <span className={s.uiActionRouteTag}>{act.route}</span>
                </button>
            ))}
        </div>
    )
}

const MessageList = memo(
    ({
        messages,
        isPending,
        onNavigate,
    }: {
        messages: ChatMessage[]
        isPending: boolean
        onNavigate: (route: string) => void
    }) => {
        const messagesEndRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, [messages, isPending])

        return (
            <div className={s.messagesContainer}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`${s.message} ${s[msg.sender]}`}
                    >
                        {msg.sender === 'bot' ? (
                            <>
                                {msg.toolCalls && msg.toolCalls.length > 0 && (
                                    <AgentToolStatusList
                                        toolCalls={msg.toolCalls}
                                    />
                                )}
                                {msg.fallbackNotice && (
                                    <div className={s.fallbackBanner}>
                                        {msg.fallbackNotice}
                                    </div>
                                )}
                                <div className={s.markdownContent}>
                                    {msg.text ? (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    ) : isPending &&
                                      index === messages.length - 1 ? (
                                        <div className={s.typingIndicator}>
                                            <span className={s.typingDot} />
                                            <span className={s.typingDot} />
                                            <span className={s.typingDot} />
                                        </div>
                                    ) : null}
                                </div>
                                {msg.uiActions && msg.uiActions.length > 0 && (
                                    <AgentNavigationBadges
                                        uiActions={msg.uiActions}
                                        onNavigate={onNavigate}
                                    />
                                )}
                                {msg.sources && msg.sources.length > 0 && (
                                    <CitationBadgeGroup sources={msg.sources} />
                                )}
                            </>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        )
    }
)

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
    const navigate = useNavigate()
    const user = useSession((state) => state.user)
    const isStudentAgent = user?.role === 'student'

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {
                // ignore malformed storage
            }
        }
        return [
            {
                text: 'Xin chào! Tôi là Trợ lý ảo TungTung AI. Tôi có thể hỗ trợ bạn tra cứu lộ trình IELTS, quy chế đào tạo, xem lịch học, bài tập, thông báo hoặc chuyển nhanh đến trang bạn cần.',
                sender: 'bot',
            },
        ]
    })

    const [inputValue, setInputValue] = useState('')
    const [isPending, setIsPending] = useState(false)
    const [retrievalMode] = useState<RetrievalMode>('hybrid_rerank')
    const abortControllerRef = useRef<AbortController | null>(null)

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    }, [messages])

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() === '' || isPending) return

        const userText = inputValue.trim()

        const newMessages: ChatMessage[] = [
            ...messages,
            { text: userText, sender: 'user' },
        ]
        setMessages(newMessages)
        setInputValue('')
        setIsPending(true)

        // Add empty bot response placeholder for real-time token streaming
        setMessages((prev) => [
            ...prev,
            {
                text: '',
                sender: 'bot',
                sources: [],
                toolCalls: [],
                uiActions: [],
            },
        ])

        const historyPayload = messages.slice(-MAX_HISTORY_SEND).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            content: msg.text,
        }))

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        try {
            const accessToken = getAccessToken()
            const url = `${API.replace(/\/$/, '')}/api/v1/chatbot/ask/stream`

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : {}),
                },
                body: JSON.stringify({
                    message: userText,
                    history: historyPayload,
                    retrieval_mode: retrievalMode,
                    top_k: 4,
                }),
                signal: abortController.signal,
            })

            if (!response.ok) {
                if (response.status === 403 || response.status === 429) {
                    setMessages((prev) => {
                        const next = [...prev]
                        const lastMsg = next[next.length - 1]
                        if (lastMsg && lastMsg.sender === 'bot') {
                            lastMsg.text =
                                '**Đã hết lượt sử dụng AI miễn phí hôm nay.**\n\nNâng cấp tài khoản hoặc đăng nhập để tiếp tục sử dụng không giới hạn nhé!'
                        }
                        return next
                    })
                    setIsPending(false)
                    return
                }
                throw new Error('Lỗi kết nối máy chủ')
            }

            if (!response.body) {
                throw new Error('Dữ liệu stream không khả dụng')
            }

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
                            const parsed = JSON.parse(cleanLine.substring(6))

                            // 1. Sự kiện trạng thái công cụ Agent (tool_call)
                            if (parsed.tool_call) {
                                const tc =
                                    parsed.tool_call as AgentToolCallEvent
                                setMessages((prev) => {
                                    const next = [...prev]
                                    const lastMsg = next[next.length - 1]
                                    if (lastMsg && lastMsg.sender === 'bot') {
                                        const existing = [
                                            ...(lastMsg.toolCalls || []),
                                        ]
                                        const matchIdx = existing.findIndex(
                                            (item) =>
                                                item.tool === tc.tool &&
                                                item.status === 'running'
                                        )
                                        if (
                                            matchIdx >= 0 &&
                                            tc.status !== 'running'
                                        ) {
                                            existing[matchIdx] = tc
                                        } else {
                                            existing.push(tc)
                                        }
                                        lastMsg.toolCalls = existing
                                    }
                                    return next
                                })
                            }

                            // 2. Sự kiện điều hướng giao diện (ui_action)
                            if (parsed.ui_action) {
                                const act =
                                    parsed.ui_action as AgentUiActionEvent
                                if (act.action === 'navigate' && act.route) {
                                    navigate(act.route)
                                    setMessages((prev) => {
                                        const next = [...prev]
                                        const lastMsg = next[next.length - 1]
                                        if (
                                            lastMsg &&
                                            lastMsg.sender === 'bot'
                                        ) {
                                            const currentActions = [
                                                ...(lastMsg.uiActions || []),
                                            ]
                                            if (
                                                !currentActions.some(
                                                    (a) => a.route === act.route
                                                )
                                            ) {
                                                currentActions.push(act)
                                            }
                                            lastMsg.uiActions = currentActions
                                        }
                                        return next
                                    })
                                }
                            }

                            // 3. Sự kiện nguồn trích dẫn RAG (sources)
                            if (
                                parsed.sources &&
                                Array.isArray(parsed.sources)
                            ) {
                                setMessages((prev) => {
                                    const next = [...prev]
                                    const lastMsg = next[next.length - 1]
                                    if (lastMsg && lastMsg.sender === 'bot') {
                                        lastMsg.sources = parsed.sources
                                    }
                                    return next
                                })
                            }

                            // 4. Sự kiện văn bản phản hồi (text)
                            if (parsed.text) {
                                setMessages((prev) => {
                                    const next = [...prev]
                                    const lastMsg = next[next.length - 1]
                                    if (lastMsg && lastMsg.sender === 'bot') {
                                        lastMsg.text += parsed.text
                                    }
                                    return next
                                })
                            }

                            // 5. Sự kiện kết thúc lượt (done) kèm cảnh báo chuyển về RAG nếu hết hạn mức Agent
                            if (
                                parsed.done &&
                                parsed.mode === 'rag_fallback' &&
                                parsed.fallback_reason &&
                                parsed.fallback_reason !==
                                    'role_or_flag_rag_mode'
                            ) {
                                setMessages((prev) => {
                                    const next = [...prev]
                                    const lastMsg = next[next.length - 1]
                                    if (lastMsg && lastMsg.sender === 'bot') {
                                        lastMsg.fallbackNotice =
                                            'Đã chuyển sang chế độ hỏi đáp tri thức tiêu chuẩn (hết hạn mức công cụ Agent tạm thời).'
                                    }
                                    return next
                                })
                            }
                        } catch (err) {
                            console.error(
                                'Lỗi phân tích cú pháp stream chunk:',
                                err
                            )
                        }
                    }
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') {
                return
            }
            console.error('Lỗi khi streaming chatbot:', error)
            setMessages((prev) => {
                const next = [...prev]
                const lastMsg = next[next.length - 1]
                if (lastMsg && lastMsg.sender === 'bot') {
                    lastMsg.text =
                        lastMsg.text ||
                        'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.'
                }
                return next
            })
        } finally {
            setIsPending(false)
            abortControllerRef.current = null
        }
    }

    const handleClearChat = () => {
        const defaultMsg: ChatMessage[] = [
            {
                text: 'Xin chào! Tôi là Trợ lý ảo TungTung AI. Tôi có thể hỗ trợ bạn tra cứu lộ trình IELTS, quy chế đào tạo, xem lịch học, bài tập, thông báo hoặc chuyển nhanh đến trang bạn cần.',
                sender: 'bot',
            },
        ]
        setMessages(defaultMsg)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMsg))
    }

    return (
        <div
            className={`${s.overlay} ${isOpen ? s.open : ''}`}
            onClick={onClose}
        >
            <div
                className={`${s.chatWindow} ${isOpen ? s.open : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className={s.header}>
                    <div className={s.headerTitleGroup}>
                        <h4>TungTung AI</h4>
                        <span className={s.ragModePill}>
                            {isStudentAgent ? 'Student Agent' : 'Hybrid RAG'}
                        </span>
                    </div>
                    <div className={s.headerActions}>
                        <button
                            onClick={handleClearChat}
                            className={s.closeBtn}
                            aria-label="Xóa lịch sử"
                            title="Làm mới cuộc trò chuyện"
                        >
                            <img src={ResetIcon} alt="Reset" />
                        </button>
                        <button
                            onClick={onClose}
                            className={s.closeBtn}
                            aria-label="Đóng chatbot"
                        >
                            <img src={CloseIcon} alt="Close" />
                        </button>
                    </div>
                </header>

                <MessageList
                    messages={messages}
                    isPending={isPending}
                    onNavigate={(route) => navigate(route)}
                />

                <form className={s.inputArea} onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder={
                            isStudentAgent
                                ? 'Hỏi bài tập, lịch học, mở trang hoặc tra cứu IELTS...'
                                : 'Nhập câu hỏi về học vụ, lộ trình IELTS...'
                        }
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isPending}
                        autoFocus
                    />
                    <button
                        type="submit"
                        aria-label="Gửi tin nhắn"
                        disabled={!inputValue.trim() || isPending}
                    >
                        <img src={SendIcon} alt="Send" />
                    </button>
                </form>
            </div>
        </div>
    )
}
