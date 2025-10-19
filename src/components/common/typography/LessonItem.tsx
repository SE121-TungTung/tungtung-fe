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

const getStatusInfo = (status?: LessonStatus) => {
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
        default:
            return { text: 'Sắp diễn ra', color: 'gray' }
    }
}

export default function LessonItem({
    className,
    courseName,
    roomName,
    teacherName,
    startTime,
    endTime,
    status,
    attendanceTaken,
    mode = 'light',
}: Lesson) {
    const statusInfo = getStatusInfo(status)

    const itemClasses = [s.item, s[mode]].join(' ')

    return (
        <article className={itemClasses} data-status={status}>
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
