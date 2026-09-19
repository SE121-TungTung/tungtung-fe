import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import s from './ClassNewsTab.module.css'
import {
    getClassPosts,
    recordPostView,
    recordPostFileDownload,
    MATERIAL_CATEGORY_LABELS,
    type ClassPost,
    type MaterialCategory,
} from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import { useSession } from '@/stores/session.store'
import { usePostViewTracker } from '@/hooks/usePostViewTracker'
import { ReactionBar } from '@/pages/teacher/classes/components/ReactionBar'
import { CommentSection } from '@/pages/teacher/classes/components/CommentSection'
import { downloadFileWithOriginalName } from '@/lib/download'

interface ClassNewsTabProps {
    classId?: string
}

type PostFilter = 'all' | 'announcement' | 'material'
const POSTS_PER_PAGE = 8

// ─── Inline SVG Icons (NO emojis) ──────────────────────────────────────────

const PinIcon = ({ size = 15 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
)

const BellIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
)

const BookOpenIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
)

const DownloadIcon = ({ size = 13 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

const PaperclipIcon = ({ size = 13 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
)

const ChevronLeftIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="15 18 9 12 15 6" />
    </svg>
)

const ChevronRightIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

const CloseIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

// ─── Pinned Posts Carousel (Facebook Style) ──────────────────────────────────

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
        <div className={s.pinnedCarouselWrapper}>
            <div className={s.pinnedCarouselHeader}>
                <PinIcon size={16} />
                <h3 className={s.pinnedCarouselTitle}>
                    Đáng chú ý ({posts.length}/3)
                </h3>
            </div>
            <div className={s.pinnedCarouselViewport}>
                {posts.length > 1 && (
                    <button
                        type="button"
                        className={`${s.carouselArrow} ${s.carouselArrowLeft}`}
                        onClick={() => scroll('left')}
                        aria-label="Mục trước đó"
                    >
                        <ChevronLeftIcon />
                    </button>
                )}
                <div className={s.pinnedCarouselTrack} ref={scrollRef}>
                    {posts.map((post) => (
                        <button
                            key={post.id}
                            type="button"
                            className={s.pinnedCarouselItem}
                            onClick={() => onClickPost(post)}
                        >
                            <div className={s.pinnedItemAvatar}>
                                {post.author?.full_name
                                    ?.charAt(0)
                                    .toUpperCase() ?? 'G'}
                            </div>
                            <div className={s.pinnedItemBody}>
                                <div className={s.pinnedItemAuthor}>
                                    {post.author?.full_name ?? 'Giảng viên'}
                                </div>
                                <div className={s.pinnedItemTitle}>
                                    {post.title}
                                </div>
                                {post.content && (
                                    <div className={s.pinnedItemPreview}>
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
                        className={`${s.carouselArrow} ${s.carouselArrowRight}`}
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

// ─── Pinned Post Expand Modal ────────────────────────────────────────────────

interface PinnedPostModalProps {
    post: ClassPost
    classId: string
    onClose: () => void
}

function PinnedPostDetailModal({
    post,
    classId,
    onClose,
}: PinnedPostModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    return (
        <div
            className={s.modalOverlay}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className={s.modalBox}>
                <div className={s.modalHeader}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <div className={s.avatar}>
                            {post.author?.full_name?.charAt(0).toUpperCase() ??
                                'G'}
                        </div>
                        <div>
                            <div className={s.authorName}>
                                {post.author?.full_name ?? 'Giảng viên'}
                            </div>
                            <div className={s.postMeta}>
                                {new Date(post.created_at).toLocaleString(
                                    'vi-VN'
                                )}
                                {post.is_edited && (
                                    <span className={s.editedBadge}>
                                        {' '}
                                        · (đã chỉnh sửa)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={s.modalClose}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div
                    style={{
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                    }}
                >
                    <div className={s.actionsRow}>
                        <span
                            className={`${s.typeBadge} ${post.post_type === 'material' ? s.badgeMaterial : s.badgeAnnouncement}`}
                        >
                            {post.post_type === 'material' ? (
                                <>
                                    <BookOpenIcon size={12} /> Tài liệu
                                </>
                            ) : (
                                <>
                                    <BellIcon size={12} /> Thông báo
                                </>
                            )}
                        </span>
                        {post.material_category && (
                            <span className={s.categoryBadge}>
                                {
                                    MATERIAL_CATEGORY_LABELS[
                                        post.material_category
                                    ]
                                }
                            </span>
                        )}
                    </div>

                    <h3 className={s.postTitle}>{post.title}</h3>
                    {post.content && (
                        <p className={s.postContent}>{post.content}</p>
                    )}

                    {/* Attachments */}
                    {post.attachments.length > 0 && (
                        <div className={s.attachmentsSection}>
                            <div className={s.attachmentsLabel}>
                                <PaperclipIcon size={12} /> Tệp đính kèm (
                                {post.attachments.length})
                            </div>
                            <div className={s.attachmentsList}>
                                {post.attachments.map((file, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            if (classId) {
                                                void recordPostFileDownload(
                                                    classId,
                                                    post.id,
                                                    file.file_name,
                                                    file.file_url
                                                )
                                            }
                                            void downloadFileWithOriginalName(
                                                file.file_url,
                                                file.file_name
                                            )
                                        }}
                                        className={s.attachmentLink}
                                        title={`Tải ${file.file_name}`}
                                    >
                                        <span className={s.attachmentIcon}>
                                            <DownloadIcon size={13} />
                                        </span>
                                        <span className={s.attachmentName}>
                                            {file.file_name}
                                        </span>
                                        <span className={s.fileSize}>
                                            (
                                            {(file.file_size / 1024).toFixed(1)}{' '}
                                            KB)
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reactions & Comments */}
                    <div className={s.postFooter}>
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
                    </div>

                    <CommentSection
                        classId={classId}
                        postId={post.id}
                        isLocked={post.is_comment_locked}
                    />
                </div>
            </div>
        </div>
    )
}

// ─── PostCard Component (with Auto View Tracker) ─────────────────────────────

interface StudentPostCardProps {
    post: ClassPost
    classId: string
    isStudent: boolean
}

function StudentPostCard({ post, classId, isStudent }: StudentPostCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)

    // Tự động ghi nhận lượt xem khi học viên dừng xem bài viết >= 2 giây
    usePostViewTracker({
        elementRef: cardRef,
        onViewed: () => {
            if (classId) {
                void recordPostView(classId, post.id)
            }
        },
        durationMs: 2000,
        threshold: 0.3,
        isEnabled: isStudent && Boolean(classId),
    })

    return (
        <div ref={cardRef} className={s.postCard}>
            {/* Header */}
            <div className={s.postHeaderRow}>
                <div className={s.authorRow}>
                    <div className={s.avatar}>
                        {post.author?.full_name?.charAt(0).toUpperCase() ?? 'G'}
                    </div>
                    <div>
                        <div className={s.authorName}>
                            {post.author?.full_name ?? 'Giảng viên'}
                        </div>
                        <div className={s.postMeta}>
                            {new Date(post.created_at).toLocaleString('vi-VN')}
                            {post.is_edited && (
                                <span className={s.editedBadge}>
                                    {' '}
                                    · (đã chỉnh sửa)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className={s.actionsRow}>
                    <span
                        className={`${s.typeBadge} ${post.post_type === 'material' ? s.badgeMaterial : s.badgeAnnouncement}`}
                    >
                        {post.post_type === 'material' ? (
                            <>
                                <BookOpenIcon size={12} /> Tài liệu
                            </>
                        ) : (
                            <>
                                <BellIcon size={12} /> Thông báo
                            </>
                        )}
                    </span>
                    {post.material_category && (
                        <span className={s.categoryBadge}>
                            {MATERIAL_CATEGORY_LABELS[post.material_category]}
                        </span>
                    )}
                </div>
            </div>

            {/* Title & Content */}
            <h4 className={s.postTitle}>{post.title}</h4>
            {post.content && <p className={s.postContent}>{post.content}</p>}

            {/* Attachments */}
            {post.attachments.length > 0 && (
                <div className={s.attachmentsSection}>
                    <div className={s.attachmentsLabel}>
                        <PaperclipIcon size={12} /> Tệp đính kèm (
                        {post.attachments.length}):
                    </div>
                    <div className={s.attachmentsList}>
                        {post.attachments.map((file, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    if (classId) {
                                        void recordPostFileDownload(
                                            classId,
                                            post.id,
                                            file.file_name,
                                            file.file_url
                                        )
                                    }
                                    void downloadFileWithOriginalName(
                                        file.file_url,
                                        file.file_name
                                    )
                                }}
                                className={s.attachmentLink}
                                title={`Tải ${file.file_name}`}
                            >
                                <span className={s.attachmentIcon}>
                                    <DownloadIcon size={13} />
                                </span>
                                <span className={s.attachmentName}>
                                    {file.file_name}
                                </span>
                                <span className={s.fileSize}>
                                    ({(file.file_size / 1024).toFixed(1)} KB)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer — Reactions */}
            <div className={s.postFooter}>
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
            </div>

            {/* Comment Section */}
            <CommentSection
                classId={classId}
                postId={post.id}
                isLocked={post.is_comment_locked}
            />
        </div>
    )
}

// ─── Main ClassNewsTab Component ─────────────────────────────────────────────

export default function ClassNewsTab({ classId }: ClassNewsTabProps) {
    const [filter, setFilter] = useState<PostFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedPinnedPost, setSelectedPinnedPost] =
        useState<ClassPost | null>(null)
    const { user } = useSession()

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: queryKeys.classes.posts(classId ?? ''),
        queryFn: () => getClassPosts(classId!, 1, 100),
        enabled: !!classId,
    })

    const allPosts: ClassPost[] = postsData?.data ?? []
    const isStudent = user?.role === 'student'

    // Filter posts: Khi filter = 'all', các bài ghim đã xuất hiện ở Carousel "Đáng chú ý",
    // danh sách bài viết bên dưới loại trừ bài ghim để không bị lặp.
    const filteredPosts = useMemo(() => {
        if (filter !== 'all') {
            return allPosts.filter((p) => p.post_type === filter)
        }
        return allPosts.filter((p) => !p.is_pinned)
    }, [allPosts, filter])

    // Pinned carousel: only shown when filter === 'all'
    const pinnedPosts = useMemo(() => {
        return allPosts.filter((p) => p.is_pinned)
    }, [allPosts])

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filter])

    // Pagination calculations
    const totalPages = Math.max(
        1,
        Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    )
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * POSTS_PER_PAGE
        return filteredPosts.slice(start, start + POSTS_PER_PAGE)
    }, [filteredPosts, currentPage])

    return (
        <div className={s.feedLayout}>
            {/* ─── Pinned Carousel ("Đáng chú ý" - Facebook style) ─── */}
            {filter === 'all' && pinnedPosts.length > 0 && (
                <PinnedPostsCarousel
                    posts={pinnedPosts}
                    onClickPost={(post) => setSelectedPinnedPost(post)}
                />
            )}

            {/* ─── Filter Tabs Bar ─── */}
            <div className={s.listHeader}>
                <div className={s.filterTabs} role="tablist">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'all'}
                        className={`${s.filterTab} ${filter === 'all' ? s.filterTabActive : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Tất cả
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'announcement'}
                        className={`${s.filterTab} ${filter === 'announcement' ? s.filterTabActive : ''}`}
                        onClick={() => setFilter('announcement')}
                    >
                        <BellIcon size={13} />
                        Thông báo
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={filter === 'material'}
                        className={`${s.filterTab} ${filter === 'material' ? s.filterTabActive : ''}`}
                        onClick={() => setFilter('material')}
                    >
                        <BookOpenIcon size={13} />
                        Tài liệu
                    </button>
                </div>
            </div>

            {/* ─── Feed Posts List ─── */}
            {postsLoading ? (
                <div className={s.loadingSkeleton}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={s.skeletonCard}>
                            <div
                                className={s.skeletonRow}
                                style={{ width: '35%' }}
                            />
                            <div
                                className={s.skeletonRow}
                                style={{ width: '70%' }}
                            />
                            <div
                                className={s.skeletonRow}
                                style={{ width: '50%' }}
                            />
                        </div>
                    ))}
                </div>
            ) : paginatedPosts.length === 0 ? (
                <div className={s.emptyState}>
                    <p className={s.emptyTitle}>
                        {filter === 'all'
                            ? 'Lớp học chưa có bài đăng nào.'
                            : `Chưa có ${filter === 'announcement' ? 'thông báo' : 'tài liệu'} nào.`}
                    </p>
                    <p className={s.emptySubtitle}>
                        Các thông báo và tài liệu mới từ giảng viên sẽ xuất hiện
                        tại đây.
                    </p>
                </div>
            ) : (
                <>
                    {paginatedPosts.map((post) => (
                        <StudentPostCard
                            key={post.id}
                            post={post}
                            classId={classId ?? ''}
                            isStudent={isStudent}
                        />
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className={s.pagination}>
                            <button
                                type="button"
                                className={s.pageBtn}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                            >
                                <ChevronLeftIcon />
                                <span>Trang trước</span>
                            </button>

                            <div className={s.pageNumbers}>
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        className={`${s.pageNumBtn} ${currentPage === pageNum ? s.pageNumBtnActive : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className={s.pageBtn}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                <span>Trang sau</span>
                                <ChevronRightIcon />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ─── Pinned Post Expand Modal ─── */}
            {selectedPinnedPost && (
                <PinnedPostDetailModal
                    post={selectedPinnedPost}
                    classId={classId ?? ''}
                    onClose={() => setSelectedPinnedPost(null)}
                />
            )}
        </div>
    )
}
