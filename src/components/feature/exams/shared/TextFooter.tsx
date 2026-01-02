import React, { useMemo } from 'react'
import styles from './TextFooter.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'

interface Section {
    id: string
    name?: string
    parts: any[]
}

interface TestFooterProps {
    sections: Section[]
    currentIndex: number
    onSectionChange: (index: number) => void
    currentQNum: number
    reviewed: Set<number>
    answers: { [key: string]: any }
    onNav: (qNum: number) => void
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
        currentQNum,
        reviewed,
        answers,
        onNav,
        onToggleReview,
        onSubmit,
        isSubmitting,
        hideReviewButton = false,
    }: TestFooterProps) => {
        const currentQuestions = useMemo(() => {
            return (
                sections[currentIndex]?.parts.flatMap((p: any) =>
                    p.questionGroups.flatMap((g: any) => g.questions)
                ) || []
            )
        }, [sections, currentIndex])

        return (
            <footer className={styles.footer}>
                {/* Section Navigation Row */}
                <div className={styles.footerRow}>
                    <div className={styles.passageNav}>
                        {sections.map(
                            (
                                section,
                                i // ✅ Đổi tên biến
                            ) => (
                                <button
                                    key={section.id}
                                    className={`${styles.passageButton} ${i === currentIndex ? styles.active : ''}`}
                                    onClick={() => onSectionChange(i)}
                                >
                                    {section.name || `Section ${i + 1}`}
                                </button>
                            )
                        )}
                    </div>
                    <div className={styles.footerActions}>
                        {!hideReviewButton && (
                            <ButtonGhost
                                size="sm"
                                onClick={() => onToggleReview(currentQNum)}
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

                {/* Question Navigation Row */}
                <div className={styles.footerRow}>
                    <div className={styles.questionNav}>
                        {currentQuestions.map((q: any) => (
                            <button
                                key={q.id}
                                className={`
                                ${styles.navButton}
                                ${q.globalNumber === currentQNum ? styles.current : ''}
                                ${answers[q.id] ? styles.answered : ''}
                                ${reviewed.has(q.globalNumber) ? styles.reviewed : ''}
                            `}
                                onClick={() => onNav(q.globalNumber)}
                            >
                                {q.globalNumber}
                            </button>
                        ))}
                    </div>
                </div>
            </footer>
        )
    }
)
