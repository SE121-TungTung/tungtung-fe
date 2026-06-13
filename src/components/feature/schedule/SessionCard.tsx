import { useRef, useState } from 'react'
import type { WeeklySession } from '@/types/schedule.types'
import s from './views/ScheduleViews.module.css'
import { PortalTooltip } from '@/components/core/PortalTooltip'

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
    const cardRef = useRef<HTMLDivElement>(null)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClick?.(session)
    }

    if (compact) {
        const isConflict = session.is_conflict
        return (
            <>
                <div
                    ref={cardRef} // Gắn ref vào đây
                    className={s.sessionCardCompact}
                    style={
                        isConflict
                            ? {
                                  backgroundColor:
                                      'var(--color-status-danger-bg)',
                                  borderLeftColor: 'var(--color-status-danger)',
                              }
                            : undefined
                    }
                    onClick={handleClick}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <div className={s.cardInner}>
                        <div className={s.sessionTitle}>
                            {session.class_name}
                        </div>
                        <div className={s.sessionMeta}>
                            {/* ... Giữ nguyên nội dung thẻ ... */}
                            <span>{session.room_name}</span>
                        </div>
                    </div>
                </div>

                {/* Render Portal Tooltip nằm ngoài DOM tree của thẻ này */}
                <PortalTooltip parentRef={cardRef} isOpen={showTooltip}>
                    <div className={s.tooltipHeader}>{session.class_name}</div>
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
                </PortalTooltip>
            </>
        )
    }

    // Full card for list view
    const isConflict = session.is_conflict
    return (
        <div
            className={s.sessionCardFull}
            style={
                isConflict
                    ? {
                          backgroundColor: 'var(--color-status-danger-bg)',
                          borderLeftColor: 'var(--color-status-danger)',
                      }
                    : undefined
            }
            onClick={handleClick}
        >
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
