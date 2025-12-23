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

const getMessageTime = (createdAt?: string): string => {
    if (!createdAt) return ''

    try {
        return new Date(createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch (error) {
        console.error('Error parsing date:', createdAt, error)
        return ''
    }
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isSent,
    sender,
    showAvatar,
    showSenderName,
}) => {
    const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`
        : 'Unknown'

    const messageTime = getMessageTime(message.createdAt)

    return (
        <div className={`${s.bubbleWrapper} ${isSent ? s.sent : s.received}`}>
            <div className={s.avatarColumn}>
                {showAvatar && (
                    <img
                        src={sender?.avatarUrl || AvatarImg}
                        alt={'Avatar'}
                        className={s.senderAvatar}
                        title={senderName}
                    />
                )}
            </div>

            <div className={s.bubbleGroup}>
                {showSenderName && (
                    <span className={s.senderName}>{senderName}</span>
                )}

                <div className={`${s.bubble}`}>
                    <p className={s.text}>{message.content}</p>

                    {messageTime && (
                        <span className={s.time}>{messageTime}</span>
                    )}
                </div>
            </div>
        </div>
    )
}
