import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { WeeklySession } from '@/types/schedule.types'
import SessionCard from '../SessionCard'
import s from './ScheduleViews.module.css'

interface ScheduleListViewProps {
    sessions: WeeklySession[]
    onSessionClick?: (session: WeeklySession) => void
}

export default function ScheduleListView({
    sessions,
    onSessionClick,
}: ScheduleListViewProps) {
    // Group sessions by date
    const sessionsByDate = sessions.reduce(
        (acc, session) => {
            const date = session.session_date
            if (!acc[date]) acc[date] = []
            acc[date].push(session)
            return acc
        },
        {} as Record<string, WeeklySession[]>
    )

    // Sort dates and sessions
    const sortedDates = Object.keys(sessionsByDate).sort()

    sortedDates.forEach((date) => {
        sessionsByDate[date].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        )
    })

    if (sessions.length === 0) {
        return (
            <div className={s.emptyState}>
                <div className={s.emptyIcon}>📋</div>
                <div className={s.emptyText}>Không có buổi học nào</div>
            </div>
        )
    }

    return (
        <div className={s.listContainer}>
            {sortedDates.map((dateStr) => {
                const date = parseISO(dateStr)
                const daySessions = sessionsByDate[dateStr]

                return (
                    <div key={dateStr} className={s.dateGroup}>
                        <div className={s.dateHeader}>
                            <div className={s.dateTitle}>
                                {format(date, 'EEEE, dd/MM/yyyy', {
                                    locale: vi,
                                })}
                            </div>
                            <div className={s.sessionCount}>
                                {daySessions.length} buổi
                            </div>
                        </div>

                        <div className={s.sessionList}>
                            {daySessions.map((session) => (
                                <SessionCard
                                    key={session.session_id}
                                    session={session}
                                    onClick={onSessionClick}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
