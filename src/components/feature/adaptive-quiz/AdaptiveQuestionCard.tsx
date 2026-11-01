import React, { useEffect, useState } from 'react'
import {
    BookOpenIcon,
    SendIcon,
    LoaderIcon,
    CheckCircleIcon,
} from './AdaptiveIcons'
import type { NextQuestion, QuestionOption } from '@/types/adaptive-quiz'
import styles from './AdaptiveQuestionCard.module.css'

interface AdaptiveQuestionCardProps {
    question: NextQuestion
    onSubmit: (answer: string) => Promise<void>
    isSubmitting: boolean
}

export const AdaptiveQuestionCard: React.FC<AdaptiveQuestionCardProps> = ({
    question,
    onSubmit,
    isSubmitting,
}) => {
    const [selectedOption, setSelectedOption] = useState<string>('')
    const [isPassageExpanded, setIsPassageExpanded] = useState<boolean>(true)

    useEffect(() => {
        setSelectedOption('')
        setIsPassageExpanded(true)
    }, [question.question_id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedOption || isSubmitting) return
        await onSubmit(selectedOption)
        setSelectedOption('')
    }

    // Normalize options across all possible DB formats ({id, text}, {key, text}, string[])
    const parsedOptions: QuestionOption[] = React.useMemo(() => {
        if (
            !question.options ||
            (Array.isArray(question.options) && question.options.length === 0)
        ) {
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

        const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

        if (Array.isArray(question.options)) {
            return question.options.map((opt, idx) => {
                const fallbackId = letters[idx] || String(idx + 1)

                if (typeof opt === 'string') {
                    const trimmed = opt.trim()
                    const match = trimmed.match(/^([A-Za-z])[.)]\s+(.*)$/)
                    if (match) {
                        return {
                            id: match[1].toUpperCase(),
                            text: match[2].trim(),
                        }
                    }
                    return { id: fallbackId, text: trimmed }
                }

                if (opt && typeof opt === 'object') {
                    const record = opt as Record<string, unknown>
                    const rawId = String(
                        record.id ?? record.key ?? record.value ?? fallbackId
                    ).trim()
                    let rawText = String(
                        record.text ?? record.label ?? record.content ?? rawId
                    ).trim()

                    const prefixDot = `${rawId}. `
                    const prefixParen = `${rawId}) `
                    if (rawText.startsWith(prefixDot)) {
                        rawText = rawText.slice(prefixDot.length).trim()
                    } else if (rawText.startsWith(prefixParen)) {
                        rawText = rawText.slice(prefixParen.length).trim()
                    }

                    return {
                        id: rawId || fallbackId,
                        text: rawText,
                    }
                }

                return { id: fallbackId, text: String(opt) }
            })
        }

        return []
    }, [question.options, question.question_type])

    const paragraphs = React.useMemo(() => {
        if (!question.passage_text) return []
        return question.passage_text
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
    }, [question.passage_text])

    const formatQuestionType = (typeStr: string) => {
        switch (typeStr) {
            case 'multiple_choice':
                return 'Trắc nghiệm lựa chọn'
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
                        <div className={styles.audioWrapper}>
                            <span className={styles.mediaLabel}>
                                Nghe đoạn ghi âm để trả lời câu hỏi:
                            </span>
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

            {/* Reading Passage / Context Section */}
            {paragraphs.length > 0 && (
                <div className={styles.passageSection}>
                    <div className={styles.passageHeader}>
                        <div className={styles.passageHeaderTitle}>
                            <BookOpenIcon size={16} />
                            <span>
                                {question.passage_title ||
                                    (question.skill_area === 'reading'
                                        ? 'Nội dung bài đọc (Reading Passage)'
                                        : 'Ngữ cảnh bài nghe')}
                            </span>
                        </div>
                        <button
                            type="button"
                            className={styles.passageToggleBtn}
                            onClick={() =>
                                setIsPassageExpanded((prev) => !prev)
                            }
                        >
                            {isPassageExpanded ? 'Thu gọn' : 'Mở rộng'}
                        </button>
                    </div>
                    {isPassageExpanded && (
                        <div className={styles.passageBody}>
                            {paragraphs.map((para, index) => (
                                <p key={index} className={styles.passagePara}>
                                    {para}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Instructions if available */}
            {question.instructions && (
                <div className={styles.instructionsBox}>
                    <strong>Hướng dẫn:</strong> {question.instructions}
                </div>
            )}

            {/* Question Stem */}
            <div className={styles.questionStemBox}>
                <span className={styles.questionNumberBadge}>
                    Câu hỏi #{question.item_position}
                </span>
                <div className={styles.questionText}>
                    {question.question_text}
                </div>
            </div>

            {/* Options list */}
            <div className={styles.optionsList}>
                {parsedOptions.map((opt) => {
                    const isSelected =
                        Boolean(selectedOption) && selectedOption === opt.id
                    return (
                        <button
                            type="button"
                            key={opt.id}
                            aria-pressed={isSelected}
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
                            {isSelected && (
                                <span className={styles.selectedIndicator}>
                                    <CheckCircleIcon size={18} />
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className={styles.footer}>
                <span className={styles.hintText}>
                    Chọn một đáp án và bấm Xác nhận để tiếp tục câu hỏi tiếp
                    theo.
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
