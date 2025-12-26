import React, { useState } from 'react'
import s from './MessageBubble.module.css'
import type { Message, Participant } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'
import { MessageContextMenu } from './MessageContextMenu'

interface MessageBubbleProps {
    message: Message
    isSent: boolean
    sender?: Participant
    showSenderName: boolean
    showAvatar: boolean
    onEdit?: (messageId: string, newContent: string) => void
    onDelete?: (messageId: string) => void
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
    onEdit,
    onDelete,
}) => {
    const [contextMenu, setContextMenu] = useState<{
        x: number
        y: number
    } | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)

    const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`
        : 'Unknown'
    const messageTime = getMessageTime(message.createdAt)

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent.trim())
        }
        setIsEditing(false)
    }

    const handleCancelEdit = () => {
        setEditContent(message.content)
        setIsEditing(false)
    }

    const handleDelete = () => {
        if (confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
            onDelete?.(message.id)
        }
    }

    return (
        <>
            <div
                className={`${s.bubbleWrapper} ${isSent ? s.sent : s.received} ${
                    !showAvatar ? s.noAvatar : ''
                }`}
                onContextMenu={handleContextMenu}
            >
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

                    <div className={s.bubble}>
                        {isEditing ? (
                            <div className={s.editMode}>
                                <textarea
                                    value={editContent}
                                    onChange={(e) =>
                                        setEditContent(e.target.value)
                                    }
                                    className={s.editInput}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSaveEdit()
                                        } else if (e.key === 'Escape') {
                                            handleCancelEdit()
                                        }
                                    }}
                                />
                                <div className={s.editActions}>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className={s.editBtn}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        className={`${s.editBtn} ${s.primary}`}
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className={s.text}>{message.content}</p>
                                {messageTime && (
                                    <span className={s.time}>
                                        {messageTime}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {contextMenu && !isEditing && (
                <MessageContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    canEdit={isSent}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </>
    )
}
