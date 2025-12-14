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
    showAvatar,
    showSenderName,
}) => {
    const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`
        : 'Unknown'

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

                    <span className={s.time}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            </div>
        </div>
    )
}
