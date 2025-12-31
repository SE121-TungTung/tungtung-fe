import { useState } from 'react'
import type { WeeklySession } from '@/types/schedule.types'
import s from './views/ScheduleViews.module.css'

interface SessionCardProps {
    session: WeeklySession
    compact?: boolean
    onClick?: (session: WeeklySession) => void
}

export default function SessionCard({
    session,
    compact = false,
    onClick,
}: SessionCardProps) {
    const [showTooltip, setShowTooltip] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClick?.(session)
    }

    if (compact) {
        // Compact view for grid cells
        return (
            <div
                className={s.sessionCardCompact}
                onClick={handleClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <div className={s.sessionTitle}>{session.class_name}</div>
                <div className={s.sessionMeta}>
                    <span>{session.room_name}</span>
                    <span>•</span>
                    <span>
                        {session.start_time.slice(0, 5)} -{' '}
                        {session.end_time.slice(0, 5)}
                    </span>
                </div>

                {/* Tooltip on hover */}
                {showTooltip && (
                    <div className={s.tooltip}>
                        <div className={s.tooltipHeader}>
                            {session.class_name}
                        </div>
                        <div className={s.tooltipRow}>
                            <span>👤</span>
                            <span>{session.teacher_name}</span>
                        </div>
                        <div className={s.tooltipRow}>
                            <span>🏫</span>
                            <span>{session.room_name}</span>
                        </div>
                        <div className={s.tooltipRow}>
                            <span>🕐</span>
                            <span>
                                {session.start_time.slice(0, 5)} -{' '}
                                {session.end_time.slice(0, 5)}
                            </span>
                        </div>
                        {session.topic && (
                            <div className={s.tooltipRow}>
                                <span>📚</span>
                                <span>{session.topic}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // Full card for list view
    return (
        <div className={s.sessionCardFull} onClick={handleClick}>
            <div className={s.cardHeader}>
                <div className={s.sessionTitle}>{session.class_name}</div>
                <div className={s.sessionTime}>
                    {session.start_time.slice(0, 5)} -{' '}
                    {session.end_time.slice(0, 5)}
                </div>
            </div>
            <div className={s.cardBody}>
                <div className={s.cardInfo}>
                    <span>👤 {session.teacher_name}</span>
                    <span>•</span>
                    <span>🏫 {session.room_name}</span>
                </div>
                {session.topic && (
                    <div className={s.cardTopic}>📚 {session.topic}</div>
                )}
            </div>
        </div>
    )
}
