import { useState, useCallback } from 'react'
import s from './RoadmapPage.module.css'
import { useSession } from '@/stores/session.store'
import { useLocation } from 'react-router-dom'

import { getNavItems, getUserMenuItems } from '@/config/navigation.config'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import TextType from '@/components/common/text/TextType'
import Card from '@/components/common/card/Card'
import AvatarImg from '@/assets/avatar-placeholder.png'
import {
    RoadmapStageItem,
    type RoadmapStage,
} from '@/components/feature/roadmap/RoadmapStageItem'

const mockRoadmap: RoadmapStage[] = [
    {
        id: 'rs1',
        stage_order: 1,
        title: 'Xây dựng nền tảng (Band 5.5 - 6.0)',
        description:
            'Tập trung củng cố ngữ pháp cốt lõi và từ vựng học thuật cơ bản. Luyện nghe các đoạn hội thoại ngắn và đọc hiểu văn bản đơn giản.',
        focus_skills: ['grammar', 'vocabulary', 'basic_listening'],
        status: 'completed',
    },
    {
        id: 'rs2',
        stage_order: 2,
        title: 'Phát triển Kỹ năng (Band 6.0 - 7.0)',
        description:
            'Phân tích các dạng bài đọc và nghe. Luyện viết Writing Task 1 (biểu đồ) và Task 2 (các dạng câu hỏi phổ biến). Bắt đầu luyện Speaking Part 2.',
        focus_skills: [
            'reading_strategies',
            'listening_note_taking',
            'writing_task_1',
            'writing_task_2',
        ],
        status: 'in_progress',
    },
    {
        id: 'rs3',
        stage_order: 3,
        title: 'Tăng tốc & Luyện đề (Band 7.0 - 7.5+)',
        description:
            'Tập trung vào các chủ đề từ vựng nâng cao. Luyện đề thi đầy đủ (Full Mock Tests) để quản lý thời gian và áp lực.',
        focus_skills: ['advanced_vocabulary', 'mock_tests', 'speaking_part_3'],
        status: 'pending',
    },
]

export default function RoadmapPage() {
    const sessionState = useSession()
    const location = useLocation()
    const userRole = sessionState?.user?.role || 'student'
    const currentPath = location.pathname

    const [showGradientName, setShowGradientName] = useState(false)

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const navItems = getNavItems(userRole as any, currentPath)
    const userMenuItems = getUserMenuItems(userRole as any)

    return (
        <div className={s.pageWrapper}>
            {/* --- Header --- */}
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={sessionState?.user?.avatarUrl || AvatarImg}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            {/* --- Main Content --- */}
            <main className={s.mainContent}>
                {/* Tiêu đề trang */}
                <h1 className={s.pageTitle}>
                    <TextType
                        text="Lộ trình "
                        typingSpeed={50}
                        loop={false}
                        showCursor={!showGradientName}
                        onSentenceComplete={handleGreetingComplete}
                    />
                    {showGradientName && (
                        <TextType
                            as="span"
                            className={s.gradientText}
                            text="của bạn"
                            typingSpeed={70}
                            loop={false}
                        />
                    )}
                </h1>

                {/* --- Card Lộ trình --- */}
                <Card
                    title="Lộ trình cá nhân hóa"
                    variant="flat"
                    mode="light"
                    className={s.roadmapCard}
                >
                    <div className={s.cardIntro}>
                        <p>
                            Dựa trên kết quả học tập và các bài thi gần đây, đây
                            là lộ trình AI đề xuất để bạn đạt được mục tiêu.
                        </p>
                    </div>

                    <ul className={s.timeline}>
                        {mockRoadmap.map((stage) => (
                            <RoadmapStageItem key={stage.id} stage={stage} />
                        ))}
                    </ul>
                </Card>
            </main>
        </div>
    )
}
