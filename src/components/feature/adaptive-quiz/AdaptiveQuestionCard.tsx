import React, { useState } from 'react'
import {
    SendIcon,
    LoaderIcon,
    CheckCircleIcon,
    XCircleIcon,
} from './AdaptiveIcons'
import type { NextQuestion, QuestionOption } from '@/types/adaptive-quiz'
import styles from './AdaptiveQuestionCard.module.css'

interface AdaptiveQuestionCardProps {
    question: NextQuestion
    onSubmit: (answer: string) => Promise<void>
    isSubmitting: boolean
    lastFeedback?: {
        isCorrect: boolean
        correctAnswer?: string | null
        explanation?: string | null
    } | null
}

export const AdaptiveQuestionCard: React.FC<AdaptiveQuestionCardProps> = ({
    question,
    onSubmit,
    isSubmitting,
    lastFeedback,
}) => {
    const [selectedOption, setSelectedOption] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedOption || isSubmitting) return
        await onSubmit(selectedOption)
        setSelectedOption('')
    }

    // Normalize options
    const parsedOptions: QuestionOption[] = React.useMemo(() => {
        if (!question.options) {
            if (question.question_type === 'true_false_not_given') {
                return [
                    { id: 'TRUE', text: 'True' },
                    { id: 'FALSE', text: 'False' },
                    { id: 'NOT GIVEN', text: 'Not Given' },
                ]
            }
            if (question.question_type === 'yes_no_not_given') {
                return [
                    { id: 'YES', text: 'Yes' },
                    { id: 'NO', text: 'No' },
                    { id: 'NOT GIVEN', text: 'Not Given' },
                ]
            }
            return []
        }

        if (Array.isArray(question.options)) {
            return question.options.map((opt, idx) => {
                if (typeof opt === 'string') {
                    const letters = ['A', 'B', 'C', 'D', 'E', 'F']
                    return { id: letters[idx] || String(idx + 1), text: opt }
                }
                return opt as QuestionOption
            })
        }

        return []
    }, [question.options, question.question_type])

    const formatQuestionType = (typeStr: string) => {
        switch (typeStr) {
            case 'multiple_choice':
                return 'Trắc nghiệm 4 lựa chọn'
            case 'true_false_not_given':
                return 'True / False / Not Given'
            case 'yes_no_not_given':
                return 'Yes / No / Not Given'
            default:
                return typeStr.replace(/_/g, ' ')
        }
    }

    return (
        <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.cardHeader}>
                <div className={styles.tags}>
                    <span className={styles.skillPill}>
                        {question.skill_area === 'reading'
                            ? 'Reading'
                            : 'Listening'}
                    </span>
                    <span className={styles.typePill}>
                        {formatQuestionType(question.question_type)}
                    </span>
                </div>
                <h3 className={styles.questionTitle}>{question.title}</h3>
            </div>

            {/* Audio or Image attachments */}
            {(question.audio_url || question.image_url) && (
                <div className={styles.mediaSection}>
                    {question.audio_url && (
                        <div>
                            <audio
                                controls
                                src={question.audio_url}
                                className={styles.audioPlayer}
                            />
                        </div>
                    )}
                    {question.image_url && (
                        <img
                            src={question.image_url}
                            alt="Question illustration"
                            className={styles.questionImage}
                        />
                    )}
                </div>
            )}

            {/* Question Text */}
            <div className={styles.questionText}>{question.question_text}</div>

            {/* Options list */}
            <div className={styles.optionsList}>
                {parsedOptions.map((opt) => {
                    const isSelected = selectedOption === opt.id
                    return (
                        <button
                            type="button"
                            key={opt.id}
                            className={`${styles.optionItem} ${
                                isSelected ? styles.optionSelected : ''
                            }`}
                            onClick={() => setSelectedOption(opt.id)}
                            disabled={isSubmitting}
                        >
                            <span className={styles.optionKey}>{opt.id}</span>
                            <span className={styles.optionText}>
                                {opt.text}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Feedback notification if available */}
            {lastFeedback && (
                <div
                    className={`${styles.feedbackBanner} ${
                        lastFeedback.isCorrect
                            ? styles.feedbackCorrect
                            : styles.feedbackWrong
                    }`}
                >
                    {lastFeedback.isCorrect ? (
                        <>
                            <CheckCircleIcon size={18} />
                            <span>Chính xác! Năng lực ước lượng tăng lên.</span>
                        </>
                    ) : (
                        <>
                            <XCircleIcon size={18} />
                            <span>
                                Chưa chính xác.{' '}
                                {lastFeedback.correctAnswer &&
                                    `Đáp án đúng: ${lastFeedback.correctAnswer}`}
                            </span>
                        </>
                    )}
                </div>
            )}

            <div className={styles.footer}>
                <span className={styles.hintText}>
                    Chọn một đáp án và bấm Xác nhận để hệ thống hiệu chuẩn năng
                    lực tiếp theo.
                </span>
                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={!selectedOption || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <LoaderIcon size={16} />
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <SendIcon size={16} />
                            Xác nhận câu trả lời
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
