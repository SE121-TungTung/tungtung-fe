import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import {
    useRevenueReport,
    useExpensesReport,
    useProfitReport,
    useDebtsReport,
    useCreateExportJob,
} from '@/hooks/domain/useFinance'
import s from './Finance.module.css'

function StatCard({
    title,
    value,
    icon,
    color = 'var(--color-brand-primary)',
}: any) {
    return (
        <Card
            variant="glass"
            style={{ padding: '20px', borderLeft: `4px solid ${color}` }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                <div>
                    <p
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 600,
                        }}
                    >
                        {title}
                    </p>
                    <h3
                        style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}
                    >
                        {value}
                    </h3>
                </div>
                <div
                    style={{
                        padding: '10px',
                        background: `${color}15`,
                        borderRadius: '12px',
                        color: color,
                    }}
                >
                    {icon}
                </div>
            </div>
        </Card>
    )
}

function RevenueTab() {
    const { data: revRes, isLoading } = useRevenueReport('', '', true)
    const { mutate: exportJob } = useCreateExportJob()

    if (isLoading) return <div>Đang tải...</div>
    const rev = revRes
    if (!rev)
        return <EmptyState title="Lỗi" description="Không lấy được bao cáo" />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={s.statsRow}>
                <StatCard
                    title="Tổng doanh thu"
                    value={`${rev.total_revenue.toLocaleString()} đ`}
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                    }
                    color="var(--color-status-success-dark, #02bc2a)"
                />
                <StatCard
                    title="Số lượng Hóa đơn"
                    value={rev.total_invoices}
                    icon={<FileText />}
                />
                <StatCard
                    title="Trung bình HS/HĐ"
                    value={`${rev.avg_payment_value.toLocaleString()} đ`}
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    }
                />
            </div>

            <Card
                variant="outline"
                className={s.tableCard}
                style={{ padding: 0 }}
            >
                <div
                    style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--color-border-soft)',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '16px' }}>
                        Doanh thu theo khóa học
                    </h3>
                    <button
                        onClick={() =>
                            exportJob(
                                { report_type: 'REVENUE' },
                                {
                                    onSuccess: () =>
                                        alert(
                                            'Đã khởi tạo yêu cầu xuất Excel.'
                                        ),
                                }
                            )
                        }
                        className="flex items-center gap-2 text-sm text-brand-primary font-semibold hover:underline"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>{' '}
                        Xuất Excel
                    </button>
                </div>
                <div className={s.tableWrapper}>
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Khóa học</th>
                                <th>Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rev.breakdown.map((b: any) => (
                                <tr key={b.course_id} className={s.tableRow}>
                                    <td className={s.tdName}>
                                        {b.course_name}
                                    </td>
                                    <td className={s.tdAmount}>
                                        {b.revenue.toLocaleString()} đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

function ExpenseTab() {
    const { data: expRes, isLoading } = useExpensesReport('', '', 'ALL')
    if (isLoading) return <div>Đang tải...</div>
    const exp = expRes
    if (!exp)
        return <EmptyState title="Lỗi" description="Không lấy được báo cáo" />

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={s.statsRow}>
                <StatCard
                    title="Tổng chi phí"
                    value={`${exp.total_expenses.toLocaleString()} đ`}
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                            <polyline points="17 18 23 18 23 12"></polyline>
                        </svg>
                    }
                    color="var(--color-status-danger)"
                />
                <StatCard
                    title="Lương giáo viên"
                    value={`${exp.total_salary.toLocaleString()} đ`}
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    }
                    color="var(--color-status-warning-dark, #bca51b)"
                />
                <StatCard
                    title="Vận hành"
                    value={`${exp.total_operations.toLocaleString()} đ`}
                    icon={
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    }
                    color="var(--color-status-info)"
                />
            </div>
            {/* Breakdown table */}
        </div>
    )
}

function ProfitTab() {
    const { data: profRes, isLoading } = useProfitReport()
    if (isLoading) return <div>Đang tải...</div>
    const prof = profRes
    if (!prof) return null

    return (
        <div className={s.statsRow}>
            <StatCard
                title="Doanh thu"
                value={`${prof.total_revenue.toLocaleString()} đ`}
                icon={
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                }
                color="var(--color-status-success-dark, #02bc2a)"
            />
            <StatCard
                title="Chi phí"
                value={`${prof.total_expenses.toLocaleString()} đ`}
                icon={
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                        <polyline points="17 18 23 18 23 12"></polyline>
                    </svg>
                }
                color="var(--color-status-danger)"
            />
            <StatCard
                title="Lợi nhuận ròng"
                value={`${prof.net_profit.toLocaleString()} đ`}
                icon={
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                }
                color="var(--color-brand-primary)"
            />
            <StatCard
                title="Biên lợi nhuận (Margin)"
                value={`${prof.profit_margin.toFixed(2)}%`}
                icon={
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                }
                color="var(--color-brand-accent)"
            />
        </div>
    )
}

function DebtTab() {
    const { data: debtsRes, isLoading } = useDebtsReport(1, 50)
    if (isLoading) return <div>Đang tải...</div>
    const debts = debtsRes?.data || []

    return (
        <Card variant="outline" className={s.tableCard} style={{ padding: 0 }}>
            <div className={s.tableWrapper}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th>Học viên</th>
                            <th>SĐT</th>
                            <th>Khóa học</th>
                            <th>Số tiền nợ</th>
                            <th>Quá hạn</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debts.map((d, idx) => (
                            <tr key={idx} className={s.tableRow}>
                                <td className={s.tdName}>{d.student_name}</td>
                                <td>{d.phone || '—'}</td>
                                <td>{d.course_name || '—'}</td>
                                <td
                                    className={s.tdAmount}
                                    style={{
                                        color: 'var(--color-status-danger)',
                                    }}
                                >
                                    {d.debt_amount.toLocaleString()} đ
                                </td>
                                <td>
                                    <span
                                        className={`${s.badge} ${s.badgePending}`}
                                    >
                                        {d.days_overdue > 0
                                            ? `${d.days_overdue} ngày`
                                            : 'Chưa đến hạn'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}

function FileText(props: any) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    )
}

export default function AdminFinanceReportPage() {
    const [tab, setTab] = useState<'REVENUE' | 'EXPENSE' | 'PROFIT' | 'DEBT'>(
        'REVENUE'
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                    }}
                >
                    Báo cáo Tài chính
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Theo dõi doanh thu, chi phí, lợi nhuận và công nợ của trung
                    tâm.
                </p>
            </div>

            <Card
                variant="outline"
                style={{ padding: '0 16px', borderRadius: '12px' }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '24px',
                        borderBottom: '1px solid var(--color-border-soft)',
                    }}
                >
                    {[
                        { id: 'REVENUE', label: 'Doanh thu' },
                        { id: 'EXPENSE', label: 'Chi phí' },
                        { id: 'PROFIT', label: 'Lợi nhuận tổng hợp' },
                        { id: 'DEBT', label: 'Công nợ' },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            style={{
                                padding: '16px 8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                color:
                                    tab === t.id
                                        ? 'var(--color-brand-primary)'
                                        : 'var(--color-text-secondary)',
                                borderBottom:
                                    tab === t.id
                                        ? '2px solid var(--color-brand-primary)'
                                        : '2px solid transparent',
                                marginBottom: '-1px',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </Card>

            <div style={{ minHeight: '400px' }}>
                {tab === 'REVENUE' && <RevenueTab />}
                {tab === 'EXPENSE' && <ExpenseTab />}
                {tab === 'PROFIT' && <ProfitTab />}
                {tab === 'DEBT' && <DebtTab />}
            </div>
        </div>
    )
}
