import React, { useMemo, useState } from 'react'
import s from './ConversationItem.module.css'
import type { Conversation } from '@/types/message.types'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import MoreIcon from '@/assets/Menu Hamburger.svg'
import { ConversationContextMenu } from './ConversationContextMenu'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'

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
    const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
    } | null>(null)
    const queryClient = useQueryClient()

    const displayName = conversation.name || 'Chưa đặt tên'
    const displayAvatar = conversation.avatarUrl || DefaultAvatar

    const otherParticipant = useMemo(() => {
        if (!conversation.isGroup && conversation.participants.length > 0) {
            return conversation.participants.find((p) => p.id !== currentUserId)
        }
        return null
    }, [conversation.isGroup, conversation.participants, currentUserId])

    const isOnline = !conversation.isGroup && otherParticipant?.isOnline

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

    // ✅ Mutations cho context menu
    const muteMutation = useMutation({
        mutationFn: () =>
            conversation.isMuted
                ? messageApi.unmuteConversation(conversation.id)
                : messageApi.muteConversation(conversation.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })

    const markAsReadMutation = useMutation({
        mutationFn: () => messageApi.markAsRead(conversation.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            queryClient.invalidateQueries({ queryKey: ['totalUnreadCount'] })
        },
    })

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setContextMenu({
            x: rect.right - 200,
            y: rect.bottom + 5,
        })
    }

    return (
        <>
            <div
                className={`${s.item} ${isActive ? s.active : ''}`}
                onClick={onClick}
                onContextMenu={handleContextMenu}
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
                                    e.currentTarget.src = DefaultAvatar
                                }}
                            />
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

                {/* ✅ More button */}
                <button
                    type="button"
                    className={s.moreButton}
                    onClick={handleMoreClick}
                    aria-label="Thêm tùy chọn"
                >
                    <img src={MoreIcon} alt="More" />
                </button>
            </div>

            {/* ✅ Context Menu */}
            {contextMenu && (
                <ConversationContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    isMuted={conversation.isMuted || false}
                    onMuteToggle={() => muteMutation.mutate()}
                    onMarkAsRead={() => markAsReadMutation.mutate()}
                    onDelete={() => {
                        // TODO: Implement delete conversation
                        console.log('Delete conversation:', conversation.id)
                    }}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </>
    )
}
