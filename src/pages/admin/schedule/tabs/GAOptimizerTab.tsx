import { useState, useMemo, useEffect } from 'react'
import { startOfWeek, format, addWeeks, subWeeks } from 'date-fns'
import ViewModeSelector, {
    type ViewMode,
} from '@/components/feature/schedule/ViewModeSelector'
import TimeGridView from '@/components/feature/schedule/views/TimeGridView'
import RoomGridView from '@/components/feature/schedule/views/RoomGridView'
import ScheduleListView from '@/components/feature/schedule/views/ScheduleListView'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDialog } from '@/hooks/useDialog'
import { listClasses } from '@/lib/classes'
import {
    useRunGA,
    useGARunDetail,
    useGARunHistory,
    useApplyGAProposal,
    useDeleteGARun,
    useAnalyzeConstraints,
} from '@/hooks/domain/useGASchedule'
import type {
    GAScheduleRequest,
    GARunResponse,
    AIAnalyzeResponse,
} from '@/types/ga-schedule.types'
import s from '../Schedule.module.css'
import SliderField from '../components/SliderField'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import RunStatusCard from '../components/RunStatusCard'

type GAStep = 'config' | 'running' | 'result'

function formatDateShort(iso: string): string {
    try {
        const d = new Date(iso)
        return `${d.getDate()}/${d.getMonth() + 1}`
    } catch {
        return iso
    }
}

export default function GAOptimizerTab() {
    const navigate = useNavigate()
    const { alert } = useDialog()

    const [step, setStep] = useState<GAStep>('config')
    const [activeRunId, setActiveRunId] = useState<string | undefined>()

    const runGA = useRunGA()
    const runDetail = useGARunDetail(activeRunId)
    const applyProposal = useApplyGAProposal()
    const deleteRun = useDeleteGARun()
    const { data: historyData } = useGARunHistory(1, 10)

    const [currentDate, setCurrentDate] = useState<Date | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('time-grid')

    useEffect(() => {
        if (runDetail.data?.start_date) {
            setCurrentDate(new Date(runDetail.data.start_date))
        }
    }, [runDetail.data?.start_date])

    const [form, setForm] = useState<GAScheduleRequest>({
        start_date: '',
        end_date: '',
        class_ids: [],
        population_size: 100,
        generations: 300,
        crossover_rate: 0.7,
        mutation_rate: 0.15,
        penalty_consecutive_limit: 5,
        penalty_paired_classes: 10,
        penalty_time_preference: 1,
        penalty_room_utilization: 2,
        penalty_preserve_existing: 3,
        paired_class_ids: null,
        class_preferences: null,
        class_unavailabilities: null,
    })

    const { data: classesData, isLoading: loadingClasses } = useQuery({
        queryKey: ['classes', 'active', 'ga'],
        queryFn: () => listClasses({ status: 'active', limit: 200 }),
        staleTime: 5 * 60_000,
    })

    const [selectedClass, setSelectedClass] = useState<string>('')
    const [selectedTeacher, setSelectedTeacher] = useState<string>('')
    const [selectedRoom, setSelectedRoom] = useState<string>('')

    const weeklySessions = useMemo(() => {
        if (!runDetail.data?.sessions) return []
        return runDetail.data.sessions.map((ses) => ({
            session_id: ses.id,
            class_name: ses.class_name,
            teacher_name: ses.teacher_name,
            room_name: ses.room_name || 'Chưa xếp phòng',
            session_date: ses.session_date,
            day_of_week: '',
            start_time: ses.start_time,
            end_time: ses.end_time,
            topic: ses.lesson_topic,
            is_conflict: ses.is_conflict,
        }))
    }, [runDetail.data?.sessions])

    const currentWeekStart = useMemo(() => {
        if (!currentDate) return new Date()
        return startOfWeek(currentDate, { weekStartsOn: 1 })
    }, [currentDate])

    const currentWeekEnd = useMemo(() => {
        return new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    }, [currentWeekStart])

    const uniqueClasses = useMemo(
        () =>
            Array.from(new Set(weeklySessions.map((s) => s.class_name))).sort(),
        [weeklySessions]
    )
    const uniqueTeachers = useMemo(
        () =>
            Array.from(
                new Set(weeklySessions.map((s) => s.teacher_name))
            ).sort(),
        [weeklySessions]
    )
    const uniqueRooms = useMemo(
        () =>
            Array.from(new Set(weeklySessions.map((s) => s.room_name))).sort(),
        [weeklySessions]
    )

    const filteredSessions = useMemo(() => {
        let res = weeklySessions
        if (selectedClass)
            res = res.filter((s) => s.class_name === selectedClass)
        if (selectedTeacher)
            res = res.filter((s) => s.teacher_name === selectedTeacher)
        if (selectedRoom) res = res.filter((s) => s.room_name === selectedRoom)
        return res
    }, [weeklySessions, selectedClass, selectedTeacher, selectedRoom])

    const currentWeekSessions = useMemo(() => {
        if (!currentWeekStart) return filteredSessions
        const startStr = format(currentWeekStart, 'yyyy-MM-dd')
        const endStr = format(currentWeekEnd, 'yyyy-MM-dd')
        return filteredSessions.filter(
            (s) => s.session_date >= startStr && s.session_date <= endStr
        )
    }, [filteredSessions, currentWeekStart, currentWeekEnd])

    const handlePrevWeek = () => {
        if (currentDate)
            setCurrentDate((prev) => (prev ? subWeeks(prev, 1) : null))
    }
    const handleNextWeek = () => {
        if (currentDate)
            setCurrentDate((prev) => (prev ? addWeeks(prev, 1) : null))
    }

    const runStatus = runDetail.data?.status

    const handleRunGA = () => {
        if (!form.start_date || !form.end_date) return alert('Chọn khoảng ngày')
        if (form.start_date > form.end_date)
            return alert('Ngày bắt đầu phải trước ngày kết thúc')
        if (!form.class_ids?.length) return alert('Chọn ít nhất 1 lớp')
        runGA.mutate(form, {
            onSuccess: (res) => {
                setActiveRunId(res.run_id)
                setStep('running')
            },
            onError: (err: any) => alert('Lỗi chạy GA: ' + err.message),
        })
    }

    const handleApply = () => {
        if (!activeRunId) return
        applyProposal.mutate(activeRunId, {
            onSuccess: (res) => {
                alert(res.message || 'Đã áp dụng TKB thành công!')
            },
            onError: (err: any) => alert('Lỗi apply: ' + err.message),
        })
    }

    const handleDeleteAndRetry = () => {
        if (!activeRunId) return
        deleteRun.mutate(activeRunId, {
            onSuccess: () => {
                setActiveRunId(undefined)
                setStep('config')
            },
        })
    }

    const handleViewRun = (run: GARunResponse) => {
        setActiveRunId(run.run_id)
        if (run.status === 'completed' || run.status === 'applied') {
            setStep('result')
        } else if (run.status === 'pending' || run.status === 'running') {
            setStep('running')
        } else {
            setStep('result')
        }
    }

    const [aiInputText, setAiInputText] = useState('')
    const [aiResponse, setAiResponse] = useState<AIAnalyzeResponse | null>(null)
    const analyzeMutation = useAnalyzeConstraints()

    const handleAnalyze = () => {
        if (!aiInputText.trim()) return alert('Vui lòng nhập yêu cầu tự nhiên')
        analyzeMutation.mutate(
            { natural_language_text: aiInputText },
            {
                onSuccess: (res) => setAiResponse(res),
                onError: (err: any) =>
                    alert('Lỗi khi gọi AI Gemini: ' + err.message),
            }
        )
    }

    const handleApplyAI = () => {
        if (!aiResponse) return
        setForm((prev) => {
            const next = { ...prev }
            if (aiResponse.paired_class_ids)
                next.paired_class_ids = aiResponse.paired_class_ids
            if (aiResponse.class_preferences)
                next.class_preferences = aiResponse.class_preferences
            if (aiResponse.class_unavailabilities)
                next.class_unavailabilities = aiResponse.class_unavailabilities
            if (aiResponse.penalties_override) {
                const po = aiResponse.penalties_override
                const consec =
                    po.penalty_consecutive_limit ?? po.consecutive_limit
                const paired = po.penalty_paired_classes ?? po.paired_classes
                const timePref =
                    po.penalty_time_preference ?? po.time_preference
                const roomUtil =
                    po.penalty_room_utilization ?? po.room_utilization
                const preserve =
                    po.penalty_preserve_existing ?? po.preserve_existing
                if (consec !== undefined)
                    next.penalty_consecutive_limit = consec
                if (paired !== undefined) next.penalty_paired_classes = paired
                if (timePref !== undefined)
                    next.penalty_time_preference = timePref
                if (roomUtil !== undefined)
                    next.penalty_room_utilization = roomUtil
                if (preserve !== undefined)
                    next.penalty_preserve_existing = preserve
            }
            const affectedClassIds = new Set(next.class_ids || [])
            if (aiResponse.class_preferences)
                aiResponse.class_preferences.forEach((p) =>
                    affectedClassIds.add(p.class_id)
                )
            if (aiResponse.class_unavailabilities)
                aiResponse.class_unavailabilities.forEach((u) =>
                    affectedClassIds.add(u.class_id)
                )
            if (aiResponse.paired_class_ids)
                aiResponse.paired_class_ids.forEach((pair) =>
                    pair.forEach((id) => affectedClassIds.add(id))
                )
            next.class_ids = Array.from(affectedClassIds)
            return next
        })
        alert('Đã áp dụng ràng buộc từ AI thành công!')
    }

    const handleClassToggle = (classId: string) => {
        setForm((prev) => {
            const ids = prev.class_ids || []
            const exists = ids.includes(classId)
            return {
                ...prev,
                class_ids: exists
                    ? ids.filter((id) => id !== classId)
                    : [...ids, classId],
            }
        })
    }

    const handleSelectAllClasses = () => {
        const allIds = classesData?.items?.map((c: any) => c.id) || []
        setForm((prev) => ({ ...prev, class_ids: allIds }))
    }

    const handleDeselectAllClasses = () => {
        setForm((prev) => ({ ...prev, class_ids: [] }))
    }

    // Lookup helper
    const resolveClassName = (id: string) => {
        const c = classesData?.items?.find((item: any) => item.id === id)
        return c ? c.name : id.slice(0, 8) + '...'
    }

    const DAY_VI_MAP: Record<string, string> = {
        monday: 'Thứ 2',
        tuesday: 'Thứ 3',
        wednesday: 'Thứ 4',
        thursday: 'Thứ 5',
        friday: 'Thứ 6',
        saturday: 'Thứ 7',
        sunday: 'Chủ nhật',
    }

    return (
        <div style={{ width: '100%', display: 'flex', gap: 24 }}>
            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* STEP: CONFIG */}
                {step === 'config' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        {/* AI Constraint Analyzer */}
                        <Card
                            title="🤖 Trợ lý Xếp lịch AI (Gemini)"
                            mode="light"
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--color-text-secondary)',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    Nhập các yêu cầu xếp lịch bằng ngôn ngữ tự
                                    nhiên (Ví dụ:{' '}
                                    <i>
                                        "Xếp lớp Guitar và Piano học cùng buổi
                                        sáng thứ hai. Giáo viên Nguyễn Văn A bận
                                        chiều thứ sáu. Tăng tối đa ưu tiên tối
                                        ưu phòng."
                                    </i>
                                    ) để tự động trích xuất các ràng buộc cho
                                    GA.
                                </div>

                                <textarea
                                    value={aiInputText}
                                    onChange={(e) =>
                                        setAiInputText(e.target.value)
                                    }
                                    placeholder="Nhập yêu cầu xếp lịch của bạn ở đây..."
                                    style={{
                                        width: '100%',
                                        minHeight: 80,
                                        padding: 12,
                                        borderRadius:
                                            'var(--primitive-radius-sm)',
                                        border: '1px solid var(--color-border-soft)',
                                        fontSize: 13,
                                        background: 'var(--color-surface-card)',
                                        color: 'var(--color-text-primary)',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                    }}
                                />

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <ButtonPrimary
                                        onClick={handleAnalyze}
                                        loading={analyzeMutation.isPending}
                                    >
                                        ✨ Phân tích yêu cầu
                                    </ButtonPrimary>
                                </div>

                                {aiResponse && (
                                    <div
                                        style={{
                                            marginTop: 12,
                                            padding: 16,
                                            borderRadius:
                                                'var(--primitive-radius-sm)',
                                            background:
                                                'var(--color-surface-card)',
                                            border: '1px solid var(--color-border-soft)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: 'var(--color-brand-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                            }}
                                        >
                                            <span>
                                                🔍 Kết quả phân tích của AI
                                            </span>
                                        </div>

                                        {aiResponse.ai_explanation && (
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    background:
                                                        'var(--color-surface-raised)',
                                                    padding: 10,
                                                    borderRadius: 6,
                                                    borderLeft:
                                                        '3px solid var(--color-brand-primary)',
                                                }}
                                            >
                                                <strong>Giải thích:</strong>{' '}
                                                {aiResponse.ai_explanation}
                                            </div>
                                        )}

                                        {aiResponse.warnings &&
                                            aiResponse.warnings.length > 0 && (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: 'var(--color-status-warning)',
                                                        background:
                                                            'var(--color-status-warning-bg)',
                                                        padding: 10,
                                                        borderRadius: 6,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 4,
                                                    }}
                                                >
                                                    <strong>
                                                        ⚠️ Cảnh báo từ AI:
                                                    </strong>
                                                    {aiResponse.warnings.map(
                                                        (w, idx) => (
                                                            <span key={idx}>
                                                                • {w}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: 12,
                                                fontSize: 13,
                                            }}
                                        >
                                            {/* Paired classes */}
                                            <div
                                                style={{
                                                    background:
                                                        'var(--color-surface-raised)',
                                                    padding: 12,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        marginBottom: 8,
                                                        color: 'var(--color-text-primary)',
                                                    }}
                                                >
                                                    🔗 Lớp học đi kèm (Xếp cùng
                                                    buổi):
                                                </div>
                                                {!aiResponse.paired_class_ids ||
                                                aiResponse.paired_class_ids
                                                    .length === 0 ? (
                                                    <span
                                                        style={{
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Không phát hiện cặp lớp
                                                        nào
                                                    </span>
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            gap: 4,
                                                        }}
                                                    >
                                                        {aiResponse.paired_class_ids.map(
                                                            (pair, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    style={{
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    •{' '}
                                                                    {pair
                                                                        .map(
                                                                            resolveClassName
                                                                        )
                                                                        .join(
                                                                            ' và '
                                                                        )}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Class unavailabilities */}
                                            <div
                                                style={{
                                                    background:
                                                        'var(--color-surface-raised)',
                                                    padding: 12,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        marginBottom: 8,
                                                        color: 'var(--color-text-primary)',
                                                    }}
                                                >
                                                    🚫 Ràng buộc bận học (AI):
                                                </div>
                                                {!aiResponse.class_unavailabilities ||
                                                aiResponse
                                                    .class_unavailabilities
                                                    .length === 0 ? (
                                                    <span
                                                        style={{
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Không phát hiện ngày bận
                                                    </span>
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            gap: 4,
                                                        }}
                                                    >
                                                        {aiResponse.class_unavailabilities.map(
                                                            (un, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    style={{
                                                                        fontSize: 12,
                                                                    }}
                                                                >
                                                                    •{' '}
                                                                    {resolveClassName(
                                                                        un.class_id
                                                                    )}
                                                                    :{' '}
                                                                    <strong
                                                                        style={{
                                                                            color: 'var(--color-status-error)',
                                                                        }}
                                                                    >
                                                                        Bận{' '}
                                                                        {DAY_VI_MAP[
                                                                            un
                                                                                .day
                                                                        ] ??
                                                                            un.day}
                                                                    </strong>
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Class preferences */}
                                            <div
                                                style={{
                                                    background:
                                                        'var(--color-surface-raised)',
                                                    padding: 12,
                                                    borderRadius: 6,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        marginBottom: 8,
                                                        color: 'var(--color-text-primary)',
                                                    }}
                                                >
                                                    ⏰ Sở thích buổi học:
                                                </div>
                                                {!aiResponse.class_preferences ||
                                                aiResponse.class_preferences
                                                    .length === 0 ? (
                                                    <span
                                                        style={{
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Không phát hiện sở thích
                                                        buổi
                                                    </span>
                                                ) : (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            gap: 4,
                                                        }}
                                                    >
                                                        {aiResponse.class_preferences.map(
                                                            (pref, idx) => {
                                                                const periodLabel =
                                                                    pref.preferred_time_period ===
                                                                    'morning'
                                                                        ? 'Sáng'
                                                                        : pref.preferred_time_period ===
                                                                            'afternoon'
                                                                          ? 'Chiều'
                                                                          : 'Tối'
                                                                return (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        style={{
                                                                            fontSize: 12,
                                                                        }}
                                                                    >
                                                                        •{' '}
                                                                        {resolveClassName(
                                                                            pref.class_id
                                                                        )}
                                                                        :{' '}
                                                                        <strong>
                                                                            Buổi{' '}
                                                                            {
                                                                                periodLabel
                                                                            }
                                                                        </strong>
                                                                    </span>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Penalties Override */}
                                        {aiResponse.penalties_override &&
                                            Object.keys(
                                                aiResponse.penalties_override
                                            ).length > 0 && (
                                                <div
                                                    style={{
                                                        background:
                                                            'var(--color-surface-raised)',
                                                        padding: 12,
                                                        borderRadius: 6,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            marginBottom: 8,
                                                            color: 'var(--color-text-primary)',
                                                        }}
                                                    >
                                                        📈 Điều chỉnh mức độ ưu
                                                        tiên (Trọng số):
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns:
                                                                'repeat(auto-fill, minmax(200px, 1fr))',
                                                            gap: 8,
                                                        }}
                                                    >
                                                        {Object.entries(
                                                            aiResponse.penalties_override
                                                        ).map(
                                                            ([key, value]) => {
                                                                const LABELS: Record<
                                                                    string,
                                                                    string
                                                                > = {
                                                                    penalty_consecutive_limit:
                                                                        'Tránh lịch liên tiếp',
                                                                    consecutive_limit:
                                                                        'Tránh lịch liên tiếp',
                                                                    penalty_paired_classes:
                                                                        'Lớp cùng buổi',
                                                                    paired_classes:
                                                                        'Lớp cùng buổi',
                                                                    penalty_time_preference:
                                                                        'Đúng buổi mong muốn',
                                                                    time_preference:
                                                                        'Đúng buổi mong muốn',
                                                                    penalty_room_utilization:
                                                                        'Tối ưu hóa phòng',
                                                                    room_utilization:
                                                                        'Tối ưu hóa phòng',
                                                                    penalty_preserve_existing:
                                                                        'Giữ nguyên lịch cũ',
                                                                    preserve_existing:
                                                                        'Giữ nguyên lịch cũ',
                                                                }
                                                                return (
                                                                    <span
                                                                        key={
                                                                            key
                                                                        }
                                                                        style={{
                                                                            fontSize: 12,
                                                                        }}
                                                                    >
                                                                        •{' '}
                                                                        {LABELS[
                                                                            key
                                                                        ] ??
                                                                            key}
                                                                        :{' '}
                                                                        <strong
                                                                            style={{
                                                                                color: 'var(--color-brand-primary)',
                                                                            }}
                                                                        >
                                                                            {
                                                                                value
                                                                            }
                                                                        </strong>
                                                                    </span>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                gap: 12,
                                                marginTop: 8,
                                            }}
                                        >
                                            <ButtonPrimary
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setAiResponse(null)
                                                }
                                            >
                                                Hủy bỏ
                                            </ButtonPrimary>
                                            <ButtonPrimary
                                                size="sm"
                                                onClick={handleApplyAI}
                                            >
                                                ✓ Áp dụng vào cấu hình
                                            </ButtonPrimary>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Date range */}
                        <Card title="1. Khoảng thời gian" mode="light">
                            <div className={s.configPanel}>
                                <InputField
                                    label="Ngày bắt đầu"
                                    type="date"
                                    value={form.start_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            start_date: e.target.value,
                                        })
                                    }
                                />
                                <InputField
                                    label="Ngày kết thúc"
                                    type="date"
                                    value={form.end_date}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            end_date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </Card>

                        {/* Class selection */}
                        <Card title="2. Chọn lớp học" mode="light">
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--color-text-muted)',
                                    }}
                                >
                                    Đã chọn: {form.class_ids?.length || 0}
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <ButtonPrimary
                                        size="sm"
                                        variant="outline"
                                        onClick={handleSelectAllClasses}
                                    >
                                        Chọn tất cả
                                    </ButtonPrimary>
                                    <ButtonPrimary
                                        size="sm"
                                        variant="outline"
                                        onClick={handleDeselectAllClasses}
                                    >
                                        Bỏ chọn
                                    </ButtonPrimary>
                                </div>
                            </div>

                            <div
                                style={{
                                    border: '1px solid var(--color-border-soft)',
                                    borderRadius: 'var(--primitive-radius-sm)',
                                    padding: 12,
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fill, minmax(200px, 1fr))',
                                    gap: 8,
                                }}
                            >
                                {loadingClasses ? (
                                    <div
                                        style={{
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Đang tải...
                                    </div>
                                ) : (
                                    classesData?.items?.map((cls: any) => (
                                        <label
                                            key={cls.id}
                                            style={{
                                                display: 'flex',
                                                gap: 8,
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                borderRadius: 6,
                                                background:
                                                    form.class_ids?.includes(
                                                        cls.id
                                                    )
                                                        ? 'var(--color-status-info-bg)'
                                                        : 'transparent',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    form.class_ids?.includes(
                                                        cls.id
                                                    ) || false
                                                }
                                                onChange={() =>
                                                    handleClassToggle(cls.id)
                                                }
                                            />
                                            <span
                                                style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {cls.name}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>

                            {form.paired_class_ids &&
                                form.paired_class_ids.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: 12,
                                            padding: 10,
                                            background:
                                                'var(--color-status-info-bg)',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: 'var(--color-status-info)',
                                            }}
                                        >
                                            🔗 Cặp lớp học xếp cùng buổi (AI /
                                            Cấu hình):
                                        </strong>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 8,
                                            }}
                                        >
                                            {form.paired_class_ids.map(
                                                (pair, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            background:
                                                                'var(--color-surface-card)',
                                                            padding: '3px 8px',
                                                            borderRadius: 4,
                                                            border: '1px solid var(--color-border-soft)',
                                                        }}
                                                    >
                                                        {pair
                                                            .map(
                                                                resolveClassName
                                                            )
                                                            .join(' + ')}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {form.class_unavailabilities &&
                                form.class_unavailabilities.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            padding: 10,
                                            background:
                                                'var(--color-status-error-bg)',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: 'var(--color-status-error)',
                                            }}
                                        >
                                            🚫 Lịch bận không xếp của các lớp
                                            (AI / Cấu hình):
                                        </strong>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 8,
                                            }}
                                        >
                                            {form.class_unavailabilities.map(
                                                (un, idx) => (
                                                    <span
                                                        key={idx}
                                                        style={{
                                                            background:
                                                                'var(--color-surface-card)',
                                                            padding: '3px 8px',
                                                            borderRadius: 4,
                                                            border: '1px solid var(--color-border-soft)',
                                                        }}
                                                    >
                                                        {resolveClassName(
                                                            un.class_id
                                                        )}
                                                        :{' '}
                                                        <strong>
                                                            Bận{' '}
                                                            {DAY_VI_MAP[
                                                                un.day
                                                            ] ?? un.day}
                                                        </strong>
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {form.class_preferences &&
                                form.class_preferences.length > 0 && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            padding: 10,
                                            background:
                                                'var(--color-status-info-bg)',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: 'var(--color-status-info)',
                                            }}
                                        >
                                            ⏰ Sở thích buổi học (AI / Cấu
                                            hình):
                                        </strong>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 8,
                                            }}
                                        >
                                            {form.class_preferences.map(
                                                (pref, idx) => {
                                                    const periodLabel =
                                                        pref.preferred_time_period ===
                                                        'morning'
                                                            ? 'Sáng'
                                                            : pref.preferred_time_period ===
                                                                'afternoon'
                                                              ? 'Chiều'
                                                              : 'Tối'
                                                    return (
                                                        <span
                                                            key={idx}
                                                            style={{
                                                                background:
                                                                    'var(--color-surface-card)',
                                                                padding:
                                                                    '3px 8px',
                                                                borderRadius: 4,
                                                                border: '1px solid var(--color-border-soft)',
                                                            }}
                                                        >
                                                            {resolveClassName(
                                                                pref.class_id
                                                            )}
                                                            :{' '}
                                                            <strong>
                                                                Buổi{' '}
                                                                {periodLabel}
                                                            </strong>
                                                        </span>
                                                    )
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                        </Card>

                        {/* GA params */}
                        <Card title="3. Tham số GA" mode="light">
                            <div className={s.configPanel}>
                                <SliderField
                                    label="Population Size"
                                    tooltip="Số phương án thời khóa biểu mà hệ thống thử cùng lúc trong mỗi vòng xử lý. Tăng lên sẽ tìm được lịch tốt hơn, nhưng thời gian chạy sẽ lâu hơn."
                                    value={form.population_size!}
                                    min={10}
                                    max={500}
                                    step={10}
                                    onChange={(v) =>
                                        setForm({ ...form, population_size: v })
                                    }
                                />
                                <SliderField
                                    label="Generations"
                                    tooltip="Số vòng lặp tối đa mà hệ thống chạy để cải thiện lịch. Càng nhiều vòng thì kết quả càng chính xác. Hệ thống sẽ tự dừng sớm nếu lịch đã đủ tốt."
                                    value={form.generations!}
                                    min={50}
                                    max={2000}
                                    step={50}
                                    onChange={(v) =>
                                        setForm({ ...form, generations: v })
                                    }
                                />
                                <SliderField
                                    label="Crossover Rate"
                                    tooltip="Tỷ lệ hệ thống kết hợp 2 phương án tốt lại với nhau để tạo phương án mới. Giá trị cao (0.7–0.9) giúp nhanh tìm được lịch tối ưu."
                                    value={form.crossover_rate!}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={(v) =>
                                        setForm({ ...form, crossover_rate: v })
                                    }
                                />
                                <SliderField
                                    label="Mutation Rate"
                                    tooltip="Tỷ lệ hệ thống thử thay đổi ngẫu nhiên một buổi học (đổi ngày, tiết, hoặc phòng) để tìm phương án tốt hơn. Nên để trong khoảng 0.05–0.20."
                                    value={form.mutation_rate!}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={(v) =>
                                        setForm({ ...form, mutation_rate: v })
                                    }
                                />
                            </div>
                        </Card>

                        {/* Soft weights */}
                        <Card title="4. Trọng số ràng buộc mềm" mode="light">
                            <div className={s.configPanel}>
                                <SliderField
                                    label="Lịch liên tiếp"
                                    tooltip="Mức ưu tiên tránh xếp giáo viên dạy quá 3 tiết liên tiếp trong cùng ngày."
                                    value={form.penalty_consecutive_limit!}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onChange={(v) =>
                                        setForm({
                                            ...form,
                                            penalty_consecutive_limit: v,
                                        })
                                    }
                                />
                                <SliderField
                                    label="Cặp lớp cùng buổi"
                                    tooltip="Mức ưu tiên xếp các cặp lớp liên quan vào cùng buổi (sáng/chiều/tối) trong cùng ngày."
                                    value={form.penalty_paired_classes!}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onChange={(v) =>
                                        setForm({
                                            ...form,
                                            penalty_paired_classes: v,
                                        })
                                    }
                                />
                                <SliderField
                                    label="Sở thích buổi"
                                    tooltip="Mức ưu tiên xếp lớp đúng buổi mong muốn (sáng/chiều/tối) mà lớp đó đã đăng ký."
                                    value={form.penalty_time_preference!}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onChange={(v) =>
                                        setForm({
                                            ...form,
                                            penalty_time_preference: v,
                                        })
                                    }
                                />
                                <SliderField
                                    label="Tối ưu phòng"
                                    tooltip="Mức ưu tiên chọn phòng phù hợp với sĩ số lớp."
                                    value={form.penalty_room_utilization!}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onChange={(v) =>
                                        setForm({
                                            ...form,
                                            penalty_room_utilization: v,
                                        })
                                    }
                                />
                                <SliderField
                                    label="Giữ lịch cũ"
                                    tooltip="Mức ưu tiên giữ nguyên lịch hiện tại đang có trong hệ thống."
                                    value={form.penalty_preserve_existing!}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onChange={(v) =>
                                        setForm({
                                            ...form,
                                            penalty_preserve_existing: v,
                                        })
                                    }
                                />
                            </div>
                        </Card>

                        <div className={s.actions}>
                            <ButtonPrimary
                                variant="outline"
                                onClick={() => navigate('/admin/schedule')}
                            >
                                ← Quay lại
                            </ButtonPrimary>
                            <ButtonPrimary
                                onClick={handleRunGA}
                                loading={runGA.isPending}
                            >
                                Chạy GA →
                            </ButtonPrimary>
                        </div>
                    </div>
                )}

                {/* STEP: RUNNING */}
                {step === 'running' && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                            alignItems: 'center',
                            padding: '40px 0',
                        }}
                    >
                        <RunStatusCard
                            status={runDetail.data?.status || 'pending'}
                            detail={runDetail.data || null}
                        />

                        {runStatus === 'completed' && (
                            <ButtonPrimary onClick={() => setStep('result')}>
                                Xem kết quả →
                            </ButtonPrimary>
                        )}

                        {runStatus === 'failed' && (
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        color: 'var(--color-status-danger)',
                                        marginBottom: 12,
                                        fontSize: 14,
                                    }}
                                >
                                    {runDetail.data?.config &&
                                        'GA chạy thất bại. '}
                                    Kiểm tra lại dữ liệu đầu vào.
                                </div>
                                <ButtonPrimary
                                    variant="outline"
                                    onClick={handleDeleteAndRetry}
                                >
                                    Xóa &amp; Cấu hình lại
                                </ButtonPrimary>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP: RESULT */}
                {step === 'result' && runDetail.data && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        {/* Stat cards */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            <StatCard
                                label="Tổng buổi"
                                value={runDetail.data.total_sessions ?? 0}
                            />
                            <StatCard
                                label="Xung đột"
                                value={runDetail.data.conflict_count ?? 0}
                                color={
                                    runDetail.data.conflict_count
                                        ? 'var(--color-status-danger)'
                                        : 'var(--color-status-success)'
                                }
                            />
                            <StatCard
                                label="Hard Violations"
                                value={runDetail.data.hard_violations ?? 0}
                                color={
                                    runDetail.data.hard_violations
                                        ? 'var(--color-status-danger)'
                                        : 'var(--color-status-success)'
                                }
                            />
                            <StatCard
                                label="Soft Score"
                                value={
                                    runDetail.data.soft_score?.toFixed(1) ?? '—'
                                }
                            />
                            <StatCard
                                label="Fitness"
                                value={
                                    runDetail.data.best_fitness?.toFixed(1) ??
                                    '—'
                                }
                            />
                            <StatCard
                                label="Thế hệ"
                                value={runDetail.data.generations_run ?? '—'}
                            />
                        </div>

                        {/* Conflict banner */}
                        {runDetail.data.conflicts.length > 0 && (
                            <div
                                style={{
                                    padding: 16,
                                    borderRadius: 'var(--primitive-radius-sm)',
                                    background: 'var(--color-status-danger-bg)',
                                    border: '1px solid var(--color-status-danger)',
                                }}
                            >
                                <strong>
                                    ⚠ {runDetail.data.conflicts.length} xung đột
                                </strong>
                                <div style={{ fontSize: 13, marginTop: 4 }}>
                                    Hệ thống phát hiện{' '}
                                    {runDetail.data.conflicts.length} điểm xung
                                    đột/vi phạm trong kết quả đề xuất.
                                </div>
                            </div>
                        )}

                        {/* Sessions card */}
                        <Card
                            title={`Danh sách buổi đề xuất (${runDetail.data.sessions.length})`}
                            mode="light"
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 16,
                                }}
                            >
                                {/* Controls bar */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: 12,
                                        borderBottom:
                                            '1px solid var(--color-border-soft)',
                                        paddingBottom: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                        }}
                                    >
                                        <ButtonPrimary
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrevWeek}
                                        >
                                            ← Tuần trước
                                        </ButtonPrimary>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: 'var(--color-text-primary)',
                                            }}
                                        >
                                            {currentDate
                                                ? `${format(currentWeekStart, 'dd/MM/yyyy')} - ${format(currentWeekEnd, 'dd/MM/yyyy')}`
                                                : ''}
                                        </span>
                                        <ButtonPrimary
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextWeek}
                                        >
                                            Tuần sau →
                                        </ButtonPrimary>
                                    </div>
                                    <ViewModeSelector
                                        currentMode={viewMode}
                                        onModeChange={setViewMode}
                                    />
                                </div>

                                {/* Filters bar */}
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 16,
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        background:
                                            'var(--color-surface-raised)',
                                        padding: '12px 16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border-soft)',
                                    }}
                                >
                                    {[
                                        {
                                            label: 'Lớp:',
                                            value: selectedClass,
                                            opts: uniqueClasses,
                                            setter: setSelectedClass,
                                        },
                                        {
                                            label: 'Giáo viên:',
                                            value: selectedTeacher,
                                            opts: uniqueTeachers,
                                            setter: setSelectedTeacher,
                                        },
                                        {
                                            label: 'Phòng:',
                                            value: selectedRoom,
                                            opts: uniqueRooms,
                                            setter: setSelectedRoom,
                                        },
                                    ].map(({ label, value, opts, setter }) => (
                                        <div
                                            key={label}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <label
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    color: 'var(--color-text-secondary)',
                                                }}
                                            >
                                                {label}
                                            </label>
                                            <select
                                                value={value}
                                                onChange={(e) =>
                                                    setter(e.target.value)
                                                }
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius:
                                                        'var(--radius-sm)',
                                                    border: '1px solid var(--color-border-soft)',
                                                    fontSize: 13,
                                                    background:
                                                        'var(--color-surface-card)',
                                                    color: 'var(--color-text-primary)',
                                                }}
                                            >
                                                <option value="">Tất cả</option>
                                                {opts.map((o) => (
                                                    <option key={o} value={o}>
                                                        {o}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}

                                    {(selectedClass ||
                                        selectedTeacher ||
                                        selectedRoom) && (
                                        <button
                                            onClick={() => {
                                                setSelectedClass('')
                                                setSelectedTeacher('')
                                                setSelectedRoom('')
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'transparent',
                                                border: '1px solid var(--color-status-danger)',
                                                borderRadius:
                                                    'var(--radius-sm)',
                                                color: 'var(--color-status-danger)',
                                                fontSize: 13,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </div>

                                {/* Grid / List view */}
                                <div style={{ minHeight: 400 }}>
                                    {viewMode === 'time-grid' &&
                                        currentDate && (
                                            <TimeGridView
                                                startDate={currentWeekStart}
                                                sessions={currentWeekSessions}
                                            />
                                        )}
                                    {viewMode === 'room-grid' &&
                                        currentDate && (
                                            <RoomGridView
                                                startDate={currentWeekStart}
                                                sessions={currentWeekSessions}
                                            />
                                        )}
                                    {viewMode === 'list' && (
                                        <ScheduleListView
                                            sessions={currentWeekSessions}
                                        />
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className={s.actions}>
                            <ButtonPrimary
                                variant="outline"
                                onClick={handleDeleteAndRetry}
                            >
                                Xóa &amp; Cấu hình lại
                            </ButtonPrimary>
                            <ButtonPrimary
                                onClick={handleApply}
                                loading={applyProposal.isPending}
                                disabled={
                                    runDetail.data.status === 'applied' ||
                                    (runDetail.data.hard_violations != null &&
                                        runDetail.data.hard_violations > 0)
                                }
                            >
                                {runDetail.data.status === 'applied'
                                    ? '✓ Đã áp dụng'
                                    : 'Confirm & Apply'}
                            </ButtonPrimary>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar: Run History */}
            <div style={{ width: 280, flexShrink: 0 }}>
                <Card title="Lịch sử chạy GA" mode="light">
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        {(!historyData?.data ||
                            historyData.data.length === 0) && (
                            <div
                                style={{
                                    fontSize: 13,
                                    color: 'var(--color-text-muted)',
                                    textAlign: 'center',
                                    padding: 16,
                                }}
                            >
                                Chưa có lần chạy nào
                            </div>
                        )}

                        {historyData?.data?.map((run) => (
                            <button
                                key={run.run_id}
                                onClick={() => handleViewRun(run)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    padding: '10px 12px',
                                    borderRadius: 'var(--primitive-radius-sm)',
                                    border:
                                        run.run_id === activeRunId
                                            ? '2px solid var(--color-brand-primary)'
                                            : '1px solid var(--color-border-soft)',
                                    background:
                                        run.run_id === activeRunId
                                            ? 'var(--color-status-info-bg)'
                                            : 'var(--color-surface-card)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'var(--transition-colors)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <StatusBadge status={run.status} />
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        {formatDateShort(run.created_at)}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    {run.start_date} → {run.end_date}
                                </div>
                                {run.total_sessions != null && (
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        {run.total_sessions} buổi ·{' '}
                                        {run.conflict_count ?? 0} xung đột
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
