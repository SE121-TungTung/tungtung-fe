import {
    XIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    StarIcon,
} from './FlashcardIcons'
import styles from './RatingBar.module.css'
import {
    FSRSRating,
    RATING_LABELS,
    RATING_DESCRIPTIONS,
} from '@/types/flashcard'

interface RatingBarProps {
    onRate: (rating: FSRSRating) => void
    disabled?: boolean
    /** Estimated intervals per rating (days), returned after first review.
     * When null (first review), show default preview text. */
    estimatedIntervals?: Partial<Record<FSRSRating, number>>
}

const RATING_COLORS: Record<FSRSRating, string> = {
    [FSRSRating.AGAIN]: 'again',
    [FSRSRating.HARD]: 'hard',
    [FSRSRating.GOOD]: 'good',
    [FSRSRating.EASY]: 'easy',
}

function renderRatingIcon(rating: FSRSRating) {
    switch (rating) {
        case FSRSRating.AGAIN:
            return <XIcon size={16} />
        case FSRSRating.HARD:
            return <AlertTriangleIcon size={16} />
        case FSRSRating.GOOD:
            return <CheckCircleIcon size={16} />
        case FSRSRating.EASY:
            return <StarIcon size={16} />
    }
}

const RATING_VN_LABELS: Record<FSRSRating, string> = {
    [FSRSRating.AGAIN]: 'Quên rồi',
    [FSRSRating.HARD]: 'Khó nhớ',
    [FSRSRating.GOOD]: 'Nhớ tốt',
    [FSRSRating.EASY]: 'Rất dễ',
}

const DEFAULT_INTERVALS: Record<FSRSRating, string> = {
    [FSRSRating.AGAIN]: '< 1 ngày',
    [FSRSRating.HARD]: '1–2 ngày',
    [FSRSRating.GOOD]: '4–6 ngày',
    [FSRSRating.EASY]: '10+ ngày',
}

function formatInterval(days: number): string {
    if (days === 0) return '< 1 ngày'
    if (days === 1) return '1 ngày'
    if (days < 7) return `${days} ngày`
    if (days < 30) return `${Math.round(days / 7)} tuần`
    return `${Math.round(days / 30)} tháng`
}

export function RatingBar({
    onRate,
    disabled = false,
    estimatedIntervals,
}: RatingBarProps) {
    const ratings: FSRSRating[] = [
        FSRSRating.AGAIN,
        FSRSRating.HARD,
        FSRSRating.GOOD,
        FSRSRating.EASY,
    ]

    return (
        <div className={styles.container}>
            <div className={styles.promptHeader}>
                <p className={styles.titlePrompt}>
                    Bạn nhớ từ vựng này thế nào?
                </p>
                <p className={styles.subtitlePrompt}>
                    Chọn mức độ ghi nhớ hoặc bấm phím số [1 - 4]
                </p>
            </div>
            <div
                className={styles.bar}
                role="group"
                aria-label="Đánh giá mức độ nhớ"
            >
                {ratings.map((rating) => {
                    const interval = estimatedIntervals?.[rating]
                    const intervalText =
                        interval !== undefined
                            ? formatInterval(interval)
                            : DEFAULT_INTERVALS[rating]

                    return (
                        <button
                            key={rating}
                            type="button"
                            className={`${styles.btn} ${styles[RATING_COLORS[rating]]} ${disabled ? styles.disabled : ''}`}
                            onClick={() => !disabled && onRate(rating)}
                            disabled={disabled}
                            title={`${RATING_VN_LABELS[rating]} (${RATING_LABELS[rating]}): ${RATING_DESCRIPTIONS[rating]}`}
                            aria-label={`${RATING_VN_LABELS[rating]} — ôn lại sau ${intervalText}`}
                        >
                            <span className={styles.keyHint}>{rating}</span>
                            <span className={styles.icon}>
                                {renderRatingIcon(rating)}
                            </span>
                            <span className={styles.label}>
                                {RATING_VN_LABELS[rating]}
                            </span>
                            <span className={styles.subLabel}>
                                {RATING_LABELS[rating]}
                            </span>
                            <span className={styles.interval}>
                                {intervalText}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
