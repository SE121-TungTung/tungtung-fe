import React from 'react'
import s from './FlagReviewButton.module.css'

interface FlagReviewButtonProps {
    isReviewed?: boolean
    onToggle?: () => void
}

export const FlagReviewButton: React.FC<FlagReviewButtonProps> = ({
    isReviewed,
    onToggle,
}) => {
    if (!onToggle) return null

    return (
        <button
            type="button"
            className={`${s.flagBtn} ${isReviewed ? s.flagged : ''}`}
            onClick={(e) => {
                e.stopPropagation()
                onToggle()
            }}
            title={
                isReviewed
                    ? 'Bỏ đánh dấu xem lại câu này'
                    : 'Đánh dấu câu này để xem lại'
            }
            aria-label={isReviewed ? 'Unflag review' : 'Flag for review'}
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={isReviewed ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={s.flagIcon}
            >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            <span className={s.flagText}>
                {isReviewed ? 'Đã đánh dấu' : 'Đánh dấu'}
            </span>
        </button>
    )
}
