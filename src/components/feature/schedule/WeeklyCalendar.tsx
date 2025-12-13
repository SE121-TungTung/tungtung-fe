import {
    format,
    addDays,
    startOfWeek,
    getHours,
    getMinutes,
    parseISO,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import s from './WeeklyCalendar.module.css'
import type { SessionBase } from '@/types/schedule.types'

interface WeeklyCalendarProps {
    startDate: Date // Ngày bắt đầu tuần
    sessions: SessionBase[]
    onSessionClick?: (session: SessionBase) => void
}

export default function WeeklyCalendar({
    startDate,
    sessions,
    onSessionClick,
}: WeeklyCalendarProps) {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }) // Thứ 2 là đầu tuần
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 14 }).map((_, i) => i + 7) // 7h sáng -> 20h tối

    // Helper: Tính vị trí top và height cho session
    const getSessionStyle = (session: SessionBase) => {
        const start = parseISO(`${session.session_date}T${session.start_time}`)
        const end = parseISO(`${session.session_date}T${session.end_time}`)

        const startHour = getHours(start) + getMinutes(start) / 60
        const endHour = getHours(end) + getMinutes(end) / 60

        const top = (startHour - 7) * 60 // 60px mỗi giờ, trừ offset 7h sáng
        const height = (endHour - startHour) * 60

        return { top: `${top}px`, height: `${height}px` }
    }

    // Helper: Lọc session theo ngày
    const getSessionsForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.filter((s) => s.session_date === dateStr)
    }

    return (
        <div className={s.container}>
            {/* Header */}
            <div className={s.headerRow}>
                <div className={s.timeHeader}>Giờ</div>
                {days.map((day, i) => (
                    <div key={i} className={s.dayHeader}>
                        <span className={s.dayName}>
                            {format(day, 'EEEE', { locale: vi })}
                        </span>
                        <span className={s.date}>{format(day, 'dd/MM')}</span>
                    </div>
                ))}
            </div>

            {/* Body */}
            <div className={s.gridBody}>
                {/* Cột giờ */}
                <div className={s.timeColumn}>
                    {hours.map((h) => (
                        <div key={h} className={s.timeSlot}>
                            {h}:00
                        </div>
                    ))}
                </div>

                {/* Các cột ngày */}
                {days.map((day, i) => (
                    <div key={i} className={s.dayColumn}>
                        {/* Grid lines nền */}
                        {hours.map((h) => (
                            <div key={h} className={s.timeSlot} />
                        ))}

                        {/* Sessions */}
                        {getSessionsForDay(day).map((session, idx) => (
                            <div
                                key={idx}
                                className={`${s.sessionCard} ${session.conflict ? s.conflict : ''}`}
                                style={getSessionStyle(session)}
                                onClick={() => onSessionClick?.(session)}
                                title={`${session.class_name} - ${session.teacher_name}`}
                            >
                                <div className={s.sessionTitle}>
                                    {session.class_name}
                                </div>
                                <div className={s.sessionMeta}>
                                    <span>
                                        {session.room_name || 'Chưa xếp phòng'}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {session.start_time} -{' '}
                                        {session.end_time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
