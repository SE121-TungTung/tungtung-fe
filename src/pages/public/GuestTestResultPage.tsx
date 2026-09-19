import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import type { SubmitResult } from '@/types/test.types'
import { AttemptStatus } from '@/types/test.types'
import { useGuestSession } from '@/stores/guestSession.store'
import DualHookModal from '@/components/feature/exams/shared/DualHookModal'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'

import s from '../student/exam/TestResultPage.module.css'

export default function GuestTestResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>()
    const navigate = useNavigate()

    const { getGuestSessionId } = useGuestSession()
    const [result, setResult] = useState<SubmitResult | null>(null)
    const [showModal, setShowModal] = useState(false)
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
            const guestSessionId = getGuestSessionId()
            if (!guestSessionId) {
                throw new Error('No guest session found')
            }
            const data = await testApi.getGuestAttemptSummary(
                attemptId!,
                guestSessionId
            )
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
                            onClick={() => navigate('/public/tests')}
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

    // Note: getAttemptStatusInfo is missing, let's hardcode for simplicity or import it if exported.
    const isPending = result.status === AttemptStatus.SUBMITTED
    const isAutoGraded = true // Guest only has auto grading

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
                        <span className={`${s.statusLabel} ${s.statusBlue}`}>
                            Đã hoàn thành
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
                                {result.percentageScore !== undefined
                                    ? `${Math.round(result.percentageScore)}%`
                                    : 'N/A'}
                            </div>
                            <div className={s.statLabel}>Tỷ lệ đúng</div>
                        </div>

                        <div className={s.statCard}>
                            <div className={s.statValue}>
                                {result.timeTakenSeconds}s
                            </div>
                            <div className={s.statLabel}>Thời gian</div>
                        </div>
                    </div>
                </Card>

                {/* Call to action for Dual Hook */}
                <Card
                    className={s.questionsSection}
                    variant="outline"
                    title="Chi tiết từng câu hỏi"
                >
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p
                            style={{
                                marginBottom: '1rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Bạn cần cung cấp thông tin để mở khóa lời giải chi
                            tiết và nhận tư vấn từ chuyên gia.
                        </p>
                        <ButtonPrimary onClick={() => setShowModal(true)}>
                            Mở khóa giải thích chi tiết
                        </ButtonPrimary>
                    </div>
                    {/* Actions */}
                    <div className={s.actions}>
                        <ButtonGhost onClick={() => navigate('/public/tests')}>
                            Quay lại danh sách
                        </ButtonGhost>
                    </div>
                </Card>

                <DualHookModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    attemptId={attemptId!}
                />
            </main>
        </div>
    )
}
