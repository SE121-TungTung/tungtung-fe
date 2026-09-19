import { useState, useCallback } from 'react'
import s from './AdminKpiOverviewPage.module.css'
import sharedS from '../users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/state/EmptyState'
import { useKpiRecords, useKpiDashboard } from '@/hooks/domain/useKpi'
import StatCard from '@/components/common/card/StatCard'
import { KpiPeriodSelector } from '@/components/common/input/KpiPeriodSelector'
import type { KPIRecordListItem, ApprovalStatus } from '@/types/kpi.types'

function getScoreColor(score: number): string {
    if (score >= 0.85) return '#22c55e'
    if (score >= 0.7) return '#3b82f6'
    if (score >= 0.5) return '#f59e0b'
    return '#ef4444'
}

function ScoreBadge({ score }: { score: number | null | undefined }) {
    if (score == null) return <span style={{ color: '#94a3b8' }}>—</span>
    const pct = score <= 1 ? (score * 100).toFixed(1) : score.toFixed(1)
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
            {pct}%
        </span>
    )
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
    const map: Record<
        ApprovalStatus,
        { bg: string; fg: string; label: string }
    > = {
        DRAFT: { bg: '#64748b18', fg: '#64748b', label: 'Nháp' },
        SUBMITTED: { bg: '#3b82f618', fg: '#2563eb', label: 'Chờ duyệt' },
        APPROVED: { bg: '#22c55e18', fg: '#16a34a', label: 'Đã duyệt' },
        REJECTED: { bg: '#ef444418', fg: '#dc2626', label: 'Từ chối' },
    }
    const c = map[status] ?? map.DRAFT
    return (
        <span
            className={s.statusChip}
            style={{ background: c.bg, color: c.fg }}
        >
            {c.label}
        </span>
    )
}

function formatCurrency(v: number | null | undefined): string {
    if (v == null) return '—'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(v)
}

import { CreateKpiPeriodModal } from './CreateKpiPeriodModal'

export default function AdminKpiOverviewPage() {
    const navigate = useNavigate()
    const [periodId, setPeriodId] = useState('')
    const [page, setPage] = useState(1)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const limit = 15

    const handlePeriodChange = useCallback((id: string) => {
        setPeriodId(id)
        setPage(1)
    }, [])

    const {
        data: recordsResult,
        isLoading,
        isError,
    } = useKpiRecords({ period_id: periodId, page, limit })

    const { data: dashboard } = useKpiDashboard(periodId || undefined)

    const items: KPIRecordListItem[] = recordsResult?.data ?? []
    const meta = recordsResult?.meta

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
                    <KpiPeriodSelector
                        value={periodId}
                        onChange={handlePeriodChange}
                        label="Chọn kỳ đánh giá"
                    />
                    <ButtonPrimary
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{
                            background:
                                'var(--color-status-success-dark, #02bc2a)',
                            borderColor:
                                'var(--color-status-success-dark, #02bc2a)',
                        }}
                    >
                        Tạo kỳ mới
                    </ButtonPrimary>
                    <ButtonPrimary
                        onClick={() =>
                            navigate(
                                `/admin/kpi/calculation${periodId ? `?periodId=${periodId}` : ''}`
                            )
                        }
                    >
                        Chạy tính KPI
                    </ButtonPrimary>
                    <ButtonPrimary
                        onClick={() => navigate('/admin/kpi/templates')}
                        style={{
                            background: 'transparent',
                            color: 'var(--color-brand-primary)',
                            border: '1.5px solid var(--color-border-soft)',
                        }}
                    >
                        Quản lý Template
                    </ButtonPrimary>
                </div>

                <CreateKpiPeriodModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={(newId) => handlePeriodChange(newId)}
                />

                {/* Stat Cards from Dashboard API */}
                {!isLoading && dashboard && (
                    <div className={s.statsRow}>
                        <StatCard
                            title="Tổng nhân sự"
                            value={dashboard.total_staff}
                            unit="người"
                            mode="light"
                        />
                        <StatCard
                            title="Điểm TB"
                            value={
                                dashboard.avg_score != null
                                    ? `${(dashboard.avg_score * 100).toFixed(1)}%`
                                    : '—'
                            }
                            mode="light"
                        />
                        <StatCard
                            title="Đã duyệt"
                            value={dashboard.approved_count}
                            unit={`/ ${dashboard.total_staff}`}
                            mode="light"
                        />
                        <StatCard
                            title="Tổng thưởng"
                            value={formatCurrency(dashboard.total_bonus_amount)}
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
                            description="Kỳ này chưa có bản ghi KPI. Hãy tạo kỳ KPI mới hoặc chọn kỳ khác."
                        />
                    ) : (
                        <>
                            <div className={s.tableWrapper}>
                                <table className={s.table}>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nhân viên</th>
                                            <th>Loại HĐ</th>
                                            <th>Tổng điểm</th>
                                            <th>Thưởng</th>
                                            <th>Giờ dạy</th>
                                            <th>Trạng thái</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className={s.tableRow}
                                            >
                                                <td className={s.tdIndex}>
                                                    {(page - 1) * limit +
                                                        idx +
                                                        1}
                                                </td>
                                                <td className={s.tdName}>
                                                    {item.staff_name ?? '—'}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {item.staff_contract ?? '—'}
                                                </td>
                                                <td>
                                                    <ScoreBadge
                                                        score={item.total_score}
                                                    />
                                                </td>
                                                <td className={s.tdBonus}>
                                                    {formatCurrency(
                                                        item.bonus_amount
                                                    )}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {item.teaching_hours != null
                                                        ? `${item.teaching_hours}h`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <ApprovalBadge
                                                        status={
                                                            item.approval_status
                                                        }
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className={s.detailBtn}
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/kpi/records/${item.id}`
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
                                        {meta.total} bản ghi
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
