import { useEffect, useRef, useState } from 'react'
import type { Conversation, Message } from '@/pages/messages/mockData'
import styles from './ChatWindow.module.css'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
    conversation: Conversation
    messages: Message[]
    currentUserId: string
}

export function ChatWindow({
    conversation,
    messages,
    currentUserId,
}: ChatWindowProps) {
    // Lấy thông tin người đối thoại
    const participant = conversation.participants.find(
        (p) => p.id !== currentUserId
    )

    // State để lưu tin nhắn (bao gồm cả tin nhắn mới)
    const [messageList, setMessageList] = useState(messages)

    // Ref để tự động cuộn xuống
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messageList]) // Cuộn khi danh sách tin nhắn thay đổi

    const handleSend = (text: string) => {
        const newMessage: Message = {
            id: `msg_${Math.random()}`,
            senderId: currentUserId,
            text,
            timestamp: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        }
        setMessageList((prev) => [...prev, newMessage])
    }

    if (!participant) {
        return (
            <div className={styles.window}>
                <div className={styles.noChat}>Đã xảy ra lỗi</div>
            </div>
        )
    }

    return (
        <div className={styles.window}>
            {/* Header của Chat */}
            <header className={styles.header}>
                <img
                    src={participant.avatarUrl}
                    alt={participant.name}
                    className={styles.avatar}
                />
                <span className={styles.name}>{participant.name}</span>
                {/* Bạn có thể thêm các nút (call, info...) ở đây */}
            </header>

            {/* Danh sách tin nhắn */}
            <div className={styles.messageList}>
                {messageList.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isSentByCurrentUser={msg.senderId === currentUserId}
                    />
                ))}
                {/* Element trống để cuộn xuống */}
                <div ref={messagesEndRef} />
            </div>

            {/* Ô nhập liệu */}
            <div className={styles.inputArea}>
                <ChatInput onSend={handleSend} />
            </div>
        </div>
    )
}
