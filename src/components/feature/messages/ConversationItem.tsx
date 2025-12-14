import React from 'react'
import s from './ConversationItem.module.css'
import { GroupAvatar } from './GroupAvatar'
import type { Conversation } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

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
    const otherParticipant = conversation.participants.find(
        (p) => p.id !== currentUserId
    )

    const displayName = conversation.isGroup
        ? conversation.name
        : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`

    const avatarUrl = conversation.isGroup
        ? conversation.avatarUrl
        : otherParticipant?.avatarUrl

    const isOnline = !conversation.isGroup && otherParticipant?.isOnline

    return (
        <div
            className={`${s.item} ${isActive ? s.active : ''}`}
            onClick={onClick}
        >
            <div className={s.avatarWrapper}>
                {conversation.isGroup ? (
                    <GroupAvatar
                        participants={conversation.participants}
                        size="md"
                    />
                ) : (
                    <img
                        src={avatarUrl || AvatarImg}
                        alt="Avatar"
                        className={s.headerAvatar}
                    />
                )}
                {isOnline && (
                    <span className={s.onlineBadge} title="Online"></span>
                )}
            </div>
            <div className={s.content}>
                <div className={s.header}>
                    <span className={s.name}>{displayName}</span>
                    <span className={s.timestamp}>
                        {conversation.lastMessage
                            ? formatDistanceToNow(
                                  new Date(conversation.lastMessage.createdAt),
                                  { addSuffix: false, locale: vi }
                              )
                            : ''}
                    </span>
                </div>
                <p className={s.lastMessage}>
                    <p
                        className={`${s.preview} ${conversation.unreadCount > 0 ? s.unread : ''}`}
                    >
                        {conversation.lastMessage?.content ||
                            'Chưa có tin nhắn'}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <span className={s.badge}>
                            {conversation.unreadCount}
                        </span>
                    )}
                </p>
            </div>
        </div>
    )
}
