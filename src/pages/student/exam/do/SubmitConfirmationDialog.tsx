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

const renderSkillIcon = (skillArea?: SkillArea | string | null) => {
    switch (skillArea) {
        case SkillArea.LISTENING:
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
            )
        case SkillArea.READING:
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
            )
        case SkillArea.WRITING:
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
            )
        case SkillArea.SPEAKING:
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            )
        default:
            return (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
            )
    }
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
        let answered = questions.filter(
            (q) =>
                answers[q.id] !== undefined &&
                answers[q.id] !== null &&
                String(answers[q.id]).trim() !== ''
        ).length

        if (section.skillArea === SkillArea.SPEAKING) {
            if (speakingResults) {
                answered =
                    speakingResults.totalQuestions ||
                    speakingResults.processedCount ||
                    0
            } else {
                answered = 0
            }
        }

        return {
            name: section.name || 'Phần thi',
            skillArea: section.skillArea,
            answered,
            total: questions.length,
            percentage:
                questions.length > 0
                    ? Math.round((answered / questions.length) * 100)
                    : 0,
        }
    })

    const totalQuestions = sectionStats.reduce((sum, s) => sum + s.total, 0)
    const totalAnswered = sectionStats.reduce((sum, s) => sum + s.answered, 0)
    const isComplete = totalQuestions > 0 && totalAnswered === totalQuestions

    return (
        <div className={s.confirmDialog}>
            <div className={s.warningBanner}>
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={s.warningIcon}
                >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <div className={s.warningText}>
                    <strong>Lưu ý quan trọng:</strong> Sau khi nộp bài, bạn sẽ
                    không thể chỉnh sửa câu trả lời.
                </div>
            </div>

            <div className={s.summaryCard}>
                <div className={s.summaryHeader}>
                    <span className={s.summaryTitle}>Tiến độ làm bài</span>
                    <span
                        className={`${s.totalBadge} ${isComplete ? s.complete : ''}`}
                    >
                        Đã làm {totalAnswered} / {totalQuestions} câu
                    </span>
                </div>

                <div className={s.sectionList}>
                    {sectionStats.map((stat, index) => (
                        <div key={index} className={s.statRow}>
                            <div className={s.statTop}>
                                <div className={s.sectionName}>
                                    <span className={s.skillIcon}>
                                        {renderSkillIcon(stat.skillArea)}
                                    </span>
                                    <span>{stat.name}</span>
                                </div>
                                <span className={s.progressText}>
                                    {stat.answered} / {stat.total} (
                                    {stat.percentage}%)
                                </span>
                            </div>
                            <div className={s.progressBar}>
                                <div
                                    className={`${s.progressFill} ${stat.percentage === 100 ? s.full : ''}`}
                                    style={{ width: `${stat.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Speaking special notice */}
            {speakingResults && (
                <div className={s.speakingNotice}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                        Speaking: Đã lưu {speakingResults.processedCount} bản
                        thu âm
                        {speakingResults.aiOverallScores?.overallBand && (
                            <strong className={s.aiBand}>
                                {' '}
                                (AI Dự đoán: Band{' '}
                                {speakingResults.aiOverallScores.overallBand.toFixed(
                                    1
                                )}
                                )
                            </strong>
                        )}
                    </span>
                </div>
            )}

            <p className={s.confirmQuestion}>
                {totalAnswered < totalQuestions
                    ? `Bạn vẫn còn ${totalQuestions - totalAnswered} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`
                    : 'Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài ngay bây giờ?'}
            </p>
        </div>
    )
}
