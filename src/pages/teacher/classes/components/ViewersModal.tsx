/**
 * ViewersModal.tsx
 * Modal hiển thị danh sách học viên đã xem và chưa xem bài viết (dành cho GV / TA / Admin).
 *
 * Nghiệp vụ:
 * - Thống kê tỷ lệ đã xem: viewed_count / total_students
 * - 2 tabs: Đã xem (kèm thời gian xem relative) & Chưa xem
 * - Tìm kiếm theo tên / email học viên
 * - Chỉ liệt kê học viên (role = student enrolled)
 */

import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { getPostViewers, type ViewerInfo } from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import s from './ViewersModal.module.css'

interface ViewersModalProps {
    isOpen: boolean
    onClose: () => void
    classId: string
    postId: string | null
    postTitle?: string
}

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const EyeIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
        aria-hidden="true"
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
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

const CheckIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="12"
        height="12"
        aria-hidden="true"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

export function ViewersModal({
    isOpen,
    onClose,
    classId,
    postId,
    postTitle,
}: ViewersModalProps) {
    const [activeTab, setActiveTab] = useState<'viewed' | 'not_viewed'>(
        'viewed'
    )
    const [searchTerm, setSearchTerm] = useState('')

    // Reset filter khi đóng/mở
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('')
            setActiveTab('viewed')
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

    const filteredViewers = useMemo(() => {
        if (!data) return []
        const list = activeTab === 'viewed' ? data.viewers : data.non_viewers
        if (!searchTerm.trim()) return list

        const lower = searchTerm.toLowerCase()
        return list.filter(
            (s) =>
                s.name.toLowerCase().includes(lower) ||
                s.email.toLowerCase().includes(lower)
        )
    }, [data, activeTab, searchTerm])

    if (!isOpen || !postId) return null

    const totalStudents = data?.total_students ?? 0
    const viewedCount = data?.viewed_count ?? 0
    const notViewedCount = data?.not_viewed_count ?? 0
    const percentage =
        totalStudents > 0 ? Math.round((viewedCount / totalStudents) * 100) : 0

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
                {/* Header */}
                <div className={s.header}>
                    <div className={s.titleArea}>
                        <div className={s.titleRow}>
                            <span className={s.headerIcon}>
                                <EyeIcon />
                            </span>
                            <h3 id="viewers-modal-title" className={s.title}>
                                Thống kê người đã xem
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

                {/* Progress bar & Overview stats */}
                <div className={s.statsSection}>
                    <div className={s.statsRow}>
                        <span className={s.statsLabel}>
                            Tỷ lệ hoàn thành xem:
                        </span>
                        <span className={s.statsCount}>
                            {viewedCount}
                            <span>
                                /{totalStudents} học viên ({percentage}%)
                            </span>
                        </span>
                    </div>
                    <div className={s.progressBarContainer}>
                        <div
                            className={s.progressBarFill}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                {/* Controls (Tabs + Search) */}
                <div className={s.controlsSection}>
                    <div className={s.tabsRow}>
                        <button
                            type="button"
                            className={`${s.tabBtn} ${activeTab === 'viewed' ? s.tabBtnActive : ''}`}
                            onClick={() => setActiveTab('viewed')}
                        >
                            Đã xem
                            <span className={s.tabBadge}>{viewedCount}</span>
                        </button>
                        <button
                            type="button"
                            className={`${s.tabBtn} ${activeTab === 'not_viewed' ? s.tabBtnActive : ''}`}
                            onClick={() => setActiveTab('not_viewed')}
                        >
                            Chưa xem
                            <span className={s.tabBadge}>{notViewedCount}</span>
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

                {/* Students list */}
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
                                Không thể tải danh sách người xem.
                            </p>
                            <button
                                type="button"
                                className={s.footerCloseBtn}
                                onClick={() => void refetch()}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : filteredViewers.length === 0 ? (
                        <div className={s.emptyState}>
                            {searchTerm ? (
                                <p className={s.emptyText}>
                                    Không tìm thấy học viên phù hợp với từ khóa
                                    &ldquo;{searchTerm}&rdquo;.
                                </p>
                            ) : activeTab === 'viewed' ? (
                                <p className={s.emptyText}>
                                    Chưa có học viên nào xem bài viết này.
                                </p>
                            ) : (
                                <p className={s.emptyText}>
                                    Tất cả học viên đều đã xem bài viết! 🎉
                                </p>
                            )}
                        </div>
                    ) : (
                        filteredViewers.map((student: ViewerInfo) => {
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
                                        </div>
                                    </div>

                                    {student.viewed_at ? (
                                        <div
                                            className={s.viewStatus}
                                            title={new Date(
                                                student.viewed_at
                                            ).toLocaleString('vi-VN')}
                                        >
                                            <CheckIcon />
                                            <span>
                                                {formatDistanceToNow(
                                                    new Date(student.viewed_at),
                                                    {
                                                        addSuffix: true,
                                                        locale: vi,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className={s.notViewStatus}>
                                            Chưa xem
                                        </span>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer */}
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
