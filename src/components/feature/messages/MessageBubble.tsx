import React from 'react'
import s from './MessageBubble.module.css'
import type { Message, Participant } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'

interface MessageBubbleProps {
    message: Message
    isSent: boolean
    sender?: Participant
    showSenderName: boolean
    showAvatar: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isSent,
    sender,
    showSenderName,
    showAvatar,
}) => {
    const isSending = message.timestamp === 'Đang gửi...'
    return (
        <div className={`${s.bubbleWrapper} ${isSent ? s.sent : s.received}`}>
            <div className={s.avatarColumn}>
                {showAvatar && (
                    <img
                        src={sender?.avatarUrl || AvatarImg}
                        alt={sender?.name || 'Avatar'}
                        className={s.senderAvatar}
                        title={sender?.name}
                    />
                )}
            </div>

            <div className={s.bubbleGroup}>
                {showSenderName && (
                    <span className={s.senderName}>{sender?.name}</span>
                )}

                <div
                    className={`${s.bubble} ${isSending ? s.sending : ''}`}
                    title={message.timestamp}
                >
                    {message.text}
                </div>
            </div>
        </div>
    )
}
