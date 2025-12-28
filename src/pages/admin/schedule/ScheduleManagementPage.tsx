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
import type { WeeklySession } from '@/types/schedule.types'

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

    // ✅ Updated: Properly handle response structure
    const {
        data: weeklyData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['schedule', format(startWeek, 'yyyy-MM-dd')],
        queryFn: async () => {
            const response = await scheduleApi.getWeekly({
                start_date: format(startWeek, 'yyyy-MM-dd'),
                end_date: format(endWeek, 'yyyy-MM-dd'),
            })
            return response
        },
    })

    // ✅ Extract sessions array with proper type
    const sessions: WeeklySession[] = weeklyData?.schedule || []

    // Xử lý chuyển tuần
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const handleToday = () => setCurrentDate(new Date())

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
                    {/* ✅ Show session count */}
                    {sessions.length > 0 && (
                        <div
                            style={{
                                fontSize: 14,
                                color: '#666',
                                marginRight: 16,
                            }}
                        >
                            {sessions.length} buổi học
                        </div>
                    )}
                    <ButtonPrimary
                        onClick={() => navigate('/admin/schedule/generate')}
                    >
                        + Xếp lịch tự động
                    </ButtonPrimary>
                </div>

                {/* ✅ Better loading and error states */}
                {isLoading && (
                    <div
                        style={{
                            padding: 40,
                            textAlign: 'center',
                            color: '#666',
                        }}
                    >
                        Đang tải dữ liệu...
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            padding: 40,
                            textAlign: 'center',
                            color: '#ef4444',
                            background: '#fee',
                            borderRadius: 8,
                        }}
                    >
                        ❌ Lỗi tải dữ liệu: {(error as Error).message}
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {sessions.length === 0 ? (
                            <div
                                style={{
                                    padding: 60,
                                    textAlign: 'center',
                                    background: '#f9fafb',
                                    borderRadius: 12,
                                    border: '2px dashed #e5e7eb',
                                }}
                            >
                                <div style={{ fontSize: 48, marginBottom: 16 }}>
                                    📅
                                </div>
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
                                    Bắt đầu bằng cách tạo lịch tự động hoặc thêm
                                    thủ công
                                </div>
                                <ButtonPrimary
                                    onClick={() =>
                                        navigate('/admin/schedule/generate')
                                    }
                                >
                                    + Tạo lịch ngay
                                </ButtonPrimary>
                            </div>
                        ) : (
                            <WeeklyCalendar
                                startDate={startWeek}
                                sessions={sessions}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
