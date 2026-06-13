import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import kpiS from './AdminKpiOverviewPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useKpiDisputes, useResolveKpiDispute } from '@/hooks/domain/useKpi'
import { EmptyState } from '@/components/common/state/EmptyState'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { Modal } from '@/components/core/Modal'
import Card from '@/components/common/card/Card'

export default function AdminKpiDisputesPage() {
    const navigate = useNavigate()
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [page, setPage] = useState<number>(1)
    const limit = 10

    const { data: paginatedData, isLoading } = useKpiDisputes({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        limit,
    })

    const resolveMutation = useResolveKpiDispute()

    const [selectedDispute, setSelectedDispute] = useState<any | null>(null)
    const [resolveStatus, setResolveStatus] = useState<'RESOLVED' | 'REJECTED'>(
        'RESOLVED'
    )
    const [resolutionNote, setResolutionNote] = useState<string>('')

    const handleOpenResolve = (dispute: any) => {
        setSelectedDispute(dispute)
        setResolveStatus('RESOLVED')
        setResolutionNote('')
    }

    const handleResolve = () => {
        if (!selectedDispute || !resolutionNote.trim()) return
        resolveMutation.mutate(
            {
                id: selectedDispute.id,
                payload: {
                    status: resolveStatus,
                    resolution_note: resolutionNote,
                },
            },
            {
                onSuccess: () => {
                    setSelectedDispute(null)
                },
            }
        )
    }

    const disputes = paginatedData?.data || []
    const meta = paginatedData?.meta

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px',
                    }}
                >
                    <div>
                        <h1
                            className={s.pageTitle}
                            style={{ marginBottom: '4px' }}
                        >
                            Danh sách khiếu nại KPI
                        </h1>
                        <p
                            style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: 14,
                                margin: 0,
                            }}
                        >
                            Xem và giải quyết các khiếu nại về chỉ số KPI của
                            giảng viên/trợ giảng
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card
                    variant="outline"
                    style={{ padding: '16px 20px', marginBottom: '24px' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                        }}
                    >
                        <span
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            Trạng thái:
                        </span>
                        {['ALL', 'PENDING', 'RESOLVED', 'REJECTED'].map(
                            (st) => (
                                <button
                                    key={st}
                                    onClick={() => {
                                        setStatusFilter(st)
                                        setPage(1)
                                    }}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        border: '1.5px solid',
                                        borderColor:
                                            statusFilter === st
                                                ? 'var(--color-brand-primary)'
                                                : 'var(--color-border-soft)',
                                        background:
                                            statusFilter === st
                                                ? 'var(--color-brand-primary-light, rgba(59, 130, 246, 0.1))'
                                                : 'transparent',
                                        color:
                                            statusFilter === st
                                                ? 'var(--color-brand-primary)'
                                                : 'var(--color-text-primary)',
                                        fontWeight: 600,
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {st === 'ALL'
                                        ? 'Tất cả'
                                        : st === 'PENDING'
                                          ? 'Chờ xử lý'
                                          : st === 'RESOLVED'
                                            ? 'Đã duyệt'
                                            : 'Từ chối'}
                                </button>
                            )
                        )}
                    </div>
                </Card>

                {isLoading ? (
                    <div className={kpiS.loadingWrapper}>
                        <div className={kpiS.skeletonRow} />
                        <div className={kpiS.skeletonRow} />
                        <div className={kpiS.skeletonRow} />
                    </div>
                ) : disputes.length === 0 ? (
                    <EmptyState
                        title="Không có khiếu nại nào"
                        description="Hiện tại không có khiếu nại nào phù hợp với bộ lọc đã chọn."
                    />
                ) : (
                    <Card
                        variant="outline"
                        style={{ padding: 0, overflow: 'hidden' }}
                    >
                        <div className={kpiS.tableWrapper}>
                            <table className={kpiS.table}>
                                <thead>
                                    <tr>
                                        <th className={kpiS.tdIndex}>#</th>
                                        <th>Giảng viên</th>
                                        <th>Kỳ KPI</th>
                                        <th>Lý do khiếu nại</th>
                                        <th>Ngày tạo</th>
                                        <th>Trạng thái</th>
                                        <th style={{ textAlign: 'right' }}>
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {disputes.map((dispute, index) => {
                                        const globalIdx =
                                            (page - 1) * limit + index + 1
                                        return (
                                            <tr
                                                key={dispute.id}
                                                className={kpiS.tableRow}
                                            >
                                                <td className={kpiS.tdIndex}>
                                                    {globalIdx}
                                                </td>
                                                <td className={kpiS.tdName}>
                                                    {dispute.teacher_name ||
                                                        '—'}
                                                </td>
                                                <td>
                                                    {dispute.period_name || '—'}
                                                </td>
                                                <td
                                                    style={{
                                                        maxWidth: '300px',
                                                        wordBreak: 'break-word',
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {dispute.reason}
                                                </td>
                                                <td
                                                    style={{
                                                        fontSize: 12,
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    {dispute.created_at
                                                        ? new Date(
                                                              dispute.created_at
                                                          ).toLocaleDateString(
                                                              'vi-VN',
                                                              {
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                                  day: '2-digit',
                                                                  month: '2-digit',
                                                                  year: 'numeric',
                                                              }
                                                          )
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`${kpiS.statusChip} ${
                                                            dispute.status ===
                                                            'PENDING'
                                                                ? kpiS.status_submitted
                                                                : dispute.status ===
                                                                    'RESOLVED'
                                                                  ? kpiS.status_approved
                                                                  : kpiS.status_rejected
                                                        }`}
                                                    >
                                                        {dispute.status ===
                                                        'PENDING'
                                                            ? 'Chờ xử lý'
                                                            : dispute.status ===
                                                                'RESOLVED'
                                                              ? 'Đã duyệt'
                                                              : 'Từ chối'}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display:
                                                                'inline-flex',
                                                            gap: '8px',
                                                            justifyContent:
                                                                'flex-end',
                                                        }}
                                                    >
                                                        {dispute.kpi_record_id && (
                                                            <button
                                                                className={
                                                                    kpiS.detailBtn
                                                                }
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/admin/kpi/records/${dispute.kpi_record_id}`
                                                                    )
                                                                }
                                                            >
                                                                Chi tiết KPI
                                                            </button>
                                                        )}
                                                        {dispute.status ===
                                                        'PENDING' ? (
                                                            <ButtonPrimary
                                                                onClick={() =>
                                                                    handleOpenResolve(
                                                                        dispute
                                                                    )
                                                                }
                                                                tone="brand"
                                                                style={{
                                                                    padding:
                                                                        '5px 12px',
                                                                    borderRadius: 8,
                                                                    fontSize: 13,
                                                                }}
                                                            >
                                                                Giải quyết
                                                            </ButtonPrimary>
                                                        ) : (
                                                            <button
                                                                className={
                                                                    kpiS.detailBtn
                                                                }
                                                                style={{
                                                                    opacity: 0.7,
                                                                    color: 'var(--color-text-secondary)',
                                                                }}
                                                                onClick={() =>
                                                                    handleOpenResolve(
                                                                        dispute
                                                                    )
                                                                }
                                                            >
                                                                Xem kết quả
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meta && meta.total_pages > 1 && (
                            <div className={kpiS.pagination}>
                                <button
                                    className={kpiS.pageBtn}
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Trước
                                </button>
                                <span className={kpiS.pageInfo}>
                                    Trang {page} / {meta.total_pages} (Tổng{' '}
                                    {meta.total} bản ghi)
                                </span>
                                <button
                                    className={kpiS.pageBtn}
                                    disabled={page >= meta.total_pages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </Card>
                )}
            </main>

            {/* Resolve Modal */}
            <Modal
                isOpen={!!selectedDispute}
                onClose={() => setSelectedDispute(null)}
                title={
                    selectedDispute?.status === 'PENDING'
                        ? 'Giải quyết khiếu nại KPI'
                        : 'Chi tiết kết quả khiếu nại'
                }
                footer={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                            width: '100%',
                        }}
                    >
                        <ButtonGhost onClick={() => setSelectedDispute(null)}>
                            Đóng
                        </ButtonGhost>
                        {selectedDispute?.status === 'PENDING' && (
                            <ButtonPrimary
                                onClick={handleResolve}
                                disabled={
                                    resolveMutation.isPending ||
                                    !resolutionNote.trim()
                                }
                                tone={
                                    resolveStatus === 'RESOLVED'
                                        ? 'success'
                                        : 'danger'
                                }
                            >
                                {resolveMutation.isPending
                                    ? 'Đang xử lý...'
                                    : 'Xác nhận'}
                            </ButtonPrimary>
                        )}
                    </div>
                }
            >
                {selectedDispute && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                        }}
                    >
                        <div>
                            <span
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Người khiếu nại
                            </span>
                            <div
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    marginTop: 4,
                                }}
                            >
                                {selectedDispute.teacher_name} (
                                {selectedDispute.period_name})
                            </div>
                        </div>

                        <div>
                            <span
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Nội dung khiếu nại
                            </span>
                            <div
                                style={{
                                    fontSize: 14,
                                    marginTop: 4,
                                    padding: '10px 12px',
                                    background: 'var(--color-surface-raised)',
                                    borderRadius: 8,
                                    border: '1.5px solid var(--color-border-soft)',
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {selectedDispute.reason}
                            </div>
                        </div>

                        {selectedDispute.status === 'PENDING' ? (
                            <>
                                <div>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Quyết định
                                    </span>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 16,
                                            marginTop: 8,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'pointer',
                                                fontSize: 14,
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="resolveStatus"
                                                checked={
                                                    resolveStatus === 'RESOLVED'
                                                }
                                                onChange={() =>
                                                    setResolveStatus('RESOLVED')
                                                }
                                            />
                                            Duyệt khiếu nại (Chấp nhận)
                                        </label>
                                        <label
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'pointer',
                                                fontSize: 14,
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name="resolveStatus"
                                                checked={
                                                    resolveStatus === 'REJECTED'
                                                }
                                                onChange={() =>
                                                    setResolveStatus('REJECTED')
                                                }
                                            />
                                            Bác bỏ khiếu nại (Từ chối)
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Phản hồi / Ghi chú giải quyết
                                    </span>
                                    <textarea
                                        value={resolutionNote}
                                        onChange={(e) =>
                                            setResolutionNote(e.target.value)
                                        }
                                        rows={4}
                                        placeholder="Nhập nội dung phản hồi gửi đến giáo viên..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1.5px solid var(--color-border-soft)',
                                            fontFamily: 'inherit',
                                            fontSize: 14,
                                            resize: 'vertical',
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text-primary)',
                                            marginTop: 6,
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: 8,
                                    background:
                                        selectedDispute.status === 'RESOLVED'
                                            ? 'rgba(34, 197, 94, 0.08)'
                                            : 'rgba(239, 68, 68, 0.08)',
                                    border: '1.5px solid',
                                    borderColor:
                                        selectedDispute.status === 'RESOLVED'
                                            ? 'rgba(34, 197, 94, 0.2)'
                                            : 'rgba(239, 68, 68, 0.2)',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        color:
                                            selectedDispute.status ===
                                            'RESOLVED'
                                                ? '#16a34a'
                                                : '#dc2626',
                                    }}
                                >
                                    Kết quả giải quyết:{' '}
                                    {selectedDispute.status === 'RESOLVED'
                                        ? 'Đã duyệt'
                                        : 'Từ chối'}
                                </span>
                                <div
                                    style={{
                                        fontSize: 14,
                                        color: 'var(--color-text-primary)',
                                        marginTop: 6,
                                        fontWeight: 500,
                                    }}
                                >
                                    {selectedDispute.resolution_note ||
                                        'Không có ghi chú.'}
                                </div>
                                {selectedDispute.resolved_at && (
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: 'var(--color-text-secondary)',
                                            marginTop: 8,
                                        }}
                                    >
                                        Thời gian:{' '}
                                        {new Date(
                                            selectedDispute.resolved_at
                                        ).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}
