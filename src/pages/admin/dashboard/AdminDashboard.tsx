import React, { useMemo } from 'react'
import s from './AdminDashboard.module.css'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import TemplateCard from '@/components/common/card/TemplateCard'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'

// Assets
import ChartBarIcon from '@/assets/Chart Bar.svg'
import SettingsIcon from '@/assets/User Settings.svg'
import UserIcon from '@/assets/User.svg'
import WalletIcon from '@/assets/Shop Money.svg'
import DangerIcon from '@/assets/Information.svg'
import ArrowRightIcon from '@/assets/Arrow Right.svg'

// Libs & Types
import { getMe, getUserOverview } from '@/lib/users'
import type { Role } from '@/types/auth'
import type {
    AdminOverviewStats,
    SystemAdminOverviewStats,
} from '@/types/user.types'
import Skeleton from '@/components/effect/Skeleton'

// ============================================
// SUB-COMPONENTS
// ============================================

const UserDistributionChart = ({
    distribution,
}: {
    distribution: Record<string, number>
}) => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0)

    const roleLabels: Record<string, string> = {
        student: 'Học sinh',
        teacher: 'Giáo viên',
        office_admin: 'Admin Văn phòng',
        center_admin: 'Admin Trung tâm',
        system_admin: 'Admin Hệ thống',
    }

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

    return (
        <div className={s.chartWrapper}>
            <p className={s.chartTitle}>Phân bổ người dùng theo vai trò:</p>
            <div className={s.progressBar}>
                {Object.entries(distribution).map(([role, count], idx) => (
                    <div
                        key={role}
                        style={{
                            width:
                                total > 0 ? `${(count / total) * 100}%` : '0%',
                            backgroundColor: colors[idx % colors.length],
                        }}
                        className={s.progressSegment}
                        title={`${roleLabels[role] || role}: ${count}`}
                    />
                ))}
            </div>
            <div className={s.chartLegend}>
                {Object.entries(distribution).map(([role, count], idx) => (
                    <div key={role} className={s.legendItem}>
                        <span
                            className={s.legendDot}
                            style={{
                                backgroundColor: colors[idx % colors.length],
                            }}
                        />
                        <span className={s.legendLabel}>
                            {roleLabels[role] || role}:
                        </span>
                        <span className={s.legendValue}>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminDashboard() {
    const navigate = useNavigate()

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    const userRole = (userData?.role || 'office_admin') as Role

    const { data: overviewData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-overview', userRole],
        queryFn: () => getUserOverview<any>(),
    })

    const greetingTexts = useMemo(() => {
        if (!userData) return ['Xin chào Quản trị viên!']
        const name = `${userData.firstName} ${userData.lastName}`
        if (userRole === 'system_admin')
            return [`System Admin: ${name}`, 'Hệ thống đang vận hành ổn định.']
        if (userRole === 'center_admin')
            return [`Giám đốc: ${name}`, 'Báo cáo vận hành đã sẵn sàng.']
        return [
            `Quản trị viên: ${name}`,
            'Chúc bạn một ngày làm việc hiệu quả!',
        ]
    }, [userData, userRole])

    const renderStats = () => {
        if (statsLoading)
            return (
                <div className={s.statsGrid}>
                    <Skeleton
                        height={140}
                        variant="rect"
                        count={userRole === 'system_admin' ? 3 : 4}
                    />
                </div>
            )

        if (userRole === 'system_admin') {
            const data = overviewData as SystemAdminOverviewStats
            return (
                <div className={s.statsGrid}>
                    <StatCard
                        title="Tổng người dùng"
                        value={data?.total_users?.toString() || '0'}
                        subtitle="Tài khoản hệ thống"
                        active
                        icon={<img src={UserIcon} alt="" />}
                    />
                    <StatCard
                        title="Khóa học"
                        value={data?.total_courses?.toString() || '0'}
                        subtitle="Số lượng khóa học"
                        icon={<img src={SettingsIcon} alt="" />}
                    />
                    <StatCard
                        title="Lớp đang chạy"
                        value={data?.total_active_classes?.toString() || '0'}
                        subtitle="Lớp đang hoạt động"
                        icon={<img src={ChartBarIcon} alt="" />}
                    />
                </div>
            )
        }

        const data = overviewData as AdminOverviewStats
        return (
            <div className={s.statsGrid}>
                <StatCard
                    title="Học viên"
                    value={data?.total_students?.toString() || '0'}
                    subtitle="Học viên đang học"
                    active
                    icon={<img src={UserIcon} alt="" />}
                />
                <StatCard
                    title="Lớp vận hành"
                    value={data?.active_classes?.toString() || '0'}
                    subtitle="Số lớp đang mở"
                    icon={<img src={ChartBarIcon} alt="" />}
                />
                <StatCard
                    title="Buổi dạy hôm nay"
                    value={data?.sessions_today_count?.toString() || '0'}
                    subtitle="Lịch dạy trong ngày"
                    icon={<img src={ChartBarIcon} alt="" />}
                />
            </div>
        )
    }

    const renderShortcuts = () => {
        switch (userRole) {
            case 'office_admin':
                return (
                    <div className={s.shortcutList}>
                        <TextHorizontal
                            icon={<img src={SettingsIcon} alt="" />}
                            title="Sắp xếp lịch học"
                            description="Truy cập công cụ xếp thời khóa biểu tự động"
                            mode="light"
                            onClick={() => navigate('/admin/schedule')}
                        />
                        <TextHorizontal
                            icon={<img src={UserIcon} alt="" />}
                            title="Quản lý người dùng"
                            description="Xem và chỉnh sửa danh sách nhân sự"
                            mode="light"
                            onClick={() => navigate('/admin/users')}
                        />
                    </div>
                )
            case 'center_admin':
                return (
                    <div className={s.shortcutList}>
                        <TextHorizontal
                            icon={<img src={WalletIcon} alt="" />}
                            title="Phê duyệt bảng lương"
                            description="Xác nhận lương giáo viên tháng này"
                            mode="light"
                            onClick={() => navigate('/admin/salary')}
                        />
                        <TextHorizontal
                            icon={<img src={ChartBarIcon} alt="" />}
                            title="Xem báo cáo doanh thu"
                            description="Phân tích số liệu tài chính trung tâm"
                            mode="light"
                            onClick={() => navigate('/admin/reports')}
                        />
                    </div>
                )
            case 'system_admin':
                return (
                    <div className={s.shortcutList}>
                        <TextHorizontal
                            icon={<img src={SettingsIcon} alt="" />}
                            title="Cấu hình hệ thống"
                            description="Điều chỉnh tham số và phân quyền"
                            mode="light"
                            onClick={() => navigate('/admin/settings')}
                        />
                        <TextHorizontal
                            icon={<img src={DangerIcon} alt="" />}
                            title="Audit Logs"
                            description="Kiểm tra nhật ký truy cập hệ thống"
                            mode="light"
                            onClick={() => navigate('/admin/audit-logs')}
                        />
                    </div>
                )
            default:
                return null
        }
    }

    const renderContent = () => {
        let mainTitle = 'Tổng quan vận hành'
        let subTitle = 'Số liệu thực tế từ dữ liệu trung tâm'

        if (userRole === 'system_admin') {
            mainTitle = 'Trạng thái hệ thống'
            subTitle = 'Giám sát tài nguyên và phân bổ người dùng'
        }

        return (
            <>
                <Card
                    title={mainTitle}
                    subtitle={subTitle}
                    direction="horizontal"
                    className={s.fullRow}
                >
                    {renderStats()}
                </Card>

                <div className={s.mainRow}>
                    <Card title="Phím tắt quản lý">
                        {userLoading ? (
                            <Skeleton
                                height={50}
                                count={2}
                                style={{ marginBottom: '10px' }}
                            />
                        ) : (
                            renderShortcuts()
                        )}
                    </Card>

                    <Card
                        title={
                            userRole === 'system_admin'
                                ? 'Phân bổ tài khoản'
                                : 'Thông báo mới'
                        }
                        subtitle={
                            userRole === 'system_admin'
                                ? 'Tỉ lệ các loại người dùng'
                                : 'Tin tức hệ thống'
                        }
                    >
                        <div className={s.suggestionBody}>
                            {statsLoading ? (
                                <div style={{ width: '100%' }}>
                                    <Skeleton
                                        height={20}
                                        width="60%"
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <Skeleton
                                        height={32}
                                        variant="rect"
                                        style={{
                                            borderRadius: '16px',
                                            marginBottom: '15px',
                                        }}
                                    />
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '10px',
                                        }}
                                    >
                                        <Skeleton height={15} count={4} />
                                    </div>
                                </div>
                            ) : userRole === 'system_admin' &&
                              (overviewData as SystemAdminOverviewStats)
                                  ?.user_distribution ? (
                                <UserDistributionChart
                                    distribution={
                                        (
                                            overviewData as SystemAdminOverviewStats
                                        ).user_distribution
                                    }
                                />
                            ) : (
                                <TemplateCard
                                    tag={
                                        <>
                                            <img
                                                src={DangerIcon}
                                                width={14}
                                                alt=""
                                            />{' '}
                                            <span>Cập nhật</span>
                                        </>
                                    }
                                    title="Quy trình xếp lớp mới"
                                    excerpt="Hệ thống AI vừa cập nhật thuật toán, giúp tối ưu hóa phòng học tốt hơn 20%."
                                    ctaText="Xem ngay"
                                    ctaIcon={
                                        <img
                                            src={ArrowRightIcon}
                                            width={14}
                                            alt=""
                                        />
                                    }
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </>
        )
    }

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`
        : ''

    return (
        <div className={s.dashboard}>
            <main className={s.mainContent}>
                <h1 className={s.welcomeMessage}>
                    {!userLoading && userData && (
                        <TextType
                            text={greetingTexts}
                            typingSpeed={60}
                            pauseDuration={4000}
                            renderText={(text) => (
                                <>
                                    {text
                                        .split(fullName)
                                        .map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                {part}
                                                {i < arr.length - 1 && (
                                                    <span
                                                        className={
                                                            s.gradientText
                                                        }
                                                    >
                                                        {fullName}
                                                    </span>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </>
                            )}
                        />
                    )}
                </h1>
                {renderContent()}
            </main>
        </div>
    )
}
