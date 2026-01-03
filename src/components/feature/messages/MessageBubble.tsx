import React, { useState, useRef } from 'react'
import s from './MessageBubble.module.css'
import type { Message, Participant } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'
import { MessageContextMenu } from './MessageContextMenu'

import MoreIcon from '@/assets/More Circle.svg'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useDialog } from '@/hooks/useDialog'

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
    const [menuPosition, setMenuPosition] = useState<{
        x: number
        y: number
    } | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)
    const moreBtnRef = useRef<HTMLButtonElement>(null)
    const { confirm } = useDialog()

    const senderName = sender
        ? `${sender.firstName} ${sender.lastName}`
        : 'Unknown'
    const messageTime = getMessageTime(message.createdAt)

    const isPending = (message as any).isPending === true
    const isEdited = message.isEdited === true

    // Handler khi bấm vào nút 3 chấm
    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (moreBtnRef.current) {
            const rect = moreBtnRef.current.getBoundingClientRect()
            // Hiển thị menu ngay bên dưới nút
            setMenuPosition({
                x: rect.left,
                y: rect.bottom + 4,
            })
        }
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

    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: 'Xóa tin nhắn?',
            message:
                'Bạn có chắc chắn muốn xóa tin nhắn này không? Hành động này không thể hoàn tác.',
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
        })

        if (isConfirmed) {
            onDelete?.(message.id)
        }
    }
    return (
        <>
            <div
                className={`${s.bubbleWrapper} ${isSent ? s.sent : s.received} ${
                    !showAvatar ? s.noAvatar : ''
                } ${menuPosition ? s.active : ''}`} // Thêm class active để giữ nút hiện khi menu mở
            >
                {/* Avatar Column */}
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

                {/* Bubble Content */}
                <div className={s.bubbleGroup}>
                    {showSenderName && (
                        <span className={s.senderName}>{senderName}</span>
                    )}

                    {isEdited && !isPending && (
                        <div className={s.editedBadge}>
                            <span>Đã chỉnh sửa</span>
                        </div>
                    )}

                    <div className={s.bubbleContainer}>
                        {/* Action Button (Kebab Menu) */}
                        {!isEditing && !isPending && (
                            <button
                                ref={moreBtnRef}
                                className={s.actionBtn}
                                onClick={handleMoreClick}
                                type="button"
                            >
                                <img
                                    src={MoreIcon}
                                    alt="More"
                                    style={{
                                        width: 16,
                                        height: 16,
                                        opacity: 0.6,
                                    }}
                                />
                            </button>
                        )}

                        <div
                            className={`${s.bubble} ${isPending ? s.sending : ''}`}
                        >
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
                                            if (
                                                e.key === 'Enter' &&
                                                !e.shiftKey
                                            ) {
                                                e.preventDefault()
                                                handleSaveEdit()
                                            } else if (e.key === 'Escape') {
                                                handleCancelEdit()
                                            }
                                        }}
                                    />
                                    <div className={s.editActions}>
                                        <ButtonPrimary
                                            variant="outline"
                                            onClick={handleCancelEdit}
                                            size="sm"
                                        >
                                            Hủy
                                        </ButtonPrimary>
                                        <ButtonPrimary
                                            onClick={handleSaveEdit}
                                            variant="solid"
                                            size="sm"
                                        >
                                            Lưu
                                        </ButtonPrimary>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className={s.text}>{message.content}</p>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {messageTime && (
                                            <span className={s.time}>
                                                {messageTime}
                                            </span>
                                        )}
                                        {/* ✅ Status indicator */}
                                        {isPending && (
                                            <span
                                                className={s.statusIcon}
                                                title="Đang gửi"
                                            />
                                        )}
                                        {!isPending && isSent && (
                                            <span
                                                className={s.statusIcon}
                                                title="Đã gửi"
                                            >
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Context Menu */}
            {menuPosition && !isEditing && (
                <MessageContextMenu
                    x={menuPosition.x}
                    y={menuPosition.y}
                    canEdit={isSent}
                    onEdit={() => {
                        setIsEditing(true)
                        setMenuPosition(null)
                    }}
                    onDelete={() => {
                        handleDelete()
                        setMenuPosition(null)
                    }}
                    onClose={() => setMenuPosition(null)}
                />
            )}
        </>
    )
}
