import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import type { TestAttemptSummaryResponse } from '@/types/test.types'
import { AttemptStatus } from '@/types/test.types'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'
import s from './TeacherGradingPage.module.css'

export default function TeacherGradingPage() {
    const { testId } = useParams<{ testId: string }>()
    const navigate = useNavigate()

    const [attempts, setAttempts] = useState<TestAttemptSummaryResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<
        'all' | 'pending' | 'graded'
    >('all')

    useEffect(() => {
        loadAttempts()
    }, [testId])

    const loadAttempts = async () => {
        if (!testId) return

        setLoading(true)
        try {
            const data = await testApi.listTestAttemptsForTeacher(testId)
            setAttempts(data)
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách bài thi')
        } finally {
            setLoading(false)
        }
    }

    const filteredAttempts = attempts.filter((a) => {
        if (filterStatus === 'pending')
            return a.status === AttemptStatus.SUBMITTED
        if (filterStatus === 'graded') return a.status === AttemptStatus.GRADED
        return true
    })

    const pendingCount = attempts.filter(
        (a) => a.status === AttemptStatus.SUBMITTED
    ).length
    const gradedCount = attempts.filter(
        (a) => a.status === AttemptStatus.GRADED
    ).length

    const getStatusBadge = (status: string) => {
        const config = {
            [AttemptStatus.SUBMITTED]: { label: 'Chờ chấm', color: '#ffc107' },
            [AttemptStatus.GRADED]: { label: 'Đã chấm', color: '#28a745' },
            [AttemptStatus.IN_PROGRESS]: {
                label: 'Đang làm',
                color: '#17a2b8',
            },
        }
        const info = config[status as keyof typeof config] || {
            label: status,
            color: '#6c757d',
        }
        return (
            <span className={s.statusBadge} style={{ background: info.color }}>
                {info.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className={s.container}>
                <div className={s.loadingBox}>
                    <div className={s.spinner} />
                    <p>Đang tải...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={s.container}>
                <Card>
                    <div className={s.errorBox}>
                        <h2>❌ Lỗi</h2>
                        <p>{error}</p>
                        <ButtonPrimary
                            onClick={() => navigate('/teacher/tests')}
                        >
                            Quay lại danh sách bài thi
                        </ButtonPrimary>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className={s.container}>
            {/* Header */}
            <div className={s.header}>
                <div>
                    <h1 className={s.title}>Chấm điểm bài thi</h1>
                    <p className={s.subtitle}>
                        Xem và chấm điểm các bài làm của học sinh
                    </p>
                </div>
                <ButtonGhost
                    onClick={() => navigate(`/teacher/tests/${testId}/view`)}
                >
                    ← Quay lại bài thi
                </ButtonGhost>
            </div>

            {/* Stats */}
            <div className={s.statsGrid}>
                <Card>
                    <div className={s.statCard}>
                        <div className={s.statValue}>{attempts.length}</div>
                        <div className={s.statLabel}>Tổng bài làm</div>
                    </div>
                </Card>
                <Card>
                    <div className={s.statCard}>
                        <div
                            className={s.statValue}
                            style={{ color: '#ffc107' }}
                        >
                            {pendingCount}
                        </div>
                        <div className={s.statLabel}>Chờ chấm</div>
                    </div>
                </Card>
                <Card>
                    <div className={s.statCard}>
                        <div
                            className={s.statValue}
                            style={{ color: '#28a745' }}
                        >
                            {gradedCount}
                        </div>
                        <div className={s.statLabel}>Đã chấm</div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className={s.filterBar}>
                    <button
                        className={`${s.filterButton} ${filterStatus === 'all' ? s.active : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Tất cả ({attempts.length})
                    </button>
                    <button
                        className={`${s.filterButton} ${filterStatus === 'pending' ? s.active : ''}`}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Chờ chấm ({pendingCount})
                    </button>
                    <button
                        className={`${s.filterButton} ${filterStatus === 'graded' ? s.active : ''}`}
                        onClick={() => setFilterStatus('graded')}
                    >
                        Đã chấm ({gradedCount})
                    </button>
                </div>
            </Card>

            {/* Attempts List */}
            <div className={s.attemptsList}>
                {filteredAttempts.length === 0 ? (
                    <Card>
                        <div className={s.emptyState}>
                            <p>📭 Chưa có bài làm nào</p>
                        </div>
                    </Card>
                ) : (
                    filteredAttempts.map((attempt) => (
                        <Card key={attempt.id} className={s.attemptCard}>
                            <div className={s.attemptHeader}>
                                <div className={s.studentInfo}>
                                    <div className={s.studentAvatar}>
                                        {attempt.student_name
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={s.studentName}>
                                            {attempt.student_name}
                                        </div>
                                        <div className={s.attemptMeta}>
                                            Nộp bài:{' '}
                                            {new Date(
                                                attempt.submitted_at || ''
                                            ).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(attempt.status)}
                            </div>

                            <div className={s.attemptStats}>
                                {attempt.score !== null && (
                                    <div className={s.statItem}>
                                        <span className={s.statLabel}>
                                            Điểm:
                                        </span>
                                        <span className={s.statValue}>
                                            {attempt.score.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                                <div className={s.statItem}>
                                    <span className={s.statLabel}>
                                        Bắt đầu:
                                    </span>
                                    <span className={s.statValue}>
                                        {new Date(
                                            attempt.started_at
                                        ).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            </div>

                            <div className={s.attemptActions}>
                                {attempt.status === AttemptStatus.SUBMITTED ? (
                                    <ButtonPrimary
                                        onClick={() =>
                                            navigate(
                                                `/teacher/grading/${testId}/attempts/${attempt.id}`
                                            )
                                        }
                                        size="sm"
                                    >
                                        ✏️ Chấm điểm
                                    </ButtonPrimary>
                                ) : (
                                    <ButtonGhost
                                        onClick={() =>
                                            navigate(
                                                `/teacher/grading/${testId}/attempts/${attempt.id}`
                                            )
                                        }
                                        size="sm"
                                    >
                                        👁️ Xem chi tiết
                                    </ButtonGhost>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
