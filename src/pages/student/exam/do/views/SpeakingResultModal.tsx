import React from 'react'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import type { BatchSubmitSpeakingResponse } from '@/types/test.types'
import s from './SpeakingResultModal.module.css'

interface SpeakingResultsModalProps {
    results: BatchSubmitSpeakingResponse
    onClose: () => void
}

export const SpeakingResultsModal: React.FC<SpeakingResultsModalProps> = ({
    results,
    onClose,
}) => {
    const { aiOverallScores, aiTotalPoints, maxTotalPoints } = results

    // Calculate percentage
    const percentage =
        maxTotalPoints > 0
            ? Math.round(((aiTotalPoints || 0) / maxTotalPoints) * 100)
            : 0

    // Band color
    const getBandColor = (band?: number) => {
        if (!band) return '#999'
        if (band >= 8) return '#4caf50' // Green
        if (band >= 7) return '#8bc34a' // Light green
        if (band >= 6) return '#ffc107' // Yellow
        if (band >= 5) return '#ff9800' // Orange
        return '#f44336' // Red
    }

    return (
        <div className={s.modalOverlay}>
            <div className={s.modalContainer}>
                {/* Header */}
                <div className={s.modalHeader}>
                    <h2>Speaking Test Results</h2>
                    <button onClick={onClose} className={s.closeButton}>
                        ✕
                    </button>
                </div>

                {/* Overall Band Score */}
                <div className={s.overallSection}>
                    <div className={s.bandScoreCard}>
                        <div
                            className={s.bandScore}
                            style={{
                                color: getBandColor(
                                    aiOverallScores?.overallBand
                                ),
                            }}
                        >
                            {aiOverallScores?.overallBand?.toFixed(1) || 'N/A'}
                        </div>
                        <div className={s.bandLabel}>Overall Band</div>
                    </div>

                    <div className={s.pointsCard}>
                        <div className={s.points}>
                            {aiTotalPoints?.toFixed(1)} / {maxTotalPoints}
                        </div>
                        <div className={s.pointsLabel}>
                            Points ({percentage}%)
                        </div>
                    </div>
                </div>

                {/* IELTS Criteria Breakdown */}
                {aiOverallScores && (
                    <div className={s.criteriaSection}>
                        <h3>IELTS Criteria Breakdown</h3>
                        <div className={s.criteriaGrid}>
                            <CriteriaCard
                                title="Fluency & Coherence"
                                score={aiOverallScores.fluencyCoherence}
                                icon="🗣️"
                            />
                            <CriteriaCard
                                title="Lexical Resource"
                                score={aiOverallScores.lexicalResource}
                                icon="📚"
                            />
                            <CriteriaCard
                                title="Grammatical Range"
                                score={aiOverallScores.grammaticalRange}
                                icon="✍️"
                            />
                            <CriteriaCard
                                title="Pronunciation"
                                score={aiOverallScores.pronunciation}
                                icon="🎤"
                            />
                        </div>
                    </div>
                )}

                {/* Part Breakdown */}
                {aiOverallScores && (
                    <div className={s.partsSection}>
                        <h3>Performance by Part</h3>
                        <div className={s.partsGrid}>
                            {aiOverallScores.part1AvgBand && (
                                <PartCard
                                    part="Part 1"
                                    score={aiOverallScores.part1AvgBand}
                                    description="Introduction & Interview"
                                />
                            )}
                            {aiOverallScores.part2AvgBand && (
                                <PartCard
                                    part="Part 2"
                                    score={aiOverallScores.part2AvgBand}
                                    description="Long Turn (Cue Card)"
                                />
                            )}
                            {aiOverallScores.part3AvgBand && (
                                <PartCard
                                    part="Part 3"
                                    score={aiOverallScores.part3AvgBand}
                                    description="Discussion"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Question Results Summary */}
                <div className={s.summarySection}>
                    <h3>Processing Summary</h3>
                    <div className={s.summaryStats}>
                        <div className={s.stat}>
                            <span className={s.statValue}>
                                {results.totalQuestions}
                            </span>
                            <span className={s.statLabel}>Total Questions</span>
                        </div>
                        <div className={s.stat}>
                            <span
                                className={s.statValue}
                                style={{ color: '#4caf50' }}
                            >
                                {results.processedCount}
                            </span>
                            <span className={s.statLabel}>Processed</span>
                        </div>
                        {results.failedCount > 0 && (
                            <div className={s.stat}>
                                <span
                                    className={s.statValue}
                                    style={{ color: '#f44336' }}
                                >
                                    {results.failedCount}
                                </span>
                                <span className={s.statLabel}>Failed</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teacher Review Notice */}
                {results.requiresTeacherReview && (
                    <div className={s.noticeBox}>
                        <span className={s.noticeIcon}>ℹ️</span>
                        <div>
                            <strong>AI Preliminary Assessment</strong>
                            <p>
                                These scores are AI-generated suggestions. Your
                                final scores will be determined by your teacher
                                after manual review.
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className={s.modalActions}>
                    <ButtonPrimary onClick={onClose} size="lg">
                        Continue
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    )
}

// ============================================
// HELPER COMPONENTS
// ============================================
const CriteriaCard: React.FC<{
    title: string
    score?: number
    icon: string
}> = ({ title, score, icon }) => (
    <div className={s.criteriaCard}>
        <div className={s.criteriaIcon}>{icon}</div>
        <div className={s.criteriaTitle}>{title}</div>
        <div className={s.criteriaScore}>{score?.toFixed(1) || 'N/A'}</div>
    </div>
)

const PartCard: React.FC<{
    part: string
    score: number
    description: string
}> = ({ part, score, description }) => (
    <div className={s.partCard}>
        <div className={s.partName}>{part}</div>
        <div className={s.partScore}>{score.toFixed(1)}</div>
        <div className={s.partDescription}>{description}</div>
    </div>
)
