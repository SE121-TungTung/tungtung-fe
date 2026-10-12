import React from 'react'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import type { EnhancedSection } from '@/pages/student/exam/QuestionGroupRenderer'
import s from './ReviewOverviewModal.module.css'

interface ReviewOverviewModalProps {
    isOpen: boolean
    onClose: () => void
    sections: EnhancedSection[]
    answers: Record<string, any>
    reviewed: Set<number>
    onNav: (qNum: number, qId: string) => void
    onSubmit?: () => void
}

export const ReviewOverviewModal: React.FC<ReviewOverviewModalProps> = ({
    isOpen,
    onClose,
    sections,
    answers,
    reviewed,
    onNav,
    onSubmit,
}) => {
    // Gather all questions across sections and parts
    const allQuestions = sections.flatMap((section) =>
        section.parts.flatMap((part) =>
            part.questionGroups.flatMap((group) =>
                group.questions.map((q) => {
                    const ans = answers[q.id]
                    const isAnswered =
                        ans !== undefined &&
                        ans !== null &&
                        String(ans).trim() !== ''
                    const isFlagged = reviewed.has(q.globalNumber)
                    return {
                        id: q.id,
                        number: q.globalNumber,
                        isAnswered,
                        isFlagged,
                        answerValue: isAnswered ? String(ans) : null,
                    }
                })
            )
        )
    )

    const total = allQuestions.length
    const answeredCount = allQuestions.filter((q) => q.isAnswered).length
    const unansweredCount = total - answeredCount
    const flaggedCount = allQuestions.filter((q) => q.isFlagged).length

    const handleJumpToQuestion = (qNum: number, qId: string) => {
        onNav(qNum, qId)
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tổng quan bài thi & Câu hỏi đã làm"
            footer={
                <div className={s.footerContainer}>
                    <button
                        type="button"
                        className={s.closeBtn}
                        onClick={onClose}
                    >
                        Quay lại làm bài
                    </button>
                    {onSubmit && (
                        <ButtonPrimary
                            size="md"
                            onClick={() => {
                                onClose()
                                onSubmit()
                            }}
                        >
                            Nộp bài
                        </ButtonPrimary>
                    )}
                </div>
            }
        >
            <div className={s.container}>
                {/* Stats Summary Bar */}
                <div className={s.statsBar}>
                    <div className={s.statItem}>
                        <span className={s.statLabel}>Tổng số câu:</span>
                        <span className={s.statValue}>{total}</span>
                    </div>
                    <div className={`${s.statItem} ${s.answered}`}>
                        <span className={s.indicatorDot} />
                        <span className={s.statLabel}>Đã trả lời:</span>
                        <span className={s.statValue}>{answeredCount}</span>
                    </div>
                    <div className={`${s.statItem} ${s.unanswered}`}>
                        <span className={s.indicatorDot} />
                        <span className={s.statLabel}>Chưa làm:</span>
                        <span className={s.statValue}>{unansweredCount}</span>
                    </div>
                    <div className={`${s.statItem} ${s.flagged}`}>
                        <span className={s.indicatorDot} />
                        <span className={s.statLabel}>Đã đánh dấu:</span>
                        <span className={s.statValue}>{flaggedCount}</span>
                    </div>
                </div>

                <div className={s.guideText}>
                    Nhấp vào số câu hỏi bất kỳ bên dưới để chuyển trực tiếp đến
                    câu đó:
                </div>

                {/* Question Grid */}
                <div className={s.gridContainer}>
                    {allQuestions.map((q) => (
                        <button
                            key={q.id}
                            type="button"
                            className={`
                                ${s.questionCard}
                                ${q.isAnswered ? s.isAnswered : s.isUnanswered}
                                ${q.isFlagged ? s.isFlagged : ''}
                            `}
                            onClick={() => handleJumpToQuestion(q.number, q.id)}
                            title={`Câu ${q.number}: ${q.isAnswered ? 'Đã làm' : 'Chưa làm'}${q.isFlagged ? ' (Đã đánh dấu xem lại)' : ''}`}
                        >
                            <span className={s.qNum}>{q.number}</span>
                            {q.isAnswered && (
                                <span
                                    className={s.ansPreview}
                                    title={q.answerValue || ''}
                                >
                                    {q.answerValue && q.answerValue.length <= 4
                                        ? q.answerValue
                                        : '✓'}
                                </span>
                            )}
                            {q.isFlagged && (
                                <span className={s.flagMarker}>
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        stroke="none"
                                    >
                                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
    )
}
