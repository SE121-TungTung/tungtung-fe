import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi, getAttemptStatusInfo } from '@/lib/test'
import type { AttemptDetail } from '@/types/test.types'
import { AttemptStatus } from '@/types/test.types'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'

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
                                    ? result.totalScore.toFixed(1)
                                    : 'N/A'}
                            </div>
                            <div className={s.statLabel}>Điểm số</div>
                        </div>

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
                                {detail.userAnswer || <em>Không trả lời</em>}
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
