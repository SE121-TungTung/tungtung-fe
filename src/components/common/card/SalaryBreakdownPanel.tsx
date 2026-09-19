import React from 'react'
import Card from '@/components/common/card/Card'
import type { Salary } from '@/types/kpi.types'
import { ButtonPrimary } from '../button/ButtonPrimary'
import { StatusBadge } from '@/components/common/typography/StatusBadge'

interface SalaryBreakdownPanelProps {
    data?: Salary
    readOnly?: boolean
    onApprove?: () => void
    isApproving?: boolean
    onPay?: () => void
    isPaying?: boolean
}

export const SalaryBreakdownPanel: React.FC<SalaryBreakdownPanelProps> = ({
    data,
    readOnly = true,
    onApprove,
    isApproving = false,
    onPay,
    isPaying = false,
}) => {
    if (!data) return null

    const formatVND = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val)
    }

    const {
        base_salary_calc,
        kpi_bonus_calc,
        fixed_allowance,
        total_adjustments,
        net_salary,
        status,
    } = data

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <h3 style={{ margin: 0 }}>
                    Chi tiết Phiếu lương ({data.period})
                </h3>
                <StatusBadge
                    variant={
                        status === 'APPROVED' || status === 'PAID'
                            ? 'success'
                            : 'warning'
                    }
                    label={
                        status === 'APPROVED'
                            ? 'Đã duyệt'
                            : status === 'PAID'
                              ? 'Đã thanh toán'
                              : 'Bản nháp'
                    }
                />
            </div>

            <Card variant="glass" style={{ padding: '24px' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '12px',
                    }}
                >
                    {/* Fixed Component */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed var(--color-border-soft)',
                            paddingBottom: '12px',
                        }}
                    >
                        <div>
                            <strong>Lương cơ bản / Đơn giá tiết dạy</strong>
                            <div
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Dựa trên hợp đồng {data.contract_type}
                            </div>
                        </div>
                        <div style={{ fontSize: '16px' }}>
                            {formatVND(base_salary_calc)}
                        </div>
                    </div>

                    {/* KPI Bonus */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed var(--color-border-soft)',
                            paddingBottom: '12px',
                        }}
                    >
                        <div>
                            <strong>Thưởng hiệu suất KPI</strong>
                        </div>
                        <div
                            style={{
                                fontSize: '16px',
                                color: 'var(--color-brand-primary)',
                            }}
                        >
                            + {formatVND(kpi_bonus_calc)}
                        </div>
                    </div>

                    {/* Allowances */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed var(--color-border-soft)',
                            paddingBottom: '12px',
                        }}
                    >
                        <div>
                            <strong>Phụ cấp cố định</strong>
                        </div>
                        <div style={{ fontSize: '16px' }}>
                            + {formatVND(fixed_allowance)}
                        </div>
                    </div>

                    {/* Adjustments */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px dashed var(--color-border-soft)',
                            paddingBottom: '12px',
                        }}
                    >
                        <div>
                            <strong>Các khoản điều chỉnh phát sinh</strong>
                            <div
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Phụ cấp thêm / Khấu trừ (Xem tab điều chỉnh)
                            </div>
                        </div>
                        <div
                            style={{
                                fontSize: '16px',
                                color:
                                    total_adjustments >= 0
                                        ? 'var(--color-brand-primary)'
                                        : 'var(--color-status-error)',
                            }}
                        >
                            {total_adjustments > 0 ? '+' : ''}{' '}
                            {formatVND(total_adjustments)}
                        </div>
                    </div>

                    {/* TOTAL */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '12px',
                            padding: '16px',
                            backgroundColor: 'var(--color-surface-raised)',
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            Thực nhận (Net)
                        </div>
                        <div
                            style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: 'var(--color-brand-primary)',
                            }}
                        >
                            {formatVND(net_salary)}
                        </div>
                    </div>
                </div>
            </Card>

            {!readOnly && status === 'DRAFT' && onApprove && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '16px',
                    }}
                >
                    <ButtonPrimary onClick={onApprove} disabled={isApproving}>
                        Duyệt phiếu lương này
                    </ButtonPrimary>
                </div>
            )}

            {!readOnly && status === 'APPROVED' && onPay && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '16px',
                    }}
                >
                    <ButtonPrimary onClick={onPay} disabled={isPaying}>
                        Thanh toán lương này
                    </ButtonPrimary>
                </div>
            )}
        </div>
    )
}
