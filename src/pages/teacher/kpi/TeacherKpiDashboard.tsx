import React, { useState } from 'react'
import s from '../../admin/users/UserManagementPage.module.css'
import { PeriodSelector } from '@/components/common/input/PeriodSelector'
import { KpiBreakdownCard } from '@/components/common/card/KpiBreakdownCard'
import { useMyKpi, useCreateKpiDispute } from '@/hooks/domain/useKpi'
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
    const [period, setPeriod] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })

    const { data: myKpi, isLoading } = useMyKpi(period)

    // Dispute state
    const [isDisputeOpen, setIsDisputeOpen] = useState(false)
    const { register, handleSubmit, reset } = useForm({
        defaultValues: { reason: '', sub_reason: 'C_ATTENDANCE' },
    })
    const disputeMutation = useCreateKpiDispute()

    const onDispute = (form: any) => {
        if (!myKpi) return
        disputeMutation.mutate(
            { kpi_id: myKpi.id, reason: `[${form.sub_reason}] ${form.reason}` },
            {
                onSuccess: () => {
                    alert(
                        'Đã gửi khiếu nại thành công. Vui lòng chờ bộ phận Quản lý nhân sự phản hồi.'
                    )
                    setIsDisputeOpen(false)
                    reset()
                },
                onError: (e: any) => alert(e.message || 'Lỗi gửi khiếu nại.'),
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
                    <PeriodSelector
                        value={period}
                        onChange={setPeriod}
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
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <ButtonGhost onClick={() => setIsDisputeOpen(true)}>
                                Gửi khiếu nại điểm KPI
                            </ButtonGhost>
                        </div>

                        {/* Chart History would go here */}
                        <EmptyState
                            title="Biểu đồ lịch sử"
                            description="Lịch sử điểm sẽ được hiển thị khi bạn có đủ dữ liệu >= 3 tháng."
                        />
                    </div>
                ) : (
                    <EmptyState
                        title="Không có dữ liệu"
                        description={`Hệ thống chưa ghi nhận điểm KPI tháng ${period} của bạn.`}
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
                        options={[
                            { label: 'Chuyên cần', value: 'C_ATTENDANCE' },
                            {
                                label: 'Đánh giá từ học viên',
                                value: 'C_REVIEWS',
                            },
                            {
                                label: 'Điểm số của học viên',
                                value: 'C_TEST_SCORES',
                            },
                            {
                                label: 'Tỉ lệ tái đăng ký',
                                value: 'C_RETENTION',
                            },
                        ]}
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
