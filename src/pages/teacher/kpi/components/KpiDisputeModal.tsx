import { useForm } from 'react-hook-form'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import type { KPIRecordDetail, MetricResultResponse } from '@/types/kpi.types'

interface KpiDisputeModalProps {
    isOpen: boolean
    onClose: () => void
    myKpi?: KPIRecordDetail | null
    onSubmit: (form: { reason: string; sub_reason: string }) => void
    isSubmitting: boolean
}

export default function KpiDisputeModal({
    isOpen,
    onClose,
    myKpi,
    onSubmit,
    isSubmitting,
}: KpiDisputeModalProps) {
    const { register, handleSubmit, reset } = useForm({
        defaultValues: { reason: '', sub_reason: '' },
    })

    const criteriaOptions = myKpi?.metrics
        ? myKpi.metrics
              .filter((m: MetricResultResponse) => !m.is_group_header)
              .map((m: MetricResultResponse) => ({
                  label: `${m.metric_code} — ${m.metric_name}`,
                  value: m.metric_code,
              }))
        : []

    const handleFormSubmit = (data: { reason: string; sub_reason: string }) => {
        onSubmit(data)
        reset()
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
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
                    <ButtonGhost onClick={handleClose}>Hủy</ButtonGhost>
                    <ButtonPrimary
                        onClick={handleSubmit(handleFormSubmit)}
                        disabled={isSubmitting}
                    >
                        Gửi yêu cầu
                    </ButtonPrimary>
                </div>
            }
        >
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
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
    )
}
