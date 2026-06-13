import { useMemo, useState } from 'react'
import s from '@/pages/admin/schedule/Schedule.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { scheduleApi } from '@/lib/schedule'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import type { WeeklySession } from '@/types/schedule.types'
import { useSession } from '@/stores/session.store'
import {
    getSubstitutionRequests,
    acceptSubstitution,
    declineSubstitution,
    createSubstitutionRequest,
} from '@/lib/substitutions'
import { listUsers } from '@/lib/users'
import { useDialog } from '@/hooks/useDialog'

// Reuse views
import ViewModeSelector, {
    type ViewMode,
} from '@/components/feature/schedule/ViewModeSelector'
import TimeGridView from '@/components/feature/schedule/views/TimeGridView'
import ScheduleListView from '@/components/feature/schedule/views/ScheduleListView'

export default function TeacherSchedulePage() {
    const { alert } = useDialog()
    const queryClient = useQueryClient()
    const user = useSession((s) => s.user)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState<ViewMode>('time-grid')
    const [selectedSessionForSub, setSelectedSessionForSub] =
        useState<WeeklySession | null>(null)

    // Fetch teachers list for substitution proposal
    const { data: teachersData } = useQuery({
        queryKey: ['users', 'teachers', 'list'],
        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),
        staleTime: 5 * 60 * 1000,
    })

    // Date logic
    const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endWeek = new Date(startWeek.getTime() + 6 * 24 * 60 * 60 * 1000)

    // 1. Fetch weekly schedule data for current teacher
    const {
        data: weeklyData,
        isLoading: isScheduleLoading,
        error: scheduleError,
    } = useQuery({
        queryKey: [
            'teacher-schedule',
            user?.id,
            format(startWeek, 'yyyy-MM-dd'),
        ],
        queryFn: async () => {
            if (!user?.id) return { schedule: [] }
            return scheduleApi.getWeekly({
                start_date: format(startWeek, 'yyyy-MM-dd'),
                end_date: format(endWeek, 'yyyy-MM-dd'),
                user_id: user.id,
            })
        },
        enabled: !!user?.id,
    })

    // 2. Fetch substitution requests
    const { data: subRequests } = useQuery({
        queryKey: ['substitutions', 'list'],
        queryFn: getSubstitutionRequests,
        enabled: !!user?.id,
    })

    // Filter incoming requests where this teacher is the target substitute and it is pending their acceptance (ACCEPTED)
    const incomingRequests = useMemo(() => {
        if (!subRequests || !user?.id) return []
        return subRequests.filter(
            (req) =>
                req.target_substitute_id === user.id &&
                req.status === 'ACCEPTED'
        )
    }, [subRequests, user?.id])

    // Accept Substitution Mutation
    const acceptMutation = useMutation({
        mutationFn: (requestId: string) => acceptSubstitution(requestId),
        onSuccess: () => {
            alert('Đã xác nhận đồng ý dạy thế thành công!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['teacher-schedule'] })
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
        },
        onError: (err: any) => {
            alert(err?.message || 'Có lỗi xảy ra khi xác nhận nhận lớp.')
        },
    })

    // Decline Substitution Mutation
    const declineMutation = useMutation({
        mutationFn: (requestId: string) => declineSubstitution(requestId),
        onSuccess: () => {
            alert('Đã từ chối dạy thế thành công!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['teacher-schedule'] })
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
        },
        onError: (err: any) => {
            alert(err?.message || 'Có lỗi xảy ra khi từ chối nhận lớp.')
        },
    })

    const sessions = useMemo(() => {
        return weeklyData?.schedule || []
    }, [weeklyData])

    // Navigation handlers
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const handleToday = () => setCurrentDate(new Date())

    const handleSessionClick = (session: WeeklySession) => {
        setSelectedSessionForSub(session)
    }

    const renderScheduleView = () => {
        if (isScheduleLoading) {
            return (
                <div
                    style={{
                        padding: 40,
                        textAlign: 'center',
                        color: '#64748b',
                    }}
                >
                    Đang tải thời khóa biểu...
                </div>
            )
        }

        if (scheduleError) {
            return (
                <div
                    style={{
                        padding: 20,
                        textAlign: 'center',
                        color: '#ef4444',
                        background: '#fee2e2',
                        borderRadius: '12px',
                    }}
                >
                    ⚠ Lỗi tải lịch dạy: {(scheduleError as Error).message}
                </div>
            )
        }

        if (sessions.length === 0) {
            return (
                <div
                    style={{
                        padding: '60px 24px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        borderRadius: '16px',
                        border: '2px dashed #cbd5e1',
                    }}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        📅
                    </div>
                    <div
                        style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1e293b',
                            marginBottom: '8px',
                        }}
                    >
                        Không có lịch dạy trong tuần này
                    </div>
                    <p
                        style={{
                            color: '#64748b',
                            fontSize: '14px',
                            margin: 0,
                        }}
                    >
                        Hãy chọn tuần khác hoặc liên hệ admin nếu có thắc mắc.
                    </p>
                </div>
            )
        }

        if (viewMode === 'list') {
            return (
                <ScheduleListView
                    sessions={sessions}
                    onSessionClick={handleSessionClick}
                />
            )
        }

        return (
            <TimeGridView
                startDate={startWeek}
                sessions={sessions}
                onSessionClick={handleSessionClick}
            />
        )
    }

    return (
        <div
            className={s.pageWrapperWithoutHeader}
            style={{ padding: '24px 16px' }}
        >
            <div className={s.mainContent} style={{ gap: '24px' }}>
                {/* Header Section */}
                <div
                    style={{
                        textAlign: 'center',
                        width: '100%',
                        marginBottom: '8px',
                    }}
                >
                    <h1
                        className={s.pageTitle}
                        style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: '#1e293b',
                            margin: '0 0 4px 0',
                        }}
                    >
                        Lịch dạy của tôi
                    </h1>
                    <p
                        style={{
                            color: '#64748b',
                            fontSize: '14px',
                            margin: 0,
                        }}
                    >
                        Xem thời khóa biểu giảng dạy cá nhân và xác nhận dạy thế
                    </p>
                </div>

                {/* Incoming Substitution Requests (UC06.3) */}
                {incomingRequests.length > 0 && (
                    <div
                        style={{
                            width: '100%',
                            background:
                                'linear-gradient(135deg, #e0e7ff 0%, #e8efff 100%)',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid #c7d2fe',
                            boxShadow:
                                '0 10px 15px -3px rgba(99, 102, 241, 0.05)',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#312e81',
                                margin: '0 0 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <span>🔔</span> Yêu cầu nhận dạy thế đang chờ xác
                            nhận ({incomingRequests.length})
                        </h2>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            {incomingRequests.map((req) => {
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
                                            borderRadius: '16px',
                                            padding: '20px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '16px',
                                        }}
                                    >
                                        <div style={{ textAlign: 'left' }}>
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
                                                        backgroundColor:
                                                            '#fee2e2',
                                                        color: '#991b1b',
                                                    }}
                                                >
                                                    Yêu cầu từ{' '}
                                                    {req.requesting_teacher_name ||
                                                        'Đồng nghiệp'}
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
                                                {req.class_session
                                                    ?.class_name ||
                                                    'Đang cập nhật'}
                                            </h4>
                                            <div
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#64748b',
                                                    display: 'flex',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <span>📅 {reqDate}</span>
                                                <span>
                                                    ⏰{' '}
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
                                                <div
                                                    style={{
                                                        marginTop: '8px',
                                                        fontSize: '13px',
                                                        color: '#475569',
                                                        fontStyle: 'italic',
                                                        background: '#f8fafc',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <strong>Lý do:</strong>{' '}
                                                    {req.reason}
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                            }}
                                        >
                                            <button
                                                disabled={
                                                    declineMutation.isPending ||
                                                    acceptMutation.isPending
                                                }
                                                onClick={() =>
                                                    declineMutation.mutate(
                                                        req.id
                                                    )
                                                }
                                                style={{
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #cbd5e1',
                                                    backgroundColor: '#fff',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Từ chối
                                            </button>
                                            <button
                                                disabled={
                                                    declineMutation.isPending ||
                                                    acceptMutation.isPending
                                                }
                                                onClick={() =>
                                                    acceptMutation.mutate(
                                                        req.id
                                                    )
                                                }
                                                style={{
                                                    padding: '10px 16px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#4f46e5',
                                                    color: '#fff',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Xác nhận dạy thế
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Control bar */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        backgroundColor: '#fff',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        flexWrap: 'wrap',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                        }}
                    >
                        <ButtonPrimary
                            size="sm"
                            variant="outline"
                            onClick={handlePrevWeek}
                            disabled={isScheduleLoading}
                        >
                            ←
                        </ButtonPrimary>
                        <div
                            className={s.dateDisplay}
                            style={{ minWidth: '180px', fontWeight: '700' }}
                        >
                            {format(startWeek, 'dd/MM')} -{' '}
                            {format(endWeek, 'dd/MM/yyyy')}
                        </div>
                        <ButtonPrimary
                            size="sm"
                            variant="outline"
                            onClick={handleNextWeek}
                            disabled={isScheduleLoading}
                        >
                            →
                        </ButtonPrimary>
                        <ButtonPrimary
                            size="sm"
                            variant="subtle"
                            onClick={handleToday}
                            disabled={isScheduleLoading}
                        >
                            Hôm nay
                        </ButtonPrimary>
                    </div>

                    <ViewModeSelector
                        currentMode={viewMode}
                        onModeChange={(m) => setViewMode(m)}
                    />
                </div>

                {/* Main Schedule Visual Panel */}
                <div
                    style={{
                        width: '100%',
                        background: '#fff',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    {renderScheduleView()}
                </div>
            </div>

            {/* Substitution Request Modal Overlay */}
            {selectedSessionForSub && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow:
                                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                        }}
                    >
                        <SubstitutionRequestModal
                            session={selectedSessionForSub}
                            teachers={teachersData?.users || []}
                            onClose={() => setSelectedSessionForSub(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function SubstitutionRequestModal({
    session,
    teachers,
    onClose,
}: {
    session: any
    teachers: any[]
    onClose: () => void
}) {
    const [subId, setSubId] = useState<string>('')
    const [reason, setReason] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim()) {
            alert('Vui lòng nhập lý do vắng mặt/dạy thế', 'Yêu cầu nhập lý do')
            return
        }

        setIsSubmitting(true)
        try {
            await createSubstitutionRequest({
                class_session_id: session.session_id || session.id,
                target_substitute_id: subId || null,
                reason: reason,
            })
            alert(
                'Gửi yêu cầu dạy thế thành công! Đang chờ phê duyệt/xác nhận.',
                'Thành công'
            )
            queryClient.invalidateQueries({ queryKey: ['teacher-schedule'] })
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
            onClose()
        } catch (err: any) {
            alert(err.message || 'Không thể tạo yêu cầu dạy thế')
        } finally {
            setIsSubmitting(false)
        }
    }

    const sessionDate = session.session_date
        ? new Date(session.session_date)
        : new Date()

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                textAlign: 'left',
            }}
        >
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0,
                }}
            >
                Yêu cầu dạy thế
            </h2>

            <div
                style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#475569',
                }}
            >
                <div style={{ marginBottom: '8px' }}>
                    <strong>Buổi học:</strong>{' '}
                    {session.topic || session.class_name || 'Tổng quan'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                    <strong>Ngày học:</strong>{' '}
                    {sessionDate.toLocaleDateString('vi-VN')}
                </div>
                <div>
                    <strong>Thời gian:</strong>{' '}
                    {session.start_time?.slice(0, 5)} -{' '}
                    {session.end_time?.slice(0, 5)}
                </div>
            </div>

            <div>
                <label
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#334155',
                        marginBottom: '8px',
                    }}
                >
                    Đề xuất giáo viên dạy thế (Tùy chọn)
                </label>
                <select
                    value={subId}
                    onChange={(e) => setSubId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        color: '#1e293b',
                        outline: 'none',
                    }}
                >
                    <option value="">-- Để trống (Admin tự chỉ định) --</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.fullName} ({t.email})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#334155',
                        marginBottom: '8px',
                    }}
                >
                    Lý do vắng mặt / dạy thế{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '8px',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        color: '#475569',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
            </div>
        </form>
    )
}
