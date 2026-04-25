import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { PeriodSelector } from '@/components/common/input/PeriodSelector'
import { useNavigate } from 'react-router-dom'
import { useSalaries } from '@/hooks/domain/useKpi'
import Pagination from '@/components/common/menu/Pagination'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { EmptyState } from '@/components/common/state/EmptyState'
import { useTableParams } from '@/hooks/useTableParams'

export default function AdminPayrollListPage() {
    const navigate = useNavigate()
    const [period, setPeriod] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })

    const { page, setPage, pageSize } = useTableParams({})
    const { data: salaryData, isLoading } = useSalaries({
        period,
        page,
        limit: pageSize,
    })

    const formatVND = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val)
    }

    const items = salaryData?.data || []

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div style={{ width: '100%', marginBottom: '16px' }}>
                    <h1 className={s.pageTitle} style={{ marginBottom: 0 }}>
                        Quản lý Bảng Lương
                    </h1>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-end',
                        marginBottom: '24px',
                    }}
                >
                    <div style={{ flex: '0 0 220px' }}>
                        <PeriodSelector
                            value={period}
                            onChange={setPeriod}
                            label="Chọn bảng lương tháng"
                        />
                    </div>
                    <ButtonPrimary
                        onClick={() => navigate('/admin/payroll/run')}
                    >
                        Chạy bảng lương
                    </ButtonPrimary>
                </div>

                <Card variant="outline" className={s.tableCard}>
                    {isLoading ? (
                        <div style={{ padding: '24px' }}>
                            Đang tải dữ liệu...
                        </div>
                    ) : items.length > 0 ? (
                        <>
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    textAlign: 'left',
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Hợp đồng
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Kỳ lương
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Lương cứng
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Thưởng KPI
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Thực nhận
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Trạng thái
                                        </th>
                                        <th
                                            style={{
                                                padding: '12px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((s) => (
                                        <tr key={s.id}>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                }}
                                            >
                                                {s.contract_type}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                }}
                                            >
                                                {s.period}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                }}
                                            >
                                                {formatVND(s.base_salary_calc)}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                    color: 'var(--color-brand-primary)',
                                                }}
                                            >
                                                +{formatVND(s.kpi_bonus_calc)}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {formatVND(s.net_salary)}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                }}
                                            >
                                                <StatusBadge
                                                    variant={
                                                        s.status ===
                                                            'APPROVED' ||
                                                        s.status === 'PAID'
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                    label={
                                                        s.status === 'APPROVED'
                                                            ? 'Đã duyệt'
                                                            : s.status ===
                                                                'PAID'
                                                              ? 'Đã TT'
                                                              : 'Nháp'
                                                    }
                                                />
                                            </td>
                                            <td
                                                style={{
                                                    padding: '12px',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                }}
                                            >
                                                <ButtonPrimary
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/payroll/${s.id}`
                                                        )
                                                    }
                                                >
                                                    Chi tiết
                                                </ButtonPrimary>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <Pagination
                                    currentPage={page}
                                    totalPages={
                                        salaryData?.meta?.total_pages || 0
                                    }
                                    onPageChange={setPage}
                                />
                            </div>
                        </>
                    ) : (
                        <EmptyState
                            title="Bảng lương trống"
                            description={`Chưa có dữ liệu tính lương cho tháng ${period}.`}
                        />
                    )}
                </Card>
            </main>
        </div>
    )
}
