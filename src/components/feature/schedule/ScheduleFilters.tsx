import s from './views/ScheduleViews.module.css'

interface ScheduleFiltersProps {
    selectedRoom?: string
    selectedClass?: string
    selectedTeacher?: string
    onRoomChange: (room: string | undefined) => void
    onClassChange: (classId: string | undefined) => void
    onTeacherChange: (teacher: string | undefined) => void
    // Could be extended with room/class/teacher lists from API
    rooms?: Array<{ id: string; name: string }>
    classes?: Array<{ id: string; name: string }>
    teachers?: Array<{ id: string; name: string }>
}

export default function ScheduleFilters({
    selectedRoom,
    selectedClass,
    selectedTeacher,
    onRoomChange,
    onClassChange,
    onTeacherChange,
    rooms = [],
    classes = [],
    teachers = [],
}: ScheduleFiltersProps) {
    return (
        <div className={s.filters}>
            <div className={s.filterGroup}>
                <label className={s.filterLabel}>Phòng:</label>
                <select
                    className={s.filterSelect}
                    value={selectedRoom || ''}
                    onChange={(e) => onRoomChange(e.target.value || undefined)}
                >
                    <option value="">Tất cả phòng</option>
                    {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                            {room.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={s.filterGroup}>
                <label className={s.filterLabel}>Lớp:</label>
                <select
                    className={s.filterSelect}
                    value={selectedClass || ''}
                    onChange={(e) => onClassChange(e.target.value || undefined)}
                >
                    <option value="">Tất cả lớp</option>
                    {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={s.filterGroup}>
                <label className={s.filterLabel}>Giáo viên:</label>
                <select
                    className={s.filterSelect}
                    value={selectedTeacher || ''}
                    onChange={(e) =>
                        onTeacherChange(e.target.value || undefined)
                    }
                >
                    <option value="">Tất cả giáo viên</option>
                    {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                        </option>
                    ))}
                </select>
            </div>

            {(selectedRoom || selectedClass || selectedTeacher) && (
                <button
                    className={s.clearFilters}
                    onClick={() => {
                        onRoomChange(undefined)
                        onClassChange(undefined)
                        onTeacherChange(undefined)
                    }}
                >
                    ✕ Xóa bộ lọc
                </button>
            )}
        </div>
    )
}
