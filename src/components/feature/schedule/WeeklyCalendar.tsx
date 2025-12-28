import { format, addDays, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import s from './WeeklyCalendar.module.css'
import type { WeeklySession } from '@/types/schedule.types'

interface WeeklyCalendarProps {
    startDate: Date // Ngày bắt đầu tuần
    sessions: WeeklySession[]
    onSessionClick?: (session: WeeklySession) => void
}

export default function WeeklyCalendar({
    startDate,
    sessions,
    onSessionClick,
}: WeeklyCalendarProps) {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 14 }).map((_, i) => i + 7)
    const getSessionStyle = (session: WeeklySession) => {
        try {
            const [startHour, startMin] = session.start_time
                .split(':')
                .map(Number)
            const [endHour, endMin] = session.end_time.split(':').map(Number)

            const startTime = startHour + startMin / 60
            const endTime = endHour + endMin / 60

            const top = (startTime - 7) * 60
            const height = (endTime - startTime) * 60

            return {
                top: `${top}px`,
                height: `${Math.max(height, 40)}px`,
            }
        } catch (error) {
            console.error('Error parsing session time:', session, error)
            return { top: '0px', height: '60px' }
        }
    }

    const getSessionsForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.filter((s) => s.session_date === dateStr)
    }

    const hasOverlap = (daySessions: WeeklySession[]): boolean => {
        if (daySessions.length <= 1) return false

        for (let i = 0; i < daySessions.length - 1; i++) {
            for (let j = i + 1; j < daySessions.length; j++) {
                const s1Start = daySessions[i].start_time
                const s1End = daySessions[i].end_time
                const s2Start = daySessions[j].start_time
                const s2End = daySessions[j].end_time

                if (s1Start < s2End && s2Start < s1End) {
                    return true
                }
            }
        }
        return false
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
                {days.map((day, i) => {
                    const daySessions = getSessionsForDay(day)
                    const hasOverlaps = hasOverlap(daySessions)

                    return (
                        <div key={i} className={s.dayColumn}>
                            {/* Grid lines nền */}
                            {hours.map((h) => (
                                <div key={h} className={s.timeSlot} />
                            ))}

                            {/* Sessions */}
                            {daySessions.map((session, idx) => {
                                const style = getSessionStyle(session)

                                return (
                                    <div
                                        key={`${session.session_id}-${idx}`}
                                        className={`${s.sessionCard} ${
                                            hasOverlaps ? s.hasOverlap : ''
                                        }`}
                                        style={{
                                            ...style,
                                            // Offset overlapping sessions
                                            left: hasOverlaps
                                                ? `${idx * 5}%`
                                                : '0',
                                            width: hasOverlaps ? '95%' : '100%',
                                        }}
                                        onClick={() =>
                                            onSessionClick?.(session)
                                        }
                                        title={`${session.class_name} - ${session.teacher_name}`}
                                    >
                                        <div className={s.sessionTitle}>
                                            {session.class_name}
                                        </div>
                                        <div className={s.sessionMeta}>
                                            <span>
                                                {session.room_name ||
                                                    'Chưa xếp phòng'}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {session.start_time.slice(0, 5)}{' '}
                                                - {session.end_time.slice(0, 5)}
                                            </span>
                                        </div>
                                        {session.topic && (
                                            <div className={s.sessionTopic}>
                                                📚 {session.topic}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Empty state for day */}
                            {daySessions.length === 0 && (
                                <div className={s.emptyDay}>
                                    {/* Silent empty - no text needed */}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
