import { useMemo, useState } from 'react'
import s from './Schedule.module.css'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import { scheduleApi } from '@/lib/schedule'
import { listClasses } from '@/lib/classes'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import { useSession } from '@/stores/session.store'
import { type Role as UserRole } from '@/types/auth'
import type {
    ScheduleGenerateRequest,
    ScheduleGenerateResponse,
    SessionProposal,
    ConflictInfo,
} from '@/types/schedule.types'
import { listUsers } from '@/lib/users'
import ConflictMatrix from '@/components/feature/schedule/ConflictMatrix'
import { Modal } from '@/components/core/Modal'
import { listRooms } from '@/lib/rooms'
import DraggableScheduleEditor from '@/components/feature/schedule/DraggableScheduleEditor'

export default function ScheduleGeneratorPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState<1 | 2>(1)

    const [showClassConflict, setShowClassConflict] = useState(false)
    const [showTeacherConflict, setShowTeacherConflict] = useState(false)
    const [showConflictsModal, setShowConflictsModal] = useState(false)

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

    const [formData, setFormData] = useState<ScheduleGenerateRequest>({
        start_date: '',
        end_date: '',
        class_ids: [],
        max_slots_per_session: 2, // ✅ Changed default to 2
        prefer_morning: true,
        class_conflict: {},
        teacher_conflict: {},
    })

    // ✅ Store complete generate response
    const [generateResponse, setGenerateResponse] =
        useState<ScheduleGenerateResponse | null>(null)
    const [draftSessions, setDraftSessions] = useState<SessionProposal[]>([])

    const { data: teachersData } = useQuery({
        queryKey: ['teachers', 'all'],
        queryFn: () => listUsers({ limit: 100, role: 'teacher' as any }),
    })

    const { data: classesData, isLoading: isLoadingClasses } = useQuery({
        queryKey: ['classes', 'all'],
        queryFn: () => listClasses({ page: 1, limit: 100 }),
    })

    const { data: roomsData } = useQuery({
        queryKey: ['rooms', 'all'],
        queryFn: () => listRooms({ page: 1, limit: 100 }),
    })

    const [errorModal, setErrorModal] = useState<{
        show: boolean
        title: string
        message: string
    }>({ show: false, title: '', message: '' })

    const generateMutation = useMutation({
        mutationFn: scheduleApi.generateDraft,
        onSuccess: (data: ScheduleGenerateResponse) => {
            // ✅ Store complete response
            setGenerateResponse(data)
            setDraftSessions(data.sessions || [])
            setStep(2)

            // ✅ Show conflicts modal if any
            if (data.conflicts && data.conflicts.length > 0) {
                setShowConflictsModal(true)
            }
        },
        onError: (err: any) => {
            // ✅ Handle specific error types
            if (err.status === 409) {
                // Hard exception - không thể xếp đủ lịch
                setErrorModal({
                    show: true,
                    title: '⚠️ Không thể xếp đủ lịch',
                    message:
                        err.message ||
                        'Không đủ tài nguyên (phòng, giáo viên) để xếp đủ số buổi học yêu cầu trong khoảng thời gian này. Vui lòng:\n\n• Tăng khoảng thời gian (end_date)\n• Giảm số buổi học/tuần của lớp\n• Bỏ chặn một số khung giờ trong class_conflict/teacher_conflict',
                })
            } else {
                alert('Lỗi tạo lịch: ' + (err.message || 'Unknown error'))
            }
        },
    })

    const applyMutation = useMutation({
        mutationFn: scheduleApi.applySchedule,
        onSuccess: () => {
            alert('Đã lưu thời khóa biểu thành công!')
            navigate('/admin/schedule')
        },
        onError: (err: any) => {
            alert('Lỗi lưu lịch: ' + err.message)
        },
    })

    const handleClassSelection = (classId: string) => {
        setFormData((prev) => {
            const exists = prev.class_ids?.includes(classId)
            if (exists) {
                return {
                    ...prev,
                    class_ids: prev.class_ids?.filter((id) => id !== classId),
                }
            } else {
                return {
                    ...prev,
                    class_ids: [...(prev.class_ids ?? []), classId],
                }
            }
        })
    }

    const handleGenerate = () => {
        if (!formData.start_date || !formData.end_date)
            return alert('Vui lòng chọn ngày bắt đầu và kết thúc')
        if (formData.class_ids?.length === 0)
            return alert('Vui lòng chọn ít nhất một lớp học')

        if (formData.start_date > formData.end_date) {
            return alert('Ngày bắt đầu phải trước ngày kết thúc')
        }

        generateMutation.mutate(formData)
    }

    const handleApply = () => {
        if (!generateResponse) {
            return alert('Không có dữ liệu để lưu')
        }

        // ✅ Correct payload structure matching ScheduleApplyRequest
        const payload = {
            total_classes: generateResponse.total_classes,
            successful_sessions: draftSessions.length, // Use current edited count
            conflict_count: generateResponse.conflict_count,
            sessions: draftSessions, // Use edited sessions
            conflicts: generateResponse.conflicts,
            statistics: generateResponse.statistics,
        }

        console.log('✅ Apply payload:', payload)
        applyMutation.mutate(payload)
    }

    const countConflicts = (
        conflicts?: Record<string, Record<string, number[]>>
    ) => {
        if (!conflicts) return 0
        return Object.values(conflicts).reduce(
            (acc: number, dates: any) => acc + Object.keys(dates).length,
            0
        )
    }

    // ✅ Get conflict type label
    const getConflictTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            teacher_busy: 'Giáo viên bận',
            room_unavailable: 'Phòng không khả dụng',
            no_slots: 'Không có khung giờ',
            max_slot_violation: 'Vượt giới hạn số kíp',
            request_class_conflict: 'Lớp bị cấm lịch',
            request_teacher_conflict: 'Giáo viên bị cấm lịch',
        }
        return labels[type] || type
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
                <h1 className={s.pageTitle}>
                    {step === 1 ? 'Cấu hình Xếp lịch' : 'Xem trước & Chỉnh sửa'}
                </h1>

                <ButtonPrimary
                    variant="outline"
                    onClick={() => navigate('/admin/schedule')}
                >
                    ← Quay lại Quản lý Lịch
                </ButtonPrimary>

                {step === 1 && (
                    <div className={s.configCard}>
                        <Card title="1. Thông tin chung" mode="light">
                            <div className={s.configPanel}>
                                <InputField
                                    label="Ngày bắt đầu"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            start_date: e.target.value,
                                        })
                                    }
                                />
                                <InputField
                                    label="Ngày kết thúc"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                                <InputField
                                    label="Số kíp / buổi"
                                    type="number"
                                    min={1}
                                    max={4}
                                    value={formData.max_slots_per_session}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            max_slots_per_session: Number(
                                                e.target.value
                                            ),
                                        })
                                    }
                                />
                                <div style={{ paddingTop: 30 }}>
                                    <label
                                        style={{
                                            display: 'flex',
                                            gap: 8,
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.prefer_morning}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    prefer_morning:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Ưu tiên buổi sáng
                                    </label>
                                </div>
                            </div>
                        </Card>

                        <div style={{ height: 24 }} />

                        <Card title="2. Chọn Lớp & Giáo viên" mode="light">
                            {/* Class Selection & Config */}
                            <div style={{ marginBottom: 24 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 8,
                                    }}
                                >
                                    <label style={{ fontWeight: 600 }}>
                                        Danh sách lớp (
                                        {formData.class_ids?.length})
                                    </label>
                                    <ButtonPrimary
                                        size="sm"
                                        variant="outline"
                                        disabled={
                                            formData.class_ids?.length === 0
                                        }
                                        onClick={() =>
                                            setShowClassConflict(true)
                                        }
                                    >
                                        🗓️ Cấm lịch Lớp (
                                        {countConflicts(
                                            formData.class_conflict
                                        )}
                                        )
                                    </ButtonPrimary>
                                </div>
                                <div
                                    style={{
                                        border: '1px solid #eee',
                                        borderRadius: 8,
                                        padding: 12,
                                        maxHeight: 180,
                                        overflowY: 'auto',
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fill, minmax(180px, 1fr))',
                                        gap: 8,
                                    }}
                                >
                                    {isLoadingClasses ? (
                                        <div>Loading...</div>
                                    ) : (
                                        classesData?.items.map((cls: any) => (
                                            <label
                                                key={cls.id}
                                                style={{
                                                    display: 'flex',
                                                    gap: 8,
                                                    fontSize: 13,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.class_ids?.includes(
                                                        cls.id
                                                    )}
                                                    onChange={() =>
                                                        handleClassSelection(
                                                            cls.id
                                                        )
                                                    }
                                                />
                                                <span
                                                    style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                    }}
                                                >
                                                    {cls.name}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Teacher Config Button */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    background: '#f9f9f9',
                                    borderRadius: 8,
                                }}
                            >
                                <div>
                                    <span style={{ fontWeight: 600 }}>
                                        Giáo viên
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: '#666',
                                            marginLeft: 8,
                                        }}
                                    >
                                        ({teachersData?.items?.length || 0}{' '}
                                        người)
                                    </span>
                                </div>
                                <ButtonPrimary
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowTeacherConflict(true)}
                                >
                                    🗓️ Cấm lịch Giáo viên (
                                    {countConflicts(formData.teacher_conflict)})
                                </ButtonPrimary>
                            </div>

                            <div
                                className={s.actions}
                                style={{ marginTop: 32 }}
                            >
                                <ButtonPrimary
                                    onClick={handleGenerate}
                                    loading={generateMutation.isPending}
                                    disabled={isLoadingClasses}
                                >
                                    Tạo bản nháp →
                                </ButtonPrimary>
                            </div>
                        </Card>
                    </div>
                )}

                {step === 2 && generateResponse && (
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 24,
                        }}
                    >
                        {/* ✅ Show conflict warning if any */}
                        {generateResponse.conflicts.length > 0 && (
                            <Card mode="light">
                                <div
                                    style={{
                                        padding: 16,
                                        background: '#fef3c7',
                                        borderRadius: 8,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div>
                                        <strong>
                                            ⚠️ Có{' '}
                                            {generateResponse.conflicts.length}{' '}
                                            xung đột
                                        </strong>
                                        <div
                                            style={{
                                                fontSize: 14,
                                                marginTop: 4,
                                            }}
                                        >
                                            Một số buổi học không thể xếp được.
                                            Xem chi tiết để điều chỉnh.
                                        </div>
                                    </div>
                                    <ButtonPrimary
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            setShowConflictsModal(true)
                                        }
                                    >
                                        Xem chi tiết
                                    </ButtonPrimary>
                                </div>
                            </Card>
                        )}

                        <DraggableScheduleEditor
                            startDate={new Date(formData.start_date)}
                            sessions={draftSessions}
                            onSessionsChange={setDraftSessions}
                            availableTeachers={
                                teachersData?.items.map((t: any) => ({
                                    id: t.id,
                                    name:
                                        `${t.first_name || ''} ${t.last_name || ''}`.trim() ||
                                        t.email,
                                })) || []
                            }
                            availableRooms={
                                roomsData?.items.map((r: any) => ({
                                    id: r.id,
                                    name: r.name,
                                })) || []
                            }
                        />

                        {/* ✅ Updated Statistics */}
                        <Card title="Thống kê">
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: 16,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {draftSessions.length}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#666',
                                        }}
                                    >
                                        Buổi học thành công
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 600,
                                            color: '#ef4444',
                                        }}
                                    >
                                        {generateResponse.conflict_count || 0}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#666',
                                        }}
                                    >
                                        Xung đột
                                    </div>
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 600,
                                            color: '#10b981',
                                        }}
                                    >
                                        {generateResponse.statistics
                                            .success_rate || 0}
                                        %
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#666',
                                        }}
                                    >
                                        Tỷ lệ thành công
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className={s.actions}>
                                <ButtonPrimary
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    ← Cấu hình lại
                                </ButtonPrimary>
                                <ButtonPrimary
                                    onClick={handleApply}
                                    loading={applyMutation.isPending}
                                    disabled={draftSessions.length === 0}
                                >
                                    Lưu kết quả
                                </ButtonPrimary>
                            </div>
                        </Card>
                    </div>
                )}
            </main>

            {/* Class Conflict Modal */}
            <Modal
                isOpen={showClassConflict}
                onClose={() => setShowClassConflict(false)}
                title="Cấm lịch cho Lớp học"
            >
                <div
                    style={{
                        width: '800px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ConflictMatrix
                        title="Chọn khung giờ Lớp KHÔNG THỂ học"
                        startDate={formData.start_date}
                        endDate={formData.end_date}
                        items={
                            classesData?.items.filter((c: any) =>
                                formData.class_ids?.includes(c.id)
                            ) || []
                        }
                        value={formData.class_conflict || {}}
                        onChange={(val) =>
                            setFormData({
                                ...formData,
                                class_conflict: val,
                            })
                        }
                    />
                </div>
                <div
                    style={{
                        marginTop: 16,
                        textAlign: 'right',
                        paddingTop: 16,
                        borderTop: '1px solid #e5e7eb',
                    }}
                >
                    <ButtonPrimary onClick={() => setShowClassConflict(false)}>
                        Xong
                    </ButtonPrimary>
                </div>
            </Modal>

            {/* Teacher Conflict Modal */}
            <Modal
                isOpen={showTeacherConflict}
                onClose={() => setShowTeacherConflict(false)}
                title="Cấm lịch cho Giáo viên"
            >
                <div
                    style={{
                        width: '800px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <ConflictMatrix
                        title="Chọn khung giờ Giáo viên BẬN"
                        startDate={formData.start_date}
                        endDate={formData.end_date}
                        items={
                            teachersData?.items.map((t: any) => ({
                                id: t.id,
                                name:
                                    `${t.first_name || ''} ${t.last_name || ''}`.trim() ||
                                    t.email,
                            })) || []
                        }
                        value={formData.teacher_conflict || {}}
                        onChange={(val) =>
                            setFormData({
                                ...formData,
                                teacher_conflict: val,
                            })
                        }
                    />
                </div>
                <div
                    style={{
                        marginTop: 16,
                        textAlign: 'right',
                        paddingTop: 16,
                        borderTop: '1px solid #e5e7eb',
                    }}
                >
                    <ButtonPrimary
                        onClick={() => setShowTeacherConflict(false)}
                    >
                        Xong
                    </ButtonPrimary>
                </div>
            </Modal>

            {/* ✅ Conflicts Details Modal */}
            <Modal
                isOpen={showConflictsModal}
                onClose={() => setShowConflictsModal(false)}
                title={`Chi tiết xung đột (${generateResponse?.conflicts.length || 0})`}
            >
                <div
                    style={{
                        width: '700px',
                        maxHeight: '500px',
                        overflowY: 'auto',
                    }}
                >
                    {generateResponse?.conflicts.map((conflict, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: 16,
                                marginBottom: 12,
                                background: '#fef3c7',
                                borderRadius: 8,
                                borderLeft: '4px solid #f59e0b',
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 8 }}>
                                {conflict.class_name} - {conflict.session_date}
                            </div>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: '#666',
                                    marginBottom: 4,
                                }}
                            >
                                <strong>Loại:</strong>{' '}
                                {getConflictTypeLabel(conflict.conflict_type)}
                            </div>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: '#666',
                                    marginBottom: 4,
                                }}
                            >
                                <strong>Kíp:</strong>{' '}
                                {conflict.time_slots.join(', ')}
                            </div>
                            <div
                                style={{
                                    fontSize: 14,
                                    color: '#666',
                                    marginBottom: 8,
                                }}
                            >
                                <strong>Lý do:</strong> {conflict.reason}
                            </div>

                            {conflict.suggestions.length > 0 && (
                                <div
                                    style={{
                                        marginTop: 8,
                                        paddingTop: 8,
                                        borderTop: '1px solid #fcd34d',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            marginBottom: 4,
                                        }}
                                    >
                                        💡 Đề xuất:
                                    </div>
                                    {conflict.suggestions.map((sug, sidx) => (
                                        <div
                                            key={sidx}
                                            style={{
                                                fontSize: 13,
                                                marginLeft: 16,
                                            }}
                                        >
                                            •{' '}
                                            {sug.type === 'time_shift'
                                                ? 'Đổi giờ'
                                                : 'Đổi ngày'}
                                            : {sug.date} - Kíp{' '}
                                            {sug.time_slots.join(', ')}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        marginTop: 16,
                        textAlign: 'right',
                        paddingTop: 16,
                        borderTop: '1px solid #e5e7eb',
                    }}
                >
                    <ButtonPrimary onClick={() => setShowConflictsModal(false)}>
                        Đóng
                    </ButtonPrimary>
                </div>
            </Modal>

            {/* ✅ NEW: Error Modal (Hard Exception) */}
            <Modal
                isOpen={errorModal.show}
                onClose={() =>
                    setErrorModal({ show: false, title: '', message: '' })
                }
                title={errorModal.title}
            >
                <div style={{ width: '600px', padding: '20px 0' }}>
                    <div
                        style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line',
                            color: '#374151',
                        }}
                    >
                        {errorModal.message}
                    </div>

                    <div
                        style={{
                            marginTop: 20,
                            padding: 16,
                            background: '#f3f4f6',
                            borderRadius: 8,
                            fontSize: 13,
                            color: '#6b7280',
                        }}
                    >
                        <strong>💡 Giải pháp:</strong>
                        <ul style={{ marginTop: 8, marginLeft: 20 }}>
                            <li>Tăng khoảng thời gian (end_date)</li>
                            <li>
                                Giảm số buổi học/tuần (sessions_per_week) trong
                                cấu hình lớp
                            </li>
                            <li>
                                Bỏ chặn một số khung giờ trong Cấm lịch Lớp/Giáo
                                viên
                            </li>
                            <li>Thêm phòng học hoặc giáo viên mới</li>
                        </ul>
                    </div>
                </div>
                <div
                    style={{
                        marginTop: 16,
                        textAlign: 'right',
                        paddingTop: 16,
                        borderTop: '1px solid #e5e7eb',
                    }}
                >
                    <ButtonPrimary
                        onClick={() =>
                            setErrorModal({
                                show: false,
                                title: '',
                                message: '',
                            })
                        }
                    >
                        Đã hiểu
                    </ButtonPrimary>
                </div>
            </Modal>
        </div>
    )
}
