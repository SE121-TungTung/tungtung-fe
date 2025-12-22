import React, { useMemo } from 'react'
import s from './ConversationItem.module.css'
import { GroupAvatar } from './GroupAvatar'
import type { Conversation } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import DefaultAvatar from '@/assets/avatar-placeholder.png'

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
    // ✅ FIX: Use correct field names
    const displayName = conversation.name || 'Chưa đặt tên'
    const displayAvatar = conversation.avatarUrl || DefaultAvatar

    // ✅ FIX: For direct chats, find other participant
    const otherParticipant = useMemo(() => {
        if (!conversation.isGroup && conversation.participants.length > 0) {
            return conversation.participants.find((p) => p.id !== currentUserId)
        }
        return null
    }, [conversation.isGroup, conversation.participants, currentUserId])

    // ✅ FIX: Show online status only for direct chats
    const isOnline = !conversation.isGroup && otherParticipant?.isOnline

    // ✅ FIX: Format timestamp correctly
    const formattedTime = useMemo(() => {
        if (!conversation.lastMessage?.createdAt) return ''

        try {
            return formatDistanceToNow(
                new Date(conversation.lastMessage.createdAt),
                { addSuffix: false, locale: vi }
            )
        } catch (error) {
            console.error('Invalid date:', conversation.lastMessage.createdAt)
            return ''
        }
    }, [conversation.lastMessage?.createdAt])

    // ✅ FIX: Message preview with proper truncation
    const messagePreview = useMemo(() => {
        if (!conversation.lastMessage?.content) {
            return 'Chưa có tin nhắn'
        }

        const content = conversation.lastMessage.content
        const maxLength = 50
        return content.length > maxLength
            ? `${content.substring(0, maxLength)}...`
            : content
    }, [conversation.lastMessage?.content])

    return (
        <div
            className={`${s.item} ${isActive ? s.active : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick()
                }
            }}
        >
            <div className={s.avatarWrapper}>
                {conversation.isGroup ? (
                    // ✅ TODO: Implement GroupAvatar properly or use placeholder
                    conversation.avatarUrl ? (
                        <img
                            src={conversation.avatarUrl}
                            alt={displayName}
                            className={s.headerAvatar}
                        />
                    ) : (
                        <div className={s.groupAvatarPlaceholder}>👥</div>
                    )
                ) : (
                    <>
                        <img
                            src={displayAvatar}
                            alt={displayName}
                            className={s.headerAvatar}
                            onError={(e) => {
                                // ✅ FIX: Fallback if image fails to load
                                e.currentTarget.src = DefaultAvatar
                            }}
                        />
                        {/* ✅ FIX: Show online badge for direct chats */}
                        {isOnline && (
                            <span
                                className={s.onlineBadge}
                                title="Đang trực tuyến"
                                aria-label="Đang trực tuyến"
                            />
                        )}
                    </>
                )}
            </div>

            <div className={s.content}>
                <div className={s.header}>
                    <span className={s.name} title={displayName}>
                        {displayName}
                    </span>
                    <span className={s.timestamp}>{formattedTime}</span>
                </div>

                <div className={s.lastMessage}>
                    <p
                        className={`${s.preview} ${conversation.unreadCount > 0 ? s.unread : ''}`}
                        title={conversation.lastMessage?.content}
                    >
                        {messagePreview}
                    </p>
                    {/* ✅ FIX: Show unread badge */}
                    {conversation.unreadCount > 0 && (
                        <span
                            className={s.badge}
                            aria-label={`${conversation.unreadCount} tin nhắn chưa đọc`}
                        >
                            {conversation.unreadCount > 99
                                ? '99+'
                                : conversation.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
