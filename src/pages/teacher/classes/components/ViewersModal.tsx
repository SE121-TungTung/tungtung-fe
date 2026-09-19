/**
 * ViewersModal.tsx — Modal Thống kê tương tác bài viết (Views, Reactions/Comments, Downloads).
 *
 * Dành cho GV / TA / Admin theo dõi chi tiết:
 * 1. Đã xem (Views): Tỷ lệ và danh sách học viên đã xem / chưa xem.
 * 2. Đã tương tác (Interactions): Học viên đã thả reaction (Like/Heart/Understood) hoặc gửi bình luận.
 * 3. Đã tải tài liệu (Downloads): Học viên đã tải file đính kèm nào về máy.
 *
 * Lưu ý: Toàn bộ sử dụng icon SVG chuẩn hóa, không dùng emoji.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
    getPostViewers,
    type ViewerInfo,
    type InteractedStudentInfo,
    type DownloadedStudentInfo,
} from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import s from './ViewersModal.module.css'

interface ViewersModalProps {
    isOpen: boolean
    onClose: () => void
    classId: string
    postId: string | null
    postTitle?: string
}

type MetricCategory = 'views' | 'interactions' | 'downloads'
type StatusFilter = 'completed' | 'pending'

// ─── Inline SVG Icons (NO emojis) ──────────────────────────────────────────

const BarChartIcon = ({ size = 18 }: { size?: number }) => (
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
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
)

const EyeIcon = ({ size = 16 }: { size?: number }) => (
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
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const HeartIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
)

const ThumbsUpIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
)

const LightbulbIcon = ({ size = 14 }: { size?: number }) => (
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
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
    </svg>
)

const MessageSquareIcon = ({ size = 14 }: { size?: number }) => (
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)

const DownloadIcon = ({ size = 16 }: { size?: number }) => (
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

const FileTextIcon = ({ size = 13 }: { size?: number }) => (
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
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
)

const CheckCircleIcon = ({ size = 14 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)

const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
        aria-hidden="true"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const SearchIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="15"
        height="15"
        aria-hidden="true"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

// ─── Component ───────────────────────────────────────────────────────────────

export function ViewersModal({
    isOpen,
    onClose,
    classId,
    postId,
    postTitle,
}: ViewersModalProps) {
    const [selectedCategory, setSelectedCategory] =
        useState<MetricCategory>('views')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('completed')
    const [searchTerm, setSearchTerm] = useState('')

    // Reset filter khi đóng/mở
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('')
            setSelectedCategory('views')
            setStatusFilter('completed')
        }
    }, [isOpen, postId])

    // Đóng bằng phím Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.classes.postViewers(classId, postId ?? ''),
        queryFn: () => getPostViewers(classId, postId!),
        enabled: Boolean(isOpen && postId),
        staleTime: 15_000,
    })

    const totalStudents = data?.total_students ?? 0
    const hasAttachments = data?.downloads?.has_attachments ?? false

    // Metric summaries
    const viewsCount = data?.views?.count ?? data?.viewed_count ?? 0
    const viewsPct =
        data?.views?.percentage ??
        (totalStudents > 0 ? Math.round((viewsCount / totalStudents) * 100) : 0)

    const interactionsCount = data?.interactions?.count ?? 0
    const interactionsPct = data?.interactions?.percentage ?? 0

    const downloadsCount = data?.downloads?.count ?? 0
    const downloadsPct = data?.downloads?.percentage ?? 0

    // Filter current list based on category, status, search
    const currentList = useMemo(() => {
        if (!data) return []

        const lower = searchTerm.toLowerCase().trim()
        const filterMatch = (item: { name: string; email: string }) => {
            if (!lower) return true
            return (
                item.name.toLowerCase().includes(lower) ||
                item.email.toLowerCase().includes(lower)
            )
        }

        if (selectedCategory === 'views') {
            const list =
                statusFilter === 'completed'
                    ? (data.views?.viewers ?? data.viewers ?? [])
                    : (data.views?.non_viewers ?? data.non_viewers ?? [])
            return list.filter(filterMatch)
        }

        if (selectedCategory === 'interactions') {
            const list =
                statusFilter === 'completed'
                    ? (data.interactions?.interacted ?? [])
                    : (data.interactions?.not_interacted ?? [])
            return list.filter(filterMatch)
        }

        if (selectedCategory === 'downloads') {
            const list =
                statusFilter === 'completed'
                    ? (data.downloads?.downloaded ?? [])
                    : (data.downloads?.not_downloaded ?? [])
            return list.filter(filterMatch)
        }

        return []
    }, [data, selectedCategory, statusFilter, searchTerm])

    if (!isOpen || !postId) return null

    // Counts for status tabs
    let completedCount = 0
    let pendingCount = 0
    let completedLabel = ''
    let pendingLabel = ''

    if (selectedCategory === 'views') {
        completedCount = viewsCount
        pendingCount =
            data?.views?.non_viewers?.length ?? data?.not_viewed_count ?? 0
        completedLabel = 'Đã xem'
        pendingLabel = 'Chưa xem'
    } else if (selectedCategory === 'interactions') {
        completedCount = interactionsCount
        pendingCount = data?.interactions?.not_interacted?.length ?? 0
        completedLabel = 'Đã tương tác'
        pendingLabel = 'Chưa tương tác'
    } else {
        completedCount = downloadsCount
        pendingCount = data?.downloads?.not_downloaded?.length ?? 0
        completedLabel = 'Đã tải'
        pendingLabel = 'Chưa tải'
    }

    return (
        <div
            className={s.backdrop}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewers-modal-title"
        >
            <div className={s.modal}>
                {/* ─── Header ─── */}
                <div className={s.header}>
                    <div className={s.titleArea}>
                        <div className={s.titleRow}>
                            <span className={s.headerIcon}>
                                <BarChartIcon size={20} />
                            </span>
                            <h3 id="viewers-modal-title" className={s.title}>
                                Thống kê tương tác bài viết
                            </h3>
                        </div>
                        {postTitle && (
                            <p className={s.postTitlePreview} title={postTitle}>
                                {postTitle}
                            </p>
                        )}
                    </div>
                    <button
                        className={s.closeBtn}
                        onClick={onClose}
                        aria-label="Đóng"
                        type="button"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* ─── 3 Metrics Dashboard Grid ─── */}
                <div className={s.metricsDashboard}>
                    {/* Card 1: Views */}
                    <button
                        type="button"
                        className={`${s.metricCard} ${selectedCategory === 'views' ? s.metricCardActive : ''}`}
                        onClick={() => setSelectedCategory('views')}
                    >
                        <div className={s.metricTop}>
                            <span className={s.metricLabel}>
                                <EyeIcon size={14} /> Lượt xem
                            </span>
                            <span className={s.metricBadge}>{viewsPct}%</span>
                        </div>
                        <div className={s.metricValue}>
                            {viewsCount}
                            <span className={s.metricSub}>
                                /{totalStudents}
                            </span>
                        </div>
                        <div className={s.metricProgressTrack}>
                            <div
                                className={s.metricProgressFill}
                                style={{
                                    width: `${viewsPct}%`,
                                    backgroundColor: '#3b82f6',
                                }}
                            />
                        </div>
                    </button>

                    {/* Card 2: Interactions */}
                    <button
                        type="button"
                        className={`${s.metricCard} ${selectedCategory === 'interactions' ? s.metricCardActive : ''}`}
                        onClick={() => setSelectedCategory('interactions')}
                    >
                        <div className={s.metricTop}>
                            <span className={s.metricLabel}>
                                <HeartIcon size={13} /> Tương tác
                            </span>
                            <span className={s.metricBadge}>
                                {interactionsPct}%
                            </span>
                        </div>
                        <div className={s.metricValue}>
                            {interactionsCount}
                            <span className={s.metricSub}>
                                /{totalStudents}
                            </span>
                        </div>
                        <div className={s.metricProgressTrack}>
                            <div
                                className={s.metricProgressFill}
                                style={{
                                    width: `${interactionsPct}%`,
                                    backgroundColor: '#ec4899',
                                }}
                            />
                        </div>
                    </button>

                    {/* Card 3: Downloads */}
                    <button
                        type="button"
                        disabled={!hasAttachments}
                        className={`${s.metricCard} ${selectedCategory === 'downloads' ? s.metricCardActive : ''} ${!hasAttachments ? s.metricCardDisabled : ''}`}
                        onClick={() => {
                            if (hasAttachments) setSelectedCategory('downloads')
                        }}
                        title={
                            hasAttachments
                                ? 'Xem thống kê tải tài liệu'
                                : 'Bài viết không có tệp đính kèm'
                        }
                    >
                        <div className={s.metricTop}>
                            <span className={s.metricLabel}>
                                <DownloadIcon size={14} /> Tải tài liệu
                            </span>
                            {hasAttachments && (
                                <span className={s.metricBadge}>
                                    {downloadsPct}%
                                </span>
                            )}
                        </div>
                        <div className={s.metricValue}>
                            {hasAttachments ? (
                                <>
                                    {downloadsCount}
                                    <span className={s.metricSub}>
                                        /{totalStudents}
                                    </span>
                                </>
                            ) : (
                                <span
                                    className={s.metricSub}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    Không có tệp
                                </span>
                            )}
                        </div>
                        <div className={s.metricProgressTrack}>
                            <div
                                className={s.metricProgressFill}
                                style={{
                                    width: `${downloadsPct}%`,
                                    backgroundColor: '#f59e0b',
                                }}
                            />
                        </div>
                    </button>
                </div>

                {/* ─── Controls: Subtabs + Search ─── */}
                <div className={s.controlsSection}>
                    <div className={s.filterRow}>
                        <div className={s.statusTabs}>
                            <button
                                type="button"
                                className={`${s.statusTabBtn} ${statusFilter === 'completed' ? s.statusTabBtnActive : ''}`}
                                onClick={() => setStatusFilter('completed')}
                            >
                                {completedLabel}
                                <span className={s.tabBadge}>
                                    {completedCount}
                                </span>
                            </button>
                            <button
                                type="button"
                                className={`${s.statusTabBtn} ${statusFilter === 'pending' ? s.statusTabBtnActive : ''}`}
                                onClick={() => setStatusFilter('pending')}
                            >
                                {pendingLabel}
                                <span className={s.tabBadge}>
                                    {pendingCount}
                                </span>
                            </button>
                        </div>

                        <div className={s.searchBox}>
                            <span className={s.searchIcon}>
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                className={s.searchInput}
                                placeholder="Tìm học viên theo tên hoặc email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* ─── Students List ─── */}
                <div className={s.listContainer}>
                    {isLoading ? (
                        <div className={s.loadingContainer}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className={s.skeletonItem}>
                                    <div className={s.skeletonAvatar} />
                                    <div className={s.skeletonLines}>
                                        <div
                                            className={s.skeletonLine}
                                            style={{ width: '60%' }}
                                        />
                                        <div
                                            className={s.skeletonLine}
                                            style={{ width: '40%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className={s.emptyState}>
                            <p className={s.emptyText}>
                                Không thể tải danh sách thống kê tương tác.
                            </p>
                            <button
                                type="button"
                                className={s.footerCloseBtn}
                                onClick={() => void refetch()}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : currentList.length === 0 ? (
                        <div className={s.emptyState}>
                            {searchTerm ? (
                                <p className={s.emptyText}>
                                    Không tìm thấy học viên phù hợp với từ khóa
                                    &ldquo;{searchTerm}&rdquo;.
                                </p>
                            ) : statusFilter === 'completed' ? (
                                <p className={s.emptyText}>
                                    Chưa có học viên nào hoàn thành mục này.
                                </p>
                            ) : (
                                <p className={s.emptyText}>
                                    Tất cả học viên đều đã hoàn thành mục này!
                                </p>
                            )}
                        </div>
                    ) : (
                        currentList.map((student: any) => {
                            const initial = student.name
                                ? student.name.trim().charAt(0).toUpperCase()
                                : '?'

                            return (
                                <div
                                    key={student.user_id}
                                    className={s.studentItem}
                                >
                                    <div className={s.studentProfile}>
                                        {student.avatar_url ? (
                                            <img
                                                src={student.avatar_url}
                                                alt={student.name}
                                                className={s.avatar}
                                            />
                                        ) : (
                                            <div
                                                className={s.avatarPlaceholder}
                                            >
                                                {initial}
                                            </div>
                                        )}
                                        <div className={s.studentMeta}>
                                            <p className={s.studentName}>
                                                {student.name}
                                            </p>
                                            <p className={s.studentEmail}>
                                                {student.email}
                                            </p>

                                            {/* Details for Interactions */}
                                            {selectedCategory ===
                                                'interactions' &&
                                                statusFilter ===
                                                    'completed' && (
                                                    <div
                                                        className={
                                                            s.detailBadges
                                                        }
                                                    >
                                                        {(
                                                            student as InteractedStudentInfo
                                                        ).reactions?.map(
                                                            (r: string) => (
                                                                <span
                                                                    key={r}
                                                                    className={`${s.reactionChip} ${
                                                                        r ===
                                                                        'like'
                                                                            ? s.reactionChipLike
                                                                            : r ===
                                                                                'heart'
                                                                              ? s.reactionChipHeart
                                                                              : s.reactionChipUnderstood
                                                                    }`}
                                                                >
                                                                    {r ===
                                                                        'like' && (
                                                                        <ThumbsUpIcon
                                                                            size={
                                                                                11
                                                                            }
                                                                        />
                                                                    )}
                                                                    {r ===
                                                                        'heart' && (
                                                                        <HeartIcon
                                                                            size={
                                                                                11
                                                                            }
                                                                        />
                                                                    )}
                                                                    {r ===
                                                                        'understood' && (
                                                                        <LightbulbIcon
                                                                            size={
                                                                                11
                                                                            }
                                                                        />
                                                                    )}
                                                                    <span>
                                                                        {r ===
                                                                        'like'
                                                                            ? 'Thích'
                                                                            : r ===
                                                                                'heart'
                                                                              ? 'Yêu thích'
                                                                              : 'Đã hiểu'}
                                                                    </span>
                                                                </span>
                                                            )
                                                        )}
                                                        {(
                                                            student as InteractedStudentInfo
                                                        ).comment_count > 0 && (
                                                            <span
                                                                className={
                                                                    s.commentChip
                                                                }
                                                            >
                                                                <MessageSquareIcon
                                                                    size={11}
                                                                />
                                                                <span>
                                                                    {
                                                                        (
                                                                            student as InteractedStudentInfo
                                                                        )
                                                                            .comment_count
                                                                    }{' '}
                                                                    bình luận
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                            {/* Details for Downloads */}
                                            {selectedCategory === 'downloads' &&
                                                statusFilter ===
                                                    'completed' && (
                                                    <div
                                                        className={
                                                            s.detailBadges
                                                        }
                                                    >
                                                        {(
                                                            student as DownloadedStudentInfo
                                                        ).downloaded_files?.map(
                                                            (fn: string) => (
                                                                <span
                                                                    key={fn}
                                                                    className={
                                                                        s.fileChip
                                                                    }
                                                                    title={fn}
                                                                >
                                                                    <FileTextIcon
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                    <span>
                                                                        {fn}
                                                                    </span>
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Action Meta & Relative Time */}
                                    <div className={s.actionMeta}>
                                        {statusFilter === 'completed' ? (
                                            <>
                                                <div
                                                    className={s.statusSuccess}
                                                >
                                                    <CheckCircleIcon
                                                        size={14}
                                                    />
                                                    <span>
                                                        {selectedCategory ===
                                                        'views'
                                                            ? 'Đã xem'
                                                            : selectedCategory ===
                                                                'interactions'
                                                              ? 'Đã tương tác'
                                                              : 'Đã tải'}
                                                    </span>
                                                </div>
                                                {/* Relative timestamp */}
                                                {(student.viewed_at ||
                                                    student.last_interacted_at ||
                                                    student.last_downloaded_at) && (
                                                    <span
                                                        className={
                                                            s.relativeTime
                                                        }
                                                    >
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                student.viewed_at ||
                                                                    student.last_interacted_at ||
                                                                    student.last_downloaded_at
                                                            ),
                                                            {
                                                                addSuffix: true,
                                                                locale: vi,
                                                            }
                                                        )}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className={s.statusPending}>
                                                {selectedCategory === 'views'
                                                    ? 'Chưa xem'
                                                    : selectedCategory ===
                                                        'interactions'
                                                      ? 'Chưa tương tác'
                                                      : 'Chưa tải'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* ─── Footer ─── */}
                <div className={s.footer}>
                    <button
                        type="button"
                        className={s.footerCloseBtn}
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}
