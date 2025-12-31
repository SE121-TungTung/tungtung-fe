import { useMemo, useState } from 'react'
import s from './Schedule.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import { scheduleApi } from '@/lib/schedule'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import { useSession } from '@/stores/session.store'
import { type Role as UserRole } from '@/types/auth'
import type { WeeklySession } from '@/types/schedule.types'

// New components
import ViewModeSelector, {
    type ViewMode,
} from '@/components/feature/schedule/ViewModeSelector'
import ScheduleFilters from '@/components/feature/schedule/ScheduleFilters'
import TimeGridView from '@/components/feature/schedule/views/TimeGridView'
import RoomGridView from '@/components/feature/schedule/views/RoomGridView'
import ScheduleListView from '@/components/feature/schedule/views/ScheduleListView'

export default function ScheduleManagementPage() {
    const navigate = useNavigate()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('time-grid')

    // Filter states
    const [selectedRoom, setSelectedRoom] = useState<string | undefined>()
    const [selectedClass, setSelectedClass] = useState<string | undefined>()
    const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>()

    const session = useSession((state) => state.user)
    const location = useLocation()
    const userRole = (session?.role as UserRole) || 'student'
    const currentPath = location.pathname

    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [userRole, currentPath, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [userRole, navigate]
    )

    // Date logic
    const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endWeek = new Date(startWeek.getTime() + 6 * 24 * 60 * 60 * 1000)

    // Fetch schedule data with filters
    const {
        data: weeklyData,
        isLoading,
        error,
    } = useQuery({
        queryKey: [
            'schedule',
            format(startWeek, 'yyyy-MM-dd'),
            selectedRoom,
            selectedClass,
            selectedTeacher,
        ],
        queryFn: async () => {
            const response = await scheduleApi.getWeekly({
                start_date: format(startWeek, 'yyyy-MM-dd'),
                end_date: format(endWeek, 'yyyy-MM-dd'),
                // Note: Backend currently only supports user_id filter
                // Room/class filtering will be done client-side for now
            })
            return response
        },
    })

    const sessions: WeeklySession[] = weeklyData?.schedule || []

    // Client-side filtering (until backend supports it)
    const filteredSessions = useMemo(() => {
        let filtered = sessions

        if (selectedRoom) {
            filtered = filtered.filter((s) => s.room_name === selectedRoom)
        }
        if (selectedClass) {
            filtered = filtered.filter((s) => s.class_name === selectedClass)
        }
        if (selectedTeacher) {
            filtered = filtered.filter(
                (s) => s.teacher_name === selectedTeacher
            )
        }

        return filtered
    }, [sessions, selectedRoom, selectedClass, selectedTeacher])

    // Extract unique values for filter dropdowns
    const uniqueRooms = useMemo(
        () =>
            Array.from(new Set(sessions.map((s) => s.room_name)))
                .sort()
                .map((name) => ({ id: name, name })),
        [sessions]
    )

    const uniqueClasses = useMemo(
        () =>
            Array.from(new Set(sessions.map((s) => s.class_name)))
                .sort()
                .map((name) => ({ id: name, name })),
        [sessions]
    )

    const uniqueTeachers = useMemo(
        () =>
            Array.from(new Set(sessions.map((s) => s.teacher_name)))
                .sort()
                .map((name) => ({ id: name, name })),
        [sessions]
    )

    // Week navigation
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const handleToday = () => setCurrentDate(new Date())

    // Session click handler (can be extended for modal/details)
    const handleSessionClick = (session: WeeklySession) => {
        console.log('Session clicked:', session)
        // TODO: Open modal or navigate to session details
    }

    // Render view based on mode
    const renderView = () => {
        if (isLoading) {
            return (
                <div
                    style={{
                        padding: 40,
                        textAlign: 'center',
                        color: '#666',
                    }}
                >
                    Đang tải dữ liệu...
                </div>
            )
        }

        if (error) {
            return (
                <div
                    style={{
                        padding: 40,
                        textAlign: 'center',
                        color: '#ef4444',
                        background: '#fee',
                        borderRadius: 8,
                    }}
                >
                    ⚠ Lỗi tải dữ liệu: {(error as Error).message}
                </div>
            )
        }

        if (filteredSessions.length === 0) {
            return (
                <div
                    style={{
                        padding: 60,
                        textAlign: 'center',
                        background: '#f9fafb',
                        borderRadius: 12,
                        border: '2px dashed #e5e7eb',
                    }}
                >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 500,
                            marginBottom: 8,
                            color: 'var(--text-primary-light)',
                        }}
                    >
                        Chưa có lịch học nào
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: '#666',
                            marginBottom: 24,
                        }}
                    >
                        Bắt đầu bằng cách tạo lịch tự động hoặc thêm thủ công
                    </div>
                    <ButtonPrimary
                        onClick={() => navigate('/admin/schedule/generate')}
                    >
                        + Tạo lịch ngay
                    </ButtonPrimary>
                </div>
            )
        }

        // Render based on view mode
        switch (viewMode) {
            case 'time-grid':
                return (
                    <TimeGridView
                        startDate={startWeek}
                        sessions={filteredSessions}
                        onSessionClick={handleSessionClick}
                    />
                )
            case 'room-grid':
                return (
                    <RoomGridView
                        startDate={startWeek}
                        sessions={filteredSessions}
                        onSessionClick={handleSessionClick}
                    />
                )
            case 'list':
                return (
                    <ScheduleListView
                        sessions={filteredSessions}
                        onSessionClick={handleSessionClick}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className={s.pageWrapper}>
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={session?.avatarUrl || DefaultAvatar}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý Thời khóa biểu</h1>

                {/* Control bar */}
                <div className={s.controls}>
                    <ButtonPrimary
                        size="sm"
                        variant="outline"
                        onClick={handlePrevWeek}
                        disabled={isLoading}
                    >
                        ←
                    </ButtonPrimary>
                    <div className={s.dateDisplay}>
                        {format(startWeek, 'dd/MM')} -{' '}
                        {format(endWeek, 'dd/MM/yyyy')}
                    </div>
                    <ButtonPrimary
                        size="sm"
                        variant="outline"
                        onClick={handleNextWeek}
                        disabled={isLoading}
                    >
                        →
                    </ButtonPrimary>
                    <ButtonPrimary
                        size="sm"
                        variant="subtle"
                        onClick={handleToday}
                        disabled={isLoading}
                    >
                        Hôm nay
                    </ButtonPrimary>
                    <div style={{ flex: 1 }}></div> {/* Spacer */}
                    {filteredSessions.length > 0 && (
                        <div
                            style={{
                                fontSize: 14,
                                color: '#666',
                                marginRight: 16,
                            }}
                        >
                            {filteredSessions.length} buổi học
                        </div>
                    )}
                    <ButtonPrimary
                        onClick={() => navigate('/admin/schedule/generate')}
                    >
                        + Xếp lịch tự động
                    </ButtonPrimary>
                </div>

                {/* View mode selector */}
                <ViewModeSelector
                    currentMode={viewMode}
                    onModeChange={setViewMode}
                />

                {/* Filters */}
                <ScheduleFilters
                    selectedRoom={selectedRoom}
                    selectedClass={selectedClass}
                    selectedTeacher={selectedTeacher}
                    onRoomChange={setSelectedRoom}
                    onClassChange={setSelectedClass}
                    onTeacherChange={setSelectedTeacher}
                    rooms={uniqueRooms}
                    classes={uniqueClasses}
                    teachers={uniqueTeachers}
                />

                {/* Render appropriate view */}
                {renderView()}
            </main>
        </div>
    )
}
