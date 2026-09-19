import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './ProfileOverview.module.css'
import { ProfileHeaderCard } from './ProfileHeaderCard'
import type { Role, User } from '@/types/auth'
import Card from '@/components/common/card/Card'
import { TestHistoryItem, type TestAttempt } from './TestHistoryItem'
import StatCard from '@/components/common/card/StatCard'
import { testApi } from '@/lib/test'
import type { TestAttemptHistoryResponse } from '@/types/test.types'

interface StudentStatsProps {
    user: User
}

const StudentStats: React.FC<StudentStatsProps> = ({ user }) => {
    const navigate = useNavigate()
    const [attempts, setAttempts] = useState<TestAttemptHistoryResponse[]>([])
    const [loadingAttempts, setLoadingAttempts] = useState(true)

    useEffect(() => {
        let isMounted = true
        setLoadingAttempts(true)
        testApi
            .listMyAttemptsHistory()
            .then((data) => {
                if (isMounted) {
                    setAttempts(data)
                }
            })
            .catch((err) => {
                console.error('Failed to load attempt history:', err)
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingAttempts(false)
                }
            })
        return () => {
            isMounted = false
        }
    }, [])

    // Read target band from user preferences (synced with backend)
    const targetBand = user?.preferences?.target_band
        ? parseFloat(user.preferences.target_band)
        : null

    const expectedExamDate = user?.preferences?.expected_exam_date
        ? (() => {
              try {
                  return new Date(
                      user.preferences.expected_exam_date
                  ).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                  })
              } catch {
                  return user.preferences.expected_exam_date
              }
          })()
        : 'Chưa đặt'

    // TODO: Replace with real data from API
    const completedLessons = 32
    const totalLessons = 50
    const progressPercent = (completedLessons / totalLessons) * 100

    const mappedAttempts: TestAttempt[] = attempts.map((att) => ({
        id: att.id,
        test_title: att.test_title,
        completed_at: att.submitted_at || att.started_at,
        scores: {
            listening: 0,
            reading: 0,
            writing: 0,
            speaking: 0,
            overall: att.score || 0,
        },
    }))

    return (
        <>
            {/* 1. Biểu đồ tiến độ (Dùng StatCard) */}
            <Card title="Biểu đồ tiến độ" variant="flat" mode="light">
                <div className={s.statsGrid}>
                    <StatCard
                        title="Band mục tiêu"
                        value={targetBand ? targetBand.toFixed(1) : 'Chưa đặt'}
                        subtitle={targetBand ? 'IELTS' : 'Vào Hồ sơ để cài đặt'}
                    />
                    <StatCard
                        title="Dự kiến thi"
                        value={expectedExamDate}
                        subtitle={
                            user?.preferences?.expected_exam_date
                                ? 'Ngày đi thi chính thức'
                                : 'Vào Hồ sơ để cài đặt'
                        }
                    />
                    <StatCard
                        title="Tiến độ khóa học"
                        value={`${progressPercent.toFixed(0)}%`}
                        subtitle={`${completedLessons}/${totalLessons} buổi`}
                    />
                </div>
                {/* TODO: Chart */}
            </Card>

            {/* 2. Lịch sử thi */}
            <Card title="Lịch sử thi" variant="flat" mode="light">
                <ul className={s.historyList}>
                    {loadingAttempts ? (
                        <li className={s.placeholder}>
                            Đang tải lịch sử thi...
                        </li>
                    ) : mappedAttempts.length > 0 ? (
                        mappedAttempts.map((attempt) => (
                            <TestHistoryItem
                                key={attempt.id}
                                attempt={attempt}
                                onViewDetails={(id) =>
                                    navigate(`/student/tests/results/${id}`)
                                }
                            />
                        ))
                    ) : (
                        <li className={s.placeholder}>Chưa có lịch sử thi.</li>
                    )}
                </ul>
            </Card>
        </>
    )
}

const TeacherStats = () => (
    <Card title="Hiệu suất Giảng dạy" variant="flat" mode="light">
        <div className={s.placeholder}>
            <p>
                Biểu đồ KPI, Lịch sử đánh giá (Feedback) và các lớp đã dạy sẽ
                được hiển thị ở đây.
            </p>
            <p>(UC005: Giáo viên)</p>
        </div>
    </Card>
)

interface ProfileOverviewProps {
    user: any
    role: Role
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
    user,
    role,
}) => {
    const renderRoleSpecificCards = () => {
        switch (role) {
            case 'student':
                return <StudentStats user={user} />
            case 'teacher':
                return <TeacherStats />
            case 'office_admin':
            case 'center_admin':
            case 'system_admin':
                return (
                    <Card title="Quyền Quản trị" variant="flat" mode="light">
                        <div className={s.placeholder}>
                            <p>Thông tin và thống kê dành cho quản trị viên.</p>
                        </div>
                    </Card>
                )
            default:
                return null
        }
    }

    return (
        <>
            {/* Card Thông tin chung (cho mọi role) */}
            <ProfileHeaderCard user={user} />

            {/* Cards Thông tin riêng theo vai trò (UC005) */}
            {renderRoleSpecificCards()}
        </>
    )
}
