import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { EmptyState } from '@/components/common/state/EmptyState'
import {
    usePayments,
    usePaymentReceipt,
    useInvoices,
    useRefunds,
} from '@/hooks/domain/useFinance'
import { CreateInvoiceModal } from './CreateInvoiceModal'
import { RefundModal } from './RefundModal'
import { ApproveRejectRefundModal } from './ApproveRejectRefundModal'
import { useQueryClient } from '@tanstack/react-query'
import { usePermissions } from '@/hooks/usePermissions'
import type { RefundResponse } from '@/types/finance.types'
import s from './Finance.module.css'

function StatusBadge({
    status,
    type,
}: {
    status: string
    type?: 'invoice' | 'payment' | 'refund'
}) {
    const sUpper = status?.toUpperCase()
    const isSuccessOrPaid =
        sUpper === 'SUCCESS' || sUpper === 'PAID' || sUpper === 'APPROVED'
    const isCancelled = sUpper === 'CANCELLED' || sUpper === 'REJECTED'
    const isPending = sUpper === 'PENDING'

    if (isSuccessOrPaid)
        return (
            <span className={`${s.badge} ${s.badgeSuccess}`}>
                {sUpper === 'PAID'
                    ? 'Đã thu'
                    : sUpper === 'APPROVED'
                      ? 'Đã duyệt'
                      : 'Thành công'}
            </span>
        )
    if (sUpper === 'FAILED')
        return <span className={`${s.badge} ${s.badgeFailed}`}>Thất bại</span>
    if (isCancelled)
        return (
            <span className={`${s.badge} ${s.badgeFailed}`}>
                {sUpper === 'REJECTED' ? 'Từ chối' : 'Đã hủy'}
            </span>
        )

    return (
        <span className={`${s.badge} ${s.badgePending}`}>
            {isPending
                ? type === 'refund'
                    ? 'Chờ duyệt'
                    : 'Chưa thu'
                : 'Chờ xử lý'}
        </span>
    )
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
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-md hover:bg-brand-primary/20 transition-colors border-0"
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
    const [activeTab, setActiveTab] = useState<
        'invoices' | 'payments' | 'refunds'
    >('invoices')
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<string>('')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)

    // Approval / Rejection states
    const [selectedRefund, setSelectedRefund] = useState<RefundResponse | null>(
        null
    )
    const [refundActionType, setRefundActionType] = useState<
        'APPROVE' | 'REJECT'
    >('APPROVE')
    const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] =
        useState(false)

    const queryClient = useQueryClient()
    const { role } = usePermissions()

    // 1. Fetch Invoices
    const {
        data: invoicesRes,
        isLoading: isLoadingInvoices,
        isError: isErrorInvoices,
    } = useInvoices({ page, limit: 15, status: statusFilter || undefined })

    // 2. Fetch Payments
    const {
        data: paymentsRes,
        isLoading: isLoadingPayments,
        isError: isErrorPayments,
    } = usePayments({ page, limit: 15, status: statusFilter || undefined })

    // 3. Fetch Refunds
    const {
        data: refundsRes,
        isLoading: isLoadingRefunds,
        isError: isErrorRefunds,
    } = useRefunds({ page, limit: 15, status: statusFilter || undefined })

    const invoices = invoicesRes?.data || []
    const payments = paymentsRes?.data || []
    const refunds = refundsRes?.data || []

    const isLoading =
        activeTab === 'invoices'
            ? isLoadingInvoices
            : activeTab === 'payments'
              ? isLoadingPayments
              : isLoadingRefunds
    const isError =
        activeTab === 'invoices'
            ? isErrorInvoices
            : activeTab === 'payments'
              ? isErrorPayments
              : isErrorRefunds
    const items =
        activeTab === 'invoices'
            ? invoices
            : activeTab === 'payments'
              ? payments
              : refunds
    const totalPages =
        activeTab === 'invoices'
            ? invoicesRes?.meta?.total_pages || 1
            : activeTab === 'payments'
              ? paymentsRes?.meta?.total_pages || 1
              : refundsRes?.meta?.total_pages || 1

    const handleTabChange = (tab: 'invoices' | 'payments' | 'refunds') => {
        setActiveTab(tab)
        setPage(1)
        setStatusFilter('')
    }

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
                        Theo dõi danh sách hóa đơn học phí và lịch sử giao dịch.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {(role === 'office_admin' ||
                        role === 'system_admin' ||
                        role === 'center_admin') && (
                        <ButtonPrimary
                            tone="danger"
                            onClick={() => setIsRefundModalOpen(true)}
                        >
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
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line
                                        x1="12"
                                        y1="16"
                                        x2="12.01"
                                        y2="16"
                                    ></line>
                                </svg>
                                Yêu cầu hoàn tiền
                            </div>
                        </ButtonPrimary>
                    )}
                    <ButtonPrimary onClick={() => setIsCreateModalOpen(true)}>
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

                <CreateInvoiceModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['invoices'],
                        })
                        queryClient.invalidateQueries({
                            queryKey: ['payments'],
                        })
                    }}
                />

                <RefundModal
                    isOpen={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    onSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['refunds'],
                        })
                    }}
                />

                <ApproveRejectRefundModal
                    isOpen={isApproveRejectModalOpen}
                    onClose={() => {
                        setIsApproveRejectModalOpen(false)
                        setSelectedRefund(null)
                    }}
                    refund={selectedRefund}
                    actionType={refundActionType}
                    onSuccess={() => {
                        queryClient.invalidateQueries({
                            queryKey: ['refunds'],
                        })
                    }}
                />
            </div>

            {/* Tabs */}
            <div
                style={{
                    borderBottom: '1px solid var(--color-border-soft)',
                    display: 'flex',
                    gap: '24px',
                }}
            >
                <div
                    onClick={() => handleTabChange('invoices')}
                    style={{
                        padding: '12px 4px',
                        cursor: 'pointer',
                        borderBottom:
                            activeTab === 'invoices'
                                ? '2px solid var(--color-primary)'
                                : '2px solid transparent',
                        color:
                            activeTab === 'invoices'
                                ? 'var(--color-primary)'
                                : 'var(--color-text-secondary)',
                        fontWeight: activeTab === 'invoices' ? 600 : 500,
                        transition: 'all 0.2s',
                    }}
                >
                    Danh sách hóa đơn
                </div>
                <div
                    onClick={() => handleTabChange('payments')}
                    style={{
                        padding: '12px 4px',
                        cursor: 'pointer',
                        borderBottom:
                            activeTab === 'payments'
                                ? '2px solid var(--color-primary)'
                                : '2px solid transparent',
                        color:
                            activeTab === 'payments'
                                ? 'var(--color-primary)'
                                : 'var(--color-text-secondary)',
                        fontWeight: activeTab === 'payments' ? 600 : 500,
                        transition: 'all 0.2s',
                    }}
                >
                    Lịch sử thanh toán
                </div>
                <div
                    onClick={() => handleTabChange('refunds')}
                    style={{
                        padding: '12px 4px',
                        cursor: 'pointer',
                        borderBottom:
                            activeTab === 'refunds'
                                ? '2px solid var(--color-primary)'
                                : '2px solid transparent',
                        color:
                            activeTab === 'refunds'
                                ? 'var(--color-primary)'
                                : 'var(--color-text-secondary)',
                        fontWeight: activeTab === 'refunds' ? 600 : 500,
                        transition: 'all 0.2s',
                    }}
                >
                    Yêu cầu hoàn tiền
                </div>
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
                            placeholder="Tìm kiếm..."
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
                    {activeTab === 'invoices' ? (
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
                            <option value="PENDING">Chưa thu</option>
                            <option value="PAID">Đã thu</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    ) : activeTab === 'payments' ? (
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
                            <option value="success">Thành công</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="failed">Thất bại</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    ) : (
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
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                        </select>
                    )}
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
                ) : items.length === 0 ? (
                    <EmptyState
                        title="Trống vắng"
                        description="Không tìm thấy dữ liệu nào."
                    />
                ) : (
                    <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <thead>
                                {activeTab === 'invoices' ? (
                                    <tr>
                                        <th>Khách hàng</th>
                                        <th>Khóa học</th>
                                        <th>Tổng tiền</th>
                                        <th>Ngày tạo</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                ) : activeTab === 'payments' ? (
                                    <tr>
                                        <th>Mã GD Gateway</th>
                                        <th>Phương thức</th>
                                        <th>Số tiền</th>
                                        <th>Thời gian</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>Học viên</th>
                                        <th>Khóa học</th>
                                        <th>Tiền yêu cầu</th>
                                        <th>Tiền duyệt</th>
                                        <th>Ngày yêu cầu</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {activeTab === 'invoices'
                                    ? invoices.map((inv: any) => (
                                          <tr
                                              key={inv.id}
                                              className={s.tableRow}
                                          >
                                              <td style={{ fontWeight: 500 }}>
                                                  {inv.student_name || '—'}
                                              </td>
                                              <td>{inv.course_name || '—'}</td>
                                              <td className={s.tdAmount}>
                                                  {inv.final_amount?.toLocaleString()}{' '}
                                                  đ
                                              </td>
                                              <td className={s.tdNum}>
                                                  {new Date(
                                                      inv.created_at
                                                  ).toLocaleString('vi-VN')}
                                              </td>
                                              <td>
                                                  <StatusBadge
                                                      status={inv.status}
                                                      type="invoice"
                                                  />
                                              </td>
                                          </tr>
                                      ))
                                    : activeTab === 'payments'
                                      ? payments.map((p: any) => (
                                            <tr
                                                key={p.id}
                                                className={s.tableRow}
                                            >
                                                <td className={s.tdNum}>
                                                    {p.gateway_transaction_id ||
                                                        '—'}
                                                </td>
                                                <td>{p.payment_method}</td>
                                                <td className={s.tdAmount}>
                                                    {p.amount?.toLocaleString()}{' '}
                                                    đ
                                                </td>
                                                <td className={s.tdNum}>
                                                    {new Date(
                                                        p.created_at
                                                    ).toLocaleString('vi-VN')}
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={p.status}
                                                        type="payment"
                                                    />
                                                </td>
                                                <td className={s.actionCell}>
                                                    {p.status === 'success' && (
                                                        <ReceiptButton
                                                            paymentId={p.id}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                      : refunds.map((rf: any) => (
                                            <tr
                                                key={rf.id}
                                                className={s.tableRow}
                                            >
                                                <td style={{ fontWeight: 500 }}>
                                                    {rf.student_name || '—'}
                                                </td>
                                                <td>{rf.course_name || '—'}</td>
                                                <td className={s.tdAmount}>
                                                    {rf.requested_amount?.toLocaleString()}{' '}
                                                    đ
                                                </td>
                                                <td className={s.tdAmount}>
                                                    {rf.approved_amount !==
                                                        null &&
                                                    rf.approved_amount !==
                                                        undefined
                                                        ? `${rf.approved_amount.toLocaleString()} đ`
                                                        : '—'}
                                                </td>
                                                <td className={s.tdNum}>
                                                    {new Date(
                                                        rf.created_at
                                                    ).toLocaleString('vi-VN')}
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={rf.status}
                                                        type="refund"
                                                    />
                                                </td>
                                                <td className={s.actionCell}>
                                                    {rf.status?.toUpperCase() ===
                                                        'PENDING' &&
                                                    (role === 'center_admin' ||
                                                        role ===
                                                            'system_admin') ? (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                gap: '8px',
                                                            }}
                                                        >
                                                            <div
                                                                className={
                                                                    s.tooltipWrapper
                                                                }
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRefund(
                                                                            rf
                                                                        )
                                                                        setRefundActionType(
                                                                            'APPROVE'
                                                                        )
                                                                        setIsApproveRejectModalOpen(
                                                                            true
                                                                        )
                                                                    }}
                                                                    className={`${s.actionBtn} ${s.actionBtnApprove}`}
                                                                >
                                                                    <svg
                                                                        width="18"
                                                                        height="18"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    >
                                                                        <path d="M20 6L9 17l-5-5" />
                                                                    </svg>
                                                                </button>
                                                                <span
                                                                    className={
                                                                        s.tooltipText
                                                                    }
                                                                >
                                                                    Phê duyệt
                                                                    hoàn tiền
                                                                </span>
                                                            </div>
                                                            <div
                                                                className={
                                                                    s.tooltipWrapper
                                                                }
                                                            >
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedRefund(
                                                                            rf
                                                                        )
                                                                        setRefundActionType(
                                                                            'REJECT'
                                                                        )
                                                                        setIsApproveRejectModalOpen(
                                                                            true
                                                                        )
                                                                    }}
                                                                    className={`${s.actionBtn} ${s.actionBtnReject}`}
                                                                >
                                                                    <svg
                                                                        width="18"
                                                                        height="18"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    >
                                                                        <path d="M18 6L6 18M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                                <span
                                                                    className={
                                                                        s.tooltipText
                                                                    }
                                                                >
                                                                    Từ chối hoàn
                                                                    tiền
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : rf.status?.toUpperCase() ===
                                                          'REJECTED' &&
                                                      rf.rejection_reason ? (
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    '11px',
                                                                color: 'var(--color-text-muted)',
                                                            }}
                                                            title={
                                                                rf.rejection_reason
                                                            }
                                                        >
                                                            Lý do:{' '}
                                                            {rf.rejection_reason
                                                                .length > 20
                                                                ? `${rf.rejection_reason.slice(0, 20)}...`
                                                                : rf.rejection_reason}
                                                        </span>
                                                    ) : rf.status?.toUpperCase() ===
                                                          'APPROVED' &&
                                                      rf.admin_note ? (
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    '11px',
                                                                color: 'var(--color-text-muted)',
                                                            }}
                                                            title={
                                                                rf.admin_note
                                                            }
                                                        >
                                                            Ghi chú:{' '}
                                                            {rf.admin_note
                                                                .length > 20
                                                                ? `${rf.admin_note.slice(0, 20)}...`
                                                                : rf.admin_note}
                                                        </span>
                                                    ) : (
                                                        '—'
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
                            background: 'transparent',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
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
                            background: 'transparent',
                            cursor:
                                page === totalPages ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    )
}
