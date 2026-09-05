import { useState, useCallback } from 'react'
import { useSession } from '@/stores/session.store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getSubstitutionRequests,
    acceptSubstitution,
    declineSubstitution,
} from '@/lib/substitutions'
import s from './TeacherKpiDashboard.module.css'
import { KpiPeriodSelector } from '@/components/common/input/KpiPeriodSelector'
import { KpiBreakdownCard } from '@/components/common/card/KpiBreakdownCard'
import {
    useMyKpiRecord,
    useCreateKpiDispute,
    useMyKpiDisputes,
    useStaffKpiHistory,
} from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useDialog } from '@/hooks/useDialog'

// Subcomponents
import KpiHistoryChart from './components/KpiHistoryChart'
import SubstitutionRequestsBanner from './components/SubstitutionRequestsBanner'
import KpiDisputesTable from './components/KpiDisputesTable'
import KpiDisputeModal from './components/KpiDisputeModal'

export default function TeacherKpiDashboard() {
    const { alert } = useDialog()
    const [periodId, setPeriodId] = useState('')
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)
    const user = useSession((store) => store.user)
    const queryClient = useQueryClient()

    // 1. Data fetching
    const { data: myKpi, isLoading } = useMyKpiRecord(periodId || undefined)
    const { data: disputesData } = useMyKpiDisputes({ page: 1, limit: 100 })
    const {
        data: historyData,
        isLoading: isHistoryLoading,
        error: historyError,
    } = useStaffKpiHistory(user?.id)

    const { data: subRequests } = useQuery({
        queryKey: ['substitutions', 'list'],
        queryFn: getSubstitutionRequests,
    })

    // 2. Mutations
    const acceptMutation = useMutation({
        mutationFn: acceptSubstitution,
        onSuccess: () => {
            alert('Đã đồng ý nhận dạy thế thành công!', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['substitutions'] })
            queryClient.invalidateQueries({ queryKey: ['schedule'] })
        },
        onError: (err: Error) => {
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
        onError: (err: Error) => {
            alert(err?.message || 'Có lỗi xảy ra khi từ chối.')
        },
    })

    const disputeMutation = useCreateKpiDispute()

    const handleDisputeSubmit = useCallback(
        (form: { reason: string; sub_reason: string }) => {
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
                    },
                    onError: (e: Error) =>
                        alert(e.message || 'Lỗi gửi khiếu nại.'),
                }
            )
        },
        [myKpi, disputeMutation, alert]
    )

    const pendingIncomingRequests = (subRequests || []).filter((req) => {
        return (
            req.target_substitute_id === user?.id &&
            (req.status === 'PENDING' || req.status === 'ACCEPTED')
        )
    })

    return (
        <div className={s.pageContainer}>
            <main className={s.mainContent}>
                <div className={s.headerRow}>
                    <h1 className={s.pageTitle}>KPI của tôi</h1>
                    <KpiPeriodSelector
                        value={periodId}
                        onChange={setPeriodId}
                        label="Chọn kỳ xem dữ liệu"
                    />
                </div>

                {/* Banner yêu cầu dạy thế */}
                <SubstitutionRequestsBanner
                    requests={pendingIncomingRequests}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onDecline={(id) => declineMutation.mutate(id)}
                    isActionPending={
                        acceptMutation.isPending || declineMutation.isPending
                    }
                />

                {/* Nội dung KPI */}
                {isLoading ? (
                    <div className={s.loadingState}>Đang tải dữ liệu...</div>
                ) : myKpi ? (
                    <div className={s.kpiContentGrid}>
                        <KpiBreakdownCard data={myKpi} readOnly={true} />

                        {myKpi.approval_status !== 'DRAFT' && (
                            <div className={s.disputeActionRow}>
                                <ButtonGhost
                                    onClick={() => setIsDisputeOpen(true)}
                                >
                                    Gửi khiếu nại điểm KPI
                                </ButtonGhost>
                            </div>
                        )}

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

                {/* Bảng lịch sử khiếu nại */}
                <KpiDisputesTable disputes={disputesData?.data || []} />
            </main>

            <KpiDisputeModal
                isOpen={isDisputeOpen}
                onClose={() => setIsDisputeOpen(false)}
                myKpi={myKpi}
                onSubmit={handleDisputeSubmit}
                isSubmitting={disputeMutation.isPending}
            />
        </div>
    )
}
