import React, { useState, useRef, useEffect, memo } from 'react'
import s from './Chatbot.module.css'
import { API, getAccessToken } from '@/lib/api'
import CloseIcon from '@/assets/X Mark.svg'
import SendIcon from '@/assets/Send Paper Plane.svg'
import ResetIcon from '@/assets/Refresh History.svg'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatbotProps {
    isOpen: boolean
    onClose: () => void
}

interface ChatMessage {
    text: string
    sender: 'user' | 'bot'
}

const STORAGE_KEY = 'tungtung_chat_history'
const MAX_HISTORY_SEND = 6

const MessageList = memo(({ messages }: { messages: ChatMessage[] }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className={s.messagesContainer}>
            {messages.map((msg, index) => (
                <div key={index} className={`${s.message} ${s[msg.sender]}`}>
                    {msg.sender === 'bot' ? (
                        <div className={s.markdownContent}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.text}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        msg.text
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
})

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved
            ? JSON.parse(saved)
            : [{ text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' }]
    })

    const [inputValue, setInputValue] = useState('')
    const [isPending, setIsPending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const abortControllerRef = useRef<AbortController | null>(null)

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

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

        // Add a new empty bot response message that we will append to
        setMessages((prev) => [...prev, { text: '', sender: 'bot' }])

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
                }),
                signal: abortController.signal,
            })

            if (!response.ok) {
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
                        } catch (err) {
                            console.error(
                                'Lỗi phân tích cú pháp stream chunk:',
                                err
                            )
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Stream request aborted.')
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
            { text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' },
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
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <h4 title="Double click để xóa lịch sử">TungTung AI</h4>
                    </div>
                    <div>
                        <button
                            onClick={handleClearChat}
                            className={s.closeBtn}
                            aria-label="Xóa lịch sử"
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

                <MessageList messages={messages} />

                <form className={s.inputArea} onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Nhập câu hỏi của bạn..."
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
