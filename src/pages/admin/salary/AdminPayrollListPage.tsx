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
import TabMenu from '@/components/common/menu/TabMenu'
import { usePayrollRuns } from '@/hooks/domain/useKpi'

export default function AdminPayrollListPage() {
    const navigate = useNavigate()
    const [period, setPeriod] = useState<string>('')
    const [activeTab, setActiveTab] = useState('details')

    // The backend API for salaries still expects the "YYYY-MM" string format.
    const { page, setPage, pageSize } = useTableParams({})
    const { data: salaryData, isLoading } = useSalaries({
        period: period,
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

    const { data: runsData, isLoading: isRunsLoading } = usePayrollRuns()
    const runsItems = runsData || []

    const TABS = [
        { label: 'Bảng lương chi tiết', value: 'details' },
        { label: 'Lịch sử Đợt chạy', value: 'runs' },
    ]

    const handlePeriodChange = (val: string) => {
        setPeriod(val)
        setPage(0)
    }

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
                        justifyContent: 'space-between',
                    }}
                >
                    <div style={{ flex: 1, maxWidth: 400 }}>
                        <TabMenu
                            items={TABS}
                            value={activeTab}
                            onChange={setActiveTab}
                            fullWidth
                            variant="flat"
                        />
                    </div>

                    <ButtonPrimary
                        onClick={() => navigate('/admin/payroll/run')}
                    >
                        Chạy bảng lương
                    </ButtonPrimary>
                </div>

                <Card variant="outline" className={s.tableCard}>
                    {activeTab === 'details' && (
                        <>
                            <div
                                style={{
                                    padding: '16px 24px',
                                    borderBottom:
                                        '1px solid var(--color-border-soft)',
                                }}
                            >
                                <div style={{ maxWidth: 260 }}>
                                    <PeriodSelector
                                        value={period}
                                        onChange={handlePeriodChange}
                                        label="Lọc theo tháng"
                                        showAll
                                    />
                                </div>
                            </div>
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
                                                    Giáo viên
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
                                            {items.map((s: any) => (
                                                <tr key={s.id}>
                                                    <td
                                                        style={{
                                                            padding: '12px',
                                                            borderBottom:
                                                                '1px solid var(--color-border-soft)',
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {s.teacher_name || '—'}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '12px',
                                                            borderBottom:
                                                                '1px solid var(--color-border-soft)',
                                                        }}
                                                    >
                                                        {s.contract_type ===
                                                        'FULL_TIME'
                                                            ? 'Toàn thời gian'
                                                            : s.contract_type ===
                                                                'PART_TIME'
                                                              ? 'Bán thời gian'
                                                              : s.contract_type ===
                                                                  'NATIVE'
                                                                ? 'Bản ngữ'
                                                                : s.contract_type}
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
                                                        {formatVND(
                                                            s.base_salary_calc
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '12px',
                                                            borderBottom:
                                                                '1px solid var(--color-border-soft)',
                                                            color: 'var(--color-brand-primary)',
                                                        }}
                                                    >
                                                        +
                                                        {formatVND(
                                                            s.kpi_bonus_calc
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: '12px',
                                                            borderBottom:
                                                                '1px solid var(--color-border-soft)',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {formatVND(
                                                            s.net_salary
                                                        )}
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
                                                                s.status ===
                                                                    'PAID'
                                                                    ? 'success'
                                                                    : 'warning'
                                                            }
                                                            label={
                                                                s.status ===
                                                                'APPROVED'
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
                                                salaryData?.meta?.total_pages ||
                                                0
                                            }
                                            onPageChange={setPage}
                                        />
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    title="Bảng lương trống"
                                    description={`Chưa có dữ liệu tính lương cho tháng ${period || ''}.`}
                                />
                            )}
                        </>
                    )}

                    {activeTab === 'runs' && (
                        <>
                            {isRunsLoading ? (
                                <div style={{ padding: '24px' }}>
                                    Đang tải dữ liệu...
                                </div>
                            ) : runsItems.length > 0 ? (
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
                                            <th style={thStyle}>Trạng thái</th>
                                            <th style={thStyle}>Số bản ghi</th>
                                            <th style={thStyle}>Ngày chạy</th>
                                            <th style={thStyle}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {runsItems.map((run: any) => (
                                            <tr key={run.id}>
                                                <td
                                                    style={{
                                                        ...tdStyle,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {run.period}
                                                </td>
                                                <td style={tdStyle}>
                                                    <StatusBadge
                                                        variant={
                                                            run.status ===
                                                            'COMPLETED'
                                                                ? 'success'
                                                                : run.status ===
                                                                    'FAILED'
                                                                  ? 'danger'
                                                                  : 'warning'
                                                        }
                                                        label={run.status}
                                                    />
                                                </td>
                                                <td style={tdStyle}>
                                                    {run.total_processed || 0}
                                                </td>
                                                <td style={tdStyle}>
                                                    {run.created_at
                                                        ? new Date(
                                                              run.created_at
                                                          ).toLocaleString(
                                                              'vi-VN'
                                                          )
                                                        : '—'}
                                                </td>
                                                <td style={tdStyle}>
                                                    <ButtonPrimary
                                                        variant="ghost"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/payroll-runs/${run.id}`
                                                            )
                                                        }
                                                    >
                                                        Xem chi tiết →
                                                    </ButtonPrimary>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <EmptyState
                                    title="Chưa có đợt chạy lương"
                                    description="Hệ thống chưa ghi nhận lịch sử đợt chạy lương nào."
                                />
                            )}
                        </>
                    )}
                </Card>
            </main>
        </div>
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
