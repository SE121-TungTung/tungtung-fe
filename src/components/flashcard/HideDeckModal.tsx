import { useEffect, useState } from 'react'
import { XIcon } from './FlashcardIcons'
import styles from './HideDeckModal.module.css'

interface HideDeckModalProps {
    deckTitle: string | null
    isOpen: boolean
    isPending: boolean
    error?: string | null
    onClose: () => void
    onConfirm: (reason: string) => void
}

const MIN_REASON = 5

/** Moderator nhập lý do ẩn bộ thẻ; lý do được gửi tới chủ bộ thẻ qua thông báo. */
export function HideDeckModal({
    deckTitle,
    isOpen,
    isPending,
    error,
    onClose,
    onConfirm,
}: HideDeckModalProps) {
    const [reason, setReason] = useState('')

    useEffect(() => {
        if (isOpen) setReason('')
    }, [isOpen, deckTitle])

    if (!isOpen) return null

    const valid = reason.trim().length >= MIN_REASON

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="hide-deck-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 id="hide-deck-title" className={styles.title}>
                        Ẩn bộ thẻ
                    </h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <XIcon size={18} />
                    </button>
                </div>
                <p className={styles.desc}>
                    Bộ thẻ &ldquo;{deckTitle}&rdquo; sẽ chuyển về riêng tư. Chủ
                    bộ thẻ sẽ nhận thông báo kèm lý do dưới đây.
                </p>
                <label className={styles.label} htmlFor="hide-deck-reason">
                    Lý do (bắt buộc)
                </label>
                <textarea
                    id="hide-deck-reason"
                    className={styles.textarea}
                    rows={4}
                    maxLength={500}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ví dụ: Nội dung không phù hợp / sai kiến thức..."
                    autoFocus
                />
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        className={styles.confirmBtn}
                        disabled={!valid || isPending}
                        onClick={() => onConfirm(reason.trim())}
                    >
                        {isPending ? 'Đang ẩn...' : 'Ẩn bộ thẻ'}
                    </button>
                </div>
            </div>
        </div>
    )
}
