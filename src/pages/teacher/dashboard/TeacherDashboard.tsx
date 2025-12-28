import React, { useMemo, useState } from 'react'
import s from './TeacherDashboard.module.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import Card from '@/components/common/card/Card'
import StatCard from '@/components/common/card/StatCard'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import TemplateCard from '@/components/common/card/TemplateCard'

import AvatarImg from '@/assets/avatar-placeholder.png'
import ChartBarIcon from '@/assets/Chart Bar.svg'
import ChatIcon from '@/assets/Chat Square Double Text.svg'
import DocumentIcon from '@/assets/Attachment 2.svg'
import RobotIcon from '@/assets/Robot.svg'
import ArrowRightIcon from '@/assets/Arrow Right.svg'
import BannerImg from '@/assets/banner-placeholder.png'

import Chatbot from '@/components/feature/chatbot/Chatbot'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'
import { getMe } from '@/lib/users'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import type { Role } from '@/types/auth'
import type { Lesson } from '@/components/common/typography/LessonItem'

const stats = [
    {
        id: 't1',
        title: 'KPI Tháng này',
        value: '92',
        unit: '%',
        subtitle: 'Hiệu suất giảng dạy và đánh giá từ học viên',
        active: true,
    },
    {
        id: 't2',
        title: 'Giờ dạy tích lũy',
        value: '48',
        unit: 'h',
        subtitle: 'Tổng số giờ đứng lớp trong tháng 10',
    },
    {
        id: 't3',
        title: 'Lớp phụ trách',
        value: '4',
        subtitle: 'Số lớp đang hoạt động dưới sự quản lý của bạn',
    },
]

const teachingSessions: Lesson[] = [
    {
        id: '1',
        sessionDate: '2025-03-10',
        startTime: '08:00',
        endTime: '09:30',
        className: 'IELTS Intermediate A',
        courseName: 'IELTS Intermediate A',
        teacherName: 'Phan Duy Minh', // Self
        roomName: 'A1',
        status: 'in_progress',
        attendanceTaken: true,
    },
    {
        id: '2',
        sessionDate: '2025-03-10',
        startTime: '13:30',
        endTime: '15:00',
        className: 'TOEIC Basic 101',
        courseName: 'TOEIC Preparation',
        teacherName: 'Phan Duy Minh',
        roomName: 'C3',
        status: 'scheduled',
        attendanceTaken: false,
    },
]

export default function TeacherDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isChatOpen, setIsChatOpen] = useState(false)

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    const userRole = 'teacher' as Role
    const currentPath = location.pathname

    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [currentPath, navigate]
    )

    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [navigate]
    )

    const greetingTexts = userData
        ? [
              `Xin chào thầy/cô ${userData.firstName} ${userData.lastName}!`,
              `Chúc thầy/cô một ngày giảng dạy hiệu quả!`,
          ]
        : ['Xin chào!', 'Chúc bạn một ngày làm việc hiệu quả!']

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

            <main className={s.mainContent}>
                <Card
                    title="Tổng quan giảng dạy"
                    subtitle="Số liệu KPI và hoạt động trong tháng"
                    direction="horizontal"
                >
                    <div className={s.statsGrid}>
                        {stats.map((stat) => (
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
                    <ScheduleTodayCard
                        title="Lịch dạy hôm nay"
                        sessions={teachingSessions}
                        onCheckIn={() => alert('Đã xác nhận giảng dạy!')}
                    />

                    <Card
                        title="Trợ lý giảng dạy AI"
                        subtitle="Hỗ trợ soạn giáo án và đánh giá học viên"
                    >
                        <div className={s.suggestionBody}>
                            <div className={s.suggestionTip}>
                                <TextHorizontal
                                    icon={<img src={ChatIcon} alt="ai tip" />}
                                    iconStyle="flat"
                                    title="Gợi ý chấm bài"
                                    description="Lớp IELTS Intermediate A vừa nộp bài Writing. AI đã chấm sơ bộ, hãy kiểm tra lại!"
                                    mode="light"
                                />
                            </div>

                            <TemplateCard
                                image={BannerImg}
                                tag={
                                    <>
                                        <img
                                            src={DocumentIcon}
                                            width={14}
                                            alt="doc icon"
                                        />{' '}
                                        <span>Lesson Plan</span>
                                    </>
                                }
                                title="Soạn giáo án tự động"
                                excerpt="Sử dụng AI để tạo khung giáo án chi tiết cho buổi học Speaking sắp tới dựa trên trình độ học viên."
                                ctaText="Tạo ngay"
                                ctaIcon={
                                    <img
                                        src={ArrowRightIcon}
                                        width={14}
                                        alt="arrow icon"
                                    />
                                }
                            />
                        </div>
                    </Card>
                </div>
            </main>

            <button
                className={s.fab}
                aria-label="Open AI Assistant"
                onClick={() => setIsChatOpen(true)}
            >
                <img src={RobotIcon} alt="Chatbot" />
            </button>

            <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    )
}
