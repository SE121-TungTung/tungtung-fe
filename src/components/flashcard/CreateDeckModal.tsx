import { useState } from 'react'
import { PlusIcon, XIcon, LayersIcon } from './FlashcardIcons'
import { DeckTopic, DeckLevel } from '@/types/flashcard'
import type { CreateDeckPayload } from '@/lib/flashcard'
import styles from './CreateDeckModal.module.css'

interface CreateDeckModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (payload: CreateDeckPayload) => Promise<void>
}

export function CreateDeckModal({
    isOpen,
    onClose,
    onSubmit,
}: CreateDeckModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [topicTag, setTopicTag] = useState<string>('ielts')
    const [level, setLevel] = useState<string>('beginner')
    const [isPublic, setIsPublic] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            setError('Vui lòng nhập tên bộ thẻ ghi nhớ.')
            return
        }

        setError(null)
        setIsSubmitting(true)
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || null,
                topic_tag: topicTag || null,
                level: level || null,
                is_public: isPublic,
            })
            setTitle('')
            setDescription('')
            onClose()
        } catch (err: any) {
            setError(err?.message || 'Không thể tạo bộ thẻ. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconWrapper}>
                            <LayersIcon size={20} />
                        </div>
                        <h2 className={styles.title}>Tạo Bộ Thẻ Ghi Nhớ Mới</h2>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        title="Đóng"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.errorText}>{error}</p>}

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            Tên bộ thẻ{' '}
                            <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Ví dụ: IELTS Academic Vocabulary 8.0"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Mô tả tóm tắt</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Mô tả mục tiêu từ vựng, chủ đề hoặc phạm vi bài học..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Chủ đề</label>
                            <select
                                className={styles.select}
                                value={topicTag}
                                onChange={(e) => setTopicTag(e.target.value)}
                            >
                                <option value={DeckTopic.IELTS}>IELTS</option>
                                <option value={DeckTopic.TOEIC}>TOEIC</option>
                                <option value={DeckTopic.ACADEMIC}>
                                    Học thuật
                                </option>
                                <option value={DeckTopic.BUSINESS}>
                                    Kinh doanh
                                </option>
                                <option value={DeckTopic.GENERAL}>
                                    Tổng quát
                                </option>
                                <option value={DeckTopic.OTHER}>Khác</option>
                            </select>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Cấp độ</label>
                            <select
                                className={styles.select}
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <option value={DeckLevel.BEGINNER}>
                                    Cơ bản
                                </option>
                                <option value={DeckLevel.INTERMEDIATE}>
                                    Trung cấp
                                </option>
                                <option value={DeckLevel.ADVANCED}>
                                    Nâng cao
                                </option>
                                <option value={DeckLevel.EXPERT}>
                                    Chuyên gia
                                </option>
                            </select>
                        </div>
                    </div>

                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <span>
                            Chia sẻ công khai cho mọi học viên trong trung tâm
                        </span>
                    </label>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isSubmitting}
                        >
                            <PlusIcon size={16} />
                            <span>
                                {isSubmitting ? 'Đang tạo...' : 'Tạo Bộ Thẻ'}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
