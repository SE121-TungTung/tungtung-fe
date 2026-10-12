import s from './SentenceCompletionQuestion.module.css'
import type { Question } from '@/types/test.types'
import { FlagReviewButton } from './shared/FlagReviewButton'

interface SentenceCompletionQuestionProps {
    question: Question & { globalNumber: number }
    value: string
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
    isReviewed?: boolean
    onToggleReview?: () => void
}

export default function SentenceCompletionQuestion({
    question,
    value,
    onChange,
    registerRef,
    isReviewed,
    onToggleReview,
}: SentenceCompletionQuestionProps) {
    return (
        <div
            className={s.questionBlock}
            ref={(el) => registerRef(question.id, el)}
        >
            <div className={s.headerRow}>
                <label className={s.questionText}>
                    <strong>{question.globalNumber}.</strong>{' '}
                    {question.questionText}
                </label>
                <FlagReviewButton
                    isReviewed={isReviewed}
                    onToggle={onToggleReview}
                />
            </div>
            <input
                type="text"
                className={s.inputField}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Your answer..."
            />
        </div>
    )
}
