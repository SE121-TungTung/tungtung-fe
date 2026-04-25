import { useState } from 'react'
import s from './AdminKpiOverviewPage.module.css'
import sharedS from '../users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { PeriodSelector } from '@/components/common/input/PeriodSelector'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/state/EmptyState'
import { useKpiSummary } from '@/hooks/domain/useKpi'
import StatCard from '@/components/common/card/StatCard'
import type { KpiSummaryItem } from '@/types/kpi.types'

function getScoreColor(score: number): string {
    if (score >= 85) return '#22c55e'
    if (score >= 70) return '#3b82f6'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
}

function getTierBadge(tier: string) {
    const colors: Record<string, { bg: string; fg: string }> = {
        S: { bg: '#7c3aed20', fg: '#7c3aed' },
        A: { bg: '#22c55e20', fg: '#16a34a' },
        B: { bg: '#3b82f620', fg: '#2563eb' },
        C: { bg: '#f59e0b20', fg: '#d97706' },
        D: { bg: '#ef444420', fg: '#dc2626' },
    }
    const c = colors[tier.toUpperCase()] ?? { bg: '#64748b20', fg: '#64748b' }
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 36,
                padding: '2px 10px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 800,
                background: c.bg,
                color: c.fg,
                letterSpacing: '0.04em',
            }}
        >
            {tier}
        </span>
    )
}

function ScoreBadge({ score }: { score: number }) {
    const color = getScoreColor(score)
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 52,
                padding: '3px 10px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                background: `${color}18`,
                color: color,
                border: `1.5px solid ${color}40`,
            }}
        >
            {score.toFixed(1)}
        </span>
    )
}

export default function AdminKpiOverviewPage() {
    const navigate = useNavigate()
    const [period, setPeriod] = useState(() => {
        const d = new Date()
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    })
    const [page, setPage] = useState(1)
    const limit = 15

    const {
        data: summary,
        isLoading,
        isError,
    } = useKpiSummary({ period, page, limit })

    const items: KpiSummaryItem[] = summary?.data ?? []
    const meta = summary?.meta

    // Aggregate stats from current page data
    const avgScore = items.length
        ? items.reduce((acc, i) => acc + i.total_kpi_score, 0) / items.length
        : 0
    const tierACount = items.filter(
        (i) => i.tier.toUpperCase() === 'A' || i.tier.toUpperCase() === 'S'
    ).length

    return (
        <div className={sharedS.pageWrapperWithoutHeader}>
            <main className={sharedS.mainContent}>
                {/* Header */}
                <div style={{ width: '100%', marginBottom: 8 }}>
                    <h1 className={sharedS.pageTitle}>Tổng quan KPI</h1>
                </div>

                {/* Controls */}
                <div
                    style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-end',
                        width: '100%',
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ flex: '0 0 220px' }}>
                        <PeriodSelector
                            value={period}
                            onChange={(p) => {
                                setPeriod(p)
                                setPage(1)
                            }}
                            label="Chọn kỳ đánh giá"
                        />
                    </div>
                    <ButtonPrimary
                        onClick={() =>
                            navigate(`/admin/kpi/calculation?period=${period}`)
                        }
                    >
                        Chạy tính KPI
                    </ButtonPrimary>
                </div>

                {/* Stat Cards */}
                {!isLoading && items.length > 0 && (
                    <div className={s.statsRow}>
                        <StatCard
                            title="Tổng giáo viên"
                            value={meta?.total ?? items.length}
                            unit="người"
                            mode="light"
                        />
                        <StatCard
                            title="Điểm KPI TB"
                            value={avgScore.toFixed(1)}
                            unit="/ 100"
                            mode="light"
                        />
                        <StatCard
                            title="Xuất sắc (A/S)"
                            value={tierACount}
                            unit="người"
                            mode="light"
                        />
                        <StatCard
                            title="Trạng thái kỳ"
                            value={meta?.period_status ?? '—'}
                            mode="light"
                        />
                    </div>
                )}

                {/* Table */}
                <Card
                    variant="outline"
                    className={sharedS.tableCard}
                    style={{ padding: 0 }}
                >
                    {isLoading ? (
                        <div className={s.loadingWrapper}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={s.skeletonRow} />
                            ))}
                        </div>
                    ) : isError ? (
                        <EmptyState
                            title="Lỗi tải dữ liệu"
                            description="Không thể kết nối đến máy chủ. Vui lòng thử lại."
                        />
                    ) : items.length === 0 ? (
                        <EmptyState
                            title="Chưa có dữ liệu KPI"
                            description={`Kỳ ${period} chưa được tính KPI. Bấm "Chạy tính KPI" để bắt đầu.`}
                        />
                    ) : (
                        <>
                            <div className={s.tableWrapper}>
                                <table className={s.table}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Giáo viên</th>
                                            <th>Điểm KPI</th>
                                            <th>Bậc</th>
                                            <th>Điểm danh</th>
                                            <th>Phản hồi</th>
                                            <th>Kết quả HT</th>
                                            <th>Kiểm định</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr
                                                key={item.teacher_id}
                                                className={s.tableRow}
                                            >
                                                <td className={s.tdIndex}>
                                                    {(page - 1) * limit +
                                                        idx +
                                                        1}
                                                </td>
                                                <td className={s.tdName}>
                                                    {item.teacher_name}
                                                </td>
                                                <td>
                                                    <ScoreBadge
                                                        score={
                                                            item.total_kpi_score
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    {getTierBadge(item.tier)}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {item.metrics.attendance.toFixed(
                                                        0
                                                    )}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {item.metrics.feedback.toFixed(
                                                        0
                                                    )}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {item.metrics.learning_outcome.toFixed(
                                                        0
                                                    )}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {item.metrics.academic_audit.toFixed(
                                                        0
                                                    )}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`${s.statusChip} ${s[`status_${item.status}`] ?? ''}`}
                                                    >
                                                        {item.status ===
                                                        'calculated'
                                                            ? 'Đã tính'
                                                            : item.status ===
                                                                'approved'
                                                              ? 'Đã duyệt'
                                                              : item.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className={s.detailBtn}
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/kpi/teacher/${item.teacher_id}?period=${period}`
                                                            )
                                                        }
                                                    >
                                                        Chi tiết →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {meta && meta.total_pages > 1 && (
                                <div className={s.pagination}>
                                    <button
                                        className={s.pageBtn}
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
                                        ← Trước
                                    </button>
                                    <span className={s.pageInfo}>
                                        Trang {page} / {meta.total_pages} —{' '}
                                        {meta.total} giáo viên
                                    </span>
                                    <button
                                        className={s.pageBtn}
                                        disabled={page >= meta.total_pages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Sau →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            </main>
        </div>
    )
}
