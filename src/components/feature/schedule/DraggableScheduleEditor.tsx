import { useState, useMemo } from 'react'
import s from './DraggableScheduleEditor.module.css'
import type { SessionProposal } from '@/types/schedule.types'
import { SYSTEM_TIME_SLOTS } from '@/types/schedule.types'
import { format, addDays, startOfWeek, addWeeks } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useDialog } from '@/hooks/useDialog'

interface DraggableScheduleEditorProps {
    startDate: Date
    sessions: SessionProposal[]
    onSessionsChange: (sessions: SessionProposal[]) => void
    availableTeachers?: Array<{ id: string; name: string }>
    availableRooms?: Array<{ id: string; name: string }>
}

const TIME_SLOTS = SYSTEM_TIME_SLOTS.map((slot) => ({
    id: slot.slot_number,
    label: `Ca ${slot.slot_number}`,
    time: `${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`,
}))

const DAYS_OF_WEEK = 7

export default function DraggableScheduleEditor({
    startDate,
    sessions,
    onSessionsChange,
    availableTeachers = [],
    availableRooms = [],
}: DraggableScheduleEditorProps) {
    const { alert } = useDialog()
    const [draggedSession, setDraggedSession] =
        useState<SessionProposal | null>(null)
    const [editingSession, setEditingSession] = useState<string | null>(null)
    const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

    // Week navigation state
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0)

    // Calculate date range from sessions
    const dateRange = useMemo(() => {
        if (sessions.length === 0) {
            return {
                minDate: startDate,
                maxDate: startDate,
                totalWeeks: 1,
            }
        }

        const dates = sessions.map((s) => new Date(s.session_date))
        const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
        const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

        // Calculate total weeks
        const diffTime = maxDate.getTime() - minDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const totalWeeks = Math.ceil(diffDays / 7)

        return { minDate, maxDate, totalWeeks }
    }, [sessions, startDate])

    // Calculate current week based on offset
    const currentWeekStart = useMemo(() => {
        const baseWeek = startOfWeek(dateRange.minDate, { weekStartsOn: 1 })
        return addWeeks(baseWeek, currentWeekOffset)
    }, [dateRange.minDate, currentWeekOffset])

    const weekDays = useMemo(
        () =>
            Array.from({ length: DAYS_OF_WEEK }, (_, i) =>
                addDays(currentWeekStart, i)
            ),
        [currentWeekStart]
    )

    // Week navigation handlers
    const handlePrevWeek = () => {
        if (currentWeekOffset > 0) {
            setCurrentWeekOffset((prev) => prev - 1)
        }
    }

    const handleNextWeek = () => {
        if (currentWeekOffset < dateRange.totalWeeks - 1) {
            setCurrentWeekOffset((prev) => prev + 1)
        }
    }

    // Generate unique key for session
    const getSessionKey = (session: SessionProposal) => {
        return `${session.class_id}_${session.session_date}_${(session.time_slots || []).join('-')}`
    }

    // Generate unique key for slot
    const getSlotKey = (date: Date, slotId: number) => {
        return `${format(date, 'yyyy-MM-dd')}_${slotId}`
    }

    // Get sessions starting at slot
    const getSessionsStartingAtSlot = (date: Date, slotId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.filter(
            (s) =>
                s.session_date === dateStr && (s.time_slots || [])[0] === slotId
        )
    }

    // Check if slot is occupied by span
    const isSlotOccupiedBySpan = (date: Date, slotId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.some((s) => {
            if (s.session_date !== dateStr) return false
            const slots = s.time_slots || []
            return slots.includes(slotId) && slots[0] !== slotId
        })
    }

    // Check conflict
    const hasConflict = (date: Date, slotId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const slotSessions = sessions.filter((s) => {
            return (
                s.session_date === dateStr &&
                (s.time_slots || []).includes(slotId)
            )
        })

        if (slotSessions.length <= 1) return false

        const teacherIds = slotSessions.map((s) => s.teacher_id)
        if (teacherIds.length > new Set(teacherIds).size) return true

        const roomIds = slotSessions.map((s) => s.room_id)
        if (roomIds.length > new Set(roomIds).size) return true

        return false
    }

    // Handle drag start
    const handleDragStart = (session: SessionProposal) => {
        setDraggedSession(session)
    }

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, date: Date, slotId: number) => {
        e.preventDefault()
        setHoveredSlot(getSlotKey(date, slotId))
    }

    // Handle drop
    const handleDrop = (
        e: React.DragEvent,
        targetDate: Date,
        targetSlot: number
    ) => {
        e.preventDefault()
        setHoveredSlot(null)

        if (!draggedSession) return

        const targetDateStr = format(targetDate, 'yyyy-MM-dd')
        const originalSlots = draggedSession.time_slots || [1]
        const slotCount = originalSlots.length

        const maxSlot =
            SYSTEM_TIME_SLOTS[SYSTEM_TIME_SLOTS.length - 1].slot_number
        if (targetSlot + slotCount - 1 > maxSlot) {
            alert(
                `Không thể xếp ${slotCount} ca từ ca ${targetSlot} (vượt quá ca ${maxSlot})`
            )
            return
        }

        const newTimeSlots = Array.from(
            { length: slotCount },
            (_, i) => targetSlot + i
        ).filter((slot) => slot <= maxSlot)

        const startSlot = SYSTEM_TIME_SLOTS.find(
            (s) => s.slot_number === newTimeSlots[0]
        )
        const endSlot = SYSTEM_TIME_SLOTS.find(
            (s) => s.slot_number === newTimeSlots[newTimeSlots.length - 1]
        )

        const updatedSessions = sessions.map((s) => {
            if (getSessionKey(s) === getSessionKey(draggedSession)) {
                return {
                    ...s,
                    session_date: targetDateStr,
                    time_slots: newTimeSlots,
                    start_time: startSlot?.start_time || s.start_time,
                    end_time: endSlot?.end_time || s.end_time,
                }
            }
            return s
        })

        onSessionsChange(updatedSessions)
        setDraggedSession(null)
    }

    // Handle session update
    const handleSessionUpdate = (
        sessionToUpdate: SessionProposal,
        field: keyof SessionProposal,
        value: any
    ) => {
        const updatedSessions = sessions.map((s) => {
            if (getSessionKey(s) === getSessionKey(sessionToUpdate)) {
                const updates: Partial<SessionProposal> = { [field]: value }

                if (field === 'teacher_id') {
                    const teacher = availableTeachers.find(
                        (t) => t.id === value
                    )
                    if (teacher) updates.teacher_name = teacher.name
                }
                if (field === 'room_id') {
                    const room = availableRooms.find((r) => r.id === value)
                    if (room) updates.room_name = room.name
                }

                return { ...s, ...updates }
            }
            return s
        })
        onSessionsChange(updatedSessions)
    }

    // Handle session delete
    const handleDeleteSession = (session: SessionProposal) => {
        if (!confirm('Bạn có chắc muốn xóa buổi học này?')) return
        const updatedSessions = sessions.filter(
            (s) => getSessionKey(s) !== getSessionKey(session)
        )
        onSessionsChange(updatedSessions)
    }

    return (
        <div className={s.container}>
            <div className={s.header}>
                <div className={s.titleRow}>
                    <h3 className={s.title}>Chỉnh sửa Thời Khóa Biểu</h3>
                    {dateRange.totalWeeks > 1 && (
                        <div className={s.weekNav}>
                            <ButtonPrimary
                                size="sm"
                                variant="outline"
                                onClick={handlePrevWeek}
                                disabled={currentWeekOffset === 0}
                            >
                                ←
                            </ButtonPrimary>
                            <span className={s.weekIndicator}>
                                Tuần {currentWeekOffset + 1} /{' '}
                                {dateRange.totalWeeks}
                            </span>
                            <ButtonPrimary
                                size="sm"
                                variant="outline"
                                onClick={handleNextWeek}
                                disabled={
                                    currentWeekOffset ===
                                    dateRange.totalWeeks - 1
                                }
                            >
                                →
                            </ButtonPrimary>
                        </div>
                    )}
                </div>
                <div className={s.legend}>
                    <span className={s.legendItem}>
                        <span className={s.dotNormal}></span> Bình thường
                    </span>
                    <span className={s.legendItem}>
                        <span className={s.dotConflict}></span> Có xung đột
                    </span>
                    <span className={s.legendItem}>
                        <span className={s.dotHover}></span> Vị trí thả
                    </span>
                </div>
            </div>

            <div className={s.scheduleGrid}>
                {/* Header Row */}
                <div className={s.cornerCell}>Ca \ Ngày</div>
                {weekDays.map((day) => (
                    <div key={day.toISOString()} className={s.dayHeader}>
                        <div className={s.dayName}>
                            {format(day, 'EEEE', { locale: vi })}
                        </div>
                        <div className={s.dayDate}>{format(day, 'dd/MM')}</div>
                    </div>
                ))}

                {/* Time Slots Rows */}
                {TIME_SLOTS.map((slot) => (
                    <div key={slot.id} className={s.rowGroup}>
                        {/* Slot Label */}
                        <div className={s.slotLabel}>
                            <div className={s.slotName}>{slot.label}</div>
                            <div className={s.slotTime}>{slot.time}</div>
                        </div>

                        {/* Day Cells */}
                        {weekDays.map((day) => {
                            const slotKey = getSlotKey(day, slot.id)
                            const sessionsStarting = getSessionsStartingAtSlot(
                                day,
                                slot.id
                            )
                            const isOccupied = isSlotOccupiedBySpan(
                                day,
                                slot.id
                            )
                            const isHovered = hoveredSlot === slotKey
                            const hasConflictInSlot = hasConflict(day, slot.id)

                            if (isOccupied) {
                                return (
                                    <div
                                        key={slotKey}
                                        className={s.cellOccupied}
                                    ></div>
                                )
                            }

                            return (
                                <div
                                    key={slotKey}
                                    className={`${s.cell} ${
                                        isHovered ? s.cellHover : ''
                                    } ${hasConflictInSlot ? s.cellConflict : ''}`}
                                    onDragOver={(e) =>
                                        handleDragOver(e, day, slot.id)
                                    }
                                    onDrop={(e) => handleDrop(e, day, slot.id)}
                                    onDragLeave={() => setHoveredSlot(null)}
                                >
                                    {sessionsStarting.map((session) => {
                                        const sessionKey =
                                            getSessionKey(session)
                                        const isEditing =
                                            editingSession === sessionKey
                                        const spanRows = (
                                            session.time_slots || []
                                        ).length

                                        return (
                                            <div
                                                key={sessionKey}
                                                className={s.sessionCard}
                                                style={{
                                                    gridRow: `span ${spanRows}`,
                                                }}
                                                draggable
                                                onDragStart={() =>
                                                    handleDragStart(session)
                                                }
                                                onDragEnd={() =>
                                                    setDraggedSession(null)
                                                }
                                            >
                                                <div
                                                    className={s.sessionHeader}
                                                >
                                                    <span
                                                        className={
                                                            s.sessionClass
                                                        }
                                                    >
                                                        {session.class_name}
                                                    </span>
                                                    <div
                                                        className={
                                                            s.sessionActions
                                                        }
                                                    >
                                                        <button
                                                            className={
                                                                s.btnEdit
                                                            }
                                                            onClick={() =>
                                                                setEditingSession(
                                                                    isEditing
                                                                        ? null
                                                                        : sessionKey
                                                                )
                                                            }
                                                            title="Chỉnh sửa"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className={
                                                                s.btnDelete
                                                            }
                                                            onClick={() =>
                                                                handleDeleteSession(
                                                                    session
                                                                )
                                                            }
                                                            title="Xóa"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    <div
                                                        className={
                                                            s.sessionEditForm
                                                        }
                                                    >
                                                        <select
                                                            className={
                                                                s.selectField
                                                            }
                                                            value={
                                                                session.teacher_id
                                                            }
                                                            onChange={(e) =>
                                                                handleSessionUpdate(
                                                                    session,
                                                                    'teacher_id',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {availableTeachers.map(
                                                                (t) => (
                                                                    <option
                                                                        key={
                                                                            t.id
                                                                        }
                                                                        value={
                                                                            t.id
                                                                        }
                                                                    >
                                                                        {t.name}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <select
                                                            className={
                                                                s.selectField
                                                            }
                                                            value={
                                                                session.room_id
                                                            }
                                                            onChange={(e) =>
                                                                handleSessionUpdate(
                                                                    session,
                                                                    'room_id',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {availableRooms.map(
                                                                (r) => (
                                                                    <option
                                                                        key={
                                                                            r.id
                                                                        }
                                                                        value={
                                                                            r.id
                                                                        }
                                                                    >
                                                                        {r.name}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                        <input
                                                            className={
                                                                s.inputField
                                                            }
                                                            type="text"
                                                            value={
                                                                session.lesson_topic ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
                                                                handleSessionUpdate(
                                                                    session,
                                                                    'lesson_topic',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Chủ đề bài học"
                                                        />

                                                        <div
                                                            className={
                                                                s.slotInfo
                                                            }
                                                        >
                                                            {spanRows} ca (
                                                            {(
                                                                session.time_slots ||
                                                                []
                                                            ).join(', ')}
                                                            )
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={
                                                            s.sessionInfo
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                s.infoRow
                                                            }
                                                        >
                                                            👨‍🏫{' '}
                                                            {
                                                                session.teacher_name
                                                            }
                                                        </div>
                                                        <div
                                                            className={
                                                                s.infoRow
                                                            }
                                                        >
                                                            🏫{' '}
                                                            {session.room_name}
                                                        </div>
                                                        {session.lesson_topic && (
                                                            <div
                                                                className={
                                                                    s.infoRow
                                                                }
                                                            >
                                                                📚{' '}
                                                                {
                                                                    session.lesson_topic
                                                                }
                                                            </div>
                                                        )}
                                                        {spanRows > 1 && (
                                                            <div
                                                                className={
                                                                    s.infoRow
                                                                }
                                                            >
                                                                🕐 {spanRows} ca
                                                                liên tiếp
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {sessionsStarting.length === 0 && (
                                        <div className={s.emptySlot}>Trống</div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className={s.instructions}>
                💡 <strong>Hướng dẫn:</strong> Kéo thả buổi học để di chuyển
                (giữ nguyên số ca) • Click ✏️ để chỉnh sửa • Click 🗑️ để xóa •
                Buổi học nhiều ca sẽ tự động kéo dài
                {dateRange.totalWeeks > 1 && (
                    <>
                        {' '}
                        • <strong>Dùng ← → để chuyển tuần</strong>
                    </>
                )}
            </div>
        </div>
    )
}
