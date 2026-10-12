import s from './MultipleChoiceQuestion.module.css'
import type { Question } from '@/types/test.types'
import { FlagReviewButton } from './shared/FlagReviewButton'

interface MultipleChoiceQuestionProps {
    question: Question & { globalNumber: number }
    selectedValue?: string | null
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
    isReviewed?: boolean
    onToggleReview?: () => void
}

export default function MultipleChoiceQuestion({
    question,
    selectedValue,
    onChange,
    registerRef,
    isReviewed,
    onToggleReview,
}: MultipleChoiceQuestionProps) {
    const { id, globalNumber, questionText, options } = question

    if (!options || options.length === 0) {
        return (
            <div className={s.emptyNotice}>
                Không có lựa chọn nào cho câu hỏi này.
            </div>
        )
    }

    return (
        <div className={s.questionBlock} ref={(el) => registerRef(id, el)}>
            <div className={s.questionHeader}>
                <div className={s.questionHeaderLeft}>
                    <span className={s.numberBadge}>{globalNumber}</span>
                    <div className={s.questionText}>{questionText}</div>
                </div>
                <FlagReviewButton
                    isReviewed={isReviewed}
                    onToggle={onToggleReview}
                />
            </div>

            <div
                className={s.optionsList}
                role="radiogroup"
                aria-label={`Câu hỏi ${globalNumber}`}
            >
                {options.map((option) => {
                    const isSelected = selectedValue === option.key
                    return (
                        <div
                            key={option.key}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            className={`${s.optionCard} ${isSelected ? s.selected : ''}`}
                            onClick={() => onChange(option.key)}
                            onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault()
                                    onChange(option.key)
                                }
                            }}
                        >
                            <span className={s.optionKeyBadge}>
                                {option.key}
                            </span>
                            <span className={s.optionText}>{option.text}</span>
                            <div className={s.selectionIndicator}>
                                <div className={s.radioCircle}>
                                    {isSelected && (
                                        <span className={s.radioDot} />
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
