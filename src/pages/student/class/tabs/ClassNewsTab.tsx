import { useQuery } from '@tanstack/react-query'
import s from './ClassNewsTab.module.css'
import Card from '@/components/common/card/Card'
import AssignmentCard, {
    type Assignment,
} from '@/components/common/card/AssignmentCard'
import { getClassPosts } from '@/lib/classes'

interface ClassNewsTabProps {
    classId?: string
}

const upcomingAssignments: Assignment[] = [
    {
        id: 'b1',
        title: 'Bài tập "Writing Task 1"',
        dueDate: 'Hết hạn: Thứ Sáu, 23:59',
        type: 'essay',
    },
]

export default function ClassNewsTab({ classId }: ClassNewsTabProps) {
    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['class-posts', classId],
        queryFn: () => getClassPosts(classId!, 1, 100),
        enabled: !!classId,
    })

    return (
        <div className={s.newsLayout}>
            <div>
                <Card
                    title="Bảng tin & Tài liệu lớp học"
                    variant="outline"
                    mode="light"
                >
                    <div className={s.postsContainer}>
                        {postsLoading ? (
                            <div className={s.loadingText}>Đang tải...</div>
                        ) : !postsData?.data || postsData.data.length === 0 ? (
                            <div className={s.emptyText}>
                                Lớp học chưa có thông báo hoặc tài liệu nào.
                            </div>
                        ) : (
                            postsData.data.map((post) => (
                                <div key={post.id} className={s.postCard}>
                                    <div className={s.postHeader}>
                                        <div className={s.authorRow}>
                                            <div className={s.authorAvatar}>
                                                {post.author?.full_name
                                                    ?.charAt(0)
                                                    .toUpperCase() || 'G'}
                                            </div>
                                            <div>
                                                <div className={s.authorName}>
                                                    {post.author?.full_name ||
                                                        'Giảng viên'}
                                                </div>
                                                <div className={s.postDate}>
                                                    {new Date(
                                                        post.created_at
                                                    ).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`${s.typeBadge} ${
                                                post.post_type === 'material'
                                                    ? s.badgeMaterial
                                                    : s.badgeNotice
                                            }`}
                                        >
                                            {post.post_type === 'material'
                                                ? 'Tài liệu'
                                                : 'Thông báo'}
                                        </span>
                                    </div>

                                    <h4 className={s.postTitle}>
                                        {post.title}
                                    </h4>

                                    {post.content && (
                                        <p className={s.postContent}>
                                            {post.content}
                                        </p>
                                    )}

                                    {post.attachments &&
                                        post.attachments.length > 0 && (
                                            <div
                                                className={s.attachmentsSection}
                                            >
                                                <div
                                                    className={
                                                        s.attachmentsLabel
                                                    }
                                                >
                                                    Tệp đính kèm (
                                                    {post.attachments.length}
                                                    ):
                                                </div>
                                                <div
                                                    className={
                                                        s.attachmentsList
                                                    }
                                                >
                                                    {post.attachments.map(
                                                        (file, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={
                                                                    file.file_url
                                                                }
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
                                                                    {
                                                                        file.file_name
                                                                    }
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
            <div>
                <AssignmentCard
                    assignments={upcomingAssignments}
                    onShowOld={() => {}}
                />
            </div>
        </div>
    )
}
