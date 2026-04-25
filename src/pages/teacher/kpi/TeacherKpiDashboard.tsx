import { useState } from 'react'
import s from '../../admin/users/UserManagementPage.module.css'
import { KpiPeriodSelector } from '@/components/common/input/KpiPeriodSelector'
import { KpiBreakdownCard } from '@/components/common/card/KpiBreakdownCard'
import { useMyKpiRecord, useCreateKpiDispute } from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useForm } from 'react-hook-form'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { useDialog } from '@/hooks/useDialog'

export default function TeacherKpiDashboard() {
    const { alert } = useDialog()
    const [periodId, setPeriodId] = useState('')

    const { data: myKpi, isLoading } = useMyKpiRecord(periodId || undefined)

    // Dispute state
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)
    const { register, handleSubmit, reset } = useForm({
        defaultValues: { reason: '', sub_reason: '' },
    })
    const disputeMutation = useCreateKpiDispute()

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

                        {/* Chart History placeholder */}
                        <EmptyState
                            title="Biểu đồ lịch sử"
                            description="Lịch sử điểm sẽ được hiển thị khi bạn có đủ dữ liệu >= 2 kỳ."
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
