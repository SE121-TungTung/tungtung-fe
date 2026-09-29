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
                        title={`${RATING_LABELS[rating]}: ${RATING_DESCRIPTIONS[rating]}`}
                        aria-label={`${RATING_LABELS[rating]} — ôn lại sau ${intervalText}`}
                    >
                        <span className={styles.keyHint}>{rating}</span>
                        <span className={styles.label}>
                            {RATING_LABELS[rating]}
                        </span>
                        <span className={styles.interval}>{intervalText}</span>
                    </button>
                )
            })}
        </div>
    )
}
