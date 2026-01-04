import { format, addDays, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { WeeklySession } from '@/types/schedule.types'
import SessionCard from '../SessionCard'
import s from './ScheduleViews.module.css'

interface RoomGridViewProps {
    startDate: Date
    sessions: WeeklySession[]
    onSessionClick?: (session: WeeklySession) => void
}

export default function RoomGridView({
    startDate,
    sessions,
    onSessionClick,
}: RoomGridViewProps) {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

    // Extract unique rooms from sessions
    const rooms = Array.from(new Set(sessions.map((s) => s.room_name))).sort()

    // Group sessions by room and day
    const getSessionsForRoomAndDay = (room: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions
            .filter((s) => s.room_name === room && s.session_date === dateStr)
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
    }

    if (rooms.length === 0) {
        return (
            <div className={s.emptyState}>
                <div className={s.emptyIcon}>🏫</div>
                <div className={s.emptyText}>Không có phòng học nào</div>
            </div>
        )
    }

    return (
        <div className={s.roomGridContainer}>
            {/* Header Row */}
            <div className={s.roomGridHeader}>
                <div className={s.roomHeaderCell}>Phòng</div>
                {days.map((day, i) => (
                    <div key={i} className={s.dayHeaderCell}>
                        <div className={s.dayName}>
                            {format(day, 'EEEE', { locale: vi })}
                        </div>
                        <div className={s.dayDate}>{format(day, 'dd/MM')}</div>
                    </div>
                ))}
            </div>

            {/* Room Rows */}
            <div className={s.roomGridBody}>
                {rooms.map((room) => (
                    <div key={room} className={s.roomRow}>
                        <div className={s.roomNameCell}>
                            <span className={s.roomIcon}>🏫</span>
                            <span className={s.roomName}>{room}</span>
                        </div>

                        {days.map((day, i) => {
                            const daySessions = getSessionsForRoomAndDay(
                                room,
                                day
                            )

                            return (
                                <div key={i} className={s.roomDayCell}>
                                    {daySessions.length === 0 ? (
                                        <div className={s.emptyCell}>—</div>
                                    ) : (
                                        <div className={s.sessionStack}>
                                            {daySessions.map((session) => (
                                                <SessionCard
                                                    key={session.session_id}
                                                    session={session}
                                                    compact
                                                    onClick={onSessionClick}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}
