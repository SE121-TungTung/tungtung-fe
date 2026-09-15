/**
 * ClassMaterialsLibraryTab.tsx
 * Kho Học Liệu Số — Tab thư viện tài liệu lớp học.
 *
 * Dùng chung cho cả Teacher và Student view.
 * Tất cả tệp thuộc bài đăng post_type=material tự động xuất hiện ở đây.
 *
 * Tính năng:
 * - Tìm kiếm realtime (debounce 400ms) theo tên file / title bài viết
 * - Lọc theo danh mục (material_category) với color-coded tags
 * - Card tài liệu hiển thị dung lượng, định dạng, người đăng, ngày
 * - Nút "Tải về" trực tiếp từ Cloudinary CDN
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    getClassMaterials,
    MATERIAL_CATEGORY_LABELS,
    MATERIAL_CATEGORY_COLORS,
    type MaterialCategory,
    type ClassPost,
    type ClassPostAttachment,
} from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'
import { useDebounce } from '@/hooks/useDebounce'
import s from './ClassMaterialsLibraryTab.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassMaterialsLibraryTabProps {
    classId: string
}

/** Flattened view: mỗi attachment = 1 card hiển thị */
interface MaterialItem {
    id: string // `${postId}-${attachmentIndex}`
    postId: string
    postTitle: string
    materialCategory: MaterialCategory | undefined
    author: ClassPost['author']
    createdAt: string
    attachment: ClassPostAttachment
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = Object.keys(
    MATERIAL_CATEGORY_LABELS
) as MaterialCategory[]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lấy icon theo mime type */
function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.startsWith('video/')) return '🎬'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
        return '📊'
    if (
        mimeType.includes('zip') ||
        mimeType.includes('rar') ||
        mimeType.includes('compressed')
    )
        return '📦'
    return '📎'
}

/** Lấy extension từ tên file */
function getFileExtension(fileName: string): string {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE'
}

/** Format dung lượng file */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Format ngày tạo */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

/** Lấy ký tự đầu để tạo avatar chữ cái */
function getInitial(name: string): string {
    return name.charAt(0).toUpperCase()
}

/** Flatten posts → material items (mỗi attachment = 1 card) */
function flattenMaterials(posts: ClassPost[]): MaterialItem[] {
    const items: MaterialItem[] = []
    for (const post of posts) {
        if (!post.attachments?.length) continue
        post.attachments.forEach((att, idx) => {
            items.push({
                id: `${post.id}-${idx}`,
                postId: post.id,
                postTitle: post.title,
                materialCategory: post.material_category,
                author: post.author,
                createdAt: post.created_at,
                attachment: att,
            })
        })
    }
    return items
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const SearchSvg = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16"
        height="16"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const DownloadSvg = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="14"
        height="14"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

// ─── Component ────────────────────────────────────────────────────────────────

export function ClassMaterialsLibraryTab({
    classId,
}: ClassMaterialsLibraryTabProps) {
    // ─── State ────────────────────────────────────────────────────────────────
    const [searchInput, setSearchInput] = useState('')
    const [selectedCategory, setSelectedCategory] =
        useState<MaterialCategory | null>(null)

    const debouncedSearch = useDebounce(searchInput, 400)

    // ─── Data Fetching ────────────────────────────────────────────────────────
    const { data, isLoading } = useQuery({
        queryKey: queryKeys.classes.materials(
            classId,
            selectedCategory ?? undefined,
            debouncedSearch || undefined
        ),
        queryFn: () =>
            getClassMaterials({
                classId,
                materialCategory: selectedCategory ?? undefined,
                search: debouncedSearch || undefined,
            }),
        enabled: Boolean(classId),
    })

    const posts = data?.data ?? []
    const materialItems = useMemo(() => flattenMaterials(posts), [posts])

    // ─── Category Toggle ──────────────────────────────────────────────────────
    const handleCategoryClick = (cat: MaterialCategory) => {
        setSelectedCategory((prev) => (prev === cat ? null : cat))
    }

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            {/* ═══ Toolbar: Search + Filter ═══════════════════════════════ */}
            <div className={s.toolbar}>
                {/* Search */}
                <div className={s.searchWrapper}>
                    <span className={s.searchIcon}>
                        <SearchSvg />
                    </span>
                    <input
                        id="material-search"
                        type="text"
                        className={s.searchInput}
                        placeholder="Tìm kiếm tài liệu theo tên file hoặc tiêu đề..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                {/* Category filter tags */}
                <div className={s.categoryFilters}>
                    <button
                        type="button"
                        className={`${s.categoryTag} ${selectedCategory === null ? s.categoryTagActive : ''}`}
                        style={
                            selectedCategory === null
                                ? {
                                      background: '#6366f1',
                                      borderColor: '#6366f1',
                                  }
                                : undefined
                        }
                        onClick={() => setSelectedCategory(null)}
                    >
                        Tất cả
                    </button>
                    {ALL_CATEGORIES.map((cat) => {
                        const color = MATERIAL_CATEGORY_COLORS[cat]
                        const isActive = selectedCategory === cat
                        return (
                            <button
                                key={cat}
                                type="button"
                                className={`${s.categoryTag} ${isActive ? s.categoryTagActive : ''}`}
                                style={
                                    isActive
                                        ? {
                                              background: color,
                                              borderColor: color,
                                          }
                                        : undefined
                                }
                                onClick={() => handleCategoryClick(cat)}
                            >
                                <span
                                    className={s.categoryDot}
                                    style={{
                                        background: isActive ? '#fff' : color,
                                    }}
                                />
                                {MATERIAL_CATEGORY_LABELS[cat]}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ═══ Stats Bar ══════════════════════════════════════════════ */}
            {!isLoading && (
                <div className={s.statsBar}>
                    <span>
                        <span className={s.statsCount}>
                            {materialItems.length}
                        </span>{' '}
                        tệp tài liệu
                        {selectedCategory &&
                            ` trong "${MATERIAL_CATEGORY_LABELS[selectedCategory]}"`}
                        {debouncedSearch && ` phù hợp "${debouncedSearch}"`}
                    </span>
                </div>
            )}

            {/* ═══ Materials Grid ═════════════════════════════════════════ */}
            {isLoading ? (
                <div className={s.materialsGrid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={s.skeletonCard}>
                            <div className={s.skeletonLine} />
                            <div className={s.skeletonLine} />
                            <div className={s.skeletonLine} />
                        </div>
                    ))}
                </div>
            ) : materialItems.length === 0 ? (
                <div className={s.emptyState}>
                    <div className={s.emptyIcon}>📚</div>
                    <h3 className={s.emptyTitle}>
                        {debouncedSearch || selectedCategory
                            ? 'Không tìm thấy tài liệu'
                            : 'Chưa có tài liệu nào'}
                    </h3>
                    <p className={s.emptyDescription}>
                        {debouncedSearch || selectedCategory
                            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                            : 'Các tài liệu sẽ xuất hiện tại đây khi giáo viên đăng bài tài liệu lên bảng tin.'}
                    </p>
                </div>
            ) : (
                <div className={s.materialsGrid}>
                    {materialItems.map((item) => (
                        <MaterialCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── MaterialCard ─────────────────────────────────────────────────────────────

function MaterialCard({ item }: { item: MaterialItem }) {
    const { attachment, materialCategory, postTitle, author, createdAt } = item
    const ext = getFileExtension(attachment.file_name)
    const icon = getFileIcon(attachment.mime_type)
    const size = formatFileSize(attachment.file_size)
    const date = formatDate(createdAt)
    const catColor = materialCategory
        ? MATERIAL_CATEGORY_COLORS[materialCategory]
        : '#6b7280'
    const catLabel = materialCategory
        ? MATERIAL_CATEGORY_LABELS[materialCategory]
        : null

    return (
        <div className={s.materialCard} style={{ borderLeftColor: catColor }}>
            {/* Header: icon + filename */}
            <div className={s.cardHeader}>
                <div
                    className={s.fileIconBox}
                    style={{
                        background: `${catColor}14`,
                        color: catColor,
                    }}
                >
                    {icon}
                </div>
                <div className={s.fileInfo}>
                    <div className={s.fileName} title={attachment.file_name}>
                        {attachment.file_name}
                    </div>
                    <div className={s.fileMeta}>
                        <span>{size}</span>
                        <span className={s.fileDot} />
                        <span>{ext}</span>
                    </div>
                </div>
            </div>

            {/* Body: category + post title */}
            <div className={s.cardBody}>
                {catLabel && (
                    <span
                        className={s.categoryBadge}
                        style={{ background: catColor }}
                    >
                        {catLabel}
                    </span>
                )}
                <div className={s.postTitle} title={postTitle}>
                    {postTitle}
                </div>
            </div>

            {/* Footer: author + download */}
            <div className={s.cardFooter}>
                <div className={s.authorInfo}>
                    <span className={s.authorAvatar}>
                        {author?.full_name ? getInitial(author.full_name) : '?'}
                    </span>
                    <span className={s.authorName}>
                        {author?.full_name ?? 'Ẩn danh'}
                    </span>
                    <span className={s.createdDate}>· {date}</span>
                </div>
                <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={attachment.file_name}
                    className={s.downloadBtn}
                    title={`Tải ${attachment.file_name}`}
                >
                    <DownloadSvg />
                    Tải về
                </a>
            </div>
        </div>
    )
}

export default ClassMaterialsLibraryTab
