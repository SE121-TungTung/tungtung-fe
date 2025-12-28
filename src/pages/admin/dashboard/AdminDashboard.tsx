import React, { useMemo } from 'react'
import s from './AdminDashboard.module.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import TemplateCard from '@/components/common/card/TemplateCard'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'

import AvatarImg from '@/assets/avatar-placeholder.png'
import ChartBarIcon from '@/assets/Chart Bar.svg'
import SettingsIcon from '@/assets/User Settings.svg'
import UserIcon from '@/assets/User.svg'
import WalletIcon from '@/assets/Shop Money.svg'
import DangerIcon from '@/assets/Information.svg'
import ArrowRightIcon from '@/assets/Arrow Right.svg'

import { getMe } from '@/lib/users'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import type { Role } from '@/types/auth'

interface StatItem {
    id: string
    title: string
    value: string
    unit?: string
    subtitle: string
    active?: boolean
}

const officeStats: StatItem[] = [
    {
        id: 'o1',
        title: 'Lớp đang hoạt động',
        value: '24',
        subtitle: 'Tổng số lớp học đang diễn ra trong kỳ này',
        active: true,
    },
    {
        id: 'o2',
        title: 'Phòng học trống',
        value: '5',
        unit: '/12',
        subtitle: 'Số phòng khả dụng tại thời điểm hiện tại',
    },
    {
        id: 'o3',
        title: 'Yêu cầu xếp lịch',
        value: '8',
        subtitle: 'Số yêu cầu thay đổi lịch cần xử lý',
    },
]

const centerStats: StatItem[] = [
    {
        id: 'c1',
        title: 'Doanh thu tháng',
        value: '1.2',
        unit: ' tỷ',
        subtitle: 'Tổng doanh thu ước tính đến ngày 27',
        active: true,
    },
    {
        id: 'c2',
        title: 'Chi phí lương',
        value: '450',
        unit: ' tr',
        subtitle: 'Tổng lương giáo viên và nhân viên dự kiến',
    },
    {
        id: 'c3',
        title: 'KPI Trung bình',
        value: '94',
        unit: '%',
        subtitle: 'Hiệu suất hoạt động toàn trung tâm',
    },
]

const systemStats: StatItem[] = [
    {
        id: 's1',
        title: 'Active Users',
        value: '342',
        subtitle: 'Số người dùng đang online trên hệ thống',
        active: true,
    },
    {
        id: 's2',
        title: 'Server Uptime',
        value: '99.9',
        unit: '%',
        subtitle: 'Thời gian hoạt động liên tục trong 30 ngày qua',
    },
    {
        id: 's3',
        title: 'Error Logs',
        value: '12',
        subtitle: 'Số lỗi hệ thống ghi nhận trong 24h qua',
    },
]

export default function AdminDashboard() {
    const navigate = useNavigate()
    const location = useLocation()

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    const userRole = (userData?.role || 'office_admin') as Role
    const currentPath = location.pathname

    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [userRole, currentPath, navigate]
    )

    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [userRole, navigate]
    )

    const greetingTexts = useMemo(() => {
        if (!userData) return ['Xin chào Quản trị viên!']
        const name = `${userData.firstName} ${userData.lastName}`
        if (userRole === 'system_admin')
            return [`System Admin: ${name}`, 'Hệ thống hoạt động ổn định.']
        if (userRole === 'center_admin')
            return [`Giám đốc: ${name}`, 'Báo cáo tài chính đã sẵn sàng.']
        return [`Quản trị viên: ${name}`, 'Chúc một ngày làm việc hiệu quả!']
    }, [userData, userRole])

    const renderContent = () => {
        let currentStats: StatItem[] = officeStats
        let mainTitle = 'Tổng quan vận hành'
        let subTitle = 'Số liệu về lớp học và phòng học'

        if (userRole === 'center_admin') {
            currentStats = centerStats
            mainTitle = 'Tổng quan quản trị'
            subTitle = 'Chỉ số tài chính và hiệu suất nhân sự'
        } else if (userRole === 'system_admin') {
            currentStats = systemStats
            mainTitle = 'Sức khỏe hệ thống'
            subTitle = 'Giám sát tài nguyên và nhật ký hoạt động'
        }

        return (
            <>
                <Card
                    title={mainTitle}
                    subtitle={subTitle}
                    direction="horizontal"
                >
                    <div className={s.statsGrid}>
                        {currentStats.map((stat) => (
                            <StatCard
                                key={stat.id}
                                title={stat.title}
                                value={stat.value}
                                unit={stat.unit}
                                subtitle={stat.subtitle}
                                active={stat.active}
                                icon={
                                    <img src={ChartBarIcon} alt="stat icon" />
                                }
                            />
                        ))}
                    </div>
                </Card>

                <div className={s.mainRow}>
                    <Card title="Phím tắt quản lý">
                        <div className="flex flex-col gap-4">
                            {userRole === 'office_admin' && (
                                <>
                                    <TextHorizontal
                                        icon={
                                            <img
                                                src={SettingsIcon}
                                                alt="icon"
                                            />
                                        }
                                        title="Sắp xếp lịch học"
                                        description="Truy cập công cụ xếp thời khóa biểu tự động"
                                        mode="light"
                                        onClick={() =>
                                            navigate('/admin/schedule/generate')
                                        }
                                    />
                                    <TextHorizontal
                                        icon={<img src={UserIcon} alt="icon" />}
                                        title="Duyệt đăng ký mới"
                                        description="Có 5 học viên mới đang chờ xếp lớp"
                                        mode="light"
                                        onClick={() => navigate('/admin/users')}
                                    />
                                </>
                            )}

                            {userRole === 'center_admin' && (
                                <>
                                    <TextHorizontal
                                        icon={
                                            <img src={WalletIcon} alt="icon" />
                                        }
                                        title="Phê duyệt bảng lương"
                                        description="Bảng lương tháng 10 cần xác nhận trước ngày 30"
                                        mode="light"
                                        onClick={() =>
                                            navigate('/admin/salary')
                                        }
                                    />
                                    <TextHorizontal
                                        icon={
                                            <img
                                                src={ChartBarIcon}
                                                alt="icon"
                                            />
                                        }
                                        title="Xem báo cáo chi tiết"
                                        description="Xuất báo cáo doanh thu quý III"
                                        mode="light"
                                        onClick={() =>
                                            navigate('/admin/reports')
                                        }
                                    />
                                </>
                            )}

                            {userRole === 'system_admin' && (
                                <>
                                    <TextHorizontal
                                        icon={
                                            <img
                                                src={SettingsIcon}
                                                alt="icon"
                                            />
                                        }
                                        title="Cấu hình tham số"
                                        description="Điều chỉnh tham số hệ thống và phân quyền"
                                        mode="light"
                                    />
                                    <TextHorizontal
                                        icon={
                                            <img src={DangerIcon} alt="icon" />
                                        }
                                        title="Audit Logs"
                                        description="Kiểm tra nhật ký truy cập bất thường"
                                        mode="light"
                                        onClick={() =>
                                            navigate('/admin/audit-logs')
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </Card>

                    <Card
                        title={
                            userRole === 'system_admin'
                                ? 'System Status'
                                : 'News & Updates'
                        }
                        subtitle="Thông tin nổi bật từ hệ thống"
                    >
                        <div className={s.suggestionBody}>
                            <TemplateCard
                                tag={
                                    <>
                                        <img
                                            src={DangerIcon}
                                            width={14}
                                            alt="icon"
                                        />{' '}
                                        <span>Priority</span>
                                    </>
                                }
                                title={
                                    userRole === 'system_admin'
                                        ? 'Database Maintenance Scheduled'
                                        : 'Cập nhật quy trình xếp lớp v2.0'
                                }
                                excerpt={
                                    userRole === 'system_admin'
                                        ? 'Bảo trì định kỳ vào 02:00 AM ngày mai. Vui lòng thông báo cho các bên liên quan.'
                                        : 'Hệ thống AI xếp lớp đã được cập nhật thuật toán mới, tối ưu hóa phòng học tốt hơn 20%.'
                                }
                                ctaText="Chi tiết"
                                ctaIcon={
                                    <img
                                        src={ArrowRightIcon}
                                        width={14}
                                        alt="arrow"
                                    />
                                }
                            />
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
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={userData?.avatarUrl || AvatarImg}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            <h1 className={s.welcomeMessage}>
                {!userLoading && userData && (
                    <TextType
                        text={greetingTexts}
                        typingSpeed={60}
                        pauseDuration={4000}
                        deletingSpeed={40}
                        renderText={(text) => {
                            const namePattern = new RegExp(fullName, 'g')
                            const parts = text.split(namePattern)
                            const names = text.match(namePattern) || []
                            return (
                                <>
                                    {parts.map((part, i) => (
                                        <React.Fragment key={i}>
                                            {part}
                                            {names[i] && (
                                                <span
                                                    className={s.gradientText}
                                                >
                                                    {names[i]}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </>
                            )
                        }}
                    />
                )}
            </h1>

            <main className={s.mainContent}>{renderContent()}</main>
        </div>
    )
}
