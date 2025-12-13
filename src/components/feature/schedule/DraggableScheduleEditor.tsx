import { useState } from 'react'
import s from './DraggableScheduleEditor.module.css'
import type { SessionBase } from '@/types/schedule.types'
import { format, addDays, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'

interface DraggableScheduleEditorProps {
    startDate: Date
    sessions: SessionBase[]
    onSessionsChange: (sessions: SessionBase[]) => void
    availableTeachers?: Array<{ id: string; name: string }>
    availableRooms?: Array<{ id: string; name: string }>
}

const TIME_SLOTS = [
    { id: 1, label: 'Kíp 1', time: '08:00-09:30' },
    { id: 2, label: 'Kíp 2', time: '09:45-11:15' },
    { id: 3, label: 'Kíp 3', time: '11:30-13:00' },
    { id: 4, label: 'Kíp 4', time: '13:30-15:00' },
    { id: 5, label: 'Kíp 5', time: '15:15-16:45' },
    { id: 6, label: 'Kíp 6', time: '17:00-18:30' },
]

const DAYS_OF_WEEK = 7

export default function DraggableScheduleEditor({
    startDate,
    sessions,
    onSessionsChange,
    availableTeachers = [],
    availableRooms = [],
}: DraggableScheduleEditorProps) {
    const [draggedSession, setDraggedSession] = useState<SessionBase | null>(
        null
    )
    const [editingSession, setEditingSession] = useState<string | null>(null)
    const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: DAYS_OF_WEEK }, (_, i) =>
        addDays(weekStart, i)
    )

    // Generate unique key cho session
    const getSessionKey = (session: SessionBase) => {
        return `${session.class_id}_${session.session_date}_${(session.time_slots || []).join('-')}`
    }

    // Generate unique key for slot
    const getSlotKey = (date: Date, slotId: number) => {
        return `${format(date, 'yyyy-MM-dd')}_${slotId}`
    }

    // Get sessions bắt đầu tại slot này (chỉ lấy session có slot đầu tiên = slotId)
    const getSessionsStartingAtSlot = (date: Date, slotId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.filter(
            (s) =>
                s.session_date === dateStr && (s.time_slots || [])[0] === slotId
        )
    }

    // Kiểm tra xem slot này có bị chiếm bởi session kéo dài từ slot trước không
    const isSlotOccupiedBySpan = (date: Date, slotId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return sessions.some((s) => {
            if (s.session_date !== dateStr) return false
            const slots = s.time_slots || []
            // Slot này nằm trong time_slots nhưng không phải slot đầu tiên
            return slots.includes(slotId) && slots[0] !== slotId
        })
    }

    // Check conflict
    const hasConflict = (date: Date, slotId: number) => {
        const dateStr = format(date, 'yyyy-MM-dd')

        // Lấy tất cả sessions có slot này (bao gồm cả span)
        const slotSessions = sessions.filter((s) => {
            return (
                s.session_date === dateStr &&
                (s.time_slots || []).includes(slotId)
            )
        })

        if (slotSessions.length <= 1) return false

        // Check teacher conflict
        const teacherIds = slotSessions.map((s) => s.teacher_id)
        if (teacherIds.length > new Set(teacherIds).size) return true

        // Check room conflict
        const roomIds = slotSessions.map((s) => s.room_id)
        if (roomIds.length > new Set(roomIds).size) return true

        return false
    }

    // Handle drag start
    const handleDragStart = (session: SessionBase) => {
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

        // Tạo time_slots mới bắt đầu từ targetSlot
        const newTimeSlots = Array.from(
            { length: slotCount },
            (_, i) => targetSlot + i
        ).filter((slot) => slot <= 6) // Không vượt quá kíp 6

        const updatedSessions = sessions.map((s) => {
            if (getSessionKey(s) === getSessionKey(draggedSession)) {
                return {
                    ...s,
                    session_date: targetDateStr,
                    time_slots: newTimeSlots,
                }
            }
            return s
        })

        onSessionsChange(updatedSessions)
        setDraggedSession(null)
    }

    // Handle session update
    const handleSessionUpdate = (
        sessionToUpdate: SessionBase,
        field: keyof SessionBase,
        value: any
    ) => {
        const updatedSessions = sessions.map((s) => {
            if (getSessionKey(s) === getSessionKey(sessionToUpdate)) {
                const updates: Partial<SessionBase> = { [field]: value }

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
    const handleDeleteSession = (session: SessionBase) => {
        if (!confirm('Bạn có chắc muốn xóa buổi học này?')) return
        const updatedSessions = sessions.filter(
            (s) => getSessionKey(s) !== getSessionKey(session)
        )
        onSessionsChange(updatedSessions)
    }

    return (
        <div className={s.container}>
            <div className={s.header}>
                <h3 className={s.title}>Chỉnh sửa Thời Khóa Biểu</h3>
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
                <div className={s.cornerCell}>Kíp \ Ngày</div>
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

                            // Nếu slot bị chiếm bởi span, không render gì
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
                                                                session.lesson_topic
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
                                                            {spanRows} kíp (
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
                                                        {spanRows > 1 && (
                                                            <div
                                                                className={
                                                                    s.infoRow
                                                                }
                                                            >
                                                                🕐 {spanRows}{' '}
                                                                kíp liên tiếp
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
                (giữ nguyên số kíp) • Click ✏️ để chỉnh sửa • Click 🗑️ để xóa •
                Buổi học nhiều kíp sẽ tự động kéo dài
            </div>
        </div>
    )
}
