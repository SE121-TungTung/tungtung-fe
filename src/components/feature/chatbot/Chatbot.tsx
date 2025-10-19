import React, { useState, useRef, useEffect } from 'react'
import s from './Chatbot.module.css'
import CloseIcon from '@/assets/X Mark.svg'
import SendIcon from '@/assets/Send Paper Plane.svg'

interface ChatbotProps {
    isOpen: boolean
    onClose: () => void
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
    const [messages, setMessages] = useState([
        { text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'bot' },
    ])
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(scrollToBottom, [messages])

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputValue.trim() === '') return

        const newMessages = [...messages, { text: inputValue, sender: 'user' }]
        setMessages(newMessages)
        setInputValue('')

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    text: 'Cảm ơn câu hỏi của bạn! Hiện tại tôi đang được phát triển.',
                    sender: 'bot',
                },
            ])
        }, 1000)
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
                    <h4>TungTung AI Assistant</h4>
                    <button
                        onClick={onClose}
                        className={s.closeBtn}
                        aria-label="Đóng chatbot"
                    >
                        <img src={CloseIcon} alt="Close" />
                    </button>
                </header>

                <div className={s.messagesContainer}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`${s.message} ${s[msg.sender]}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form className={s.inputArea} onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Nhập câu hỏi của bạn..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type="submit" aria-label="Gửi tin nhắn">
                        <img src={SendIcon} alt="Send" />
                    </button>
                </form>
            </div>
        </div>
    )
}
