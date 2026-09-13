import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClassPost, MaterialCategory } from '@/lib/classes'
import { MATERIAL_CATEGORY_LABELS } from '@/lib/classes'
import s from './PostModals.module.css'

// ─── Zod validation schema ────────────────────────────────────────────────────

const editPostSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống').max(255),
    content: z.string().optional(),
    material_category: z.string().optional(),
    is_comment_locked: z.boolean().optional(),
})

type EditPostFormValues = z.infer<typeof editPostSchema>

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
 * Dùng React Hook Form + Zod để validate client-side.
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

    // Điền giá trị hiện tại mỗi khi modal mở với bài viết mới
    useEffect(() => {
        if (post) {
            reset({
                title: post.title,
                content: post.content ?? '',
                material_category: post.material_category ?? '',
                is_comment_locked: post.is_comment_locked,
            })
        }
    }, [post, reset])

    if (!isOpen || !post) return null

    const handleFormSubmit = (values: EditPostFormValues) => {
        const fd = new FormData()
        if (values.title) fd.append('title', values.title)
        if (values.content !== undefined)
            fd.append('content', values.content ?? '')
        if (values.material_category)
            fd.append('material_category', values.material_category)
        if (values.is_comment_locked !== undefined)
            fd.append('is_comment_locked', String(values.is_comment_locked))
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
                        ✏️
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
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
