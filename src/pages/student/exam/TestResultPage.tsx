import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi, getAttemptStatusInfo } from '@/lib/test'
import type { AttemptDetail } from '@/types/test.types'
import { AttemptStatus } from '@/types/test.types'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'

import s from './TestResultPage.module.css'
import ReactMarkdown from 'react-markdown'

interface RubricBarProps {
    label: string
    score: number
    max?: number
}

function RubricBar({ label, score, max = 9 }: RubricBarProps) {
    const percentage = (score / max) * 100
    return (
        <div className={s.rubricBarContainer}>
            <div className={s.rubricBarHeader}>
                <span className={s.rubricBarLabel}>{label}</span>
                <span className={s.rubricBarScore}>
                    {score.toFixed(1)} / {max.toFixed(1)}
                </span>
            </div>
            <div className={s.rubricBarOuter}>
                <div
                    className={s.rubricBarInner}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function PronunciationWordComponent({ word }: { word: any }) {
    const [active, setActive] = useState(false)
    const isCorrect = word.is_correct
    const hasError = word.error_type

    return (
        <span
            className={`${s.pronWord} ${isCorrect ? s.pronWordCorrect : s.pronWordIncorrect}`}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            onClick={() => setActive(!active)}
        >
            {word.word}
            {active && (
                <span className={s.pronTooltip}>
                    <div className={s.tooltipRow}>
                        <strong>Word:</strong> {word.word}
                    </div>
                    <div className={s.tooltipRow}>
                        <strong>Score:</strong> {word.score}%
                    </div>
                    <div className={s.tooltipRow}>
                        <strong>Expected:</strong> /{word.phonemes_expected}/
                    </div>
                    <div className={s.tooltipRow}>
                        <strong>Spoken:</strong> /{word.phonemes_actual}/
                    </div>
                    {hasError && (
                        <div className={s.tooltipRow}>
                            <strong>Error:</strong>{' '}
                            <span className={s.errorBadge}>
                                {word.error_type}
                            </span>
                        </div>
                    )}
                </span>
            )}
        </span>
    )
}

function PronunciationBreakdown({ breakdown }: { breakdown: any[] }) {
    if (!breakdown || breakdown.length === 0) return null
    return (
        <div className={s.pronContainer}>
            <h5 className={s.pronTitle}>
                🔊 Phát âm chi tiết (IPA word-by-word):
            </h5>
            <div className={s.pronList}>
                {breakdown.map((w, idx) => (
                    <PronunciationWordComponent key={idx} word={w} />
                ))}
            </div>
        </div>
    )
}

export default function TestResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>()
    const navigate = useNavigate()

    const [result, setResult] = useState<AttemptDetail | null>(null)

    const getWritingRubricBars = (scores: any) => {
        if (!scores) return null
        const tr = scores.task_response ?? scores.taskResponse ?? 0
        const cc = scores.coherence_cohesion ?? scores.coherenceCohesion ?? 0
        const lr = scores.lexical_resource ?? scores.lexicalResource ?? 0
        const gr = scores.grammatical_range ?? scores.grammaticalRange ?? 0

        return (
            <div className={s.rubricGrid}>
                <RubricBar label="Task Achievement" score={tr} />
                <RubricBar label="Coherence & Cohesion" score={cc} />
                <RubricBar label="Lexical Resource" score={lr} />
                <RubricBar label="Grammatical Range" score={gr} />
            </div>
        )
    }

    const getSpeakingRubricBars = (scores: any) => {
        if (!scores) return null
        const fc = scores.fluency_coherence ?? scores.fluencyCoherence ?? 0
        const lr = scores.lexical_resource ?? scores.lexicalResource ?? 0
        const gr = scores.grammatical_range ?? scores.grammaticalRange ?? 0
        const pr = scores.pronunciation ?? 0

        return (
            <div className={s.rubricGrid}>
                <RubricBar label="Fluency & Coherence" score={fc} />
                <RubricBar label="Lexical Resource" score={lr} />
                <RubricBar label="Grammatical Range" score={gr} />
                <RubricBar label="Pronunciation" score={pr} />
            </div>
        )
    }
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadResults = useCallback(async () => {
        if (!attemptId) return
        setLoading(true)
        setError(null)
        try {
            const data = await testApi.getAttemptDetail(attemptId)
            setResult(data)
        } catch (err: any) {
            console.error('Failed to load results:', err)
            setError(err.message || 'Không thể tải kết quả bài thi')
        } finally {
            setLoading(false)
        }
    }, [attemptId])

    useEffect(() => {
        if (!attemptId) {
            setError('Missing attempt ID')
            setLoading(false)
            return
        }

        loadResults()
    }, [attemptId, loadResults])

    if (loading) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <div className={s.loadingContainer}>
                        <div className={s.spinner} />
                        <p>Đang tải kết quả...</p>
                    </div>
                </main>
            </div>
        )
    }

    if (error) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <div className={s.errorContainer}>
                        <p className={s.errorMessage}>✖ {error}</p>
                        <ButtonPrimary
                            onClick={() => navigate('/student/tests')}
                        >
                            Quay lại danh sách bài thi
                        </ButtonPrimary>
                    </div>
                </main>
            </div>
        )
    }

    if (!result) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <div className={s.errorContainer}>
                        <p className={s.errorMessage}>Không tìm thấy kết quả</p>
                    </div>
                </main>
            </div>
        )
    }

    const statusInfo = getAttemptStatusInfo(result.status)
    const isPending = result.status === AttemptStatus.SUBMITTED
    const isAutoGraded = result.details.every((d) => d.autoGraded)

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Kết quả bài thi</h1>

                {/* Header Card */}
                <Card className={s.headerCard} variant="outline">
                    <div className={s.headerInner}>
                        <h2 className={s.testTitle}>{result.testTitle}</h2>
                    </div>

                    {/* Status Badge */}
                    <div className={s.statusBadge}>
                        <span
                            className={`${s.statusLabel} ${
                                statusInfo.color === 'green'
                                    ? s.statusGreen
                                    : statusInfo.color === 'yellow'
                                      ? s.statusYellow
                                      : statusInfo.color === 'blue'
                                        ? s.statusBlue
                                        : ''
                            }`}
                        >
                            {statusInfo.label}
                        </span>
                    </div>

                    {/* Pending Notice */}
                    {isPending && !isAutoGraded && (
                        <div className={s.pendingNotice}>
                            <p>
                                ⏳ Bài thi của bạn đang chờ giáo viên chấm điểm.
                            </p>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div className={s.summaryGrid}>
                        <div className={s.statCard}>
                            <div className={s.statValue}>
                                {result.totalScore !== null
                                    ? `${result.totalScore.toFixed(1)}/10`
                                    : 'N/A'}
                            </div>
                            <div className={s.statLabel}>Điểm số</div>
                        </div>

                        {result.bandScore !== null && (
                            <div className={s.statCard}>
                                <div className={s.statValue}>
                                    {result.bandScore.toFixed(1)}
                                </div>
                                <div className={s.statLabel}>Band IELTS</div>
                            </div>
                        )}

                        <div className={s.statCard}>
                            <div className={s.statValue}>
                                {result.details.length}
                            </div>
                            <div className={s.statLabel}>Số câu</div>
                        </div>

                        <div className={s.statCard}>
                            <div className={s.statValue}>
                                {result.timeTakenSeconds}s
                            </div>
                            <div className={s.statLabel}>Thời gian</div>
                        </div>
                    </div>
                </Card>

                {/* Questions Detail Card */}
                <Card
                    className={s.questionsSection}
                    variant="outline"
                    title="Chi tiết từng câu hỏi"
                >
                    {result.details.map((detail, index) => {
                        const isWriting =
                            detail.questionType === 'writing_task_1' ||
                            detail.questionType === 'writing_task_2'
                        const isSpeaking =
                            detail.questionType.startsWith('speaking_part_')
                        const hasAIGrade =
                            detail.aiPointsEarned !== null ||
                            detail.aiBandScore !== null

                        return (
                            <div
                                key={detail.questionId}
                                className={s.questionCard}
                            >
                                <div className={s.questionHeader}>
                                    <span className={s.questionNumber}>
                                        Câu {index + 1}
                                    </span>
                                    {detail.pointsEarned !== undefined && (
                                        <span className={s.questionScore}>
                                            {detail.pointsEarned} /{' '}
                                            {detail.maxPoints}
                                        </span>
                                    )}
                                    {detail.bandScore !== null && (
                                        <span className={s.questionScore}>
                                            Band: {detail.bandScore.toFixed(1)}
                                        </span>
                                    )}
                                </div>

                                <p className={s.questionText}>
                                    <strong>Câu hỏi:</strong>{' '}
                                    {detail.questionText}
                                </p>

                                {!isSpeaking && detail.userAnswer && (
                                    <p className={s.userAnswer}>
                                        <strong>Câu trả lời của bạn:</strong>{' '}
                                        {detail.userAnswer || (
                                            <em>Không trả lời</em>
                                        )}
                                    </p>
                                )}

                                {/* Audio Response (Speaking) */}
                                {isSpeaking && detail.audioResponseUrl && (
                                    <div className={s.answerSection}>
                                        <h4 className={s.sectionTitle}>
                                            🎤 Bản ghi âm của bạn:
                                        </h4>
                                        <audio
                                            controls
                                            src={detail.audioResponseUrl}
                                            className={s.audioPlayer}
                                        />
                                    </div>
                                )}

                                {/* Transcription (Speaking) */}
                                {isSpeaking && detail.userAnswer && (
                                    <div className={s.answerSection}>
                                        <h4 className={s.sectionTitle}>
                                            📝 Transcription (Bản dịch âm
                                            thanh):
                                        </h4>
                                        <div className={s.answerBox}>
                                            {detail.userAnswer}
                                        </div>
                                    </div>
                                )}

                                {/* Pronunciation breakdown */}
                                {isSpeaking &&
                                    detail.responseData
                                        ?.pronunciation_breakdown && (
                                        <PronunciationBreakdown
                                            breakdown={
                                                detail.responseData
                                                    .pronunciation_breakdown
                                            }
                                        />
                                    )}

                                {/* AI Refined & Upgraded Suggestions */}
                                {(detail.responseData?.refined_transcript ||
                                    detail.responseData?.better_version) && (
                                    <div className={s.suggestionsBox}>
                                        {detail.responseData
                                            .refined_transcript && (
                                            <div className={s.suggestionItem}>
                                                <h5
                                                    className={
                                                        s.suggestionTitle
                                                    }
                                                >
                                                    ✨ Refined Transcript (Bản
                                                    sửa lỗi đề xuất):
                                                </h5>
                                                <div
                                                    className={s.suggestionText}
                                                >
                                                    {
                                                        detail.responseData
                                                            .refined_transcript
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        {detail.responseData.better_version && (
                                            <div className={s.suggestionItem}>
                                                <h5
                                                    className={
                                                        s.suggestionTitle
                                                    }
                                                >
                                                    🚀 Upgraded Version (Đề xuất
                                                    Band 8+):
                                                </h5>
                                                <div
                                                    className={s.suggestionText}
                                                >
                                                    {
                                                        detail.responseData
                                                            .better_version
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* AI Grading & Feedback */}
                                {hasAIGrade && (
                                    <div className={s.aiSection}>
                                        <h4 className={s.sectionTitle}>
                                            🤖 Gợi ý từ AI:
                                        </h4>
                                        <div className={s.aiGrid}>
                                            {detail.aiPointsEarned !== null && (
                                                <div className={s.aiItem}>
                                                    <span className={s.aiLabel}>
                                                        Điểm AI:
                                                    </span>
                                                    <span className={s.aiValue}>
                                                        {detail.aiPointsEarned.toFixed(
                                                            1
                                                        )}{' '}
                                                        / {detail.maxPoints}
                                                    </span>
                                                </div>
                                            )}
                                            {detail.aiBandScore !== null && (
                                                <div className={s.aiItem}>
                                                    <span className={s.aiLabel}>
                                                        Band Score:
                                                    </span>
                                                    <span className={s.aiValue}>
                                                        {detail.aiBandScore.toFixed(
                                                            1
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rubric scores breakdown */}
                                        {isWriting &&
                                            detail.aiRubricScores &&
                                            getWritingRubricBars(
                                                detail.aiRubricScores
                                            )}
                                        {isSpeaking &&
                                            detail.aiRubricScores &&
                                            getSpeakingRubricBars(
                                                detail.aiRubricScores
                                            )}

                                        {detail.aiFeedback && (
                                            <div className={s.aiFeedback}>
                                                <strong>Nhận xét AI:</strong>
                                                <div className={s.markdownBody}>
                                                    <ReactMarkdown>
                                                        {detail.aiFeedback}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Actions */}
                    <div className={s.actions}>
                        <ButtonGhost onClick={() => navigate('/student/tests')}>
                            Quay lại danh sách
                        </ButtonGhost>
                    </div>
                </Card>
            </main>
        </div>
    )
}
