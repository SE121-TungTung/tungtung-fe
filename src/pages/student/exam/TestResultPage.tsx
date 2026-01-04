import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi, getAttemptStatusInfo } from '@/lib/test'
import type { AttemptDetail } from '@/types/test.types'
import { AttemptStatus } from '@/types/test.types'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'

import s from './TestResultPage.module.css'

export default function TestResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>()
    const navigate = useNavigate()

    const [result, setResult] = useState<AttemptDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
                    <h2>❌ Lỗi</h2>
                    <p>{error}</p>
                    <ButtonPrimary onClick={() => navigate('/student/exams')}>
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

    return (
        <div className={s.container}>
            <div className={s.card}>
                {/* Header */}
                <div className={s.header}>
                    <h1 className={s.title}>Kết quả bài thi</h1>
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
                            {result.timeTakenSeconds}
                        </div>
                    </div>
                </div>

                {/* Pending Message */}
                {isPending && (
                    <div className={s.pendingNotice}>
                        <p>
                            ⏳ Bài thi của bạn đang chờ giáo viên chấm điểm. Vui
                            lòng quay lại sau.
                        </p>
                    </div>
                )}

                {/* Question Details */}
                <div className={s.questionsSection}>
                    <h3 className={s.sectionTitle}>Chi tiết từng câu hỏi</h3>

                    {result.details.map((detail, index) => (
                        <div key={detail.questionId} className={s.questionCard}>
                            <div className={s.questionHeader}>
                                <span className={s.questionNumber}>
                                    Câu {index + 1}
                                </span>
                                {detail.bandScore !== null && (
                                    <span className={s.questionScore}>
                                        {detail.bandScore.toFixed(1)} /{' '}
                                        {detail.maxPoints}
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
                    <ButtonGhost onClick={() => navigate('/student/exams')}>
                        Quay lại danh sách
                    </ButtonGhost>
                    <ButtonPrimary
                        onClick={() =>
                            navigate(`/student/exams/${result.testId}/take`)
                        }
                    >
                        Làm lại bài thi
                    </ButtonPrimary>
                </div>
            </div>
        </div>
    )
}
