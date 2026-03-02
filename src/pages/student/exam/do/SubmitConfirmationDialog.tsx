import React from 'react'
import { SkillArea } from '@/types/test.types'
import type { BatchSubmitSpeakingResponse } from '@/types/test.types'
import s from './SubmitConfirmationDialog.module.css'

interface Question {
    id: string
    globalNumber: number
}

interface QuestionGroup {
    questions: Question[]
}

interface Part {
    questionGroups: QuestionGroup[]
}

interface EnhancedSection {
    name?: string
    skillArea?: SkillArea | string | null
    parts: Part[]
}

interface SubmitConfirmationProps {
    answers: Record<string, any>
    sections: EnhancedSection[]
    speakingResults: BatchSubmitSpeakingResponse | null
}

const getSkillIcon = (skillArea?: SkillArea | string | null): string => {
    const icons: Record<SkillArea, string> = {
        [SkillArea.LISTENING]: '🎧',
        [SkillArea.READING]: '📖',
        [SkillArea.WRITING]: '✏️',
        [SkillArea.SPEAKING]: '🎤',
        [SkillArea.GRAMMAR]: '📝',
        [SkillArea.VOCABULARY]: '📚',
        [SkillArea.PRONUNCIATION]: '🗣️',
    }
    return icons[skillArea as SkillArea] || '📋'
}

export const SubmitConfirmationDialog: React.FC<SubmitConfirmationProps> = ({
    answers,
    sections,
    speakingResults,
}) => {
    // Calculate answered questions per section
    const sectionStats = sections.map((section) => {
        const questions = section.parts.flatMap((p) =>
            p.questionGroups.flatMap((g) => g.questions)
        )
        const answered = questions.filter((q) => answers[q.id]).length

        return {
            name: section.name || 'Untitled Section',
            skillArea: section.skillArea,
            answered,
            total: questions.length,
            percentage:
                questions.length > 0
                    ? Math.round((answered / questions.length) * 100)
                    : 0,
        }
    })

    return (
        <div className={s.confirmDialog}>
            <h3 className={s.title}>📝 Submit Your Test?</h3>
            <p className={s.warning}>
                You will NOT be able to change your answers after submission.
            </p>

            <div className={s.sectionSummary}>
                {sectionStats.map((stat, index) => (
                    <div key={index} className={s.statRow}>
                        <span className={s.sectionName}>
                            {getSkillIcon(stat.skillArea)} {stat.name}
                        </span>
                        <div className={s.progressContainer}>
                            <span className={s.progressText}>
                                {stat.answered} / {stat.total}
                            </span>
                            <div className={s.progressBar}>
                                <div
                                    className={s.progressFill}
                                    style={{ width: `${stat.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Speaking special notice */}
            {speakingResults && (
                <div className={s.speakingNotice}>
                    <span className={s.checkmark}>✓</span>
                    <span>
                        Speaking: {speakingResults.processedCount} recordings
                        saved
                        {speakingResults.aiOverallScores && (
                            <span className={s.aiBand}>
                                {' '}
                                (AI Band:{' '}
                                {speakingResults.aiOverallScores.overallBand?.toFixed(
                                    1
                                )}
                                )
                            </span>
                        )}
                    </span>
                </div>
            )}

            <p className={s.confirmText}>Are you sure you want to submit?</p>
        </div>
    )
}
