import React from 'react'
import type { ClassPost } from '@/lib/classes'
import s from './PostModals.module.css'

interface PinLimitModalProps {
    isOpen: boolean
    oldestPinnedPost: ClassPost | null
    /** Đang trong quá trình unpin+pin (loading state) */
    isLoading?: boolean
    onClose: () => void
    /** User xác nhận: unpin bài cũ nhất → ghim bài mới */
    onConfirmUnpin: () => void
}

/**
 * PinLimitModal
 *
 * Hiển thị khi lớp đã đạt giới hạn 3 bài ghim.
 * Cho phép user:
 *   - Hủy (Cancel) — không làm gì
 *   - Xác nhận — bỏ ghim bài cũ nhất, ghim bài mới
 */
export default function PinLimitModal({
    isOpen,
    oldestPinnedPost,
    isLoading = false,
    onClose,
    onConfirmUnpin,
}: PinLimitModalProps) {
    if (!isOpen) return null

    return (
        <div
            className={s.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pin-limit-title"
        >
            <div className={s.modal}>
                {/* Header */}
                <div className={s.modalHeader}>
                    <span className={s.warningIcon} aria-hidden="true">
                        📌
                    </span>
                    <h2 id="pin-limit-title" className={s.modalTitle}>
                        Đã đạt giới hạn ghim (3/3)
                    </h2>
                </div>

                {/* Body */}
                <div className={s.modalBody}>
                    <p className={s.modalText}>
                        Lớp học đã có <strong>3 bài đang được ghim</strong>. Để
                        ghim bài mới, bạn cần bỏ ghim 1 bài cũ.
                    </p>

                    {oldestPinnedPost && (
                        <div className={s.oldestPinCard}>
                            <span className={s.oldestPinLabel}>
                                Bài sẽ bị bỏ ghim:
                            </span>
                            <p className={s.oldestPinTitle}>
                                &ldquo;{oldestPinnedPost.title}&rdquo;
                            </p>
                            <span className={s.oldestPinMeta}>
                                (Bài ghim cũ nhất theo thời gian)
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={s.modalFooter}>
                    <button
                        id="pin-limit-cancel"
                        className={s.btnCancel}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        id="pin-limit-confirm"
                        className={s.btnConfirm}
                        onClick={onConfirmUnpin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Gỡ ghim & Ghim bài mới'}
                    </button>
                </div>
            </div>
        </div>
    )
}
