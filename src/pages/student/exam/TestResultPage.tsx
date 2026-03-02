import { useState, useEffect /*, useMemo */ } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi, getAttemptStatusInfo } from '@/lib/test'
import type {
    AttemptDetail /*, QuestionResultDetail*/,
} from '@/types/test.types'
import { AttemptStatus /*QuestionType, SkillArea */ } from '@/types/test.types'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'

import s from './TestResultPage.module.css'

// Helper to determine skill from question type
// const getSkillFromQuestionType = (questionType: QuestionType): SkillArea => {
//     const speakingTypes = [
//         QuestionType.SPEAKING_PART_1,
//         QuestionType.SPEAKING_PART_2,
//         QuestionType.SPEAKING_PART_3,
//     ]
//     const writingTypes = [
//         QuestionType.WRITING_TASK_1,
//         QuestionType.WRITING_TASK_2,
//     ]

//     if (speakingTypes.includes(questionType)) return SkillArea.SPEAKING
//     if (writingTypes.includes(questionType)) return SkillArea.WRITING

//     // Default to Reading for MCQ types
//     return SkillArea.READING
// }

export default function TestResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>()
    const navigate = useNavigate()

    const [result, setResult] = useState<AttemptDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // const resultsBySection = useMemo(() => {
    //     if (!result) return []

    //     const grouped = new Map<SkillArea, QuestionResultDetail[]>()

    //     result.details.forEach((detail) => {
    //         const skill = getSkillFromQuestionType(detail.questionType)
    //         if (!grouped.has(skill)) {
    //             grouped.set(skill, [])
    //         }
    //         grouped.get(skill)!.push(detail)
    //     })

    //     return Array.from(grouped.entries()).map(([skill, questions]) => ({
    //         skill,
    //         questions,
    //         score: questions.reduce((sum, q) => sum + q.pointsEarned, 0),
    //         maxScore: questions.reduce((sum, q) => sum + q.maxPoints, 0),
    //     }))
    // }, [result])

    useEffect(() => {
        if (!attemptId) {
            setError('Missing attempt ID')
            setLoading(false)
            return
        }

        loadResults()
    }, [attemptId])

    const loadResults = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await testApi.getAttemptDetail(attemptId!)
            setResult(data)
        } catch (err: any) {
            console.error('Failed to load results:', err)
            setError(err.message || 'Không thể tải kết quả bài thi')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={s.container}>
                <div className={s.loadingBox}>
                    <p>Đang tải kết quả...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={s.container}>
                <div className={s.errorBox}>
                    <h2>✖ Lỗi</h2>
                    <p>{error}</p>
                    <ButtonPrimary onClick={() => navigate('/student/tests')}>
                        Quay lại danh sách bài thi
                    </ButtonPrimary>
                </div>
            </div>
        )
    }

    if (!result) {
        return (
            <div className={s.container}>
                <div className={s.errorBox}>
                    <p>Không tìm thấy kết quả</p>
                </div>
            </div>
        )
    }

    const statusInfo = getAttemptStatusInfo(result.status)
    const isPending = result.status === AttemptStatus.SUBMITTED
    const isAutoGraded = result.details.every((d) => d.autoGraded)

    return (
        <div className={s.container}>
            <div className={s.card}>
                {/* Header */}
                <div className={s.header}>
                    <h1 className={s.title}>Kết quả bài thi</h1>
                    <h2 className={s.testTitle}>{result.testTitle}</h2>
                </div>

                {/* Pending Notice */}
                {isPending && !isAutoGraded && (
                    <div className={s.pendingNotice}>
                        <p>⏳ Bài thi của bạn đang chờ giáo viên chấm điểm.</p>
                    </div>
                )}

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

                {/* Summary Stats */}
                <div className={s.summaryGrid}>
                    <div className={s.statCard}>
                        <div className={s.statLabel}>Điểm số</div>
                        <div className={s.statValue}>
                            {result.totalScore !== null
                                ? result.totalScore.toFixed(1)
                                : 'N/A'}
                        </div>
                    </div>

                    <div className={s.statCard}>
                        <div className={s.statLabel}>Số câu</div>
                        <div className={s.statValue}>
                            {result.details.length}
                        </div>
                    </div>

                    <div className={s.statCard}>
                        <div className={s.statLabel}>Thời gian</div>
                        <div className={s.statValue}>
                            {result.timeTakenSeconds}s
                        </div>
                    </div>
                </div>

                {/* Question Details */}
                <div className={s.questionsSection}>
                    <h3 className={s.sectionTitle}>Chi tiết từng câu hỏi</h3>

                    {result.details.map((detail, index) => (
                        <div key={detail.questionId} className={s.questionCard}>
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
                                <strong>Câu hỏi:</strong> {detail.questionText}
                            </p>

                            <p className={s.userAnswer}>
                                <strong>Câu trả lời của bạn:</strong>{' '}
                                {detail.userAnswer || (
                                    <em style={{ color: '#999' }}>
                                        Không trả lời
                                    </em>
                                )}
                            </p>

                            {detail.aiFeedback && (
                                <div className={s.feedbackBox}>
                                    <strong>Nhận xét:</strong>
                                    <p className={s.feedbackText}>
                                        {detail.aiFeedback}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className={s.actions}>
                    <ButtonGhost onClick={() => navigate('/student/tests')}>
                        Quay lại danh sách
                    </ButtonGhost>
                </div>
            </div>
        </div>
    )
}
