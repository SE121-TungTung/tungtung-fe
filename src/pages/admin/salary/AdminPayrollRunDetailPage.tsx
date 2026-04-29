import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import s from '../users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { EmptyState } from '@/components/common/state/EmptyState'
import { usePayrollRunDetail, useSalaries } from '@/hooks/domain/useKpi'
import ButtonGhost from '@/components/common/button/ButtonGhost'

export default function AdminPayrollRunDetailPage() {
    const { runId } = useParams<{ runId: string }>()
    const navigate = useNavigate()

    const { data: run, isLoading: isRunLoading } = usePayrollRunDetail(runId)

    const { data: salariesData, isLoading: isSalariesLoading } = useSalaries(
        { period: run?.period, limit: 100 },
        { enabled: !!run?.period }
    )

    const salaries = salariesData?.data || []
    const isLoading = isRunLoading || isSalariesLoading

    const formatVND = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val || 0)
    }

    if (isLoading) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <div style={{ padding: '24px' }}>
                        Đang tải dữ liệu đợt chạy lương...
                    </div>
                </main>
            </div>
        )
    }

    if (!run) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <main className={s.mainContent}>
                    <EmptyState
                        title="Không tìm thấy"
                        description="Không tìm thấy thông tin đợt chạy lương này."
                    />
                    <ButtonGhost onClick={() => navigate('/admin/payroll')}>
                        Quay lại
                    </ButtonGhost>
                </main>
            </div>
        )
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 24,
                    }}
                >
                    <ButtonGhost
                        onClick={() => navigate('/admin/payroll')}
                        style={{ padding: '8px' }}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </ButtonGhost>
                    <div>
                        <h1 className={s.pageTitle} style={{ marginBottom: 4 }}>
                            Chi tiết Đợt chạy lương
                        </h1>
                        <p
                            style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: 14,
                            }}
                        >
                            ID: {run.id}
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 16,
                        marginBottom: 24,
                    }}
                >
                    <Card variant="outline" style={{ padding: 16 }}>
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 8,
                            }}
                        >
                            Kỳ lương
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 600 }}>
                            {run.period}
                        </p>
                    </Card>
                    <Card variant="outline" style={{ padding: 16 }}>
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 8,
                            }}
                        >
                            Trạng thái
                        </p>
                        <StatusBadge
                            variant={
                                run.status === 'COMPLETED'
                                    ? 'success'
                                    : run.status === 'FAILED'
                                      ? 'danger'
                                      : 'warning'
                            }
                            label={run.status}
                        />
                    </Card>
                    <Card variant="outline" style={{ padding: 16 }}>
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 8,
                            }}
                        >
                            Số bản ghi
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 600 }}>
                            {run.total_processed}
                        </p>
                    </Card>
                    <Card variant="outline" style={{ padding: 16 }}>
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 8,
                            }}
                        >
                            Ngày tạo
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 600 }}>
                            {run.created_at
                                ? new Date(run.created_at).toLocaleString(
                                      'vi-VN'
                                  )
                                : '—'}
                        </p>
                    </Card>
                </div>

                {run.error_log && (
                    <Card
                        variant="outline"
                        style={{
                            padding: 16,
                            marginBottom: 24,
                            borderLeft: '4px solid var(--color-status-danger)',
                        }}
                    >
                        <p
                            style={{
                                fontWeight: 600,
                                color: 'var(--color-status-danger)',
                                marginBottom: 8,
                            }}
                        >
                            Lỗi khi chạy:
                        </p>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                fontSize: 13,
                                color: 'var(--color-status-danger)',
                            }}
                        >
                            {run.error_log}
                        </pre>
                    </Card>
                )}

                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                    Danh sách Lương ({salaries?.length || 0})
                </h2>

                <Card variant="outline" className={s.tableCard}>
                    {salaries && salaries.length > 0 ? (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'left',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={thStyle}>Giáo viên</th>
                                    <th style={thStyle}>Lương cơ bản</th>
                                    <th style={thStyle}>Thưởng KPI</th>
                                    <th style={thStyle}>Thực nhận</th>
                                    <th style={thStyle}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaries.map((s: any) => (
                                    <tr key={s.id}>
                                        <td
                                            style={{
                                                ...tdStyle,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {s.teacher_name || '—'}
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: 'var(--color-text-secondary)',
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {s.contract_type}
                                            </div>
                                        </td>
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
                            title="Không có bản ghi"
                            description="Đợt chạy này không tạo ra bản ghi lương nào."
                        />
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
