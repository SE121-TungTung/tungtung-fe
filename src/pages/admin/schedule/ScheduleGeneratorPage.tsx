import { useMemo, useState } from 'react'
import s from './Schedule.module.css'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import WeeklyCalendar from '@/components/feature/schedule/WeeklyCalendar'
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
    SessionBase,
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
        max_slots_per_session: 1,
        prefer_morning: true,
        class_conflict: {},
        teacher_conflict: {},
    })

    const [draftSessions, setDraftSessions] = useState<SessionBase[]>([])
    const [stats, setStats] = useState<any>(null)

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

    const generateMutation = useMutation({
        mutationFn: scheduleApi.generateDraft,
        onSuccess: (data) => {
            setDraftSessions(data.sessions || [])
            setStats(data.statistics)
            setStep(2)
        },
        onError: (err: any) => {
            alert('Lỗi tạo lịch: ' + (err.message || 'Unknown error'))
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
            const exists = prev.class_ids.includes(classId)
            if (exists) {
                return {
                    ...prev,
                    class_ids: prev.class_ids.filter((id) => id !== classId),
                }
            } else {
                return { ...prev, class_ids: [...prev.class_ids, classId] }
            }
        })
    }

    const handleGenerate = () => {
        if (!formData.start_date || !formData.end_date)
            return alert('Vui lòng chọn ngày bắt đầu và kết thúc')
        if (formData.class_ids.length === 0)
            return alert('Vui lòng chọn ít nhất một lớp học')

        generateMutation.mutate(formData)
    }

    const handleApply = () => {
        const payload = {
            start_date: formData.start_date,
            end_date: formData.end_date,
            class_ids: formData.class_ids,
            max_slots_per_session: formData.max_slots_per_session,
            prefer_morning: formData.prefer_morning,
            class_conflict: formData.class_conflict,
            teacher_conflict: formData.teacher_conflict,
            sessions: draftSessions,
            total_classes: formData.class_ids.length,
            successful_sessions: draftSessions.length,
            conflict_count: 0,
            conflicts: [],
            statistics: stats || { success_rate: 100 },
        }

        console.log('Payload gửi lên:', payload) // DEBUG
        applyMutation.mutate(payload)
    }

    const countConflicts = (conflicts: any) => {
        if (!conflicts) return 0
        return Object.values(conflicts).reduce(
            (acc: number, dates: any) => acc + Object.keys(dates).length,
            0
        )
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
                                        {formData.class_ids.length})
                                    </label>
                                    <ButtonPrimary
                                        size="sm"
                                        variant="outline"
                                        disabled={
                                            formData.class_ids.length === 0
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
                                                    checked={formData.class_ids.includes(
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

                {step === 2 && (
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 24,
                        }}
                    >
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

                        {stats && (
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
                                            {stats.successful_sessions ||
                                                draftSessions.length}
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
                                            {stats.conflict_count || 0}
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
                                            {stats.success_rate || 100}%
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
                        )}

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
                                >
                                    Lưu kết quả
                                </ButtonPrimary>
                            </div>
                        </Card>
                    </div>
                )}
            </main>

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
                                formData.class_ids.includes(c.id)
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
        </div>
    )
}
