import React from 'react'
import s from '../TeacherClassDetail.module.css'

interface ClassPostsFeedTabProps {
    postsLoading: boolean
    postsData?: { data: any[] }
    postType: 'announcement' | 'material'
    setPostType: (type: 'announcement' | 'material') => void
    postTitle: string
    setPostTitle: (title: string) => void
    postContent: string
    setPostContent: (content: string) => void
    selectedFiles: File[]
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
    isCreatingPost: boolean
    handleCreatePost: (e: React.FormEvent) => void
    handleDeletePost: (postId: string) => void
}

export const ClassPostsFeedTab: React.FC<ClassPostsFeedTabProps> = ({
    postsLoading,
    postsData,
    postType,
    setPostType,
    postTitle,
    setPostTitle,
    postContent,
    setPostContent,
    selectedFiles,
    setSelectedFiles,
    isCreatingPost,
    handleCreatePost,
    handleDeletePost,
}) => {
    return (
        <div className={s.feedGrid}>
            {/* Cột 1: Form Đăng bài */}
            <div className={s.card} style={{ height: 'fit-content' }}>
                <h3 className={s.sectionTitle}>Tạo thông báo / tài liệu mới</h3>
                <form
                    onSubmit={handleCreatePost}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    <div>
                        <label
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                display: 'block',
                                marginBottom: '6px',
                            }}
                        >
                            Loại bài đăng
                        </label>
                        <select
                            value={postType}
                            onChange={(e) =>
                                setPostType(
                                    e.target.value as
                                        'announcement' | 'material'
                                )
                            }
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: '#fff',
                            }}
                        >
                            <option value="announcement">Thông báo</option>
                            <option value="material">Tài liệu học tập</option>
                        </select>
                    </div>

                    <div>
                        <label
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                display: 'block',
                                marginBottom: '6px',
                            }}
                        >
                            Tiêu đề
                        </label>
                        <input
                            type="text"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            placeholder="Ví dụ: Tài liệu Unit 5, Thông báo nghỉ học..."
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                display: 'block',
                                marginBottom: '6px',
                            }}
                        >
                            Nội dung chi tiết
                        </label>
                        <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="Nhập nội dung thông báo hoặc mô tả tài liệu..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div>
                        <label
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#475569',
                                display: 'block',
                                marginBottom: '6px',
                            }}
                        >
                            Đính kèm tệp tin
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(e) => {
                                if (e.target.files) {
                                    setSelectedFiles(Array.from(e.target.files))
                                }
                            }}
                            style={{
                                fontSize: '13px',
                                color: '#475569',
                            }}
                        />
                        {selectedFiles.length > 0 && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                }}
                            >
                                {selectedFiles.map((file, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            background: '#f1f5f9',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: '#334155',
                                        }}
                                    >
                                        {file.name} (
                                        {(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isCreatingPost}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            background:
                                'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: isCreatingPost ? 'not-allowed' : 'pointer',
                            opacity: isCreatingPost ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                            transition: 'all 0.2s',
                        }}
                    >
                        {isCreatingPost ? 'Đang đăng bài...' : 'Đăng bài viết'}
                    </button>
                </form>
            </div>

            {/* Cột 2: Danh sách bài đã đăng */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                }}
            >
                <h3 className={s.sectionTitle}>Lịch sử bảng tin</h3>
                {postsLoading ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#64748b',
                        }}
                    >
                        Đang tải danh sách...
                    </div>
                ) : !postsData?.data || postsData.data.length === 0 ? (
                    <div className={s.emptyText}>
                        Lớp học chưa có thông báo hoặc tài liệu nào.
                    </div>
                ) : (
                    postsData.data.map((post) => (
                        <div
                            key={post.id}
                            className={s.card}
                            style={{ padding: '20px' }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background:
                                                'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {post.author?.full_name
                                            ?.charAt(0)
                                            .toUpperCase() || 'G'}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {post.author?.full_name ||
                                                'Giảng viên'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                color: '#64748b',
                                            }}
                                        >
                                            {new Date(
                                                post.created_at
                                            ).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        style={{
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            background:
                                                post.post_type === 'material'
                                                    ? '#e0f2fe'
                                                    : '#fef3c7',
                                            color:
                                                post.post_type === 'material'
                                                    ? '#0369a1'
                                                    : '#b45309',
                                        }}
                                    >
                                        {post.post_type === 'material'
                                            ? 'Tài liệu'
                                            : 'Thông báo'}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handleDeletePost(post.id)
                                        }
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        title="Xóa bài viết"
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
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line
                                                x1="10"
                                                y1="11"
                                                x2="10"
                                                y2="17"
                                            ></line>
                                            <line
                                                x1="14"
                                                y1="11"
                                                x2="14"
                                                y2="17"
                                            ></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <h4
                                style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    marginBottom: '8px',
                                }}
                            >
                                {post.title}
                            </h4>

                            {post.content && (
                                <p
                                    style={{
                                        color: '#334155',
                                        fontSize: '13px',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap',
                                        marginBottom: '12px',
                                    }}
                                >
                                    {post.content}
                                </p>
                            )}

                            {post.attachments &&
                                post.attachments.length > 0 && (
                                    <div
                                        style={{
                                            borderTop: '1px dashed #e2e8f0',
                                            paddingTop: '10px',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#64748b',
                                                marginBottom: '6px',
                                            }}
                                        >
                                            Tệp đính kèm (
                                            {post.attachments.length}):
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                            }}
                                        >
                                            {post.attachments.map(
                                                (file: any, idx: number) => (
                                                    <a
                                                        key={idx}
                                                        href={file.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '6px',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            background:
                                                                '#f8fafc',
                                                            border: '1px solid #e2e8f0',
                                                            color: '#2563eb',
                                                            textDecoration:
                                                                'none',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            width: 'fit-content',
                                                        }}
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
                                                        <span>
                                                            {file.file_name}
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: '#64748b',
                                                                fontSize:
                                                                    '10px',
                                                            }}
                                                        >
                                                            (
                                                            {(
                                                                file.file_size /
                                                                1024
                                                            ).toFixed(1)}{' '}
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
        </div>
    )
}

export default ClassPostsFeedTab
