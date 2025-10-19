import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import s from './Dashboard.module.css'

import NavigationMenu, {
    type NavItem,
} from '@/components/common/menu/NavigationMenu'
import SideMenu, {
    type SideMenuItem,
} from '@/components/common/menu/SideMenuSet'
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
import ClassIcon from '@/assets/Book 2.svg'
import ExamIcon from '@/assets/Card Question.svg'
import RoadmapIcon from '@/assets/Merge.svg'

import type { Lesson } from '@/components/common/typography/LessonItem'
import Chatbot from '@/components/feature/chatbot/Chatbot'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import TextType from '@/components/common/text/TextType'

const userMenuItems: SideMenuItem[] = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'settings', label: 'Cài đặt' },
    { id: 'help', label: 'Trợ giúp' },
    { id: 'logout', label: 'Đăng xuất' },
]

const studyMenuItems: SideMenuItem[] = [
    { id: 'classes', label: 'Lớp học', icon: <img src={ClassIcon} /> },
    { id: 'exams', label: 'Luyện thi', icon: <img src={ExamIcon} /> },
    { id: 'roadmap', label: 'Lộ trình', icon: <img src={RoadmapIcon} /> },
]

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

// Menu Portal Component
function MenuPortal({
    isOpen,
    activeMenu,
    menuStyle,
    onClose,
}: {
    isOpen: boolean
    activeMenu: 'user' | 'study' | null
    menuStyle: React.CSSProperties
    onClose: () => void
}) {
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (!target.closest('[data-menu-trigger]')) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <div
            style={{
                position: 'fixed',
                ...menuStyle,
                zIndex: 1000,
            }}
            className={s.menuPopover}
        >
            {activeMenu === 'user' && (
                <SideMenu title="Tài khoản" items={userMenuItems} />
            )}
            {activeMenu === 'study' && (
                <SideMenu title="Học tập" items={studyMenuItems} />
            )}
        </div>,
        document.body
    )
}

export default function StudentDashboard() {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [activeMenu, setActiveMenu] = useState<'user' | 'study' | null>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
    const avatarRef = useRef<HTMLButtonElement>(null)
    const studyNavItemRef = useRef<HTMLLIElement>(null!)

    const navItems: NavItem[] = [
        {
            id: '1',
            label: 'Dashboard',
            href: '#',
            active: true,
        },
        {
            id: '2',
            label: 'Học tập',
            onClick: () =>
                setActiveMenu(activeMenu === 'study' ? null : 'study'),
            ref: studyNavItemRef,
        },
        {
            id: '3',
            label: 'Thông báo',
            href: '#',
        },
        {
            id: '4',
            label: 'Tin nhắn',
            href: '#',
        },
    ]

    const updateMenuPosition = () => {
        if (activeMenu === 'user' && avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect()
            setMenuStyle({
                top: `${rect.bottom + 12}px`,
                right: `${window.innerWidth - rect.right}px`,
            })
        } else if (activeMenu === 'study' && studyNavItemRef.current) {
            const rect = studyNavItemRef.current.getBoundingClientRect()
            setMenuStyle({
                top: `${rect.bottom + 12}px`,
                left: `${rect.left}px`,
            })
        }
    }

    useEffect(() => {
        updateMenuPosition()
    }, [activeMenu])

    useEffect(() => {
        if (!activeMenu) return

        window.addEventListener('resize', updateMenuPosition)
        window.addEventListener('scroll', updateMenuPosition, true)

        return () => {
            window.removeEventListener('resize', updateMenuPosition)
            window.removeEventListener('scroll', updateMenuPosition, true)
        }
    }, [activeMenu])

    return (
        <div className={s.dashboard}>
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlot={
                        <div className={s.avatarWrapper}>
                            <button
                                ref={avatarRef}
                                className={s.avatarButton}
                                data-menu-trigger
                                data-active={activeMenu === 'user'}
                                onClick={() =>
                                    setActiveMenu(
                                        activeMenu === 'user' ? null : 'user'
                                    )
                                }
                                aria-label="User menu"
                            >
                                <img
                                    src={AvatarImg}
                                    className={s.avatar}
                                    alt="User Avatar"
                                />
                            </button>
                        </div>
                    }
                />
            </header>

            <MenuPortal
                isOpen={!!activeMenu}
                activeMenu={activeMenu}
                menuStyle={menuStyle}
                onClose={() => setActiveMenu(null)}
            />

            <h1 className={s.welcomeMessage}>
                <TextType
                    text={[
                        'Xin chào, Phan Duy Minh!',
                        'Chào mừng trở lại, Phan Duy Minh!',
                    ]}
                    typingSpeed={70}
                    pauseDuration={5000}
                    deletingSpeed={50}
                    renderText={(text) => {
                        const namePattern = /Phan Duy Minh/g
                        const parts = text.split(namePattern)
                        const names = text.match(namePattern) || []

                        return (
                            <>
                                {parts.map((part, i) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {names[i] && (
                                            <span className={s.gradientText}>
                                                {names[i]}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </>
                        )
                    }}
                />
            </h1>

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
