import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import s from './ClassNewsTab.module.css'
import Card from '@/components/common/card/Card'
import { getClassPosts, MATERIAL_CATEGORY_LABELS } from '@/lib/classes'
import type { ClassPost } from '@/lib/classes'
import { queryKeys } from '@/lib/queryKeys'

interface ClassNewsTabProps {
    classId?: string
}

type PostFilter = 'all' | 'announcement' | 'material'

export default function ClassNewsTab({ classId }: ClassNewsTabProps) {
    const [filter, setFilter] = useState<PostFilter>('all')

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: queryKeys.classes.posts(classId ?? ''),
        queryFn: () => getClassPosts(classId!, 1, 100),
        enabled: !!classId,
    })

    const allPosts: ClassPost[] = postsData?.data ?? []
    const filteredPosts =
        filter === 'all'
            ? allPosts
            : allPosts.filter((p) => p.post_type === filter)

    return (
        <div className={s.newsLayout}>
            <div>
                <Card
                    title="Bảng tin & Tài liệu lớp học"
                    variant="outline"
                    mode="light"
                >
                    {/* Filter tabs */}
                    <div className={s.filterRow}>
                        <div className={s.filterTabs} role="tablist">
                            {(
                                [
                                    'all',
                                    'announcement',
                                    'material',
                                ] as PostFilter[]
                            ).map((tab) => (
                                <button
                                    key={tab}
                                    role="tab"
                                    aria-selected={filter === tab}
                                    onClick={() => setFilter(tab)}
                                    className={`${s.filterTab} ${filter === tab ? s.filterTabActive : ''}`}
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

                    <div className={s.postsContainer}>
                        {postsLoading ? (
                            <div className={s.loadingText}>Đang tải...</div>
                        ) : filteredPosts.length === 0 ? (
                            <div className={s.emptyText}>
                                {filter === 'all'
                                    ? 'Lớp học chưa có thông báo hoặc tài liệu nào.'
                                    : `Không có ${filter === 'announcement' ? 'thông báo' : 'tài liệu'} nào.`}
                            </div>
                        ) : (
                            filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className={`${s.postCard} ${post.is_pinned ? s.pinnedPostCard : ''}`}
                                >
                                    {/* Pinned badge */}
                                    {post.is_pinned && (
                                        <div className={s.pinnedBadge}>
                                            📌 Đang được ghim
                                        </div>
                                    )}

                                    <div className={s.postHeader}>
                                        <div className={s.authorRow}>
                                            <div className={s.authorAvatar}>
                                                {post.author?.full_name
                                                    ?.charAt(0)
                                                    .toUpperCase() ?? 'G'}
                                            </div>
                                            <div>
                                                <div className={s.authorName}>
                                                    {post.author?.full_name ??
                                                        'Giảng viên'}
                                                </div>
                                                <div className={s.postDate}>
                                                    {new Date(
                                                        post.created_at
                                                    ).toLocaleString('vi-VN')}
                                                    {post.is_edited && (
                                                        <span
                                                            className={
                                                                s.editedLabel
                                                            }
                                                        >
                                                            {' '}
                                                            · (đã chỉnh sửa)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Type + category badges */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <span
                                                className={`${s.typeBadge} ${post.post_type === 'material' ? s.badgeMaterial : s.badgeNotice}`}
                                            >
                                                {post.post_type === 'material'
                                                    ? 'Tài liệu'
                                                    : 'Thông báo'}
                                            </span>
                                            {post.material_category && (
                                                <span
                                                    className={s.categoryBadge}
                                                >
                                                    {
                                                        MATERIAL_CATEGORY_LABELS[
                                                            post
                                                                .material_category
                                                        ]
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className={s.postTitle}>
                                        {post.title}
                                    </h4>

                                    {post.content && (
                                        <p className={s.postContent}>
                                            {post.content}
                                        </p>
                                    )}

                                    {post.attachments.length > 0 && (
                                        <div className={s.attachmentsSection}>
                                            <div className={s.attachmentsLabel}>
                                                Tệp đính kèm (
                                                {post.attachments.length}):
                                            </div>
                                            <div className={s.attachmentsList}>
                                                {post.attachments.map(
                                                    (file, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={file.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={
                                                                s.attachmentLink
                                                            }
                                                        >
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                            </svg>
                                                            <span>
                                                                {file.file_name}
                                                            </span>
                                                            <span
                                                                className={
                                                                    s.fileSize
                                                                }
                                                            >
                                                                (
                                                                {(
                                                                    file.file_size /
                                                                    1024
                                                                ).toFixed(
                                                                    1
                                                                )}{' '}
                                                                KB)
                                                            </span>
                                                        </a>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
