import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/core/Modal'
import TabMenu from '@/components/common/menu/TabMenu'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { EmptyState } from '@/components/common/state/EmptyState'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { useForm } from 'react-hook-form'
import { useDialog } from '@/hooks/useDialog'
import type { User } from '@/types/user.types'
import type { TeacherPayrollConfigUpdate } from '@/types/kpi.types'
import {
    useTeacherPayrollConfig,
    useUpdateTeacherPayrollConfig,
    useTeacherSalaryHistory,
} from '@/hooks/domain/useKpi'

interface TeacherFinanceModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
}

const TABS = [
    { label: 'Cấu hình lương', value: 'config' },
    { label: 'Lịch sử lương', value: 'history' },
]

export const TeacherFinanceModal: React.FC<TeacherFinanceModalProps> = ({
    isOpen,
    onClose,
    user,
}) => {
    const { alert } = useDialog()
    const [activeTab, setActiveTab] = useState('config')

    // Data fetching
    const { data: config, isLoading: isConfigLoading } =
        useTeacherPayrollConfig(
            isOpen && activeTab === 'config' ? user?.id : undefined
        )
    const { data: historyRes, isLoading: isHistoryLoading } =
        useTeacherSalaryHistory(
            isOpen && activeTab === 'history' ? user?.id : undefined,
            { limit: 10 }
        )

    const updateConfigMutation = useUpdateTeacherPayrollConfig()

    // Form
    const { register, handleSubmit, reset } =
        useForm<TeacherPayrollConfigUpdate>({
            defaultValues: {
                contract_type: 'PART_TIME',
                base_salary: 0,
                lesson_rate: 0,
                max_kpi_bonus: 0,
                fixed_allowance: 0,
            },
        })

    // Reset form when config data changes
    useEffect(() => {
        if (config) {
            reset({
                contract_type: config.contract_type || 'PART_TIME',
                base_salary: config.base_salary || 0,
                lesson_rate: config.lesson_rate || 0,
                max_kpi_bonus: config.max_kpi_bonus || 0,
                fixed_allowance: config.fixed_allowance || 0,
            })
        }
    }, [config, reset])

    // Reset active tab when modal is reopened
    useEffect(() => {
        if (isOpen) setActiveTab('config')
    }, [isOpen])

    const onSubmitConfig = (data: TeacherPayrollConfigUpdate) => {
        if (!user) return
        updateConfigMutation.mutate(
            { teacherId: user.id, payload: data },
            {
                onSuccess: () => {
                    alert('Lưu cấu hình lương thành công', 'Thành công')
                },
                onError: (err: any) => {
                    alert(err.message || 'Lỗi khi lưu cấu hình', 'Lỗi')
                },
            }
        )
    }

    const formatVND = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val || 0)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Tài chính - ${user?.firstName} ${user?.lastName || ''}`}
            footer={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}
                >
                    <ButtonGhost onClick={onClose}>Đóng</ButtonGhost>
                    {activeTab === 'config' && (
                        <ButtonPrimary
                            onClick={handleSubmit(onSubmitConfig)}
                            disabled={
                                updateConfigMutation.isPending ||
                                isConfigLoading
                            }
                        >
                            {updateConfigMutation.isPending
                                ? 'Đang lưu...'
                                : 'Lưu thay đổi'}
                        </ButtonPrimary>
                    )}
                </div>
            }
        >
            <div style={{ marginBottom: 24 }}>
                <TabMenu
                    items={TABS}
                    value={activeTab}
                    onChange={setActiveTab}
                    fullWidth
                    variant="flat"
                />
            </div>

            {activeTab === 'config' && (
                <div>
                    {isConfigLoading ? (
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            Đang tải cấu hình...
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit(onSubmitConfig)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <SelectField
                                label="Loại hợp đồng"
                                registration={register('contract_type')}
                                options={[
                                    {
                                        label: 'Toàn thời gian (FULL_TIME)',
                                        value: 'FULL_TIME',
                                    },
                                    {
                                        label: 'Bán thời gian (PART_TIME)',
                                        value: 'PART_TIME',
                                    },
                                    {
                                        label: 'Giáo viên bản ngữ (NATIVE)',
                                        value: 'NATIVE',
                                    },
                                ]}
                            />

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16,
                                }}
                            >
                                <InputField
                                    label="Lương cứng cơ bản"
                                    type="number"
                                    min={0}
                                    {...register('base_salary', {
                                        valueAsNumber: true,
                                    })}
                                />
                                <InputField
                                    label="Thù lao 1 giờ dạy / 1 buổi"
                                    type="number"
                                    min={0}
                                    {...register('lesson_rate', {
                                        valueAsNumber: true,
                                    })}
                                />
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 16,
                                }}
                            >
                                <InputField
                                    label="Thưởng KPI tối đa"
                                    type="number"
                                    min={0}
                                    {...register('max_kpi_bonus', {
                                        valueAsNumber: true,
                                    })}
                                />
                                <InputField
                                    label="Phụ cấp cố định"
                                    type="number"
                                    min={0}
                                    {...register('fixed_allowance', {
                                        valueAsNumber: true,
                                    })}
                                />
                            </div>
                        </form>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div>
                    {isHistoryLoading ? (
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            Đang tải lịch sử lương...
                        </div>
                    ) : historyRes?.data && historyRes.data.length > 0 ? (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={thStyle}>Kỳ lương</th>
                                    <th style={thStyle}>Lương cơ bản</th>
                                    <th style={thStyle}>Thưởng KPI</th>
                                    <th style={thStyle}>Thực nhận</th>
                                    <th style={thStyle}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyRes.data.map((s) => (
                                    <tr key={s.id}>
                                        <td style={tdStyle}>{s.period}</td>
                                        <td style={tdStyle}>
                                            {formatVND(s.base_salary_calc)}
                                        </td>
                                        <td
                                            style={{
                                                ...tdStyle,
                                                color: 'var(--color-brand-primary)',
                                            }}
                                        >
                                            +{formatVND(s.kpi_bonus_calc)}
                                        </td>
                                        <td
                                            style={{
                                                ...tdStyle,
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {formatVND(s.net_salary)}
                                        </td>
                                        <td style={tdStyle}>
                                            <StatusBadge
                                                variant={
                                                    s.status === 'APPROVED' ||
                                                    s.status === 'PAID'
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                                label={
                                                    s.status === 'APPROVED'
                                                        ? 'Đã duyệt'
                                                        : s.status === 'PAID'
                                                          ? 'Đã TT'
                                                          : 'Nháp'
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            title="Không có dữ liệu"
                            description="Giáo viên này chưa có lịch sử nhận lương."
                        />
                    )}
                </div>
            )}
        </Modal>
    )
}

const thStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid var(--color-border-soft)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
    fontSize: 13,
}

const tdStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid var(--color-border-soft)',
    fontSize: 14,
}
