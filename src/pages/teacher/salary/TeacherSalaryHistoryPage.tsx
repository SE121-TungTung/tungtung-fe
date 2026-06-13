import { useState } from 'react'
import s from '../../admin/users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { PeriodSelector } from '@/components/common/input/PeriodSelector'
import { useNavigate } from 'react-router-dom'
import { useMySalaryHistory } from '@/hooks/domain/useKpi'
import Pagination from '@/components/common/menu/Pagination'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { EmptyState } from '@/components/common/state/EmptyState'
export default function TeacherSalaryHistoryPage() {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [period, setPeriod] = useState<string>(() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })

    const { data: history, isLoading } = useMySalaryHistory({
        period: period,
        page,
        limit: 10,
    })

    const formatVND = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val)
    }

    const items = history?.data || []

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
                        Lịch sử Lương
                    </h1>
                    <PeriodSelector
                        value={period}
                        onChange={setPeriod}
                        label="Lọc theo tháng"
                    />
                </div>

                <Card variant="outline" className={s.tableCard}>
                    {isLoading ? (
                        <div style={{ padding: '24px' }}>Đang tải...</div>
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
                                            Kỳ lương
                                        </th>
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
                                        />
                                    </tr>
                                </thead>
                                <tbody>
                                    {history?.data?.map((s: any) => (
                                        <tr key={s.id}>
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
                                                {s.contract_type}
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
                                                              : 'Đang xử lý'
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
                                                            `/teacher/salary/${s.id}`
                                                        )
                                                    }
                                                >
                                                    Xem phiếu
                                                </ButtonPrimary>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {history &&
                                history.meta &&
                                history.meta.total_pages > 1 && (
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
                                                history.meta.total_pages
                                            }
                                            onPageChange={setPage}
                                        />
                                    </div>
                                )}
                        </>
                    ) : (
                        <EmptyState
                            title="Trống"
                            description="Bạn chưa có dữ liệu lịch sử lương nào."
                        />
                    )}
                </Card>
            </main>
        </div>
    )
}
