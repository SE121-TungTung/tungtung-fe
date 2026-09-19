import React, { useState, useRef, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ClassPost, MaterialCategory } from '@/lib/classes'
import {
    MATERIAL_CATEGORY_LABELS,
    lockPostComments,
    recordPostFileDownload,
} from '@/lib/classes'
import { downloadFileWithOriginalName } from '@/lib/download'
import { queryKeys } from '@/lib/queryKeys'
import { ReactionBar } from '../components/ReactionBar'
import { CommentSection } from '../components/CommentSection'
import { ViewersModal } from '../components/ViewersModal'
import s from '../TeacherClassDetail.module.css'
import fs from './ClassPostsFeedTab.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCKED_EXTENSIONS = new Set([
    '.exe',
    '.sh',
    '.bat',
    '.cmd',
    '.js',
    '.mjs',
    '.ts',
    '.py',
    '.rb',
    '.php',
    '.vbs',
    '.ps1',
    '.dll',
])

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB — Cloudinary free plan limit
const POSTS_PER_PAGE = 8

const materialCategories = Object.entries(MATERIAL_CATEGORY_LABELS) as [
    MaterialCategory,
    string,
][]

type PostFilter = 'all' | 'announcement' | 'material'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const PinIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
)

const EditIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
    </svg>
)

const TrashIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
)

const ChevronLeftIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="15 18 9 12 15 6" />
    </svg>
)

const ChevronRightIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClassPostsFeedTabProps {
    posts: ClassPost[]
    postsLoading: boolean
    postType: 'announcement' | 'material'
    setPostType: (type: 'announcement' | 'material') => void
    postTitle: string
    setPostTitle: (title: string) => void
    postContent: string
    setPostContent: (content: string) => void
    materialCategory: MaterialCategory | ''
    setMaterialCategory: (cat: MaterialCategory | '') => void
    selectedFiles: File[]
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
    isCreatingPost: boolean
    handleCreatePost: (e: React.FormEvent) => void
    handleDeletePost: (postId: string) => void
    handlePinPost: (post: ClassPost) => void
    handleEditPost: (post: ClassPost) => void
    currentUserId: string
    /** ID lớp học — cần cho comment và reaction APIs */
    classId: string
    /** ID giáo viên chủ nhiệm lớp */
    teacherId?: string
    /** Role của current user — dùng để kiểm tra quyền */
    currentUserRole?: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileWarnings({ files }: { files: File[] }) {
    const blocked = files.filter((f) => {
        const ext = '.' + (f.name.split('.').pop() || '').toLowerCase()
        return BLOCKED_EXTENSIONS.has(ext)
    })
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)
    if (!blocked.length && !oversized.length) return null
    return (
        <div className={fs.fileWarnings}>
            {blocked.length > 0 && (
                <span className={fs.fileError}>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Định dạng bị cấm: {blocked.map((f) => f.name).join(', ')}
                </span>
            )}
            {oversized.length > 0 && (
                <span className={fs.fileSizeError}>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Vượt quá 10MB:{' '}
                    {oversized
                        .map(
                            (f) =>
                                `${f.name} (${(f.size / 1024 / 1024).toFixed(1)}MB)`
                        )
                        .join(', ')}
                </span>
            )}
        </div>
    )
}

// ─── Pinned Posts Carousel (Facebook "Đáng chú ý" style) ──────────────────────

interface PinnedCarouselProps {
    posts: ClassPost[]
    onClickPost: (post: ClassPost) => void
}

function PinnedPostsCarousel({ posts, onClickPost }: PinnedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return
        const amount = 320
        scrollRef.current.scrollBy({
            left: dir === 'left' ? -amount : amount,
            behavior: 'smooth',
        })
    }

    if (posts.length === 0) return null

    return (
        <div className={fs.pinnedCarouselWrapper}>
            <div className={fs.pinnedCarouselHeader}>
                <PinIcon size={16} />
                <h3 className={fs.pinnedCarouselTitle}>
                    Đáng chú ý ({posts.length}/3)
                </h3>
            </div>
            <div className={fs.pinnedCarouselViewport}>
                {posts.length > 1 && (
                    <button
                        type="button"
                        className={`${fs.carouselArrow} ${fs.carouselArrowLeft}`}
                        onClick={() => scroll('left')}
                        aria-label="Mục trước đó"
                    >
                        <ChevronLeftIcon />
                    </button>
                )}
                <div className={fs.pinnedCarouselTrack} ref={scrollRef}>
                    {posts.map((post) => (
                        <button
                            key={post.id}
                            type="button"
                            className={fs.pinnedCarouselItem}
                            onClick={() => onClickPost(post)}
                        >
                            <div className={fs.pinnedItemAvatar}>
                                {post.author?.full_name
                                    ?.charAt(0)
                                    .toUpperCase() ?? 'G'}
                            </div>
                            <div className={fs.pinnedItemBody}>
                                <div className={fs.pinnedItemAuthor}>
                                    {post.author?.full_name ?? 'Giảng viên'}
                                </div>
                                <div className={fs.pinnedItemTitle}>
                                    {post.title}
                                </div>
                                {post.content && (
                                    <div className={fs.pinnedItemPreview}>
                                        {post.content}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
                {posts.length > 1 && (
                    <button
                        type="button"
                        className={`${fs.carouselArrow} ${fs.carouselArrowRight}`}
                        onClick={() => scroll('right')}
                        aria-label="Mục tiếp theo"
                    >
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Pinned Post Detail Modal (full-featured like PostCard) ───────────────────

interface PinnedPostDetailModalProps {
    post: ClassPost
    onClose: () => void
    classId: string
    currentUserId: string
    currentUserRole: string
    teacherId?: string
    onDelete: () => void
    onPin: () => void
    onEdit: () => void
    onOpenViewers: () => void
}

function PinnedPostDetailModal({
    post,
    onClose,
    classId,
    currentUserId,
    currentUserRole,
    teacherId,
    onDelete,
    onPin,
    onEdit,
    onOpenViewers,
}: PinnedPostDetailModalProps) {
    const queryClient = useQueryClient()
    const isAuthor = post.author_id === currentUserId
    const isStaff =
        currentUserRole === 'center_admin' ||
        currentUserRole === 'system_admin' ||
        currentUserId === teacherId
    const canLock = isStaff || isAuthor

    const lockMutation = useMutation({
        mutationFn: (locked: boolean) =>
            lockPostComments(classId, post.id, locked),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId),
            })
        },
    })

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className={fs.modalOverlay}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className={fs.modalBox} style={{ maxWidth: '700px' }}>
                {/* Header */}
                <div className={fs.modalHeader}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div
                            className={fs.pinnedItemAvatar}
                            style={{
                                width: '40px',
                                height: '40px',
                                fontSize: '16px',
                            }}
                        >
                            {post.author?.full_name?.charAt(0).toUpperCase() ??
                                'G'}
                        </div>
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: '#0f172a',
                                    fontSize: '15px',
                                }}
                            >
                                {post.author?.full_name ?? 'Giảng viên'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                {new Date(post.created_at).toLocaleString(
                                    'vi-VN'
                                )}
                                {post.is_edited && (
                                    <span> · (đã chỉnh sửa)</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={fs.modalClose}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '20px 24px' }}>
                    {/* Actions bar */}
                    <div
                        className={fs.actionsRow}
                        style={{ marginBottom: '14px' }}
                    >
                        <span
                            className={`${fs.typeBadge} ${post.post_type === 'material' ? fs.badgeMaterial : fs.badgeAnnouncement}`}
                        >
                            {post.post_type === 'material'
                                ? 'Tài liệu'
                                : 'Thông báo'}
                        </span>
                        {post.material_category && (
                            <span className={fs.categoryBadge}>
                                {
                                    MATERIAL_CATEGORY_LABELS[
                                        post.material_category
                                    ]
                                }
                            </span>
                        )}
                        <div style={{ flex: 1 }} />
                        {isStaff && (
                            <button
                                type="button"
                                className={fs.viewersBtn}
                                onClick={onOpenViewers}
                                title="Xem danh sách học viên đã xem"
                            >
                                <span className={fs.viewersIcon}>
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        width="13"
                                        height="13"
                                    >
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </span>
                                <span>{post.view_count ?? 0} đã xem</span>
                            </button>
                        )}
                        <button
                            onClick={onPin}
                            className={`${fs.iconBtn} ${post.is_pinned ? fs.pinActive : ''}`}
                            title="Bỏ ghim bài viết"
                            aria-label="Bỏ ghim bài viết"
                        >
                            <PinIcon />
                        </button>
                        {isAuthor && (
                            <button
                                onClick={onEdit}
                                className={fs.iconBtn}
                                title="Chỉnh sửa bài viết"
                                aria-label="Chỉnh sửa bài viết"
                            >
                                <EditIcon />
                            </button>
                        )}
                        <button
                            onClick={onDelete}
                            className={`${fs.iconBtn} ${fs.deleteBtn}`}
                            title="Xóa bài viết"
                            aria-label="Xóa bài viết"
                        >
                            <TrashIcon />
                        </button>
                    </div>

                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '0 0 12px',
                        }}
                    >
                        {post.title}
                    </h3>
                    {post.content && (
                        <p
                            style={{
                                color: '#334155',
                                fontSize: '14px',
                                lineHeight: '1.7',
                                whiteSpace: 'pre-wrap',
                                margin: '0 0 16px',
                            }}
                        >
                            {post.content}
                        </p>
                    )}

                    {/* Attachments */}
                    {post.attachments.length > 0 && (
                        <div
                            style={{
                                borderTop: '1px dashed #e2e8f0',
                                paddingTop: '14px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#94a3b8',
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                }}
                            >
                                Tệp đính kèm ({post.attachments.length})
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                }}
                            >
                                {post.attachments.map((file, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            if (classId)
                                                void recordPostFileDownload(
                                                    classId,
                                                    post.id,
                                                    file.file_name,
                                                    file.file_url
                                                )
                                            void downloadFileWithOriginalName(
                                                file.file_url,
                                                file.file_name
                                            )
                                        }}
                                        className={fs.attachmentLink}
                                    >
                                        <svg
                                            width="13"
                                            height="13"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                        </svg>
                                        <span>{file.file_name}</span>
                                        <span className={fs.fileSize}>
                                            (
                                            {(file.file_size / 1024).toFixed(1)}{' '}
                                            KB)
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reaction + Lock */}
                    <div
                        className={fs.postFooter}
                        style={{ marginTop: '16px' }}
                    >
                        <ReactionBar
                            classId={classId}
                            postId={post.id}
                            summary={
                                post.reactions_summary ?? {
                                    like: 0,
                                    heart: 0,
                                    understood: 0,
                                    user_reactions: [],
                                }
                            }
                            isInteractive={true}
                        />
                        {canLock && (
                            <button
                                type="button"
                                className={`${fs.lockBtn} ${post.is_comment_locked ? fs.lockActive : ''}`}
                                onClick={() =>
                                    lockMutation.mutate(!post.is_comment_locked)
                                }
                                disabled={lockMutation.isPending}
                                title={
                                    post.is_comment_locked
                                        ? 'Mở khóa bình luận'
                                        : 'Khóa bình luận'
                                }
                            >
                                {post.is_comment_locked ? (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        width="14"
                                        height="14"
                                    >
                                        <rect
                                            x="3"
                                            y="11"
                                            width="18"
                                            height="11"
                                            rx="2"
                                            ry="2"
                                        />
                                        <path
                                            d="M7 11V7a5 5 0 0 1 10 0v4"
                                            stroke="currentColor"
                                            fill="none"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        width="14"
                                        height="14"
                                    >
                                        <rect
                                            x="3"
                                            y="11"
                                            width="18"
                                            height="11"
                                            rx="2"
                                            ry="2"
                                        />
                                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                    </svg>
                                )}
                                {post.is_comment_locked
                                    ? 'Mở bình luận'
                                    : 'Khóa bình luận'}
                            </button>
                        )}
                    </div>

                    {/* Comments */}
                    <CommentSection
                        classId={classId}
                        postId={post.id}
                        currentUserId={currentUserId}
                        currentUserRole={currentUserRole}
                        teacherId={teacherId}
                        isCommentLocked={post.is_comment_locked}
                        commentCount={post.comment_count ?? 0}
                    />
                </div>
            </div>
        </div>
    )
}

// ─── Post Create Modal ────────────────────────────────────────────────────────

interface PostCreateModalProps {
    isOpen: boolean
    onClose: () => void
    postType: 'announcement' | 'material'
    setPostType: (type: 'announcement' | 'material') => void
    postTitle: string
    setPostTitle: (title: string) => void
    postContent: string
    setPostContent: (content: string) => void
    materialCategory: MaterialCategory | ''
    setMaterialCategory: (cat: MaterialCategory | '') => void
    selectedFiles: File[]
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
    isCreatingPost: boolean
    handleCreatePost: (e: React.FormEvent) => void
}

function PostCreateModal({
    isOpen,
    onClose,
    postType,
    setPostType,
    postTitle,
    setPostTitle,
    postContent,
    setPostContent,
    materialCategory,
    setMaterialCategory,
    selectedFiles,
    setSelectedFiles,
    isCreatingPost,
    handleCreatePost,
}: PostCreateModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const hasBlockedFile = selectedFiles.some((f) => {
        const ext = '.' + (f.name.split('.').pop() || '').toLowerCase()
        return BLOCKED_EXTENSIONS.has(ext)
    })

    const hasOversizedFile = selectedFiles.some((f) => f.size > MAX_FILE_SIZE)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const newFiles = Array.from(e.target.files)
        setSelectedFiles((prev) => {
            const merged = [...prev, ...newFiles]
            if (merged.length > MAX_FILES) {
                alert(
                    `Chỉ được đính kèm tối đa ${MAX_FILES} tệp. Hiện tại đã có ${prev.length} tệp.`
                )
                return prev
            }
            return merged
        })
        // Reset input value để cho phép chọn lại cùng file
        e.target.value = ''
    }

    const removeFile = (idx: number) => {
        setSelectedFiles((prev) => {
            const next = [...prev]
            next.splice(idx, 1)
            if (next.length === 0 && fileInputRef.current)
                fileInputRef.current.value = ''
            return next
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        if (hasBlockedFile) {
            e.preventDefault()
            alert(
                'Vui lòng xoá các tệp có định dạng bị cấm trước khi đăng bài.'
            )
            return
        }
        if (hasOversizedFile) {
            e.preventDefault()
            alert('Vui lòng xoá các tệp vượt quá 10MB trước khi đăng bài.')
            return
        }
        handleCreatePost(e)
        onClose()
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className={fs.modalOverlay}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-modal-title"
        >
            <div className={fs.modalBox}>
                {/* Modal Header */}
                <div className={fs.modalHeader}>
                    <h3 id="post-modal-title" className={fs.modalTitle}>
                        {postType === 'material'
                            ? 'Đăng tài liệu mới'
                            : 'Tạo thông báo mới'}
                    </h3>
                    <button
                        type="button"
                        className={fs.modalClose}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={fs.form}>
                    {/* Loại bài đăng */}
                    <div className={fs.formRow}>
                        <button
                            type="button"
                            className={`${fs.typeChip} ${postType === 'announcement' ? fs.typeChipActive : ''}`}
                            onClick={() => {
                                setPostType('announcement')
                                setMaterialCategory('')
                            }}
                        >
                            Thông báo
                        </button>
                        <button
                            type="button"
                            className={`${fs.typeChip} ${postType === 'material' ? fs.typeChipMaterialActive : ''}`}
                            onClick={() => setPostType('material')}
                        >
                            Tài liệu học tập
                        </button>
                    </div>

                    {/* Phân loại tài liệu */}
                    {postType === 'material' && (
                        <div className={fs.formGroup}>
                            <label
                                htmlFor="modal-material-category"
                                className={fs.label}
                            >
                                Phân loại tài liệu
                            </label>
                            <select
                                id="modal-material-category"
                                value={materialCategory}
                                onChange={(e) =>
                                    setMaterialCategory(
                                        e.target.value as MaterialCategory | ''
                                    )
                                }
                                className={fs.select}
                            >
                                <option value="">— Chọn phân loại —</option>
                                {materialCategories.map(([val, lbl]) => (
                                    <option key={val} value={val}>
                                        {lbl}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Tiêu đề */}
                    <div className={fs.formGroup}>
                        <label htmlFor="modal-post-title" className={fs.label}>
                            Tiêu đề <span className={fs.required}>*</span>
                        </label>
                        <input
                            id="modal-post-title"
                            type="text"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            placeholder="Ví dụ: Tài liệu Unit 5, Thông báo nghỉ học..."
                            className={fs.input}
                            autoFocus
                        />
                    </div>

                    {/* Nội dung */}
                    <div className={fs.formGroup}>
                        <label
                            htmlFor="modal-post-content"
                            className={fs.label}
                        >
                            Nội dung chi tiết
                        </label>
                        <textarea
                            id="modal-post-content"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="Nhập nội dung thông báo hoặc mô tả tài liệu..."
                            rows={4}
                            className={fs.textarea}
                        />
                    </div>

                    {/* Đính kèm tệp */}
                    <div className={fs.formGroup}>
                        <label className={fs.label}>
                            Đính kèm tệp ({selectedFiles.length}/{MAX_FILES})
                        </label>
                        <label
                            htmlFor="modal-post-files"
                            className={fs.fileLabel}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            Chọn tệp...
                        </label>
                        <input
                            id="modal-post-files"
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className={fs.fileInputHidden}
                        />
                        {selectedFiles.length > 0 && (
                            <div className={fs.fileList}>
                                {selectedFiles.map((file, idx) => {
                                    const ext =
                                        '.' +
                                        (
                                            file.name.split('.').pop() || ''
                                        ).toLowerCase()
                                    const isBlocked =
                                        BLOCKED_EXTENSIONS.has(ext)
                                    const isOversized =
                                        file.size > MAX_FILE_SIZE
                                    return (
                                        <div
                                            key={idx}
                                            className={`${fs.fileChip} ${isBlocked ? fs.fileChipError : ''} ${isOversized ? fs.fileChipError : ''}`}
                                        >
                                            <span className={fs.fileName}>
                                                {file.name}
                                            </span>
                                            <span className={fs.fileSize}>
                                                (
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(1)}{' '}
                                                MB)
                                            </span>
                                            <button
                                                type="button"
                                                className={fs.removeFile}
                                                onClick={() => removeFile(idx)}
                                                title="Xoá tệp này"
                                            >
                                                <svg
                                                    width="10"
                                                    height="10"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line
                                                        x1="18"
                                                        y1="6"
                                                        x2="6"
                                                        y2="18"
                                                    />
                                                    <line
                                                        x1="6"
                                                        y1="6"
                                                        x2="18"
                                                        y2="18"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    )
                                })}
                                <FileWarnings files={selectedFiles} />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className={fs.modalActions}>
                        <button
                            type="button"
                            className={fs.cancelBtn}
                            onClick={onClose}
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            disabled={
                                isCreatingPost ||
                                hasBlockedFile ||
                                hasOversizedFile
                            }
                            className={fs.submitBtn}
                        >
                            {isCreatingPost ? 'Đang đăng...' : 'Đăng bài viết'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ClassPostsFeedTab: React.FC<ClassPostsFeedTabProps> = ({
    posts,
    postsLoading,
    postType,
    setPostType,
    postTitle,
    setPostTitle,
    postContent,
    setPostContent,
    materialCategory,
    setMaterialCategory,
    selectedFiles,
    setSelectedFiles,
    isCreatingPost,
    handleCreatePost,
    handleDeletePost,
    handlePinPost,
    handleEditPost,
    currentUserId,
    classId,
    teacherId,
    currentUserRole = 'teacher',
}) => {
    const [filter, setFilter] = useState<PostFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedPinnedPost, setSelectedPinnedPost] =
        useState<ClassPost | null>(null)
    const [selectedPostForViewers, setSelectedPostForViewers] = useState<{
        id: string
        title: string
    } | null>(null)

    // Reset về trang 1 khi đổi filter
    const handleFilterChange = useCallback((f: PostFilter) => {
        setFilter(f)
        setCurrentPage(1)
    }, [])

    // Client-side filter
    const filteredPosts =
        filter === 'all' ? posts : posts.filter((p) => p.post_type === filter)

    const pinnedPosts = filteredPosts.filter((p) => p.is_pinned)
    const regularPosts = filteredPosts.filter((p) => !p.is_pinned)

    // Pagination
    const totalPages = Math.max(
        1,
        Math.ceil(regularPosts.length / POSTS_PER_PAGE)
    )
    const safePage = Math.min(currentPage, totalPages)
    const pagedRegularPosts = regularPosts.slice(
        (safePage - 1) * POSTS_PER_PAGE,
        safePage * POSTS_PER_PAGE
    )

    const openCreateModal = () => setIsCreateModalOpen(true)
    const closeCreateModal = () => setIsCreateModalOpen(false)

    return (
        <div className={fs.feedWrapper}>
            {/* ─── Top Bar: Title + Filter + Add Button ─── */}
            <div className={fs.feedTopBar}>
                <div className={fs.feedTopLeft}>
                    <h3 className={`${s.sectionTitle} ${fs.feedTitle}`}>
                        Bảng tin lớp học
                    </h3>
                    {/* Filter tabs */}
                    <div className={fs.filterTabs} role="tablist">
                        {(
                            ['all', 'announcement', 'material'] as PostFilter[]
                        ).map((tab) => (
                            <button
                                key={tab}
                                role="tab"
                                aria-selected={filter === tab}
                                onClick={() => handleFilterChange(tab)}
                                className={`${fs.filterTab} ${filter === tab ? fs.filterTabActive : ''}`}
                            >
                                {tab === 'all'
                                    ? 'Tất cả'
                                    : tab === 'announcement'
                                      ? 'Thông báo'
                                      : 'Tài liệu'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    id="btn-create-post"
                    type="button"
                    className={fs.addBtn}
                    onClick={openCreateModal}
                    aria-label="Tạo bài đăng mới"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tạo bài đăng
                </button>
            </div>

            {/* ─── Feed Content ─── */}
            {postsLoading ? (
                <div className={fs.loadingText}>Đang tải danh sách...</div>
            ) : filteredPosts.length === 0 ? (
                <div className={s.emptyText}>
                    {filter === 'all'
                        ? 'Lớp học chưa có thông báo hoặc tài liệu nào.'
                        : `Không có bài ${filter === 'announcement' ? 'thông báo' : 'tài liệu'} nào.`}
                </div>
            ) : (
                <div className={fs.feedList}>
                    {/* ─── Pinned Posts Carousel ─── */}
                    <PinnedPostsCarousel
                        posts={pinnedPosts}
                        onClickPost={(post) => setSelectedPinnedPost(post)}
                    />

                    {/* ─── Danh sách bài viết thường (paged) ─── */}
                    {pagedRegularPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            classId={classId}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            teacherId={teacherId}
                            onDelete={() => handleDeletePost(post.id)}
                            onPin={() => handlePinPost(post)}
                            onEdit={() => handleEditPost(post)}
                            onOpenViewers={() =>
                                setSelectedPostForViewers({
                                    id: post.id,
                                    title: post.title,
                                })
                            }
                        />
                    ))}

                    {/* ─── Pagination ─── */}
                    {totalPages > 1 && (
                        <div className={fs.paginationBar}>
                            <button
                                type="button"
                                className={fs.pageBtn}
                                disabled={safePage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                aria-label="Trang trước"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                                Trước
                            </button>

                            <div className={fs.pageNumbers}>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        className={`${fs.pageNumBtn} ${page === safePage ? fs.pageNumBtnActive : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                        aria-label={`Trang ${page}`}
                                        aria-current={
                                            page === safePage
                                                ? 'page'
                                                : undefined
                                        }
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className={fs.pageBtn}
                                disabled={safePage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                aria-label="Trang sau"
                            >
                                Sau
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ─── Modal tạo bài đăng ─── */}
            <PostCreateModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                postType={postType}
                setPostType={setPostType}
                postTitle={postTitle}
                setPostTitle={setPostTitle}
                postContent={postContent}
                setPostContent={setPostContent}
                materialCategory={materialCategory}
                setMaterialCategory={setMaterialCategory}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                isCreatingPost={isCreatingPost}
                handleCreatePost={handleCreatePost}
            />

            {/* ─── Modal xem chi tiết bài ghim ─── */}
            {selectedPinnedPost && (
                <PinnedPostDetailModal
                    post={selectedPinnedPost}
                    onClose={() => setSelectedPinnedPost(null)}
                    classId={classId}
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    teacherId={teacherId}
                    onDelete={() => {
                        handleDeletePost(selectedPinnedPost.id)
                        setSelectedPinnedPost(null)
                    }}
                    onPin={() => {
                        handlePinPost(selectedPinnedPost)
                        setSelectedPinnedPost(null)
                    }}
                    onEdit={() => {
                        handleEditPost(selectedPinnedPost)
                        setSelectedPinnedPost(null)
                    }}
                    onOpenViewers={() => {
                        setSelectedPostForViewers({
                            id: selectedPinnedPost.id,
                            title: selectedPinnedPost.title,
                        })
                    }}
                />
            )}

            {/* ─── Modal Thống kê người đã xem ─── */}
            <ViewersModal
                isOpen={Boolean(selectedPostForViewers)}
                onClose={() => setSelectedPostForViewers(null)}
                classId={classId}
                postId={selectedPostForViewers?.id ?? null}
                postTitle={selectedPostForViewers?.title}
            />
        </div>
    )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

interface PostCardProps {
    post: ClassPost
    classId: string
    currentUserId: string
    currentUserRole: string
    teacherId?: string
    onDelete: () => void
    onPin: () => void
    onEdit: () => void
    onOpenViewers: () => void
}

function PostCard({
    post,
    classId,
    currentUserId,
    currentUserRole,
    teacherId,
    onDelete,
    onPin,
    onEdit,
    onOpenViewers,
}: PostCardProps) {
    const queryClient = useQueryClient()
    const isAuthor = post.author_id === currentUserId
    const isStaff =
        currentUserRole === 'center_admin' ||
        currentUserRole === 'system_admin' ||
        currentUserId === teacherId
    const canLock = isStaff || isAuthor

    // Optimistic lock toggle
    const lockMutation = useMutation({
        mutationFn: (locked: boolean) =>
            lockPostComments(classId, post.id, locked),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId),
            })
        },
    })

    return (
        <div className={s.card} style={{ padding: '24px' }}>
            {/* Header */}
            <div className={fs.postHeaderRow}>
                <div className={fs.authorRow}>
                    <div className={fs.avatar}>
                        {post.author?.full_name?.charAt(0).toUpperCase() ?? 'G'}
                    </div>
                    <div>
                        <div className={fs.authorName}>
                            {post.author?.full_name ?? 'Giảng viên'}
                        </div>
                        <div className={fs.postMeta}>
                            {new Date(post.created_at).toLocaleString('vi-VN')}
                            {post.is_edited && (
                                <span className={fs.editedLabel}>
                                    {' '}
                                    · (đã chỉnh sửa)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Badges + Actions */}
                <div className={fs.actionsRow}>
                    <span
                        className={`${fs.typeBadge} ${post.post_type === 'material' ? fs.badgeMaterial : fs.badgeAnnouncement}`}
                    >
                        {post.post_type === 'material'
                            ? 'Tài liệu'
                            : 'Thông báo'}
                    </span>

                    {post.material_category && (
                        <span className={fs.categoryBadge}>
                            {MATERIAL_CATEGORY_LABELS[post.material_category]}
                        </span>
                    )}

                    {/* Nút xem thống kê người đã xem */}
                    {isStaff && (
                        <button
                            type="button"
                            className={fs.viewersBtn}
                            onClick={onOpenViewers}
                            title="Xem danh sách học viên đã xem"
                            aria-label="Xem danh sách học viên đã xem"
                        >
                            <span className={fs.viewersIcon}>
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    width="13"
                                    height="13"
                                >
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </span>
                            <span>{post.view_count ?? 0} đã xem</span>
                        </button>
                    )}

                    {/* Ghim / bỏ ghim */}
                    <button
                        onClick={onPin}
                        className={`${fs.iconBtn} ${post.is_pinned ? fs.pinActive : ''}`}
                        title={post.is_pinned ? 'Bỏ ghim bài' : 'Ghim bài viết'}
                        aria-label={
                            post.is_pinned
                                ? 'Bỏ ghim bài viết'
                                : 'Ghim bài viết'
                        }
                    >
                        <PinIcon />
                    </button>

                    {/* Chỉnh sửa (chỉ tác giả) */}
                    {isAuthor && (
                        <button
                            onClick={onEdit}
                            className={fs.iconBtn}
                            title="Chỉnh sửa bài viết"
                            aria-label="Chỉnh sửa bài viết"
                        >
                            <EditIcon />
                        </button>
                    )}

                    {/* Xóa */}
                    <button
                        onClick={onDelete}
                        className={`${fs.iconBtn} ${fs.deleteBtn}`}
                        title="Xóa bài viết"
                        aria-label="Xóa bài viết"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>

            {/* Title */}
            <h4 className={fs.postTitle}>{post.title}</h4>

            {/* Content */}
            {post.content && <p className={fs.postContent}>{post.content}</p>}

            {/* Attachments */}
            {post.attachments.length > 0 && (
                <div className={fs.attachmentsSection}>
                    <div className={fs.attachmentsLabel}>
                        Tệp đính kèm ({post.attachments.length}):
                    </div>
                    <div className={fs.attachmentsList}>
                        {post.attachments.map((file, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    if (classId)
                                        void recordPostFileDownload(
                                            classId,
                                            post.id,
                                            file.file_name,
                                            file.file_url
                                        )
                                    void downloadFileWithOriginalName(
                                        file.file_url,
                                        file.file_name
                                    )
                                }}
                                className={fs.attachmentLink}
                            >
                                <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                                <span>{file.file_name}</span>
                                <span className={fs.fileSize}>
                                    ({(file.file_size / 1024).toFixed(1)} KB)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer — Reaction Bar + Lock button */}
            <div className={fs.postFooter}>
                <ReactionBar
                    classId={classId}
                    postId={post.id}
                    summary={
                        post.reactions_summary ?? {
                            like: 0,
                            heart: 0,
                            understood: 0,
                            user_reactions: [],
                        }
                    }
                    isInteractive={true}
                />
                {canLock && (
                    <button
                        type="button"
                        className={`${fs.lockBtn} ${post.is_comment_locked ? fs.lockActive : ''}`}
                        onClick={() =>
                            lockMutation.mutate(!post.is_comment_locked)
                        }
                        disabled={lockMutation.isPending}
                        title={
                            post.is_comment_locked
                                ? 'Mở khóa bình luận'
                                : 'Khóa bình luận'
                        }
                        aria-label={
                            post.is_comment_locked
                                ? 'Mở khóa bình luận'
                                : 'Khóa bình luận'
                        }
                    >
                        {post.is_comment_locked ? (
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="14"
                                height="14"
                            >
                                <rect
                                    x="3"
                                    y="11"
                                    width="18"
                                    height="11"
                                    rx="2"
                                    ry="2"
                                />
                                <path
                                    d="M7 11V7a5 5 0 0 1 10 0v4"
                                    stroke="currentColor"
                                    fill="none"
                                    strokeWidth="2"
                                />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                width="14"
                                height="14"
                            >
                                <rect
                                    x="3"
                                    y="11"
                                    width="18"
                                    height="11"
                                    rx="2"
                                    ry="2"
                                />
                                <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                        )}
                        {post.is_comment_locked
                            ? 'Mở bình luận'
                            : 'Khóa bình luận'}
                    </button>
                )}
            </div>

            {/* Comment Section */}
            <CommentSection
                classId={classId}
                postId={post.id}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                teacherId={teacherId}
                isCommentLocked={post.is_comment_locked}
                commentCount={post.comment_count ?? 0}
            />
        </div>
    )
}

export default ClassPostsFeedTab
