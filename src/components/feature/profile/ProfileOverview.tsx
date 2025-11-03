import React from 'react'
import s from './ProfileOverview.module.css'
import { ProfileHeaderCard } from './ProfileHeaderCard'
import type { Role } from '@/types/auth'
import Card from '@/components/common/card/Card'
import { TestHistoryItem, type TestAttempt } from './TestHistoryItem'
import StatCard from '@/components/common/card/StatCard'

const mockProgress = {
    current_band: 7.0,
    target_band: 8.0,
    completed_lessons: 32,
    total_lessons: 50,
}
const mockTestHistory: TestAttempt[] = [
    {
        id: 'att_1',
        test_title: 'IELTS Mock Test #3 (Full)',
        completed_at: '2025-10-28T10:30:00Z',
        scores: {
            listening: 8.0,
            reading: 7.5,
            writing: 6.5,
            speaking: 7.0,
            overall: 7.5,
        },
    },
    {
        id: 'att_2',
        test_title: 'Reading Practice Test (Academic)',
        completed_at: '2025-10-15T14:00:00Z',
        scores: {
            listening: 0,
            reading: 8.0,
            writing: 0,
            speaking: 0,
            overall: 8.0,
        },
    },
]

const StudentStats: React.FC = () => {
    // Tính toán tiến độ
    const progressPercent =
        (mockProgress.completed_lessons / mockProgress.total_lessons) * 100

    return (
        <>
            {/* 1. Biểu đồ tiến độ (Dùng StatCard) */}
            <Card title="Biểu đồ tiến độ" variant="flat" mode="light">
                <div className={s.statsGrid}>
                    <StatCard
                        title="Band hiện tại"
                        value={mockProgress.current_band.toFixed(1)}
                        subtitle="IELTS"
                    />
                    <StatCard
                        title="Band mục tiêu"
                        value={mockProgress.target_band.toFixed(1)}
                        subtitle="IELTS"
                    />
                    <StatCard
                        title="Tiến độ khóa học"
                        value={`${progressPercent.toFixed(0)}%`}
                        subtitle={`${mockProgress.completed_lessons}/${mockProgress.total_lessons} buổi`}
                    />
                </div>
                {/* TODO: Chart */}
            </Card>

            {/* 2. Lịch sử thi */}
            <Card title="Lịch sử thi" variant="flat" mode="light">
                <ul className={s.historyList}>
                    {mockTestHistory.length > 0 ? (
                        mockTestHistory.map((attempt) => (
                            <TestHistoryItem
                                key={attempt.id}
                                attempt={attempt}
                                onViewDetails={(id) =>
                                    alert(`Xem chi tiết thi ${id}`)
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
                return <StudentStats />
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
