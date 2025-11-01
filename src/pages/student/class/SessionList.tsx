import React, { useState, useMemo } from 'react'
import s from './SessionList.module.css' // CSS module riêng
import Card from '@/components/common/card/Card'
import NavigationOutline from '@/components/common/menu/NavigationOutline'
import LessonItem, {
    type Lesson,
} from '@/components/common/typography/LessonItem'

interface SessionListProps {
    sessions: Lesson[]
}

const SESSIONS_PER_PAGE = 5 // Số buổi học mỗi trang

export default function SessionList({ sessions }: SessionListProps) {
    const [currentPage, setCurrentPage] = useState(0)

    const totalPages = Math.ceil(sessions.length / SESSIONS_PER_PAGE)

    // Tính toán các buổi học cho trang hiện tại
    const currentSessions = useMemo(() => {
        const start = currentPage * SESSIONS_PER_PAGE
        const end = start + SESSIONS_PER_PAGE
        return sessions.slice(start, end)
    }, [sessions, currentPage])

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
    }

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0))
    }

    return (
        <Card
            title="Danh sách buổi học"
            mode="light"
            variant="outline"
            className={s.sessionCard} // Class để làm cho card co giãn
            // Slot cho các nút điều khiển
            footer={
                <NavigationOutline
                    size="sm"
                    onPrev={handlePrev}
                    onNext={handleNext}
                    disabledPrev={currentPage === 0}
                    disabledNext={currentPage >= totalPages - 1}
                />
            }
        >
            <div className={s.list}>
                {currentSessions.length > 0 ? (
                    currentSessions.map((session) => (
                        <LessonItem
                            key={session.id}
                            {...session}
                            mode="light"
                        />
                    ))
                ) : (
                    <div className={s.empty}>Chưa có buổi học nào.</div>
                )}
            </div>
        </Card>
    )
}
