import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { EmptyState } from '@/components/common/state/EmptyState'
import { usePayments, usePaymentReceipt } from '@/hooks/domain/useFinance'
import s from './Finance.module.css'

function StatusBadge({ status }: { status: string }) {
    if (status === 'SUCCESS')
        return (
            <span className={`${s.badge} ${s.badgeSuccess}`}>Thành công</span>
        )
    if (status === 'FAILED')
        return <span className={`${s.badge} ${s.badgeFailed}`}>Thất bại</span>
    return <span className={`${s.badge} ${s.badgePending}`}>Chờ xử lý</span>
}

function ReceiptButton({ paymentId }: { paymentId: string }) {
    const { refetch, isFetching } = usePaymentReceipt(paymentId)

    const handleDownload = async () => {
        const result = await refetch()
        if (result.data?.receipt_url) {
            window.open(result.data.receipt_url, '_blank')
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-md hover:bg-brand-primary/20 transition-colors"
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {isFetching ? 'Đang lấy...' : 'Biên lai'}
        </button>
    )
}

export default function AdminInvoicePage() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const {
        data: paymentsRes,
        isLoading,
        isError,
    } = usePayments({ page, limit: 15, status: statusFilter || undefined })

    const payments = paymentsRes?.data || []
    // TODO: implement actual pagination correctly using paymentsRes.meta.total_pages
    const totalPages = paymentsRes?.meta?.total_pages || 1

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: '24px',
                            fontWeight: 700,
                            margin: '0 0 8px 0',
                        }}
                    >
                        Quản lý Thanh toán & Hóa đơn
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                        }}
                    >
                        Theo dõi lịch sử giao dịch và xuất biên lai học phí.
                    </p>
                </div>
                <ButtonPrimary>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Tạo Hóa Đơn Mới
                    </div>
                </ButtonPrimary>
            </div>

            <Card variant="glass" style={{ padding: '16px' }}>
                <div
                    style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ flex: 1, position: 'relative' }}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--color-text-muted)',
                            }}
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã giao dịch..."
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px',
                                borderRadius: 'var(--input-radius)',
                                border: '1px solid var(--input-border)',
                                background: 'transparent',
                                color: 'var(--input-text)',
                            }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value)
                            setPage(1)
                        }}
                        style={{
                            padding: '10px 16px',
                            borderRadius: 'var(--input-radius)',
                            border: '1px solid var(--input-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--input-text)',
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="SUCCESS">Thành công</option>
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="FAILED">Thất bại</option>
                    </select>
                </div>
            </Card>

            <Card
                variant="outline"
                className={s.tableCard}
                style={{ padding: 0 }}
            >
                {isLoading ? (
                    <div className={s.loadingWrapper}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={s.skeletonRow} />
                        ))}
                    </div>
                ) : isError ? (
                    <EmptyState
                        title="Lỗi tải dữ liệu"
                        description="Không thể kết nối đến máy chủ."
                    />
                ) : payments.length === 0 ? (
                    <EmptyState
                        title="Chống vắng"
                        description="Không tìm thấy giao dịch nào."
                    />
                ) : (
                    <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>Mã GD Gateway</th>
                                    <th>Phương thức</th>
                                    <th>Số tiền</th>
                                    <th>Thời gian</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p) => (
                                    <tr key={p.id} className={s.tableRow}>
                                        <td className={s.tdNum}>
                                            {p.gateway_transaction_id || '—'}
                                        </td>
                                        <td>{p.payment_method}</td>
                                        <td className={s.tdAmount}>
                                            {p.amount.toLocaleString()} đ
                                        </td>
                                        <td className={s.tdNum}>
                                            {new Date(
                                                p.created_at
                                            ).toLocaleString('vi-VN')}
                                        </td>
                                        <td>
                                            <StatusBadge status={p.status} />
                                        </td>
                                        <td className={s.actionCell}>
                                            {p.status === 'SUCCESS' && (
                                                <ReceiptButton
                                                    paymentId={p.id}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {totalPages > 1 && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px',
                    }}
                >
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border-soft)',
                        }}
                    >
                        Trước
                    </button>
                    <span style={{ padding: '8px 16px' }}>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border-soft)',
                        }}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    )
}
