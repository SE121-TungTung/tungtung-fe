import React, { useMemo } from 'react'
import styles from './TextFooter.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { SkillArea } from '@/types/test.types'

interface Section {
    id: string
    name?: string
    skillArea?: SkillArea | string | null
    parts: Part[]
}

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
    sections: Section[]
    currentIndex: number
    onSectionChange: (index: number) => void
    currentPartIndex?: number // ✅ Thêm Part Index
    onPartChange?: (index: number) => void // ✅ Handler chuyển Part
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
        currentPartIndex = 0,
        onPartChange,
        currentQNum,
        reviewed,
        answers,
        onNav,
        onToggleReview,
        onSubmit,
        isSubmitting,
        hideReviewButton = false,
    }: TestFooterProps) => {
        const currentSection = sections[currentIndex]
        const currentPart = currentSection?.parts[currentPartIndex]

        const currentQuestions = useMemo(() => {
            if (!currentPart) return []
            return currentPart.questionGroups.flatMap((g) => g.questions)
        }, [currentPart])

        const showPartNavigation =
            currentSection?.parts && currentSection.parts.length > 1

        return (
            <footer className={styles.footer}>
                {/* Row 1: Section Navigation */}
                <div className={styles.footerRow}>
                    <div className={styles.passageNav}>
                        {sections.map((section, i) => (
                            <button
                                key={section.id}
                                className={`${styles.passageButton} ${i === currentIndex ? styles.active : ''}`}
                                onClick={() => onSectionChange(i)}
                            >
                                {section.name || `Section ${i + 1}`}
                            </button>
                        ))}
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

                {/* Row 2: Part Navigation (nếu có nhiều hơn 1 part) */}
                {showPartNavigation && onPartChange && (
                    <div className={styles.footerRow}>
                        <div className={styles.partNav}>
                            {currentSection.parts.map((part, i) => (
                                <button
                                    key={part.id}
                                    className={`${styles.partButton} ${i === currentPartIndex ? styles.active : ''}`}
                                    onClick={() => onPartChange(i)}
                                >
                                    {part.name || `Part ${i + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Row 3: Question Navigation */}
                <div className={styles.footerRow}>
                    <div className={styles.questionNav}>
                        {currentQuestions.map((q) => (
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
