import React, { useRef, useEffect, useState } from 'react'
import s from './ChatWindow.module.css'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import type { Conversation, Message, Participant } from '@/types/message.types'

import AvatarImg from '@/assets/avatar-placeholder.png'
import HamburgerIcon from '@/assets/Menu Circle.svg'
import BackIcon from '@/assets/arrow-left.svg'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { GroupAvatar } from './GroupAvatar'

interface ChatWindowProps {
    conversation: Conversation
    messages: Message[]
    currentUserId: string
    onCloseChat: () => void
    onToggleDetails: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    messages: initialMessages,
    currentUserId,
    onCloseChat,
    onToggleDetails,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [messages, setMessages] = useState(initialMessages)

    const otherParticipant = !conversation.isGroup
        ? conversation.participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = conversation.isGroup
        ? conversation.groupName
        : otherParticipant?.name || 'Unknown'

    const avatar = conversation.isGroup ? (
        <GroupAvatar participants={conversation.participants} />
    ) : (
        <img
            src={otherParticipant?.avatarUrl || AvatarImg}
            alt={displayName}
            className={s.avatarImg}
        />
    )

    const displayStatus = conversation.isGroup
        ? `${conversation.participants.length} thành viên`
        : otherParticipant?.onlineStatus
          ? 'Online'
          : 'Offline'

    const isOnline = !conversation.isGroup && otherParticipant?.onlineStatus

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
    }, [messages])

    // --- Logic Gửi Tin Nhắn (Optimistic UI) ---
    const handleSendMessage = (text: string) => {
        // 1. Tạo tin nhắn giả (optimistic)
        const optimisticMessage: Message = {
            id: `temp_${Date.now()}`, // ID tạm
            senderId: currentUserId,
            text,
            timestamp: 'Đang gửi...',
            // status: 'sending',
        }

        // 2. Cập nhật UI ngay lập tức
        setMessages((prevMessages) => [...prevMessages, optimisticMessage])

        // 3. Gửi API (Mô phỏng)
        console.log('API: Gửi tin nhắn...', optimisticMessage)
        setTimeout(() => {
            // 4. API trả về thành công
            const realMessage: Message = {
                ...optimisticMessage,
                id: `m_${Date.now()}`, // ID thật từ server
                timestamp: new Date().toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                }), // Timestamp thật
                // status: 'sent',
            }

            // Cập nhật lại tin nhắn "đang gửi" bằng tin nhắn "thật"
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === optimisticMessage.id ? realMessage : msg
                )
            )
            console.log('API: Gửi thành công!', realMessage)

            // 4b. Xử lý API thất bại (ví dụ)
            // setMessages(prev => prev.map(msg =>
            //     msg.id === optimisticMessage.id ? { ...msg, status: 'failed', timestamp: 'Gửi lỗi' } : msg
            // ))
        }, 1000)
    }

    return (
        <div className={s.window}>
            <header className={s.header}>
                <ButtonGhost
                    size="sm"
                    mode="light"
                    className={s.backButton}
                    onClick={onCloseChat}
                >
                    <img src={BackIcon} alt="Back" />
                </ButtonGhost>

                <div className={s.userInfo}>
                    <div className={s.avatarWrapper}>
                        {avatar}
                        {isOnline && (
                            <span
                                className={s.onlineBadge}
                                title="Online"
                            ></span>
                        )}
                    </div>

                    <div>
                        <div className={s.name}>{displayName}</div>
                        <div className={s.status}>{displayStatus}</div>
                    </div>
                </div>

                <ButtonGhost
                    size="sm"
                    mode="light"
                    className={s.menuButton}
                    onClick={onToggleDetails}
                >
                    <img src={HamburgerIcon} alt="Menu" />
                </ButtonGhost>
            </header>

            <div className={s.body}>
                {messages.map((msg, index) => {
                    const isSent = msg.senderId === currentUserId
                    let sender: Participant | undefined = undefined
                    let showSenderInfo = false

                    if (!isSent) {
                        if (conversation.isGroup) {
                            sender = conversation.participants.find(
                                (p) => p.id === msg.senderId
                            )
                            if (
                                index === 0 ||
                                messages[index - 1].senderId !== msg.senderId
                            ) {
                                showSenderInfo = true
                            }
                        } else {
                            sender = otherParticipant!
                            if (
                                index === messages.length - 1 ||
                                messages[index + 1].senderId === currentUserId
                            ) {
                                showSenderInfo = true
                            }
                        }
                    }

                    return (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isSent={isSent}
                            sender={sender}
                            showSenderName={
                                conversation.isGroup && showSenderInfo
                            }
                            showAvatar={!isSent && showSenderInfo}
                        />
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <footer className={s.footer}>
                <ChatInput onSendMessage={handleSendMessage} />
            </footer>
        </div>
    )
}
