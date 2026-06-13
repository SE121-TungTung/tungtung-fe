import { useState } from 'react'
import { useSession } from '@/stores/session.store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getSubstitutionRequests,
    acceptSubstitution,
    declineSubstitution,
} from '@/lib/substitutions'
import s from '../../admin/users/UserManagementPage.module.css'
import { KpiPeriodSelector } from '@/components/common/input/KpiPeriodSelector'
import { KpiBreakdownCard } from '@/components/common/card/KpiBreakdownCard'
import {
    useMyKpiRecord,
    useCreateKpiDispute,
    useMyKpiDisputes,
    useStaffKpiHistory,
} from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useForm } from 'react-hook-form'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { useDialog } from '@/hooks/useDialog'
import { motion, AnimatePresence } from 'framer-motion'
import type { StaffKPIHistoryItem } from '@/types/kpi.types'
import Card from '@/components/common/card/Card'

interface KpiHistoryChartProps {
    history: StaffKPIHistoryItem[]
    isLoading?: boolean
    error?: Error | null
}

const KpiHistoryChart: React.FC<KpiHistoryChartProps> = ({
    history,
    isLoading,
    error,
}) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

    if (error) {
        return (
            <Card variant="glass" style={{ padding: '24px' }}>
                <h3
                    style={{
                        margin: '0 0 24px',
                        fontSize: 16,
                        fontWeight: 600,
                    }}
                >
                    Biểu đồ xu hướng KPI
                </h3>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '240px',
                        color: 'var(--color-error, #ef4444)',
                    }}
                >
                    Lỗi tải lịch sử KPI: {error.message}
                </div>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card variant="glass" style={{ padding: '24px' }}>
                <h3
                    style={{
                        margin: '0 0 24px',
                        fontSize: 16,
                        fontWeight: 600,
                    }}
                >
                    Biểu đồ xu hướng KPI
                </h3>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '240px',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    Đang tải dữ liệu biểu đồ...
                </div>
            </Card>
        )
    }

    // Filter and prepare data (oldest first for chronological trend)
    const scoredItems = [...history]
        .reverse()
        .filter(
            (item) => item.total_score != null && item.total_score !== undefined
        )

    console.log('[DEBUG CHART]', { history, scoredItems })

    if (scoredItems.length < 2) {
        return (
            <EmptyState
                title="Biểu đồ lịch sử"
                description="Lịch sử điểm sẽ được hiển thị khi bạn có đủ dữ liệu >= 2 kỳ."
            />
        )
    }

    const maxScore = Math.max(
        ...scoredItems.map((item) => item.total_score || 0),
        1
    )

    return (
        <Card variant="glass" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 600 }}>
                Biểu đồ xu hướng KPI
            </h3>

            <div
                style={{
                    display: 'flex',
                    height: '240px',
                    position: 'relative',
                    paddingLeft: '40px',
                    paddingBottom: '30px',
                }}
            >
                {/* Y-Axis Labels */}
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: '30px',
                        width: '35px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        fontSize: '11px',
                        color: 'var(--color-text-secondary)',
                        opacity: 0.8,
                        paddingRight: '8px',
                    }}
                >
                    <span>{Math.round(maxScore * 100)}%</span>
                    <span>{Math.round(maxScore * 75)}%</span>
                    <span>{Math.round(maxScore * 50)}%</span>
                    <span>{Math.round(maxScore * 25)}%</span>
                    <span>0%</span>
                </div>

                {/* Grid Lines */}
                <div
                    style={{
                        position: 'absolute',
                        left: '40px',
                        right: 0,
                        top: 0,
                        bottom: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        pointerEvents: 'none',
                    }}
                >
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: '100%',
                                borderBottom:
                                    i === 4
                                        ? '2px solid var(--color-border-medium)'
                                        : '1px dashed var(--color-border-soft)',
                                height: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Bars Container */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'flex-end',
                        height: '100%',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {scoredItems.map((item, idx) => {
                        const scoreVal = item.total_score || 0
                        const pct = (scoreVal / maxScore) * 100
                        const isHovered = hoveredIdx === idx

                        return (
                            <div
                                key={item.period_id}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: `${80 / scoredItems.length}%`,
                                    maxWidth: '80px',
                                    height: '100%',
                                    justifyContent: 'flex-end',
                                    position: 'relative',
                                }}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                {/* Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${pct}%` }}
                                    transition={{
                                        duration: 0.8,
                                        ease: 'easeOut',
                                    }}
                                    style={{
                                        width: '100%',
                                        background:
                                            'linear-gradient(180deg, var(--color-brand-primary) 0%, rgba(99, 102, 241, 0.6) 100%)',
                                        borderRadius: '6px 6px 0 0',
                                        cursor: 'pointer',
                                        boxShadow: isHovered
                                            ? '0 0 15px rgba(99, 102, 241, 0.4)'
                                            : '0 4px 6px -1px rgba(99, 102, 241, 0.1)',
                                        position: 'relative',
                                    }}
                                />

                                {/* X-Axis Label */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '-25px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: 'var(--color-text-secondary)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {item.period_name}
                                </div>

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            style={{
                                                position: 'absolute',
                                                bottom: `${pct + 5}%`,
                                                backgroundColor:
                                                    'rgba(15, 23, 42, 0.95)',
                                                backdropFilter: 'blur(4px)',
                                                color: '#fff',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                width: '160px',
                                                boxShadow:
                                                    '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                                zIndex: 10,
                                                pointerEvents: 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    borderBottom:
                                                        '1px solid rgba(255, 255, 255, 0.15)',
                                                    paddingBottom: '4px',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                {item.period_name}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                }}
                                            >
                                                <span>Điểm KPI:</span>
                                                <strong
                                                    style={{ color: '#818cf8' }}
                                                >
                                                    {(scoreVal * 100).toFixed(
                                                        1
                                                    )}
                                                    %
                                                </strong>
                                            </div>
                                            {item.bonus_amount != null && (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                    }}
                                                >
                                                    <span>Thưởng:</span>
                                                    <strong
                                                        style={{
                                                            color: '#34d399',
                                                        }}
                                                    >
                                                        {new Intl.NumberFormat(
                                                            'vi-VN',
                                                            {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                                maximumFractionDigits: 0,
                                                            }
                                                        ).format(
                                                            item.bonus_amount
                                                        )}
                                                    </strong>
                                                </div>
                                            )}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                    marginTop: '2px',
                                                }}
                                            >
                                                <span>Trạng thái:</span>
                                                <span
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        backgroundColor:
                                                            item.approval_status ===
                                                            'APPROVED'
                                                                ? 'rgba(52, 211, 153, 0.2)'
                                                                : 'rgba(251, 191, 36, 0.2)',
                                                        color:
                                                            item.approval_status ===
                                                            'APPROVED'
                                                                ? '#34d399'
                                                                : '#fbbf24',
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {item.approval_status ===
                                                    'APPROVED'
                                                        ? 'Đã duyệt'
                                                        : item.approval_status ===
                                                            'SUBMITTED'
                                                          ? 'Chờ duyệt'
                                                          : 'Nháp'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}

export default function TeacherKpiDashboard() {
    const { alert } = useDialog()
    const [periodId, setPeriodId] = useState('')
    const user = useSession((s) => s.user)

    const { data: myKpi, isLoading } = useMyKpiRecord(periodId || undefined)
    const { data: disputesData } = useMyKpiDisputes({ page: 1, limit: 100 })
    const {
        data: historyData,
        isLoading: isHistoryLoading,
        error: historyError,
    } = useStaffKpiHistory(user?.id)

    // Log the API states for debugging
    console.log('[DEBUG KPI HISTORY]', {
        userId: user?.id,
        historyData,
        isHistoryLoading,
        historyError: historyError
            ? {
                  ...(historyError as any),
                  message: (historyError as any).message,
              }
            : null,
    })

    // Dispute state
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)
    const { register, handleSubmit, reset } = useForm({
        defaultValues: { reason: '', sub_reason: '' },
    })
    const disputeMutation = useCreateKpiDispute()

    const queryClient = useQueryClient()

    const { data: subRequests } = useQuery({
        queryKey: ['substitutions', 'list'],
        queryFn: getSubstitutionRequests,
    })

    const acceptMutation = useMutation({
        mutationFn: acceptSubstitution,
        onSuccess: () => {
            alert('Đã đồng ý nhận dạy thế thành công!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
            queryClient.invalidateQueries({ queryKey: ['schedule'] })
        },
        onError: (err: any) => {
            alert(err?.message || 'Có lỗi xảy ra khi đồng ý.')
        },
    })

    const declineMutation = useMutation({
        mutationFn: declineSubstitution,
        onSuccess: () => {
            alert('Đã từ chối nhận dạy thế.', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
            queryClient.invalidateQueries({ queryKey: ['schedule'] })
        },
        onError: (err: any) => {
            alert(err?.message || 'Có lỗi xảy ra khi từ chối.')
        },
    })

    const pendingIncomingRequests = (subRequests || []).filter((req) => {
        return (
            req.target_substitute_id === user?.id &&
            (req.status === 'PENDING' || req.status === 'ACCEPTED')
        )
    })

    // Build dynamic criteria options from KPI record metrics
    const criteriaOptions = myKpi
        ? myKpi.metrics
              .filter((m) => !m.is_group_header)
              .map((m) => ({
                  label: `${m.metric_code} — ${m.metric_name}`,
                  value: m.metric_code,
              }))
        : []

    const onDispute = (form: { reason: string; sub_reason: string }) => {
        if (!myKpi) return
        disputeMutation.mutate(
            {
                kpi_record_id: myKpi.id,
                reason: `[${form.sub_reason}] ${form.reason}`,
            },
            {
                onSuccess: () => {
                    alert(
                        'Đã gửi khiếu nại thành công. Vui lòng chờ bộ phận Quản lý nhân sự phản hồi.'
                    )
                    setIsDisputeOpen(false)
                    reset()
                },
                onError: (e: Error) => alert(e.message || 'Lỗi gửi khiếu nại.'),
            }
        )
    }

    return (
        <div
            className={s.pageWrapperWithoutHeader}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '24px',
                    }}
                >
                    <h1 className={s.pageTitle} style={{ marginBottom: 0 }}>
                        KPI của tôi
                    </h1>
                    <KpiPeriodSelector
                        value={periodId}
                        onChange={setPeriodId}
                        label="Chọn kỳ xem dữ liệu"
                    />
                </div>

                {/* Pending incoming substitution requests */}
                {pendingIncomingRequests.length > 0 && (
                    <div
                        style={{
                            background:
                                'linear-gradient(135deg, #fef08a 0%, #fef9c3 100%)',
                            border: '1px solid #fef08a',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#854d0e',
                                margin: '0 0 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <span>🔔</span> Yêu cầu dạy thế chờ bạn xác nhận (
                            {pendingIncomingRequests.length})
                        </h2>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            {pendingIncomingRequests.map((req) => {
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
                                            border: '1px solid #fef08a',
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
                                                    fontSize: '12px',
                                                    color: '#854d0e',
                                                    marginBottom: '4px',
                                                }}
                                            >
                                                Người yêu cầu:{' '}
                                                <strong>
                                                    {
                                                        req.requesting_teacher_name
                                                    }
                                                </strong>
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
                                                    color: '#475569',
                                                    display: 'flex',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
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
                                                        margin: '6px 0 0 0',
                                                        fontSize: '13px',
                                                        color: '#64748b',
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    <strong>Lý do vắng:</strong>{' '}
                                                    {req.reason}
                                                </p>
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
                                                    acceptMutation.isPending ||
                                                    declineMutation.isPending
                                                }
                                                onClick={() =>
                                                    declineMutation.mutate(
                                                        req.id
                                                    )
                                                }
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
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
                                                    acceptMutation.isPending ||
                                                    declineMutation.isPending
                                                }
                                                onClick={() =>
                                                    acceptMutation.mutate(
                                                        req.id
                                                    )
                                                }
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: '#16a34a',
                                                    color: '#fff',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Đồng ý nhận dạy
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div style={{ padding: '24px' }}>Đang tải dữ liệu...</div>
                ) : myKpi ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '24px',
                        }}
                    >
                        <KpiBreakdownCard data={myKpi} readOnly={true} />

                        {/* Feature to dispute */}
                        {myKpi.approval_status !== 'DRAFT' && (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <ButtonGhost
                                    onClick={() => setIsDisputeOpen(true)}
                                >
                                    Gửi khiếu nại điểm KPI
                                </ButtonGhost>
                            </div>
                        )}

                        {/* Chart History */}
                        <KpiHistoryChart
                            history={historyData || []}
                            isLoading={isHistoryLoading}
                            error={historyError}
                        />
                    </div>
                ) : (
                    <EmptyState
                        title="Không có dữ liệu"
                        description={
                            periodId
                                ? 'Hệ thống chưa ghi nhận điểm KPI của bạn trong kỳ này.'
                                : 'Vui lòng chọn kỳ đánh giá.'
                        }
                    />
                )}

                {/* Disputes History */}
                {disputesData && disputesData.data.length > 0 && (
                    <div
                        style={{
                            marginTop: '32px',
                            background: 'var(--color-surface-card, #fff)',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border-soft, #e2e8f0)',
                            padding: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '18px',
                                fontWeight: 600,
                                marginBottom: '16px',
                                color: 'var(--color-text-primary, #1e293b)',
                            }}
                        >
                            Lịch sử khiếu nại KPI
                        </h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom:
                                                '1px solid var(--color-border-medium, #cbd5e1)',
                                            color: 'var(--color-text-muted, #64748b)',
                                            fontWeight: 500,
                                        }}
                                    >
                                        <th style={{ padding: '12px 8px' }}>
                                            Ngày gửi
                                        </th>
                                        <th style={{ padding: '12px 8px' }}>
                                            Kỳ KPI
                                        </th>
                                        <th style={{ padding: '12px 8px' }}>
                                            Nội dung khiếu nại
                                        </th>
                                        <th style={{ padding: '12px 8px' }}>
                                            Trạng thái
                                        </th>
                                        <th style={{ padding: '12px 8px' }}>
                                            Phản hồi từ Admin
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disputesData.data.map((disp: any) => (
                                        <tr
                                            key={disp.id}
                                            style={{
                                                borderBottom:
                                                    '1px solid var(--color-border-soft, #f1f5f9)',
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding: '12px 8px',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {new Date(
                                                    disp.created_at
                                                ).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px 8px',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {disp.period_name || '—'}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px 8px',
                                                    maxWidth: '300px',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {disp.reason}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '4px 8px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                        textTransform:
                                                            'uppercase',
                                                        background:
                                                            disp.status ===
                                                            'RESOLVED'
                                                                ? 'rgba(34, 197, 94, 0.1)'
                                                                : disp.status ===
                                                                    'REJECTED'
                                                                  ? 'rgba(239, 68, 68, 0.1)'
                                                                  : 'rgba(234, 179, 8, 0.1)',
                                                        color:
                                                            disp.status ===
                                                            'RESOLVED'
                                                                ? '#16a34a'
                                                                : disp.status ===
                                                                    'REJECTED'
                                                                  ? '#dc2626'
                                                                  : '#ca8a04',
                                                    }}
                                                >
                                                    {disp.status === 'RESOLVED'
                                                        ? 'Đồng ý'
                                                        : disp.status ===
                                                            'REJECTED'
                                                          ? 'Từ chối'
                                                          : 'Đang xử lý'}
                                                </span>
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px 8px',
                                                    color: 'var(--color-text-secondary, #475569)',
                                                }}
                                            >
                                                {disp.resolution_note || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            <Modal
                isOpen={isDisputeOpen}
                onClose={() => setIsDisputeOpen(false)}
                title="Khởi tạo Giấy tiếp nhận khiếu nại"
                footer={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            width: '100%',
                        }}
                    >
                        <ButtonGhost onClick={() => setIsDisputeOpen(false)}>
                            Hủy
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleSubmit(onDispute)}
                            disabled={disputeMutation.isPending}
                        >
                            Gửi yêu cầu
                        </ButtonPrimary>
                    </div>
                }
            >
                <form
                    onSubmit={handleSubmit(onDispute)}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            color: 'var(--color-text-secondary)',
                            fontSize: '14px',
                        }}
                    >
                        Mỗi khiếu nại chỉ xét trên 1 tiêu chí điểm.
                    </p>
                    <SelectField
                        label="Tiêu chí cần xem lại"
                        registration={register('sub_reason')}
                        options={
                            criteriaOptions.length > 0
                                ? criteriaOptions
                                : [
                                      {
                                          label: 'Không có tiêu chí',
                                          value: 'N/A',
                                      },
                                  ]
                        }
                    />
                    <InputField
                        label="Giải trình chi tiết"
                        {...register('reason')}
                        placeholder="VD: Tuần 2 tôi đã xin phép và có minh chứng..."
                    />
                </form>
            </Modal>
        </div>
    )
}
