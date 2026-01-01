import React, { useState, useRef, useEffect, memo } from 'react'
import { useMutation } from '@tanstack/react-query'
import s from './Chatbot.module.css'
import { chatbotApi } from '@/lib/chatbot'
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
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const chatMutation = useMutation({
        mutationFn: async (payload: { message: string; history: any[] }) => {
            return chatbotApi.askBot(payload.message, payload.history)
        },
        onSuccess: (data) => {
            setMessages((prev) => [
                ...prev,
                { text: data.reply, sender: 'bot' },
            ])
        },
        onError: () => {
            setMessages((prev) => [
                ...prev,
                {
                    text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
                    sender: 'bot',
                },
            ])
        },
    })

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() === '' || chatMutation.isPending) return

        const userText = inputValue.trim()

        const newMessages: ChatMessage[] = [
            ...messages,
            { text: userText, sender: 'user' },
        ]
        setMessages(newMessages)
        setInputValue('')

        const historyPayload = messages.slice(-MAX_HISTORY_SEND).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            content: msg.text,
        }))

        chatMutation.mutate({
            message: userText,
            history: historyPayload,
        })
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
                        disabled={chatMutation.isPending}
                        autoFocus
                    />
                    <button
                        type="submit"
                        aria-label="Gửi tin nhắn"
                        disabled={!inputValue.trim() || chatMutation.isPending}
                    >
                        <img src={SendIcon} alt="Send" />
                    </button>
                </form>
            </div>
        </div>
    )
}
