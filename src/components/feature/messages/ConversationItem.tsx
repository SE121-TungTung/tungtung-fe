// src/components/feature/messages/ConversationItem.tsx
import React from 'react'
import s from './ConversationItem.module.css'
import { GroupAvatar } from './GroupAvatar' // Component avatar nhóm
import type { Conversation } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'

interface ConversationItemProps {
    conversation: Conversation
    isActive: boolean
    onClick: () => void
    currentUserId: string
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    isActive,
    onClick,
    currentUserId,
}) => {
    const otherParticipant = !conversation.isGroup
        ? conversation.participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = conversation.isGroup
        ? conversation.groupName
        : otherParticipant?.name || 'Unknown User'

    const avatar = conversation.isGroup ? (
        <GroupAvatar participants={conversation.participants} />
    ) : (
        <img
            src={otherParticipant?.avatarUrl || AvatarImg}
            alt={displayName}
            className={s.avatarImg}
        />
    )

    const isOnline = !conversation.isGroup && otherParticipant?.onlineStatus

    return (
        <div
            className={`${s.item} ${isActive ? s.active : ''}`}
            onClick={onClick}
        >
            <div className={s.avatarWrapper}>
                {avatar}
                {isOnline && (
                    <span className={s.onlineBadge} title="Online"></span>
                )}
            </div>
            <div className={s.content}>
                <div className={s.header}>
                    <span className={s.name}>{displayName}</span>
                    <span className={s.timestamp}>
                        {conversation.lastMessageTimestamp}
                    </span>
                </div>
                <p className={s.lastMessage}>{conversation.lastMessage}</p>
            </div>
        </div>
    )
}
