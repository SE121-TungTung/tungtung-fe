import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import { useParams, useNavigate } from 'react-router-dom'
import TabMenu from '@/components/common/menu/TabMenu'
import { SalaryBreakdownPanel } from '@/components/common/card/SalaryBreakdownPanel'
import {
    useSalaryDetail,
    useApproveSalary,
    useAddSalaryAdjustment,
} from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import { useDialog } from '@/hooks/useDialog'
import { useForm } from 'react-hook-form'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'
import type { SalaryAdjustmentCreate } from '@/types/kpi.types'

export default function AdminSalaryDetailPage() {
    const { salaryId } = useParams()
    const navigate = useNavigate()
    const { alert } = useDialog()
    const [activeTab, setActiveTab] = useState('detail')

    const { data: salary, isLoading } = useSalaryDetail(salaryId)
    const approveMutation = useApproveSalary()
    const adjustmentMutation = useAddSalaryAdjustment()

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<SalaryAdjustmentCreate>({
        defaultValues: { adjustment_type: 'ALLOWANCE', amount: 0, reason: '' },
    })

    const handleApprove = () => {
        if (!salaryId) return
        approveMutation.mutate(salaryId, {
            onSuccess: () => alert('Đã chốt phiếu lương cho giáo viên này.'),
            onError: (err: any) =>
                alert(err?.message || 'Có lỗi xảy ra khi chốt lương.'),
        })
    }

    const onAddAdjustment = (data: SalaryAdjustmentCreate) => {
        if (!salaryId) return
        adjustmentMutation.mutate(
            { salaryId, payload: data },
            {
                onSuccess: () => {
                    alert('Đã thêm điều chỉnh lương thành công.')
                    reset()
                },
                onError: (err: any) =>
                    alert(err?.message || 'Lỗi khi thêm điều chỉnh.'),
            }
        )
    }

    if (isLoading)
        return <div style={{ padding: '24px' }}>Đang tải dữ liệu...</div>
    if (!salary)
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <EmptyState
                        title="Không tìm thấy"
                        description="Phiếu lương không tồn tại."
                    />
                </main>
            </div>
        )

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '24px',
                    }}
                >
                    <ButtonGhost onClick={() => navigate('/admin/payroll')}>
                        ← Quay lại
                    </ButtonGhost>
                    <h1
                        className={s.pageTitle}
                        style={{ marginBottom: 0, flex: 1 }}
                    >
                        Chi tiết Lương Giáo viên
                    </h1>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <TabMenu
                        items={[
                            { label: 'Phiếu lương', value: 'detail' },
                            { label: 'Thêm Điều chỉnh', value: 'adjustment' },
                        ]}
                        value={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                {activeTab === 'detail' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <SalaryBreakdownPanel
                            data={salary}
                            readOnly={false}
                            onApprove={handleApprove}
                            isApproving={approveMutation.isPending}
                        />

                        {/* List existing adjustments if any */}
                    </div>
                )}

                {activeTab === 'adjustment' && (
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <Card
                            variant="glass"
                            title="Thêm khoản phát sinh/khấu trừ"
                        >
                            <form
                                onSubmit={handleSubmit(onAddAdjustment)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                }}
                            >
                                <SelectField
                                    label="Loại điều chỉnh"
                                    registration={register('adjustment_type')}
                                    options={[
                                        {
                                            label: 'Cộng thêm (Phụ cấp)',
                                            value: 'ALLOWANCE',
                                        },
                                        {
                                            label: 'Trừ đi (Khấu trừ)',
                                            value: 'DEDUCTION',
                                        },
                                    ]}
                                    disabled={salary.status !== 'DRAFT'}
                                />
                                <InputField
                                    label="Số tiền (VNĐ)"
                                    type="number"
                                    {...register('amount', {
                                        valueAsNumber: true,
                                        min: 1,
                                    })}
                                    disabled={salary.status !== 'DRAFT'}
                                />
                                <InputField
                                    label="Mô tả lý do"
                                    {...register('reason')}
                                    disabled={salary.status !== 'DRAFT'}
                                />

                                {salary.status === 'DRAFT' ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            marginTop: '16px',
                                        }}
                                    >
                                        <ButtonPrimary
                                            type="submit"
                                            disabled={
                                                isSubmitting ||
                                                adjustmentMutation.isPending
                                            }
                                        >
                                            Lưu điều chỉnh
                                        </ButtonPrimary>
                                    </div>
                                ) : (
                                    <p
                                        style={{
                                            color: 'var(--color-status-warning-text)',
                                            fontSize: '13px',
                                        }}
                                    >
                                        Phiếu lương đã chốt nên không thể chỉnh
                                        sửa thêm.
                                    </p>
                                )}
                            </form>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}
