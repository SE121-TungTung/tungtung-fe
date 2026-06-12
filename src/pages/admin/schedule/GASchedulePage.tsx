import { useState } from 'react'

import s from './Schedule.module.css'

import Card from '@/components/common/card/Card'

import InputField from '@/components/common/input/InputField'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

import { useNavigate } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

import { useDialog } from '@/hooks/useDialog'

import { listClasses } from '@/lib/classes'

import { listUsers } from '@/lib/users'

import {
    useRunGA,
    useGARunDetail,
    useGARunHistory,
    useApplyGAProposal,
    useDeleteGARun,
    useTeacherUnavailability,
    useCreateTeacherUnavailability,
    useDeleteTeacherUnavailability,
    useAnalyzeConstraints,
} from '@/hooks/domain/useGASchedule'

import type {
    GAScheduleRequest,
    GARunResponse,
    GARunStatus,
    AIAnalyzeResponse,
} from '@/types/ga-schedule.types'

// ============================================================================

// Tab definitions

// ============================================================================

type TabId = 'ga-optimizer' | 'teacher-unavailability'

const TABS: { id: TabId; label: string }[] = [
    { id: 'ga-optimizer', label: 'Xếp TKB (GA)' },

    { id: 'teacher-unavailability', label: 'Lịch bận Giáo viên' },
]

const DAYS_OF_WEEK = [
    'Thứ 2',

    'Thứ 3',

    'Thứ 4',

    'Thứ 5',

    'Thứ 6',

    'Thứ 7',

    'Chủ nhật',
]

// ============================================================================

// Main Page Component

// ============================================================================

export default function GASchedulePage() {
    const [activeTab, setActiveTab] = useState<TabId>('ga-optimizer')

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    Xếp lịch tự động (Genetic Algorithm)
                </h1>

                {/* Tab bar */}

                <div
                    style={{
                        display: 'flex',

                        gap: 0,

                        width: '100%',

                        borderBottom: '2px solid var(--color-border-soft)',

                        marginBottom: 8,
                    }}
                >
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 24px',

                                fontSize: 14,

                                fontWeight: activeTab === tab.id ? 600 : 400,

                                color:
                                    activeTab === tab.id
                                        ? 'var(--color-brand-primary)'
                                        : 'var(--color-text-muted)',

                                background: 'transparent',

                                border: 'none',

                                borderBottom:
                                    activeTab === tab.id
                                        ? '2px solid var(--color-brand-primary)'
                                        : '2px solid transparent',

                                marginBottom: -2,

                                cursor: 'pointer',

                                transition: 'var(--transition-colors)',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}

                    <div style={{ flex: 1 }} />

                    <ButtonPrimary
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            (window.location.href = '/admin/schedule/generate')
                        }
                    >
                        Xếp lịch Deterministic →
                    </ButtonPrimary>
                </div>

                {/* Tab content */}

                {activeTab === 'ga-optimizer' && <GAOptimizerTab />}

                {activeTab === 'teacher-unavailability' && (
                    <TeacherUnavailabilityTab />
                )}
            </main>
        </div>
    )
}

// ============================================================================

// Tab 1: GA Optimizer

// ============================================================================

type GAStep = 'config' | 'running' | 'result'

function GAOptimizerTab() {
    const navigate = useNavigate()

    const { alert } = useDialog()

    const [step, setStep] = useState<GAStep>('config')

    const [activeRunId, setActiveRunId] = useState<string | undefined>()

    const runGA = useRunGA()

    const runDetail = useGARunDetail(activeRunId)

    const applyProposal = useApplyGAProposal()

    const deleteRun = useDeleteGARun()

    const { data: historyData } = useGARunHistory(1, 10)

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

    // When polling detects completion, auto-advance to result

    const runStatus = runDetail.data?.status

    if (
        step === 'running' &&
        (runStatus === 'completed' || runStatus === 'failed')
    ) {
        // This is fine - React will re-render
    }

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
                onSuccess: (res) => {
                    setAiResponse(res)
                },

                onError: (err: any) => {
                    alert('Lỗi khi gọi AI Gemini: ' + err.message)
                },
            }
        )
    }

    const handleApplyAI = () => {
        if (!aiResponse) return

        setForm((prev) => {
            const next = { ...prev }

            if (aiResponse.paired_class_ids) {
                next.paired_class_ids = aiResponse.paired_class_ids
            }

            if (aiResponse.class_preferences) {
                next.class_preferences = aiResponse.class_preferences
            }

            if (aiResponse.class_unavailabilities) {
                next.class_unavailabilities = aiResponse.class_unavailabilities
            }

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

            // Auto-select classes that are referenced in AI constraints

            const affectedClassIds = new Set(next.class_ids || [])

            if (aiResponse.class_preferences) {
                aiResponse.class_preferences.forEach((p) =>
                    affectedClassIds.add(p.class_id)
                )
            }

            if (aiResponse.class_unavailabilities) {
                aiResponse.class_unavailabilities.forEach((u) =>
                    affectedClassIds.add(u.class_id)
                )
            }

            if (aiResponse.paired_class_ids) {
                aiResponse.paired_class_ids.forEach((pair) =>
                    pair.forEach((id) => affectedClassIds.add(id))
                )
            }

            next.class_ids = list(affectedClassIds)

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
                                                            (pair, idx) => {
                                                                const names =
                                                                    pair.map(
                                                                        (
                                                                            id
                                                                        ) => {
                                                                            const c =
                                                                                classesData?.items?.find(
                                                                                    (
                                                                                        item: any
                                                                                    ) =>
                                                                                        item.id ===
                                                                                        id
                                                                                )

                                                                            return c
                                                                                ? c.name
                                                                                : id.slice(
                                                                                      0,

                                                                                      8
                                                                                  ) +
                                                                                      '...'
                                                                        }
                                                                    )

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
                                                                        {names.join(
                                                                            ' và '
                                                                        )}
                                                                    </span>
                                                                )
                                                            }
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
                                                            (un, idx) => {
                                                                const c =
                                                                    classesData?.items?.find(
                                                                        (
                                                                            item: any
                                                                        ) =>
                                                                            item.id ===
                                                                            un.class_id
                                                                    )

                                                                const className =
                                                                    c
                                                                        ? c.name
                                                                        : un.class_id.slice(
                                                                              0,

                                                                              8
                                                                          ) +
                                                                          '...'

                                                                const dayVi =
                                                                    un.day ===
                                                                    'monday'
                                                                        ? 'Thứ 2'
                                                                        : un.day ===
                                                                            'tuesday'
                                                                          ? 'Thứ 3'
                                                                          : un.day ===
                                                                              'wednesday'
                                                                            ? 'Thứ 4'
                                                                            : un.day ===
                                                                                'thursday'
                                                                              ? 'Thứ 5'
                                                                              : un.day ===
                                                                                  'friday'
                                                                                ? 'Thứ 6'
                                                                                : un.day ===
                                                                                    'saturday'
                                                                                  ? 'Thứ 7'
                                                                                  : un.day ===
                                                                                      'sunday'
                                                                                    ? 'Chủ nhật'
                                                                                    : un.day

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
                                                                        {
                                                                            className
                                                                        }
                                                                        :{' '}
                                                                        <strong
                                                                            style={{
                                                                                color: 'var(--color-status-error)',
                                                                            }}
                                                                        >
                                                                            Bận{' '}
                                                                            {
                                                                                dayVi
                                                                            }
                                                                        </strong>
                                                                    </span>
                                                                )
                                                            }
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
                                                                const c =
                                                                    classesData?.items?.find(
                                                                        (
                                                                            item: any
                                                                        ) =>
                                                                            item.id ===
                                                                            pref.class_id
                                                                    )

                                                                const className =
                                                                    c
                                                                        ? c.name
                                                                        : pref.class_id.slice(
                                                                              0,

                                                                              8
                                                                          ) +
                                                                          '...'

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
                                                                        {
                                                                            className
                                                                        }
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
                                                                let label = key

                                                                if (
                                                                    key ===
                                                                        'penalty_consecutive_limit' ||
                                                                    key ===
                                                                        'consecutive_limit'
                                                                )
                                                                    label =
                                                                        'Tránh lịch liên tiếp'

                                                                if (
                                                                    key ===
                                                                        'penalty_paired_classes' ||
                                                                    key ===
                                                                        'paired_classes'
                                                                )
                                                                    label =
                                                                        'Lớp cùng buổi'

                                                                if (
                                                                    key ===
                                                                        'penalty_time_preference' ||
                                                                    key ===
                                                                        'time_preference'
                                                                )
                                                                    label =
                                                                        'Đúng buổi mong muốn'

                                                                if (
                                                                    key ===
                                                                        'penalty_room_utilization' ||
                                                                    key ===
                                                                        'room_utilization'
                                                                )
                                                                    label =
                                                                        'Tối ưu hóa phòng'

                                                                if (
                                                                    key ===
                                                                        'penalty_preserve_existing' ||
                                                                    key ===
                                                                        'preserve_existing'
                                                                )
                                                                    label =
                                                                        'Giữ nguyên lịch cũ'

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
                                                                        {label}:{' '}
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
                                                (pair, idx) => {
                                                    const names = pair.map(
                                                        (id) => {
                                                            const c =
                                                                classesData?.items?.find(
                                                                    (
                                                                        item: any
                                                                    ) =>
                                                                        item.id ===
                                                                        id
                                                                )

                                                            return c
                                                                ? c.name
                                                                : id.slice(
                                                                      0,

                                                                      8
                                                                  ) + '...'
                                                        }
                                                    )

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
                                                            {names.join(' + ')}
                                                        </span>
                                                    )
                                                }
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
                                                (un, idx) => {
                                                    const c =
                                                        classesData?.items?.find(
                                                            (item: any) =>
                                                                item.id ===
                                                                un.class_id
                                                        )

                                                    const className = c
                                                        ? c.name
                                                        : un.class_id.slice(
                                                              0,

                                                              8
                                                          ) + '...'

                                                    const dayVi =
                                                        un.day === 'monday'
                                                            ? 'Thứ 2'
                                                            : un.day ===
                                                                'tuesday'
                                                              ? 'Thứ 3'
                                                              : un.day ===
                                                                  'wednesday'
                                                                ? 'Thứ 4'
                                                                : un.day ===
                                                                    'thursday'
                                                                  ? 'Thứ 5'
                                                                  : un.day ===
                                                                      'friday'
                                                                    ? 'Thứ 6'
                                                                    : un.day ===
                                                                        'saturday'
                                                                      ? 'Thứ 7'
                                                                      : un.day ===
                                                                          'sunday'
                                                                        ? 'Chủ nhật'
                                                                        : un.day

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
                                                            {className}:{' '}
                                                            <strong>
                                                                Bận {dayVi}
                                                            </strong>
                                                        </span>
                                                    )
                                                }
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
                                            ⏰ Sở thích buổi học của các lớp (AI
                                            / Cấu hình):
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
                                                    const c =
                                                        classesData?.items?.find(
                                                            (item: any) =>
                                                                item.id ===
                                                                pref.class_id
                                                        )

                                                    const className = c
                                                        ? c.name
                                                        : pref.class_id.slice(
                                                              0,

                                                              8
                                                          ) + '...'

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
                                                            {className}:{' '}
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

                        <Card title="4. Trọng số ràng buộc mềm" mode="light">
                            <div className={s.configPanel}>
                                <SliderField
                                    label="Lịch liên tiếp"
                                    tooltip="Mức ưu tiên tránh xếp giáo viên dạy quá 3 tiết liên tiếp trong cùng ngày. Số càng cao, hệ thống càng cố tránh xếp lịch dày cho giáo viên."
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
                                    tooltip="Mức ưu tiên xếp các cặp lớp liên quan vào cùng buổi (sáng/chiều/tối) trong cùng ngày. Thuận tiện cho học sinh học nhiều môn liên tiếp."
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
                                    tooltip="Mức ưu tiên xếp lớp đúng buổi mong muốn (sáng/chiều/tối) mà lớp đó đã đăng ký. Số càng cao, lịch càng sát với nguyện vọng thời gian."
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
                                    tooltip="Mức ưu tiên chọn phòng phù hợp với sĩ số lớp. Hệ thống sẽ cố tránh xếp lớp ít học sinh vào phòng quá lớn, hoặc ngược lại."
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
                                    tooltip="Mức ưu tiên giữ nguyên lịch hiện tại đang có trong hệ thống. Số càng cao, hệ thống càng hạn chế thay đổi so với lịch cũ, tránh xáo trộn."
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

                {/* STEP: RUNNING (polling) */}

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
                                    Xóa & Cấu hình lại
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
                        {/* Stats cards */}

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

                                    background:
                                        'var(--color-status-warning-bg)',

                                    border: '1px solid var(--color-status-warning)',
                                }}
                            >
                                <strong>
                                    ⚠ {runDetail.data.conflicts.length} xung
                                    đột
                                </strong>

                                <div style={{ fontSize: 13, marginTop: 4 }}>
                                    Không thể apply khi còn hard violations. Hãy
                                    chạy lại với tham số khác.
                                </div>
                            </div>
                        )}

                        {/* Sessions table */}

                        <Card
                            title={`Danh sách buổi đề xuất (${runDetail.data.sessions.length})`}
                            mode="light"
                        >
                            <div style={{ overflowX: 'auto' }}>
                                <table
                                    style={{
                                        width: '100%',

                                        borderCollapse: 'collapse',

                                        fontSize: 13,
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom:
                                                    '2px solid var(--color-border-soft)',

                                                textAlign: 'left',
                                            }}
                                        >
                                            <th style={thStyle}>Lớp</th>

                                            <th style={thStyle}>Giáo viên</th>

                                            <th style={thStyle}>Phòng</th>

                                            <th style={thStyle}>Ngày</th>

                                            <th style={thStyle}>Tiết</th>

                                            <th style={thStyle}>Giờ</th>

                                            <th style={thStyle}>Trạng thái</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {runDetail.data.sessions.map((ses) => (
                                            <tr
                                                key={ses.id}
                                                style={{
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',

                                                    background: ses.is_conflict
                                                        ? 'var(--color-status-danger-bg)'
                                                        : 'transparent',
                                                }}
                                            >
                                                <td style={tdStyle}>
                                                    {ses.class_name}
                                                </td>

                                                <td style={tdStyle}>
                                                    {ses.teacher_name}
                                                </td>

                                                <td style={tdStyle}>
                                                    {ses.room_name || '—'}
                                                </td>

                                                <td style={tdStyle}>
                                                    {ses.session_date}
                                                </td>

                                                <td style={tdStyle}>
                                                    {ses.time_slots.join(', ')}
                                                </td>

                                                <td style={tdStyle}>
                                                    {fmtTime(ses.start_time)}–
                                                    {fmtTime(ses.end_time)}
                                                </td>

                                                <td style={tdStyle}>
                                                    {ses.is_conflict ? (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    '2px 8px',

                                                                borderRadius: 99,

                                                                fontSize: 11,

                                                                fontWeight: 600,

                                                                background:
                                                                    'var(--color-status-danger)',

                                                                color: '#fff',
                                                            }}
                                                        >
                                                            Xung đột
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    '2px 8px',

                                                                borderRadius: 99,

                                                                fontSize: 11,

                                                                fontWeight: 600,

                                                                background:
                                                                    'var(--color-status-success-bg)',

                                                                color: 'var(--color-status-success)',
                                                            }}
                                                        >
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Actions */}

                        <div className={s.actions}>
                            <ButtonPrimary
                                variant="outline"
                                onClick={handleDeleteAndRetry}
                            >
                                Xóa & Cấu hình lại
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

// ============================================================================

// Tab 2: Teacher Unavailability

// ============================================================================

function TeacherUnavailabilityTab() {
    const { alert } = useDialog()

    const [filterTeacherId, setFilterTeacherId] = useState<string>('')

    const [showForm, setShowForm] = useState(false)

    const { data: unavailData, isLoading } = useTeacherUnavailability(
        filterTeacherId || undefined
    )

    const createMutation = useCreateTeacherUnavailability()

    const deleteMutation = useDeleteTeacherUnavailability()

    const { data: teachersData } = useQuery({
        queryKey: ['users', 'teachers', 'unavail-list'],

        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),

        staleTime: 5 * 60_000,
    })

    const [newRecord, setNewRecord] = useState({
        teacher_id: '',

        is_recurring: false,

        unavailable_date: '',

        day_of_week: null as number | null,

        time_slots: null as number[] | null,

        reason: '',

        whole_day: true,
    })

    const handleCreate = () => {
        if (!newRecord.teacher_id) return alert('Chọn giáo viên')

        if (!newRecord.is_recurring && !newRecord.unavailable_date)
            return alert('Chọn ngày bận')

        if (newRecord.is_recurring && newRecord.day_of_week == null)
            return alert('Chọn ngày trong tuần')

        createMutation.mutate(
            {
                teacher_id: newRecord.teacher_id,

                unavailable_date: newRecord.is_recurring
                    ? undefined
                    : newRecord.unavailable_date,

                time_slots: newRecord.whole_day ? null : newRecord.time_slots,

                reason: newRecord.reason,

                is_recurring: newRecord.is_recurring,

                day_of_week: newRecord.is_recurring
                    ? newRecord.day_of_week
                    : undefined,
            },

            {
                onSuccess: () => {
                    setShowForm(false)

                    setNewRecord({
                        teacher_id: '',

                        is_recurring: false,

                        unavailable_date: '',

                        day_of_week: null,

                        time_slots: null,

                        reason: '',

                        whole_day: true,
                    })
                },

                onError: (err: any) => alert('Lỗi: ' + err.message),
            }
        )
    }

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id)
    }

    const records = unavailData?.data || []

    return (
        <div
            style={{
                width: '100%',

                display: 'flex',

                flexDirection: 'column',

                gap: 20,
            }}
        >
            {/* Top bar */}

            <div
                style={{
                    display: 'flex',

                    justifyContent: 'space-between',

                    alignItems: 'center',
                }}
            >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <label style={{ fontSize: 13, fontWeight: 600 }}>
                        Lọc GV:
                    </label>

                    <select
                        value={filterTeacherId}
                        onChange={(e) => setFilterTeacherId(e.target.value)}
                        style={{
                            padding: '6px 12px',

                            borderRadius: 'var(--primitive-radius-sm)',

                            border: '1px solid var(--color-border-soft)',

                            fontSize: 13,

                            background: 'var(--color-surface-card)',

                            color: 'var(--color-text-primary)',
                        }}
                    >
                        <option value="">Tất cả</option>

                        {teachersData?.users?.map((t: any) => (
                            <option key={t.id} value={t.id}>
                                {t.firstName} {t.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <ButtonPrimary size="sm" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Đóng' : '+ Thêm lịch bận'}
                </ButtonPrimary>
            </div>

            {/* Create form */}

            {showForm && (
                <Card title="Thêm lịch bận mới" mode="light">
                    <div
                        style={{
                            display: 'grid',

                            gridTemplateColumns: '1fr 1fr',

                            gap: 16,
                        }}
                    >
                        {/* Teacher select */}

                        <div>
                            <label
                                style={{
                                    fontSize: 13,

                                    fontWeight: 600,

                                    display: 'block',

                                    marginBottom: 6,
                                }}
                            >
                                Giáo viên *
                            </label>

                            <select
                                value={newRecord.teacher_id}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,

                                        teacher_id: e.target.value,
                                    })
                                }
                                style={{
                                    width: '100%',

                                    padding: '8px 12px',

                                    borderRadius: 'var(--primitive-radius-sm)',

                                    border: '1px solid var(--color-border-soft)',

                                    fontSize: 13,

                                    background: 'var(--color-surface-card)',

                                    color: 'var(--color-text-primary)',
                                }}
                            >
                                <option value="">-- Chọn --</option>

                                {teachersData?.users?.map((t: any) => (
                                    <option key={t.id} value={t.id}>
                                        {t.firstName} {t.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Recurring toggle */}

                        <div
                            style={{
                                display: 'flex',

                                alignItems: 'center',

                                gap: 12,
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',

                                    gap: 8,

                                    cursor: 'pointer',

                                    fontSize: 13,

                                    fontWeight: 500,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={newRecord.is_recurring}
                                    onChange={(e) =>
                                        setNewRecord({
                                            ...newRecord,

                                            is_recurring: e.target.checked,
                                        })
                                    }
                                />
                                Lặp hàng tuần
                            </label>
                        </div>

                        {/* Date or Day-of-week */}

                        {newRecord.is_recurring ? (
                            <div>
                                <label
                                    style={{
                                        fontSize: 13,

                                        fontWeight: 600,

                                        display: 'block',

                                        marginBottom: 6,
                                    }}
                                >
                                    Ngày trong tuần *
                                </label>

                                <select
                                    value={newRecord.day_of_week ?? ''}
                                    onChange={(e) =>
                                        setNewRecord({
                                            ...newRecord,

                                            day_of_week:
                                                e.target.value === ''
                                                    ? null
                                                    : Number(e.target.value),
                                        })
                                    }
                                    style={{
                                        width: '100%',

                                        padding: '8px 12px',

                                        borderRadius:
                                            'var(--primitive-radius-sm)',

                                        border: '1px solid var(--color-border-soft)',

                                        fontSize: 13,

                                        background: 'var(--color-surface-card)',

                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    <option value="">-- Chọn --</option>

                                    {DAYS_OF_WEEK.map((d, i) => (
                                        <option key={i} value={i}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <InputField
                                label="Ngày bận *"
                                type="date"
                                value={newRecord.unavailable_date}
                                onChange={(e) =>
                                    setNewRecord({
                                        ...newRecord,

                                        unavailable_date: e.target.value,
                                    })
                                }
                            />
                        )}

                        {/* Whole day toggle */}

                        <div
                            style={{
                                display: 'flex',

                                flexDirection: 'column',

                                gap: 8,
                            }}
                        >
                            <label
                                style={{
                                    display: 'flex',

                                    gap: 8,

                                    cursor: 'pointer',

                                    fontSize: 13,

                                    fontWeight: 500,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={newRecord.whole_day}
                                    onChange={(e) =>
                                        setNewRecord({
                                            ...newRecord,

                                            whole_day: e.target.checked,

                                            time_slots: e.target.checked
                                                ? null
                                                : [1],
                                        })
                                    }
                                />
                                Cả ngày
                            </label>

                            {!newRecord.whole_day && (
                                <div
                                    style={{
                                        display: 'flex',

                                        gap: 6,

                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6].map((slot) => (
                                        <label
                                            key={slot}
                                            style={{
                                                display: 'flex',

                                                gap: 4,

                                                fontSize: 12,

                                                cursor: 'pointer',

                                                padding: '4px 8px',

                                                borderRadius: 4,

                                                background: (
                                                    newRecord.time_slots || []
                                                ).includes(slot)
                                                    ? 'var(--color-brand-primary)'
                                                    : 'var(--color-surface-raised)',

                                                color: (
                                                    newRecord.time_slots || []
                                                ).includes(slot)
                                                    ? '#fff'
                                                    : 'var(--color-text-primary)',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={(
                                                    newRecord.time_slots || []
                                                ).includes(slot)}
                                                onChange={() => {
                                                    const current =
                                                        newRecord.time_slots ||
                                                        []

                                                    const next =
                                                        current.includes(slot)
                                                            ? current.filter(
                                                                  (s) =>
                                                                      s !== slot
                                                              )
                                                            : [...current, slot]

                                                    setNewRecord({
                                                        ...newRecord,

                                                        time_slots: next.length
                                                            ? next
                                                            : null,
                                                    })
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                            Tiết {slot}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reason */}

                        <InputField
                            label="Lý do"
                            value={newRecord.reason}
                            onChange={(e) =>
                                setNewRecord({
                                    ...newRecord,

                                    reason: e.target.value,
                                })
                            }
                            placeholder="VD: Họp hội đồng, nghỉ phép..."
                        />
                    </div>

                    <div className={s.actions} style={{ marginTop: 16 }}>
                        <ButtonPrimary
                            variant="outline"
                            onClick={() => setShowForm(false)}
                        >
                            Hủy
                        </ButtonPrimary>

                        <ButtonPrimary
                            onClick={handleCreate}
                            loading={createMutation.isPending}
                        >
                            Lưu
                        </ButtonPrimary>
                    </div>
                </Card>
            )}

            {/* Table */}

            <Card mode="light">
                {isLoading ? (
                    <div
                        style={{
                            padding: 32,

                            textAlign: 'center',

                            color: 'var(--color-text-muted)',
                        }}
                    >
                        Đang tải...
                    </div>
                ) : records.length === 0 ? (
                    <div
                        style={{
                            padding: 32,

                            textAlign: 'center',

                            color: 'var(--color-text-muted)',
                        }}
                    >
                        Chưa có lịch bận nào
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',

                                borderCollapse: 'collapse',

                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        borderBottom:
                                            '2px solid var(--color-border-soft)',

                                        textAlign: 'left',
                                    }}
                                >
                                    <th style={thStyle}>Giáo viên</th>

                                    <th style={thStyle}>Loại</th>

                                    <th style={thStyle}>Ngày / Thứ</th>

                                    <th style={thStyle}>Tiết</th>

                                    <th style={thStyle}>Lý do</th>

                                    <th style={thStyle}></th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((rec) => {
                                    const teacher = teachersData?.users?.find(
                                        (t: any) => t.id === rec.teacher_id
                                    )

                                    const teacherName = teacher
                                        ? `${teacher.firstName} ${teacher.lastName}`
                                        : rec.teacher_id.slice(0, 8) + '...'

                                    return (
                                        <tr
                                            key={rec.id}
                                            style={{
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            <td style={tdStyle}>
                                                {teacherName}
                                            </td>

                                            <td style={tdStyle}>
                                                <span
                                                    style={{
                                                        padding: '2px 8px',

                                                        borderRadius: 99,

                                                        fontSize: 11,

                                                        background:
                                                            rec.is_recurring
                                                                ? 'var(--color-status-info-bg)'
                                                                : 'var(--color-status-warning-bg)',

                                                        color: rec.is_recurring
                                                            ? 'var(--color-status-info)'
                                                            : 'var(--color-status-warning)',

                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {rec.is_recurring
                                                        ? 'Hàng tuần'
                                                        : 'Một lần'}
                                                </span>
                                            </td>

                                            <td style={tdStyle}>
                                                {rec.is_recurring
                                                    ? DAYS_OF_WEEK[
                                                          rec.day_of_week ?? 0
                                                      ]
                                                    : rec.unavailable_date ||
                                                      '—'}
                                            </td>

                                            <td style={tdStyle}>
                                                {rec.time_slots
                                                    ? `Tiết ${rec.time_slots.join(', ')}`
                                                    : 'Cả ngày'}
                                            </td>

                                            <td style={tdStyle}>
                                                {rec.reason || '—'}
                                            </td>

                                            <td style={tdStyle}>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(rec.id)
                                                    }
                                                    style={{
                                                        background: 'none',

                                                        border: 'none',

                                                        cursor: 'pointer',

                                                        color: 'var(--color-status-danger)',

                                                        fontSize: 13,

                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

// ============================================================================

// Sub-components

// ============================================================================

function TooltipIcon({ text }: { text: string }) {
    const [show, setShow] = useState(false)

    return (
        <span
            style={{
                position: 'relative',

                display: 'inline-flex',

                marginLeft: 6,

                flexShrink: 0,
            }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span
                style={{
                    display: 'inline-flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    width: 16,

                    height: 16,

                    borderRadius: '50%',

                    background: show
                        ? 'var(--color-brand-primary)'
                        : 'var(--color-border-soft)',

                    color: show ? '#fff' : 'var(--color-text-muted)',

                    fontSize: 10,

                    fontWeight: 700,

                    cursor: 'help',

                    transition: 'all 0.15s ease',
                }}
            >
                ?
            </span>

            {show && (
                <span
                    style={{
                        position: 'absolute',

                        bottom: 'calc(100% + 8px)',

                        left: '50%',

                        transform: 'translateX(-50%)',

                        width: 260,

                        padding: '10px 14px',

                        borderRadius: 'var(--primitive-radius-sm)',

                        background: 'var(--color-surface-raised)',

                        color: 'var(--color-text-primary)',

                        fontSize: 12,

                        lineHeight: 1.55,

                        fontWeight: 400,

                        boxShadow: '0 4px 16px rgba(0,0,0,0.14)',

                        border: '1px solid var(--color-border-soft)',

                        zIndex: 100,

                        pointerEvents: 'none',

                        whiteSpace: 'normal',

                        wordBreak: 'break-word',
                    }}
                >
                    {text}

                    {/* Arrow */}

                    <span
                        style={{
                            position: 'absolute',

                            bottom: -5,

                            left: '50%',

                            transform: 'translateX(-50%) rotate(45deg)',

                            width: 8,

                            height: 8,

                            background: 'var(--color-surface-raised)',

                            borderRight: '1px solid var(--color-border-soft)',

                            borderBottom: '1px solid var(--color-border-soft)',
                        }}
                    />
                </span>
            )}
        </span>
    )
}

function SliderField({
    label,

    value,

    min,

    max,

    step,

    onChange,

    tooltip,
}: {
    label: string

    value: number

    min: number

    max: number

    step: number

    onChange: (v: number) => void

    tooltip?: string
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
                style={{
                    display: 'flex',

                    justifyContent: 'space-between',

                    fontSize: 13,

                    alignItems: 'center',
                }}
            >
                <span
                    style={{
                        fontWeight: 500,

                        color: 'var(--color-text-primary)',

                        display: 'inline-flex',

                        alignItems: 'center',
                    }}
                >
                    {label}

                    {tooltip && <TooltipIcon text={tooltip} />}
                </span>

                <span
                    style={{
                        fontWeight: 600,

                        color: 'var(--color-brand-primary)',
                    }}
                >
                    {value}
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    width: '100%',

                    accentColor: 'var(--color-brand-primary)',
                }}
            />
        </div>
    )
}

function StatCard({
    label,

    value,

    color,
}: {
    label: string

    value: string | number

    color?: string
}) {
    return (
        <div
            style={{
                padding: '16px 12px',

                borderRadius: 'var(--primitive-radius-sm)',

                background: 'var(--color-surface-card)',

                border: '1px solid var(--color-border-soft)',

                textAlign: 'center',
            }}
        >
            <div
                style={{
                    fontSize: 22,

                    fontWeight: 700,

                    color: color || 'var(--color-text-primary)',
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize: 11,

                    color: 'var(--color-text-muted)',

                    marginTop: 4,
                }}
            >
                {label}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: GARunStatus }) {
    const map: Record<
        GARunStatus,
        { bg: string; color: string; label: string }
    > = {
        pending: {
            bg: 'var(--color-status-warning-bg)',

            color: 'var(--color-status-warning)',

            label: 'Chờ',
        },

        running: {
            bg: 'var(--color-status-info-bg)',

            color: 'var(--color-status-info)',

            label: 'Đang chạy',
        },

        completed: {
            bg: 'var(--color-status-success-bg)',

            color: 'var(--color-status-success)',

            label: 'Hoàn tất',
        },

        failed: {
            bg: 'var(--color-status-danger-bg)',

            color: 'var(--color-status-danger)',

            label: 'Lỗi',
        },

        applied: {
            bg: 'var(--color-brand-primary)',

            color: '#fff',

            label: 'Đã áp dụng',
        },
    }

    const s = map[status] || map.pending

    return (
        <span
            style={{
                padding: '2px 8px',

                borderRadius: 99,

                fontSize: 11,

                fontWeight: 600,

                background: s.bg,

                color: s.color,
            }}
        >
            {s.label}
        </span>
    )
}

function RunStatusCard({ status }: { status: GARunStatus; detail?: any }) {
    const isPolling = status === 'pending' || status === 'running'

    return (
        <div
            style={{
                padding: 32,

                borderRadius: 'var(--primitive-radius-md)',

                background: 'var(--color-surface-card)',

                border: '1px solid var(--color-border-soft)',

                textAlign: 'center',

                minWidth: 400,
            }}
        >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
                {status === 'pending'
                    ? '⏳'
                    : status === 'running'
                      ? '🧬'
                      : status === 'completed'
                        ? '✅'
                        : '❌'}
            </div>

            <StatusBadge status={status} />

            <div
                style={{
                    fontSize: 14,

                    color: 'var(--color-text-secondary)',

                    marginTop: 12,
                }}
            >
                {status === 'pending' && 'Đang khởi tạo GA...'}

                {status === 'running' &&
                    'Thuật toán đang tối ưu hóa thời khóa biểu...'}

                {status === 'completed' && 'GA đã hoàn tất!'}

                {status === 'failed' && 'GA thất bại.'}
            </div>

            {isPolling && (
                <div
                    style={{
                        marginTop: 16,

                        height: 4,

                        borderRadius: 2,

                        background: 'var(--color-border-soft)',

                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',

                            width: '30%',

                            background: 'var(--color-brand-primary)',

                            borderRadius: 2,

                            animation: 'shimmer 1.5s infinite',
                        }}
                    />
                </div>
            )}
        </div>
    )
}

// ============================================================================

// Helpers

// ============================================================================

const thStyle: React.CSSProperties = {
    padding: '8px 12px',

    fontSize: 12,

    fontWeight: 600,

    color: 'var(--color-text-muted)',
}

const tdStyle: React.CSSProperties = { padding: '10px 12px' }

function fmtTime(t: string): string {
    // "08:00:00" → "08:00"

    return t?.slice(0, 5) || ''
}

function formatDateShort(iso: string): string {
    try {
        const d = new Date(iso)

        return `${d.getDate()}/${d.getMonth() + 1}`
    } catch {
        return iso
    }
}
