import { useState } from 'react'
import s from './TeacherSalary.module.css'
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
    const [period, setPeriod] = useState<string>('')

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

    const handlePeriodChange = (val: string) => {
        setPeriod(val)
        setPage(1)
    }

    return (
        <div className={s.pageContainer}>
            <main className={s.mainContent}>
                <div className={s.headerRow}>
                    <h1 className={s.pageTitle}>Lịch sử Lương</h1>
                    <PeriodSelector
                        value={period}
                        onChange={handlePeriodChange}
                        label="Lọc theo tháng"
                        showAll
                    />
                </div>

                <Card variant="outline" className={s.tableCard}>
                    {isLoading ? (
                        <div className={s.loadingBox}>Đang tải...</div>
                    ) : items.length > 0 ? (
                        <>
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        <th className={s.th}>Kỳ lương</th>
                                        <th className={s.th}>Hợp đồng</th>
                                        <th className={s.th}>Lương cứng</th>
                                        <th className={s.th}>Thưởng KPI</th>
                                        <th className={s.th}>Thực nhận</th>
                                        <th className={s.th}>Trạng thái</th>
                                        <th className={s.th} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {history?.data?.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className={s.td}>
                                                {item.period}
                                            </td>
                                            <td className={s.td}>
                                                {item.contract_type}
                                            </td>
                                            <td className={s.td}>
                                                {formatVND(
                                                    item.base_salary_calc
                                                )}
                                            </td>
                                            <td
                                                className={s.td}
                                                style={{
                                                    color: 'var(--color-brand-primary)',
                                                }}
                                            >
                                                +
                                                {formatVND(item.kpi_bonus_calc)}
                                            </td>
                                            <td
                                                className={`${s.td} ${s.tdBold}`}
                                            >
                                                {formatVND(item.net_salary)}
                                            </td>
                                            <td className={s.td}>
                                                <StatusBadge
                                                    variant={
                                                        item.status ===
                                                            'APPROVED' ||
                                                        item.status === 'PAID'
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                    label={
                                                        item.status ===
                                                        'APPROVED'
                                                            ? 'Đã duyệt'
                                                            : item.status ===
                                                                'PAID'
                                                              ? 'Đã TT'
                                                              : 'Đang xử lý'
                                                    }
                                                />
                                            </td>
                                            <td className={s.td}>
                                                <ButtonPrimary
                                                    onClick={() =>
                                                        navigate(
                                                            `/teacher/salary/${item.id}`
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
                                    <div className={s.paginationRow}>
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
