import { useMemo, useState } from 'react'
import s from './Schedule.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { scheduleApi } from '@/lib/schedule'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDialog } from '@/hooks/useDialog'
import {
    getSubstitutionRequests,
    approveSubstitution,
    rejectSubstitution,
} from '@/lib/substitutions'
import { useNavigate } from 'react-router-dom'
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import type { WeeklySession } from '@/types/schedule.types'

// New components
import ViewModeSelector, {
    type ViewMode,
} from '@/components/feature/schedule/ViewModeSelector'
import ScheduleFilters from '@/components/feature/schedule/ScheduleFilters'
import TimeGridView from '@/components/feature/schedule/views/TimeGridView'
import RoomGridView from '@/components/feature/schedule/views/RoomGridView'
import ScheduleListView from '@/components/feature/schedule/views/ScheduleListView'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import CreateSessionModal from '@/components/feature/schedule/CreateSessionModal'
import { listClasses } from '@/lib/classes'
import { listUsers } from '@/lib/users'
import { listRooms, type Room } from '@/lib/rooms'

export default function ScheduleManagementPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { alert } = useDialog()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('time-grid')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Substitution states
    const [selectedSubs, setSelectedSubs] = useState<Record<string, string>>({})
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

    // Filter states
    const [selectedRoom, setSelectedRoom] = useState<string | undefined>()
    const [selectedClass, setSelectedClass] = useState<string | undefined>()
    const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>()

    // Fetch substitution requests
    const { data: subRequests } = useQuery({
        queryKey: ['substitutions', 'list'],
        queryFn: getSubstitutionRequests,
    })

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: ({
            requestId,
            targetSubId,
            note,
        }: {
            requestId: string
            targetSubId?: string | null
            note?: string
        }) => approveSubstitution(requestId, targetSubId, note),
        onSuccess: () => {
            alert('Đã xử lý phê duyệt dạy thế thành công!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['schedule'] })
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
        },
        onError: (err: any) => {
            alert(err?.message || 'Có lỗi xảy ra khi phê duyệt.')
        },
    })

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({
            requestId,
            note,
        }: {
            requestId: string
            note?: string
        }) => rejectSubstitution(requestId, note),
        onSuccess: () => {
            alert('Đã từ chối yêu cầu dạy thế!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['schedule'] })
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
        },
        onError: (err: any) => {
            alert(err?.message || 'Có lỗi xảy ra khi từ chối.')
        },
    })

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

    const { data: classesData } = useQuery({
        queryKey: ['classes', 'active', 'list'],
        queryFn: () => listClasses({ status: 'active', limit: 100 }),
        staleTime: 5 * 60 * 1000,
    })

    const { data: teachersData } = useQuery({
        queryKey: ['users', 'teachers', 'list'],
        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),
        staleTime: 5 * 60 * 1000,
    })

    const { data: roomsData } = useQuery({
        queryKey: ['rooms', 'all', 'list'],
        queryFn: () => listRooms({ limit: 100 }),
        staleTime: 60 * 60 * 1000,
    })

    const classOptions = useMemo(() => {
        const list = classesData?.items || []
        return list.map((c) => ({ label: c.name, value: c.id }))
    }, [classesData])

    const teacherOptions = useMemo(() => {
        const list = teachersData?.users || []
        return list.map((t) => ({
            label: t.fullName,
            value: t.id,
        }))
    }, [teachersData])

    const roomOptions = useMemo(() => {
        const list = roomsData?.items || []
        return list.map((r: Room) => ({ label: r.name, value: r.id }))
    }, [roomsData])

    const pendingRequests = useMemo(() => {
        if (!subRequests) return []
        return subRequests.filter(
            (req) => req.status === 'PENDING' || req.status === 'ACCEPTED'
        )
    }, [subRequests])

    const sessions = useMemo(() => {
        return weeklyData?.schedule || []
    }, [weeklyData])

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
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý Thời khóa biểu</h1>

                {/* Substitution requests section */}
                {pendingRequests.length > 0 && (
                    <div
                        style={{
                            width: '100%',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '24px',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: '0 0 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <span>🔄</span> Yêu cầu dạy thế cần xử lý (
                            {pendingRequests.length})
                        </h2>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            {pendingRequests.map((req) => {
                                const isFlowB = req.status === 'PENDING'
                                const isFlowA = req.status === 'ACCEPTED'
                                const reqDate = req.class_session?.session_date
                                    ? new Date(
                                          req.class_session.session_date
                                      ).toLocaleDateString('vi-VN')
                                    : ''

                                return (
                                    <div
                                        key={req.id}
                                        style={{
                                            background: '#fff',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '20px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                flex: '1 1 300px',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        padding: '2px 8px',
                                                        borderRadius: '12px',
                                                        backgroundColor: isFlowA
                                                            ? '#dcfce7'
                                                            : '#fef9c3',
                                                        color: isFlowA
                                                            ? '#15803d'
                                                            : '#854d0e',
                                                    }}
                                                >
                                                    {isFlowA
                                                        ? 'Đã có GV nhận (Chờ duyệt)'
                                                        : 'Chưa có GV thế (Cần chỉ định)'}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                    }}
                                                >
                                                    Người gửi:{' '}
                                                    <strong>
                                                        {
                                                            req.requesting_teacher_name
                                                        }
                                                    </strong>
                                                </span>
                                            </div>

                                            <h4
                                                style={{
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#1e293b',
                                                    margin: '0 0 6px 0',
                                                }}
                                            >
                                                Lớp:{' '}
                                                {req.class_session?.class_name}
                                            </h4>

                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
                                                    marginBottom: '8px',
                                                }}
                                            >
                                                <span>📅 Ngày: {reqDate}</span>
                                                <span>
                                                    ⏰ Giờ:{' '}
                                                    {req.class_session?.start_time?.slice(
                                                        0,
                                                        5
                                                    )}{' '}
                                                    -{' '}
                                                    {req.class_session?.end_time?.slice(
                                                        0,
                                                        5
                                                    )}
                                                </span>
                                            </div>

                                            {req.reason && (
                                                <p
                                                    style={{
                                                        margin: '4px 0',
                                                        fontSize: '13px',
                                                        color: '#475569',
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    <strong>Lý do vắng:</strong>{' '}
                                                    {req.reason}
                                                </p>
                                            )}

                                            {isFlowA && (
                                                <p
                                                    style={{
                                                        margin: '4px 0',
                                                        fontSize: '13px',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    <strong>
                                                        Giáo viên nhận thế đề
                                                        xuất:
                                                    </strong>{' '}
                                                    {req.target_substitute_name ||
                                                        'Đang chờ'}
                                                </p>
                                            )}
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px',
                                                minWidth: '240px',
                                            }}
                                        >
                                            {/* Note input */}
                                            <input
                                                type="text"
                                                placeholder="Ghi chú của admin..."
                                                value={adminNotes[req.id] || ''}
                                                onChange={(e) =>
                                                    setAdminNotes({
                                                        ...adminNotes,
                                                        [req.id]:
                                                            e.target.value,
                                                    })
                                                }
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #cbd5e1',
                                                    fontSize: '13px',
                                                    width: '100%',
                                                }}
                                            />

                                            {/* For Flow B, let admin select a teacher */}
                                            {isFlowB && (
                                                <select
                                                    value={
                                                        selectedSubs[req.id] ||
                                                        ''
                                                    }
                                                    onChange={(e) =>
                                                        setSelectedSubs({
                                                            ...selectedSubs,
                                                            [req.id]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    style={{
                                                        padding: '8px 12px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '13px',
                                                        width: '100%',
                                                        background: '#fff',
                                                    }}
                                                >
                                                    <option value="">
                                                        -- Chọn giáo viên dạy
                                                        thế --
                                                    </option>
                                                    {teachersData?.users?.map(
                                                        (t: any) => (
                                                            <option
                                                                key={t.id}
                                                                value={t.id}
                                                            >
                                                                {t.fullName}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            )}

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                <button
                                                    disabled={
                                                        approveMutation.isPending ||
                                                        rejectMutation.isPending
                                                    }
                                                    onClick={() =>
                                                        rejectMutation.mutate({
                                                            requestId: req.id,
                                                            note: adminNotes[
                                                                req.id
                                                            ],
                                                        })
                                                    }
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ef4444',
                                                        backgroundColor: '#fff',
                                                        color: '#ef4444',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Từ chối
                                                </button>
                                                <button
                                                    disabled={
                                                        approveMutation.isPending ||
                                                        rejectMutation.isPending
                                                    }
                                                    onClick={() => {
                                                        const targetSubId =
                                                            isFlowB
                                                                ? selectedSubs[
                                                                      req.id
                                                                  ]
                                                                : req.target_substitute_id
                                                        if (
                                                            isFlowB &&
                                                            !targetSubId
                                                        ) {
                                                            alert(
                                                                'Vui lòng chọn giáo viên dạy thế trước.'
                                                            )
                                                            return
                                                        }
                                                        approveMutation.mutate({
                                                            requestId: req.id,
                                                            targetSubId,
                                                            note: adminNotes[
                                                                req.id
                                                            ],
                                                        })
                                                    }}
                                                    style={{
                                                        padding: '8px 14px',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        backgroundColor:
                                                            '#16a34a',
                                                        color: '#fff',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {isFlowB
                                                        ? 'Chỉ định & Phê duyệt'
                                                        : 'Phê duyệt'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

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
                    <ButtonGhost onClick={() => setIsCreateModalOpen(true)}>
                        + Thêm buổi học
                    </ButtonGhost>
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

                <CreateSessionModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    classes={classOptions}
                    teachers={teacherOptions}
                    rooms={roomOptions}
                />
            </main>
        </div>
    )
}
