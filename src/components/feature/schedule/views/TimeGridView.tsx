import { format, addDays, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { WeeklySession } from '@/types/schedule.types'
import SessionCard from '../SessionCard'
import s from './ScheduleViews.module.css'

interface TimeGridViewProps {
    startDate: Date
    sessions: WeeklySession[]
    onSessionClick?: (session: WeeklySession) => void
}

export default function TimeGridView({
    startDate,
    sessions,
    onSessionClick,
}: TimeGridViewProps) {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
    const hours = Array.from({ length: 14 }).map((_, i) => i + 7) // 7:00 - 20:00

    // Calculate session position based on time
    const getSessionStyle = (session: WeeklySession) => {
        try {
            const [startHour, startMin] = session.start_time
                .split(':')
                .map(Number)
            const [endHour, endMin] = session.end_time.split(':').map(Number)

            const startTime = startHour + startMin / 60
            const endTime = endHour + endMin / 60

            const top = (startTime - 7) * 60 // 60px per hour, offset by 7am
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

    // Get sessions for a specific day
    const getSessionsForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.filter((s) => s.session_date === dateStr)
    }

    // Detect time overlap between sessions
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

    const groupOverlappingSessions = (sessions: WeeklySession[]) => {
        const sorted = [...sessions].sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        )
        const groups: WeeklySession[][] = []

        for (const session of sorted) {
            let placed = false
            for (const group of groups) {
                if (isOverlappingWithGroup(session, group)) {
                    group.push(session)
                    placed = true
                    break
                }
            }
            if (!placed) {
                groups.push([session])
            }
        }
        return groups
    }

    const isOverlappingWithGroup = (
        session: WeeklySession,
        group: WeeklySession[]
    ) => {
        return group.some((s) => {
            const start1 = session.start_time
            const end1 = session.end_time
            const start2 = s.start_time
            const end2 = s.end_time
            return start1 < end2 && start2 < end1
        })
    }

    return (
        <div className={s.timeGridContainer}>
            {/* Header */}
            <div className={s.timeGridHeader}>
                <div className={s.timeHeaderCell}>Giờ</div>
                {days.map((day, i) => (
                    <div key={i} className={s.dayHeaderCell}>
                        <div className={s.dayName}>
                            {format(day, 'EEEE', { locale: vi })}
                        </div>
                        <div className={s.dayDate}>{format(day, 'dd/MM')}</div>
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className={s.timeGridBody}>
                {/* Time column */}
                <div className={s.timeColumn}>
                    {hours.map((h) => (
                        <div key={h} className={s.timeSlot}>
                            {h}:00
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {days.map((day, i) => {
                    const daySessions = getSessionsForDay(day)
                    const hasOverlaps = hasOverlap(daySessions)

                    const groups = groupOverlappingSessions(daySessions)

                    return (
                        <div key={i} className={s.dayColumn}>
                            {/* Grid lines background */}
                            {hours.map((h) => (
                                <div key={h} className={s.gridLine} />
                            ))}

                            {groups.map((group, groupIdx) =>
                                group.map((session, indexInGroup) => {
                                    const style = getSessionStyle(session)

                                    const widthPercent = 100 / group.length
                                    const leftPercent =
                                        indexInGroup * widthPercent

                                    return (
                                        <div
                                            key={session.session_id}
                                            className={s.gridSession}
                                            style={{
                                                ...style,
                                                left: `${leftPercent}%`,
                                                width: `${widthPercent}%`,
                                                borderRight:
                                                    indexInGroup <
                                                    group.length - 1
                                                        ? '1px solid white'
                                                        : 'none',
                                                zIndex: 10,
                                            }}
                                        >
                                            <SessionCard
                                                session={session}
                                                compact
                                                onClick={onSessionClick}
                                            />
                                        </div>
                                    )
                                })
                            )}

                            {daySessions.length === 0 && (
                                <div className={s.emptyDay}>—</div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
