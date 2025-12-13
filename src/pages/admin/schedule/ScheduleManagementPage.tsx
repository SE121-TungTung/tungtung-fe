import { useMemo, useState } from 'react'
import s from './Schedule.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import WeeklyCalendar from '@/components/feature/schedule/WeeklyCalendar'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import { scheduleApi } from '@/lib/schedule'
import { useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import { useSession } from '@/stores/session.store'
import { type Role as UserRole } from '@/types/auth'

export default function ScheduleManagementPage() {
    const navigate = useNavigate()
    const [currentDate, setCurrentDate] = useState(new Date())

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

    // Logic ngày tháng
    const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endWeek = new Date(startWeek.getTime() + 6 * 24 * 60 * 60 * 1000)

    // Gọi API
    const { data: sessions = [], isLoading } = useQuery({
        // Mặc định sessions = [] để tránh lỗi undefined
        queryKey: ['schedule', format(startWeek, 'yyyy-MM-dd')],
        queryFn: () =>
            scheduleApi.getWeekly({
                start_date: format(startWeek, 'yyyy-MM-dd'),
                end_date: format(endWeek, 'yyyy-MM-dd'),
            }),
    })

    // Xử lý chuyển tuần
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))

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

                {/* Thanh công cụ điều khiển */}
                <div className={s.controls}>
                    <ButtonPrimary
                        size="sm"
                        variant="ghost"
                        onClick={handlePrevWeek}
                    >
                        ← Tuần trước
                    </ButtonPrimary>
                    <div className={s.dateDisplay}>
                        {format(startWeek, 'dd/MM')} -{' '}
                        {format(endWeek, 'dd/MM/yyyy')}
                    </div>
                    <ButtonPrimary
                        size="sm"
                        variant="ghost"
                        onClick={handleNextWeek}
                    >
                        Tuần sau →
                    </ButtonPrimary>
                    <div style={{ flex: 1 }}></div> {/* Spacer */}
                    <ButtonPrimary
                        onClick={() => navigate('/admin/schedule/generate')}
                    >
                        + Xếp lịch tự động
                    </ButtonPrimary>
                </div>

                {isLoading ? (
                    <div>Đang tải dữ liệu...</div>
                ) : (
                    // Truyền mảng sessions đã được đảm bảo là Array
                    <WeeklyCalendar
                        startDate={startWeek}
                        sessions={Array.isArray(sessions) ? sessions : []}
                    />
                )}
            </main>
        </div>
    )
}
