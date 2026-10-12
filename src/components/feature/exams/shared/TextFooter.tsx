import React, { useMemo, useState } from 'react'
import styles from './TextFooter.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import type { EnhancedSection } from '@/pages/student/exam/QuestionGroupRenderer'
import { ReviewOverviewModal } from './ReviewOverviewModal'

interface Part {
    id: string
    name?: string
    questionGroups: QuestionGroup[]
}

interface QuestionGroup {
    questions: Question[]
}

interface Question {
    id: string
    globalNumber: number
}

interface TestFooterProps {
    sections: EnhancedSection[]
    currentIndex: number
    onSectionChange: (index: number) => void
    currentPartIndex?: number // ✅ Thêm Part Index
    onPartChange?: (index: number) => void // ✅ Handler chuyển Part
    currentQNum: number
    reviewed: Set<number>
    answers: { [key: string]: any }
    onNav: (qNum: number, qId?: string) => void
    onToggleReview: (qNum: number) => void
    onSubmit: () => void
    isSubmitting: boolean
    hideReviewButton?: boolean
}

export const TestFooter = React.memo(
    ({
        sections,
        currentIndex,
        onSectionChange,
        currentPartIndex = 0,
        onPartChange,
        currentQNum: _currentQNum,
        reviewed,
        answers,
        onNav,
        onToggleReview: _onToggleReview,
        onSubmit,
        isSubmitting,
        hideReviewButton = false,
    }: TestFooterProps) => {
        const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
        const currentSection = sections[currentIndex]
        const currentPart = currentSection?.parts[currentPartIndex]

        const currentQuestions = useMemo(() => {
            if (!currentPart) return []
            return currentPart.questionGroups.flatMap(
                (g: QuestionGroup) => g.questions
            )
        }, [currentPart])

        const showPartNavigation =
            currentSection?.parts && currentSection.parts.length > 1

        return (
            <footer className={styles.footer}>
                {/* Row 1: Section/Part Navigation */}
                <div className={styles.footerRow}>
                    <div className={styles.passageNav}>
                        {sections.length > 1 ? (
                            sections.map(
                                (section: EnhancedSection, i: number) => (
                                    <button
                                        key={section.id}
                                        className={`${styles.passageButton} ${i === currentIndex ? styles.active : ''}`}
                                        onClick={() => onSectionChange(i)}
                                    >
                                        {section.name || `Section ${i + 1}`}
                                    </button>
                                )
                            )
                        ) : showPartNavigation && onPartChange ? (
                            <div className={styles.partNav}>
                                {currentSection.parts.map(
                                    (part: Part, i: number) => (
                                        <button
                                            key={part.id}
                                            className={`${styles.partButton} ${i === currentPartIndex ? styles.active : ''}`}
                                            onClick={() => onPartChange(i)}
                                        >
                                            {part.name || `Part ${i + 1}`}
                                        </button>
                                    )
                                )}
                            </div>
                        ) : (
                            <button
                                className={`${styles.passageButton} ${styles.active}`}
                                disabled
                            >
                                {currentSection?.name || 'Section'}
                            </button>
                        )}
                    </div>
                    <div className={styles.footerActions}>
                        {!hideReviewButton && (
                            <ButtonGhost
                                size="sm"
                                onClick={() => setIsReviewModalOpen(true)}
                                title="Xem lại các câu hỏi đã làm và chưa làm"
                            >
                                Review
                            </ButtonGhost>
                        )}
                        <ButtonPrimary
                            size="md"
                            onClick={onSubmit}
                            loading={isSubmitting}
                        >
                            Submit
                        </ButtonPrimary>
                    </div>
                </div>

                {/* Row 2: Part Navigation (chỉ hiện khi có nhiều Sections và Section hiện tại có nhiều Parts) */}
                {sections.length > 1 && showPartNavigation && onPartChange && (
                    <div className={styles.footerRow}>
                        <div className={styles.partNav}>
                            {currentSection.parts.map(
                                (part: Part, i: number) => (
                                    <button
                                        key={part.id}
                                        className={`${styles.partButton} ${i === currentPartIndex ? styles.active : ''}`}
                                        onClick={() => onPartChange(i)}
                                    >
                                        {part.name || `Part ${i + 1}`}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Row 3: Question Navigation */}
                <div className={styles.footerRow}>
                    <div className={styles.questionNav}>
                        {currentQuestions.map((q: Question) => (
                            <button
                                key={q.id}
                                className={`
                                ${styles.navButton}
                                ${q.globalNumber === _currentQNum ? styles.current : ''}
                                ${answers[q.id] ? styles.answered : ''}
                                ${reviewed.has(q.globalNumber) ? styles.reviewed : ''}
                            `}
                                onClick={() => onNav(q.globalNumber, q.id)}
                            >
                                {q.globalNumber}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Review Overview Modal */}
                <ReviewOverviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    sections={sections}
                    answers={answers}
                    reviewed={reviewed}
                    onNav={onNav}
                    onSubmit={onSubmit}
                />
            </footer>
        )
    }
)
