import s from './LessonItem.module.css'

export type LessonStatus =
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'postponed'

export interface Lesson {
    id: string
    sessionDate: string // YYYY-MM-DD
    startTime: string // HH:mm
    endTime: string // HH:mm
    className: string
    courseName?: string
    roomName?: string
    teacherName?: string
    status?: LessonStatus
    attendanceTaken?: boolean
    mode?: 'light' | 'dark'
}

/**
 * Compute the effective display status.
 * When backend status is "scheduled", check real-time against session timing
 * to decide whether to show "Đang diễn ra" instead of "Sắp diễn ra".
 */
const getStatusInfo = (
    status?: LessonStatus,
    sessionDate?: string,
    startTime?: string,
    endTime?: string
) => {
    // If backend already says in_progress/completed/cancelled, trust it
    switch (status) {
        case 'in_progress':
            return { text: 'Đang diễn ra', color: 'green' }
        case 'completed':
            return { text: 'Đã hoàn thành', color: 'blue' }
        case 'cancelled':
            return { text: 'Đã hủy', color: 'red' }
        case 'postponed':
            return { text: 'Tạm hoãn', color: 'yellow' }
        case 'scheduled':
        default: {
            // Real-time check: is it happening right now, or has it passed?
            if (sessionDate && startTime && endTime) {
                const now = new Date()
                // Use local date to match session_date format (YYYY-MM-DD)
                const y = now.getFullYear()
                const m = String(now.getMonth() + 1).padStart(2, '0')
                const d = String(now.getDate()).padStart(2, '0')
                const todayStr = `${y}-${m}-${d}`

                const [sh, sm] = startTime.split(':').map(Number)
                const [eh, em] = endTime.split(':').map(Number)
                const currentMinutes = now.getHours() * 60 + now.getMinutes()
                const startMinutes = sh * 60 + sm
                const endMinutes = eh * 60 + em

                // Past date or past end time on today
                if (
                    sessionDate < todayStr ||
                    (sessionDate === todayStr && currentMinutes >= endMinutes)
                ) {
                    return { text: 'Chưa hoàn thành', color: 'gray' }
                }

                // Happening right now
                if (
                    sessionDate === todayStr &&
                    currentMinutes >= startMinutes &&
                    currentMinutes < endMinutes
                ) {
                    return { text: 'Đang diễn ra', color: 'green' }
                }
            }
            return { text: 'Sắp diễn ra', color: 'gray' }
        }
    }
}

export default function LessonItem({
    className,
    courseName,
    roomName,
    teacherName,
    sessionDate,
    startTime,
    endTime,
    status,
    attendanceTaken,
    mode = 'light',
}: Lesson) {
    const statusInfo = getStatusInfo(status, sessionDate, startTime, endTime)
    const effectiveStatus =
        statusInfo.text === 'Đang diễn ra' ? 'in_progress' : status

    const itemClasses = [s.item, s[mode]].join(' ')

    return (
        <article className={itemClasses} data-status={effectiveStatus}>
            <div className={s.timeColumn}>
                <div className={s.statusBar} />
                <div className={s.time}>
                    <span>{startTime}</span>
                    <span>{endTime}</span>
                </div>
            </div>

            <div className={s.detailsColumn}>
                <div className={s.header}>
                    <h4 className={s.title}>{className}</h4>
                    <span className={`${s.tag} ${s[statusInfo.color]}`}>
                        {statusInfo.text}
                    </span>
                </div>
                <div className={s.meta}>
                    {courseName && <span>Khóa: {courseName}</span>}
                    {teacherName && <span>GV: {teacherName}</span>}
                    {roomName && <span>Phòng: {roomName}</span>}
                </div>
                {attendanceTaken && (
                    <span className={s.attendanceTag}>Đã điểm danh</span>
                )}
            </div>
        </article>
    )
}
