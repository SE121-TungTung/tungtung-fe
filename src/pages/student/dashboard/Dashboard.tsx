import React, { useMemo, useState } from 'react'
import s from './Dashboard.module.css'
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
import YoutubeIcon from '@/assets/Arrow Right.svg'
import TemplateImg from '@/assets/banner-placeholder.png'
import RobotIcon from '@/assets/Robot.svg'
import type { Lesson } from '@/components/common/typography/LessonItem'
import Chatbot from '@/components/feature/chatbot/Chatbot'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'
import { getMe } from '@/lib/users'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import type { Role } from '@/types/auth'

const stats = [
    {
        id: 's1',
        title: 'Điểm danh',
        value: '99',
        unit: '%',
        subtitle: 'Tỉ lệ tham gia các buổi học hàng tháng',
        active: true,
    },
    {
        id: 's2',
        title: 'Điểm hiện tại',
        value: '4.5',
        subtitle: 'Điểm đạt được trung bình từ các bài thi',
    },
    {
        id: 's3',
        title: 'Số bài kiểm tra',
        value: '124',
        subtitle: 'Số lần làm bài của bạn trên hệ thống',
    },
]

const todaySessions: Lesson[] = [
    {
        id: '1',
        sessionDate: '2025-03-10',
        startTime: '08:00',
        endTime: '09:30',
        className: 'IELTS Intermediate A',
        courseName: 'IELTS Intermediate A',
        teacherName: 'Mr. John',
        roomName: 'A1',
        status: 'in_progress',
        attendanceTaken: false,
    },
    {
        id: '2',
        sessionDate: '2025-03-10',
        startTime: '10:00',
        endTime: '11:30',
        className: 'TOEIC Advanced B',
        courseName: 'TOEIC Advanced B',
        teacherName: 'Ms. Jane',
        roomName: 'B2',
        status: 'scheduled',
        attendanceTaken: false,
    },
]

export default function StudentDashboard() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isChatOpen, setIsChatOpen] = useState(false)

    // Fetch current user
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    const userRole = 'student' as Role
    const currentPath = location.pathname

    // Get nav items from config
    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [currentPath, navigate]
    )

    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [navigate]
    )

    // Build greeting text with user's full name
    const greetingTexts = userData
        ? [
              `Xin chào, ${userData.firstName} ${userData.lastName}!`,
              `Chào mừng trở lại, ${userData.firstName} ${userData.lastName}!`,
          ]
        : ['Xin chào!', 'Chào mừng trở lại!']

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`
        : ''

    return (
        <div className={s.dashboard}>
            {/* Navigation */}
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={userData?.avatarUrl || AvatarImg}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            {/* Welcome Message */}
            <h1 className={s.welcomeMessage}>
                {!userLoading && userData && (
                    <TextType
                        text={greetingTexts}
                        typingSpeed={70}
                        pauseDuration={5000}
                        deletingSpeed={50}
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

            {/* Main Content */}
            <main className={s.mainContent}>
                <Card
                    title="Tổng quan"
                    subtitle="Số liệu phân tích từ các hoạt động gần đây"
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
                                icon={<img src={ChartBarIcon} />}
                            />
                        ))}
                    </div>
                </Card>

                <div className={s.mainRow}>
                    <ScheduleTodayCard
                        sessions={todaySessions}
                        onCheckIn={() => alert('Điểm danh!')}
                    />

                    <Card
                        title="Hôm nay làm gì?"
                        subtitle="Dựa trên lộ trình học được AI đề xuất"
                    >
                        <div className={s.suggestionBody}>
                            <div className={s.suggestionTip}>
                                <TextHorizontal
                                    icon={<img src={ChatIcon} alt="tip icon" />}
                                    iconStyle="flat"
                                    title="Tip!"
                                    description="Trong bài kiểm tra Listening, hãy tập trung nghe vào Keyword để tìm ra đáp án đúng!"
                                    mode="light"
                                />
                            </div>

                            <TemplateCard
                                image={TemplateImg}
                                tag={
                                    <>
                                        <img
                                            src={ChatIcon}
                                            width={14}
                                            alt="tag icon"
                                        />{' '}
                                        <span>Speaking</span>
                                    </>
                                }
                                title="How to pronounce /ed/ sound?"
                                excerpt="This is the sample text. Real information will be added later when developing this website."
                                ctaText="Go to Youtube"
                                ctaIcon={
                                    <img
                                        src={YoutubeIcon}
                                        width={14}
                                        alt="cta icon"
                                    />
                                }
                            />
                        </div>
                    </Card>
                </div>
            </main>

            {/* Chatbot FAB */}
            <button
                className={s.fab}
                aria-label="Open chatbot"
                onClick={() => setIsChatOpen(true)}
            >
                <img src={RobotIcon} alt="Chatbot" />
            </button>

            <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    )
}
