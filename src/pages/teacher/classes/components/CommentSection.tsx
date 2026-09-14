/**
 * CommentSection.tsx
 * Section bình luận Q&A lồng 1 cấp cho bài viết lớp học.
 *
 * Features:
 * - Hiển thị danh sách top-level comments kèm replies inline
 * - Form tạo comment mới / reply inline
 * - Chỉnh sửa inline (chỉ tác giả — is_edited badge)
 * - Xóa mềm (tác giả, GV, Admin)
 * - Banner khóa bình luận khi is_comment_locked = true
 */

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    type ClassPostComment,
    getPostComments,
    createPostComment,
    updatePostComment,
    deletePostComment,
} from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import s from './CommentSection.module.css'

interface CommentSectionProps {
    classId: string
    postId: string
    currentUserId: string
    currentUserRole: string
    /** ID giáo viên chủ nhiệm lớp — cần để kiểm tra quyền xóa */
    teacherId?: string
    isCommentLocked: boolean
    /** Số lượng comments để hiển thị trên header */
    commentCount?: number
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({
    name,
    avatarUrl,
    size = 32,
}: {
    name: string
    avatarUrl?: string | null
    size?: number
}) {
    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={name}
                className={s.avatar}
                style={{ width: size, height: size, minWidth: size }}
            />
        )
    }
    const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    return (
        <div
            className={s.avatarInitials}
            style={{
                width: size,
                height: size,
                minWidth: size,
                fontSize: size * 0.38,
            }}
        >
            {initials}
        </div>
    )
}

// ─── Comment Form ─────────────────────────────────────────────────────────────

interface CommentFormProps {
    placeholder: string
    initialValue?: string
    onSubmit: (content: string) => Promise<void>
    onCancel?: () => void
    autoFocus?: boolean
}

function CommentForm({
    placeholder,
    initialValue = '',
    onSubmit,
    onCancel,
    autoFocus,
}: CommentFormProps) {
    const [value, setValue] = useState(initialValue)
    const [loading, setLoading] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus()
            // Di chuyển cursor tới cuối
            const len = textareaRef.current.value.length
            textareaRef.current.setSelectionRange(len, len)
        }
    }, [autoFocus])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = value.trim()
        if (!trimmed || loading) return
        setLoading(true)
        try {
            await onSubmit(trimmed)
            setValue('')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e as any)
        }
        if (e.key === 'Escape' && onCancel) {
            onCancel()
        }
    }

    return (
        <form className={s.commentForm} onSubmit={handleSubmit}>
            <textarea
                ref={textareaRef}
                className={s.commentInput}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={2000}
                disabled={loading}
            />
            <div className={s.formActions}>
                {onCancel && (
                    <button
                        type="button"
                        className={s.cancelBtn}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                )}
                <button
                    type="submit"
                    className={s.submitBtn}
                    disabled={!value.trim() || loading}
                >
                    {loading ? 'Đang gửi…' : 'Gửi'}
                </button>
            </div>
            <p className={s.formHint}>Ctrl+Enter để gửi • Esc để hủy</p>
        </form>
    )
}

// ─── Single Comment Item ──────────────────────────────────────────────────────

interface CommentItemProps {
    comment: ClassPostComment
    classId: string
    postId: string
    currentUserId: string
    currentUserRole: string
    teacherId?: string
    isLocked: boolean
    isReply?: boolean
    onReply?: (commentId: string) => void
}

function CommentItem({
    comment,
    classId,
    postId,
    currentUserId,
    currentUserRole,
    teacherId,
    isLocked,
    isReply = false,
    onReply,
}: CommentItemProps) {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [showReplyForm, setShowReplyForm] = useState(false)

    const isAuthor = comment.author_id === currentUserId
    const isAdmin =
        currentUserRole === 'center_admin' || currentUserRole === 'system_admin'
    const isTeacher = currentUserId === teacherId
    const canDelete = isAuthor || isAdmin || isTeacher
    const canEdit = isAuthor

    const editMutation = useMutation({
        mutationFn: (content: string) =>
            updatePostComment(classId, postId, comment.id, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.postComments(classId, postId),
            })
            setIsEditing(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: () => deletePostComment(classId, postId, comment.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.postComments(classId, postId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId),
            })
        },
    })

    const replyMutation = useMutation({
        mutationFn: (content: string) =>
            createPostComment(classId, postId, {
                content,
                parent_comment_id: comment.id,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.postComments(classId, postId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId),
            })
            setShowReplyForm(false)
        },
    })

    const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
        addSuffix: true,
        locale: vi,
    })

    return (
        <div className={`${s.commentItem} ${isReply ? s.reply : ''}`}>
            <Avatar
                name={comment.author?.full_name ?? 'Người dùng'}
                avatarUrl={comment.author?.avatar_url}
                size={isReply ? 28 : 34}
            />

            <div className={s.commentBody}>
                <div className={s.commentBubble}>
                    <div className={s.commentMeta}>
                        <span className={s.authorName}>
                            {comment.author?.full_name ?? 'Người dùng'}
                        </span>
                        <span className={s.roleTag}>
                            {comment.author?.role}
                        </span>
                        {comment.is_edited && (
                            <span
                                className={s.editedBadge}
                                title="Đã chỉnh sửa"
                            >
                                đã sửa
                            </span>
                        )}
                    </div>

                    {isEditing ? (
                        <CommentForm
                            placeholder="Chỉnh sửa bình luận…"
                            initialValue={comment.content}
                            onSubmit={async (content) => {
                                await editMutation.mutateAsync(content)
                            }}
                            onCancel={() => setIsEditing(false)}
                            autoFocus
                        />
                    ) : (
                        <p className={s.commentContent}>{comment.content}</p>
                    )}
                </div>

                <div className={s.commentActions}>
                    <span
                        className={s.timeAgo}
                        title={new Date(comment.created_at).toLocaleString(
                            'vi-VN'
                        )}
                    >
                        {timeAgo}
                    </span>

                    {!isLocked && !isReply && (
                        <button
                            type="button"
                            className={s.actionBtn}
                            onClick={() => setShowReplyForm((v) => !v)}
                        >
                            Phản hồi
                        </button>
                    )}
                    {canEdit && !isEditing && (
                        <button
                            type="button"
                            className={s.actionBtn}
                            onClick={() => setIsEditing(true)}
                        >
                            Chỉnh sửa
                        </button>
                    )}
                    {canDelete && (
                        <button
                            type="button"
                            className={`${s.actionBtn} ${s.deleteBtn}`}
                            onClick={() => {
                                if (window.confirm('Xóa bình luận này?'))
                                    deleteMutation.mutate()
                            }}
                            disabled={deleteMutation.isPending}
                        >
                            Xóa
                        </button>
                    )}
                </div>

                {/* Inline reply form */}
                {showReplyForm && !isLocked && (
                    <div className={s.replyFormWrap}>
                        <CommentForm
                            placeholder={`Phản hồi ${comment.author?.full_name ?? ''}…`}
                            onSubmit={async (content) => {
                                await replyMutation.mutateAsync(content)
                            }}
                            onCancel={() => setShowReplyForm(false)}
                            autoFocus
                        />
                    </div>
                )}

                {/* Replies (1 cấp) */}
                {!isReply && comment.replies?.length > 0 && (
                    <div className={s.repliesList}>
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                classId={classId}
                                postId={postId}
                                currentUserId={currentUserId}
                                currentUserRole={currentUserRole}
                                teacherId={teacherId}
                                isLocked={isLocked}
                                isReply
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Main CommentSection ──────────────────────────────────────────────────────

export function CommentSection({
    classId,
    postId,
    currentUserId,
    currentUserRole,
    teacherId,
    isCommentLocked,
    commentCount,
}: CommentSectionProps) {
    const queryClient = useQueryClient()
    const [showAll, setShowAll] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.classes.postComments(classId, postId),
        queryFn: () => getPostComments(classId, postId, 1, 100),
        staleTime: 30_000,
    })

    const comments = data?.data ?? []
    const total = data?.total ?? commentCount ?? 0

    const newCommentMutation = useMutation({
        mutationFn: (content: string) =>
            createPostComment(classId, postId, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.postComments(classId, postId),
            })
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId),
            })
        },
    })

    const displayedComments = showAll ? comments : comments.slice(0, 3)
    const hasMore = comments.length > 3

    return (
        <div className={s.commentSection}>
            {/* Header */}
            <div className={s.header}>
                <span className={s.headerTitle}>
                    Bình luận
                    {total > 0 && <span className={s.countBadge}>{total}</span>}
                </span>
                {isCommentLocked && (
                    <span className={s.lockedBadge}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            width="13"
                            height="13"
                        >
                            <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                            />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Đã khóa bình luận
                    </span>
                )}
            </div>

            {/* Locked banner */}
            {isCommentLocked && (
                <div className={s.lockedBanner}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="15"
                        height="15"
                    >
                        <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Giảng viên đã khóa bình luận cho bài viết này
                </div>
            )}

            {/* Comment list */}
            {isLoading ? (
                <div className={s.loadingText}>Đang tải bình luận…</div>
            ) : comments.length === 0 ? (
                <p className={s.emptyText}>
                    Chưa có bình luận nào. Hãy là người đầu tiên!
                </p>
            ) : (
                <>
                    <div className={s.commentsList}>
                        {displayedComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                classId={classId}
                                postId={postId}
                                currentUserId={currentUserId}
                                currentUserRole={currentUserRole}
                                teacherId={teacherId}
                                isLocked={isCommentLocked}
                            />
                        ))}
                    </div>
                    {hasMore && (
                        <button
                            type="button"
                            className={s.showMoreBtn}
                            onClick={() => setShowAll((v) => !v)}
                        >
                            {showAll
                                ? 'Thu gọn'
                                : `Xem thêm ${comments.length - 3} bình luận`}
                        </button>
                    )}
                </>
            )}

            {/* New comment form */}
            {!isCommentLocked && (
                <div className={s.newCommentWrap}>
                    <CommentForm
                        placeholder="Viết bình luận… (Ctrl+Enter để gửi)"
                        onSubmit={async (content) => {
                            await newCommentMutation.mutateAsync(content)
                        }}
                    />
                </div>
            )}
        </div>
    )
}
