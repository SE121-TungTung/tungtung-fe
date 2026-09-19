import React, { useState, useRef, useEffect } from 'react'
import { publicApi } from '@/lib/public'
import { useSession } from '@/stores/session.store'
import { useNavigate } from 'react-router-dom'
import s from './ChatbotWidget.module.css'

interface Message {
    role: 'user' | 'assistant'
    content: string
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

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, quotaExceeded])

    const handleSend = async () => {
        if (!input.trim() || quotaExceeded || isLoading) return

        const userMessage = input.trim()
        setInput('')

        // Optimistic UI update
        const newHistory = [
            ...messages,
            { role: 'user' as const, content: userMessage },
        ]
        setMessages(newHistory)
        setIsLoading(true)

        try {
            const response = await publicApi.chatbotAsk(userMessage, messages)
            if (response && response.reply) {
                setMessages([
                    ...newHistory,
                    { role: 'assistant', content: response.reply },
                ])
            } else {
                setMessages([
                    ...newHistory,
                    {
                        role: 'assistant',
                        content: 'Xin lỗi, tôi không thể trả lời lúc này.',
                    },
                ])
            }
        } catch (error: any) {
            // Check for 429 QUOTA_EXCEEDED
            if (error.status === 429 || error.message?.includes('429')) {
                setQuotaExceeded(true)
                // Remove the optimistic user message if we want, or keep it. Let's keep it and show error.
            } else {
                setMessages([
                    ...newHistory,
                    {
                        role: 'assistant',
                        content: 'Có lỗi xảy ra kết nối với máy chủ.',
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
        const message = `Bạn đã hết lượt hỏi (${limit}/${limit}).`
        const ctaText = isGuestStudent
            ? 'Liên hệ nâng cấp khóa học'
            : 'Đăng ký để mở khóa thêm lượt'
        const onClickAction = () => navigate(isGuestStudent ? '/' : '/login') // assuming '/' has the lead form or we redirect guest to login

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
                        <h4>TungTung AI Assistant</h4>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={s.closeBtn}
                        >
                            &times;
                        </button>
                    </div>

                    <div className={s.chatBody}>
                        {messages.length === 0 && (
                            <div className={s.emptyState}>
                                Xin chào! Tôi có thể giúp gì cho bạn về lộ trình
                                học IELTS hôm nay?
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`${s.messageWrapper} ${msg.role === 'user' ? s.userMsg : s.aiMsg}`}
                            >
                                <div className={s.messageBubble}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${s.messageWrapper} ${s.aiMsg}`}>
                                <div className={s.messageBubble}>
                                    Đang nhập...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                        {renderCTA()}
                    </div>

                    <div className={s.chatFooter}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập câu hỏi..."
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
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            )}
        </div>
    )
}
