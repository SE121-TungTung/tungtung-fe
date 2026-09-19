import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClassPost, MaterialCategory } from '@/lib/classes'
import { MATERIAL_CATEGORY_LABELS } from '@/lib/classes'
import s from './PostModals.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// ─── Zod validation schema ────────────────────────────────────────────────────

const editPostSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống').max(255),
    content: z.string().optional(),
    material_category: z.string().optional(),
    is_comment_locked: z.boolean().optional(),
})

type EditPostFormValues = z.infer<typeof editPostSchema>

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExistingAttachment {
    file_name: string
    file_url: string
    file_size: number
    mime_type: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditPostModalProps {
    isOpen: boolean
    post: ClassPost | null
    isLoading?: boolean
    onClose: () => void
    /** Gọi khi form submit hợp lệ — trả về FormData để gửi lên BE */
    onSubmit: (formData: FormData) => void
}

/**
 * EditPostModal
 *
 * Inline edit form cho bài viết lớp học.
 * Hỗ trợ quản lý tệp đính kèm: xóa file cũ + thêm file mới.
 */
export default function EditPostModal({
    isOpen,
    post,
    isLoading = false,
    onClose,
    onSubmit,
}: EditPostModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EditPostFormValues>({
        resolver: zodResolver(editPostSchema),
    })

    const postType = post?.post_type

    // ─── File management state ───────────────────────────────────────────────
    const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set())
    const [newFiles, setNewFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Existing attachments from the post
    const existingAttachments: ExistingAttachment[] = (post?.attachments ??
        []) as ExistingAttachment[]
    const keptExistingCount = existingAttachments.length - removedIndices.size
    const totalFiles = keptExistingCount + newFiles.length

    // Điền giá trị hiện tại mỗi khi modal mở với bài viết mới
    useEffect(() => {
        if (post) {
            reset({
                title: post.title,
                content: post.content ?? '',
                material_category: post.material_category ?? '',
                is_comment_locked: post.is_comment_locked,
            })
            setRemovedIndices(new Set())
            setNewFiles([])
        }
    }, [post, reset])

    if (!isOpen || !post) return null

    const handleRemoveExisting = (idx: number) => {
        setRemovedIndices((prev) => {
            const next = new Set(prev)
            next.add(idx)
            return next
        })
    }

    const handleRestoreExisting = (idx: number) => {
        setRemovedIndices((prev) => {
            const next = new Set(prev)
            next.delete(idx)
            return next
        })
    }

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        const incoming = Array.from(e.target.files)
        setNewFiles((prev) => {
            const merged = [...prev, ...incoming]
            if (keptExistingCount + merged.length > MAX_FILES) {
                alert(
                    `Tổng cộng tối đa ${MAX_FILES} tệp. Hiện tại đã giữ lại ${keptExistingCount} tệp cũ.`
                )
                return prev
            }
            return merged
        })
        e.target.value = ''
    }

    const handleRemoveNewFile = (idx: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== idx))
    }

    const handleFormSubmit = (values: EditPostFormValues) => {
        const fd = new FormData()
        if (values.title) fd.append('title', values.title)
        if (values.content !== undefined)
            fd.append('content', values.content ?? '')
        if (values.material_category)
            fd.append('material_category', values.material_category)
        if (values.is_comment_locked !== undefined)
            fd.append('is_comment_locked', String(values.is_comment_locked))

        // Attachment management
        if (removedIndices.size > 0) {
            fd.append(
                'remove_attachment_indices',
                JSON.stringify([...removedIndices])
            )
        }
        for (const file of newFiles) {
            fd.append('files', file)
        }

        onSubmit(fd)
    }

    const materialCategories = Object.entries(MATERIAL_CATEGORY_LABELS) as [
        MaterialCategory,
        string,
    ][]

    return (
        <div
            className={s.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-post-title"
        >
            <div className={s.modal}>
                {/* Header */}
                <div className={s.modalHeader}>
                    <span className={s.editIcon} aria-hidden="true">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </span>
                    <h2 id="edit-post-title" className={s.modalTitle}>
                        Chỉnh sửa bài viết
                    </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className={s.modalBody}>
                        {/* Tiêu đề */}
                        <div className={s.formGroup}>
                            <label htmlFor="edit-title" className={s.formLabel}>
                                Tiêu đề <span className={s.required}>*</span>
                            </label>
                            <input
                                id="edit-title"
                                className={`${s.formInput} ${errors.title ? s.inputError : ''}`}
                                placeholder="Tiêu đề bài viết..."
                                {...register('title')}
                            />
                            {errors.title && (
                                <span className={s.errorMsg}>
                                    {errors.title.message}
                                </span>
                            )}
                        </div>

                        {/* Nội dung */}
                        <div className={s.formGroup}>
                            <label
                                htmlFor="edit-content"
                                className={s.formLabel}
                            >
                                Nội dung chi tiết
                            </label>
                            <textarea
                                id="edit-content"
                                className={s.formTextarea}
                                rows={5}
                                placeholder="Nhập nội dung bài viết..."
                                {...register('content')}
                            />
                        </div>

                        {/* Phân loại tài liệu (chỉ hiện với material) */}
                        {postType === 'material' && (
                            <div className={s.formGroup}>
                                <label
                                    htmlFor="edit-material-category"
                                    className={s.formLabel}
                                >
                                    Phân loại tài liệu
                                </label>
                                <select
                                    id="edit-material-category"
                                    className={s.formSelect}
                                    {...register('material_category')}
                                >
                                    <option value="">— Chọn phân loại —</option>
                                    {materialCategories.map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        )}

                        {/* ─── Quản lý tệp đính kèm ──────────────────────────────── */}
                        <div className={s.fileSection}>
                            <div className={s.fileSectionHeader}>
                                <span className={s.formLabel}>
                                    Tệp đính kèm ({totalFiles}/{MAX_FILES})
                                </span>
                                {totalFiles < MAX_FILES && (
                                    <label
                                        htmlFor="edit-add-file"
                                        className={s.addFileLabel}
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                        </svg>
                                        Thêm tệp
                                    </label>
                                )}
                                <input
                                    id="edit-add-file"
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleAddFiles}
                                    className={s.fileHiddenInput}
                                />
                            </div>

                            <div className={s.fileChipList}>
                                {/* Existing attachments */}
                                {existingAttachments.map((att, idx) => {
                                    const isRemoved = removedIndices.has(idx)
                                    return (
                                        <div
                                            key={`existing-${idx}`}
                                            className={s.fileChip}
                                            style={
                                                isRemoved
                                                    ? {
                                                          opacity: 0.4,
                                                          textDecoration:
                                                              'line-through',
                                                      }
                                                    : {}
                                            }
                                        >
                                            <span className={s.fileChipName}>
                                                {att.file_name}
                                            </span>
                                            <span className={s.fileChipSize}>
                                                (
                                                {(
                                                    att.file_size /
                                                    1024 /
                                                    1024
                                                ).toFixed(1)}{' '}
                                                MB)
                                            </span>
                                            {isRemoved ? (
                                                <button
                                                    type="button"
                                                    className={s.fileChipRemove}
                                                    onClick={() =>
                                                        handleRestoreExisting(
                                                            idx
                                                        )
                                                    }
                                                    title="Khôi phục tệp này"
                                                >
                                                    <svg
                                                        width="10"
                                                        height="10"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#22c55e"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="1 4 1 10 7 10" />
                                                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={s.fileChipRemove}
                                                    onClick={() =>
                                                        handleRemoveExisting(
                                                            idx
                                                        )
                                                    }
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
                                            )}
                                        </div>
                                    )
                                })}

                                {/* New files */}
                                {newFiles.map((file, idx) => (
                                    <div
                                        key={`new-${idx}`}
                                        className={`${s.fileChip} ${s.fileChipNew}`}
                                    >
                                        <span className={s.fileChipName}>
                                            {file.name}
                                        </span>
                                        <span className={s.fileChipSize}>
                                            (
                                            {(file.size / 1024 / 1024).toFixed(
                                                1
                                            )}{' '}
                                            MB)
                                            {file.size > MAX_FILE_SIZE && (
                                                <span
                                                    style={{
                                                        color: '#ef4444',
                                                        marginLeft: 4,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '2px',
                                                    }}
                                                >
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                        <line
                                                            x1="12"
                                                            y1="9"
                                                            x2="12"
                                                            y2="13"
                                                        />
                                                        <line
                                                            x1="12"
                                                            y1="17"
                                                            x2="12.01"
                                                            y2="17"
                                                        />
                                                    </svg>
                                                    quá 10MB
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            type="button"
                                            className={s.fileChipRemove}
                                            onClick={() =>
                                                handleRemoveNewFile(idx)
                                            }
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
                                ))}

                                {existingAttachments.length === 0 &&
                                    newFiles.length === 0 && (
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: '#94a3b8',
                                            }}
                                        >
                                            Không có tệp đính kèm
                                        </span>
                                    )}
                            </div>
                        </div>

                        {/* Khoá bình luận */}
                        <div className={s.formGroup}>
                            <label className={s.checkboxLabel}>
                                <input
                                    id="edit-comment-locked"
                                    type="checkbox"
                                    className={s.checkbox}
                                    {...register('is_comment_locked')}
                                />
                                Khoá bình luận
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={s.modalFooter}>
                        <button
                            type="button"
                            id="edit-post-cancel"
                            className={s.btnCancel}
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            id="edit-post-submit"
                            className={s.btnConfirm}
                            disabled={
                                isLoading ||
                                newFiles.some((f) => f.size > MAX_FILE_SIZE)
                            }
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
