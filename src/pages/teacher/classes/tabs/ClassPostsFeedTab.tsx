import React, { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ClassPost, MaterialCategory } from '@/lib/classes'
import { MATERIAL_CATEGORY_LABELS, lockPostComments } from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import { ReactionBar } from '../components/ReactionBar'
import { CommentSection } from '../components/CommentSection'
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

const materialCategories = Object.entries(MATERIAL_CATEGORY_LABELS) as [
    MaterialCategory,
    string,
][]

type PostFilter = 'all' | 'announcement' | 'material'

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

function FileExtError({ files }: { files: File[] }) {
    const blocked = files.filter((f) => {
        const ext = '.' + (f.name.split('.').pop() || '').toLowerCase()
        return BLOCKED_EXTENSIONS.has(ext)
    })
    if (!blocked.length) return null
    return (
        <span className={fs.fileError}>
            ⚠ Không cho phép: {blocked.map((f) => f.name).join(', ')}
        </span>
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
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Client-side filter (BE cũng filter, đây là UX nhanh hơn)
    const filteredPosts =
        filter === 'all' ? posts : posts.filter((p) => p.post_type === filter)

    // Client-side file validation before submit
    const hasBlockedFile = selectedFiles.some((f) => {
        const ext = '.' + (f.name.split('.').pop() || '').toLowerCase()
        return BLOCKED_EXTENSIONS.has(ext)
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return
        const files = Array.from(e.target.files)
        if (files.length > MAX_FILES) {
            alert(`Chỉ được đính kèm tối đa ${MAX_FILES} tệp.`)
            e.target.value = ''
            return
        }
        setSelectedFiles(files)
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

    const handleSubmit = (e: React.FormEvent) => {
        if (hasBlockedFile) {
            e.preventDefault()
            alert(
                'Vui lòng xoá các tệp có định dạng bị cấm trước khi đăng bài.'
            )
            return
        }
        handleCreatePost(e)
    }

    return (
        <div className={s.feedGrid}>
            {/* ═══ Cột 1: Form Đăng bài ════════════════════════════════════ */}
            <div className={s.card} style={{ height: 'fit-content' }}>
                <h3 className={s.sectionTitle}>Tạo thông báo / tài liệu mới</h3>

                <form onSubmit={handleSubmit} className={fs.form}>
                    {/* Loại bài đăng */}
                    <div className={fs.formGroup}>
                        <label htmlFor="post-type-select" className={fs.label}>
                            Loại bài đăng
                        </label>
                        <select
                            id="post-type-select"
                            value={postType}
                            onChange={(e) => {
                                setPostType(
                                    e.target.value as
                                        'announcement' | 'material'
                                )
                                setMaterialCategory('')
                            }}
                            className={fs.select}
                        >
                            <option value="announcement">📢 Thông báo</option>
                            <option value="material">
                                📚 Tài liệu học tập
                            </option>
                        </select>
                    </div>

                    {/* Phân loại tài liệu (chỉ hiện với material) */}
                    {postType === 'material' && (
                        <div className={fs.formGroup}>
                            <label
                                htmlFor="material-category"
                                className={fs.label}
                            >
                                Phân loại tài liệu
                            </label>
                            <select
                                id="material-category"
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
                        <label htmlFor="post-title" className={fs.label}>
                            Tiêu đề <span className={fs.required}>*</span>
                        </label>
                        <input
                            id="post-title"
                            type="text"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            placeholder="Ví dụ: Tài liệu Unit 5, Thông báo nghỉ học..."
                            className={fs.input}
                        />
                    </div>

                    {/* Nội dung */}
                    <div className={fs.formGroup}>
                        <label htmlFor="post-content" className={fs.label}>
                            Nội dung chi tiết
                        </label>
                        <textarea
                            id="post-content"
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
                        <label htmlFor="post-files" className={fs.fileLabel}>
                            📎 Chọn tệp...
                        </label>
                        <input
                            id="post-files"
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
                                    return (
                                        <div
                                            key={idx}
                                            className={`${fs.fileChip} ${isBlocked ? fs.fileChipError : ''}`}
                                        >
                                            <span className={fs.fileName}>
                                                {file.name}
                                            </span>
                                            <span className={fs.fileSize}>
                                                ({(file.size / 1024).toFixed(1)}{' '}
                                                KB)
                                            </span>
                                            <button
                                                type="button"
                                                className={fs.removeFile}
                                                onClick={() => removeFile(idx)}
                                                title="Xoá tệp này"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                })}
                                <FileExtError files={selectedFiles} />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isCreatingPost || hasBlockedFile}
                        className={fs.submitBtn}
                    >
                        {isCreatingPost ? 'Đang đăng bài...' : 'Đăng bài viết'}
                    </button>
                </form>
            </div>

            {/* ═══ Cột 2: Danh sách bài đã đăng ═══════════════════════════ */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                <div className={fs.listHeader}>
                    <h3 className={s.sectionTitle} style={{ margin: 0 }}>
                        Lịch sử bảng tin
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
                                onClick={() => setFilter(tab)}
                                className={`${fs.filterTab} ${filter === tab ? fs.filterTabActive : ''}`}
                            >
                                {tab === 'all'
                                    ? 'Tất cả'
                                    : tab === 'announcement'
                                      ? '📢 Thông báo'
                                      : '📚 Tài liệu'}
                            </button>
                        ))}
                    </div>
                </div>

                {postsLoading ? (
                    <div className={fs.loadingText}>Đang tải danh sách...</div>
                ) : filteredPosts.length === 0 ? (
                    <div className={s.emptyText}>
                        {filter === 'all'
                            ? 'Lớp học chưa có thông báo hoặc tài liệu nào.'
                            : `Không có bài ${filter === 'announcement' ? 'thông báo' : 'tài liệu'} nào.`}
                    </div>
                ) : (
                    filteredPosts.map((post) => (
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
                        />
                    ))
                )}
            </div>
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
        <div
            className={`${s.card} ${post.is_pinned ? fs.pinnedCard : ''}`}
            style={{ padding: '20px' }}
        >
            {/* Pin indicator banner */}
            {post.is_pinned && (
                <div className={fs.pinnedBanner}>
                    📌 <span>Đang được ghim</span>
                </div>
            )}

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
                        📌
                    </button>

                    {/* Chỉnh sửa (chỉ tác giả) */}
                    {isAuthor && (
                        <button
                            onClick={onEdit}
                            className={fs.iconBtn}
                            title="Chỉnh sửa bài viết"
                            aria-label="Chỉnh sửa bài viết"
                        >
                            ✏️
                        </button>
                    )}

                    {/* Xóa */}
                    <button
                        onClick={onDelete}
                        className={`${fs.iconBtn} ${fs.deleteBtn}`}
                        title="Xóa bài viết"
                        aria-label="Xóa bài viết"
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
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
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
                            <a
                                key={idx}
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
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
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Phase 2: Footer — Reaction Bar + Lock button ─── */}
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

            {/* ─── Phase 2: Comment Section ─── */}
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
