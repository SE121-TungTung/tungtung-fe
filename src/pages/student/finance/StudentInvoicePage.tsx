import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import {
    useMyInvoices,
    useProcessPayment,
    useMyWalletBalance,
} from '@/hooks/domain/useFinance'
import { useDialog } from '@/hooks/useDialog'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import s from './StudentInvoice.module.css'
import type { InvoiceResponse, PaymentGateway } from '@/types/finance.types'

function PaymentModal({
    invoice,
    onClose,
}: {
    invoice: InvoiceResponse
    onClose: () => void
}) {
    const navigate = useNavigate()
    const { mutate: processPayment, isPending } = useProcessPayment()
    const { data: wallet } = useMyWalletBalance()
    const balance =
        wallet?.wallet_balance !== undefined ? Number(wallet.wallet_balance) : 0
    const { alert, confirm } = useDialog()
    const queryClient = useQueryClient()
    const [gateway] = useState<PaymentGateway>('INTERNAL_WALLET')

    const isInsufficient = balance < invoice.final_amount
    const shortage = invoice.final_amount - balance

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const handlePay = () => {
        if (gateway === 'INTERNAL_WALLET' && isInsufficient) {
            alert('Số dư ví không đủ. Vui lòng nạp thêm tiền.', 'Lỗi số dư')
            return
        }
        const idempotencyKey = crypto.randomUUID()
        processPayment(
            {
                payload: {
                    invoice_id: invoice.id,
                    amount: invoice.final_amount,
                    gateway: gateway.toLowerCase() as PaymentGateway,
                    return_url: `${window.location.origin}/student/finance/callback`,
                },
                idempotencyKey,
            },
            {
                onSuccess: async (res) => {
                    const payUrl = res?.payment_url
                    if (payUrl) {
                        if (payUrl.includes('example.com')) {
                            const transactionId =
                                res.gateway_transaction_id || ''
                            const simulate = await confirm({
                                title: 'Môi trường DEV',
                                message: `Backend trả về Gateway URL ảo:\n${payUrl}\n\nBạn có muốn tự động giả lập Webhook báo "Thanh toán thành công"?`,
                                confirmText: 'Giả lập thành công',
                                cancelText: 'Không, chỉ xem',
                                type: 'confirm',
                            })

                            if (simulate && transactionId) {
                                try {
                                    await api(
                                        `/api/v1/payments/webhooks/${gateway.toLowerCase()}`,
                                        {
                                            method: 'POST',
                                            body: JSON.stringify({
                                                transaction_id: transactionId,
                                                status: 'success',
                                            }),
                                        }
                                    )
                                    await alert(
                                        'Giả lập thành công. Vui lòng kiểm tra lại trạng thái hóa đơn.',
                                        'Thông báo'
                                    )
                                    queryClient.invalidateQueries({
                                        queryKey: ['my-invoices'],
                                    })
                                    queryClient.invalidateQueries({
                                        queryKey: ['payments'],
                                    })
                                } catch (e: any) {
                                    let msg = 'Lỗi không xác định'
                                    if (e instanceof Error) msg = e.message
                                    await alert(
                                        'Gửi webhook giả lập thất bại: ' + msg
                                    )
                                }
                            }
                            onClose()
                        } else {
                            window.location.href = payUrl
                        }
                    } else {
                        await alert(
                            'Thanh toán nội bộ thành công hoặc chưa có URL.'
                        )
                        onClose()
                    }
                },
                onError: async (err: any) => {
                    await alert(err.message || 'Đã có lỗi xảy ra', 'Lỗi')
                },
            }
        )
    }

    return (
        <div
            className={s.modalOverlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <Card variant="glass" className={s.modalCard}>
                <div className={s.modalHeader}>
                    <h3 className={s.modalTitle}>Thanh toán Hóa đơn</h3>
                </div>
                <p className={s.modalCourse}>
                    Khóa học: {invoice.course_name || '—'}
                </p>

                <div className={s.amountSummaryBox}>
                    <div className={s.amountRow}>
                        <span>Học phí gốc:</span>
                        <span>
                            {invoice.original_amount.toLocaleString()} đ
                        </span>
                    </div>
                    {invoice.discount_amount > 0 && (
                        <div className={`${s.amountRow} ${s.amountDiscount}`}>
                            <span>Giảm giá:</span>
                            <span>
                                - {invoice.discount_amount.toLocaleString()} đ
                            </span>
                        </div>
                    )}
                    <hr className={s.amountDivider} />
                    <div className={s.amountTotalRow}>
                        <span>Cần thanh toán:</span>
                        <span className={s.amountTotalValue}>
                            {invoice.final_amount.toLocaleString()} đ
                        </span>
                    </div>
                </div>

                <div className={s.paymentMethodSection}>
                    <label className={s.methodLabel}>
                        Phương thức thanh toán:
                    </label>
                    <div className={s.walletOptionCard}>
                        <div className={s.walletOptionHeader}>
                            <div className={s.walletOptionTitle}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--color-brand-primary)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                    <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
                                    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                                </svg>
                                <span>Ví điện tử nội bộ</span>
                            </div>
                            <span className={s.walletBalanceTag}>
                                Khả dụng:{' '}
                                <strong className={s.walletBalanceValue}>
                                    {balance.toLocaleString()} đ
                                </strong>
                            </span>
                        </div>

                        {isInsufficient && (
                            <div className={s.insufficientWarning}>
                                <span>
                                    Số dư ví không đủ (thiếu{' '}
                                    <strong>
                                        {shortage.toLocaleString()} đ
                                    </strong>
                                    )
                                </span>
                                <span
                                    className={s.topUpLink}
                                    onClick={() => {
                                        onClose()
                                        navigate('/finance/wallet')
                                    }}
                                >
                                    Nạp thêm ví &rarr;
                                </span>
                            </div>
                        )}
                    </div>
                    <p className={s.otherMethodsHint}>
                        * Cổng thanh toán VNPay / MoMo được hỗ trợ nạp tiền trực
                        tiếp vào Ví nội bộ.
                    </p>
                </div>

                <div className={s.modalActions}>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className={s.cancelBtn}
                        type="button"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handlePay}
                        disabled={isPending || isInsufficient}
                        className={s.confirmBtn}
                        type="button"
                    >
                        {isPending
                            ? 'Đang xử lý...'
                            : isInsufficient
                              ? 'Số dư không đủ'
                              : 'Xác nhận thanh toán'}
                    </button>
                </div>
            </Card>
        </div>
    )
}

export default function StudentInvoicePage() {
    const [page, setPage] = useState(1)
    const { data: invoicesRes, isLoading, isError } = useMyInvoices(page, 15)
    const [selectedInvoice, setSelectedInvoice] =
        useState<InvoiceResponse | null>(null)

    const invoices = invoicesRes?.data || []
    const totalPages = invoicesRes?.meta?.total_pages || 1

    return (
        <div className={s.container}>
            <div className={s.header}>
                <div>
                    <h1 className={s.title}>Hóa đơn của tôi</h1>
                    <p className={s.subtitle}>
                        Theo dõi lịch sử đóng học phí và thanh toán trực tuyến.
                    </p>
                </div>
            </div>

            <Card
                variant="outline"
                className={s.tableCard}
                style={{ padding: 0 }}
            >
                {isLoading ? (
                    <div className={s.loadingWrapper}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={s.skeletonRow} />
                        ))}
                    </div>
                ) : isError ? (
                    <EmptyState
                        title="Lỗi tải dữ liệu"
                        description="Không thể kết nối đến máy chủ."
                    />
                ) : invoices.length === 0 ? (
                    <EmptyState
                        title="Chưa có hóa đơn"
                        description="Bạn chưa được phát hành hóa đơn nào."
                    />
                ) : (
                    <div className={s.tableWrapper}>
                        <table className={s.table}>
                            <thead>
                                <tr>
                                    <th>Mã HĐ</th>
                                    <th>Khóa học</th>
                                    <th>Số tiền (VND)</th>
                                    <th>Hạn nộp</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className={s.tableRow}>
                                        <td className={s.tdNum}>
                                            {inv.id.split('-')[0].toUpperCase()}
                                        </td>
                                        <td className={s.tdName}>
                                            {inv.course_name || '—'}
                                        </td>
                                        <td className={s.tdAmount}>
                                            {inv.final_amount.toLocaleString()}{' '}
                                            đ
                                        </td>
                                        <td className={s.tdNum}>
                                            {inv.due_date
                                                ? new Date(
                                                      inv.due_date
                                                  ).toLocaleDateString('vi-VN')
                                                : '—'}
                                        </td>
                                        <td>
                                            {inv.status === 'PAID' ||
                                            inv.status === 'paid' ? (
                                                <span
                                                    className={`${s.badge} ${s.badgePaid}`}
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{
                                                            marginRight: '4px',
                                                        }}
                                                    >
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>{' '}
                                                    Đã thanh toán
                                                </span>
                                            ) : inv.status === 'PENDING' ||
                                              inv.status === 'pending' ? (
                                                <span
                                                    className={`${s.badge} ${s.badgePending}`}
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{
                                                            marginRight: '4px',
                                                        }}
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        ></circle>
                                                        <line
                                                            x1="12"
                                                            y1="8"
                                                            x2="12"
                                                            y2="12"
                                                        ></line>
                                                        <line
                                                            x1="12"
                                                            y1="16"
                                                            x2="12.01"
                                                            y2="16"
                                                        ></line>
                                                    </svg>{' '}
                                                    Chờ thanh toán
                                                </span>
                                            ) : (
                                                <span
                                                    className={`${s.badge} ${s.badgeCancelled}`}
                                                >
                                                    Đã hủy
                                                </span>
                                            )}
                                        </td>
                                        <td className={s.actionCell}>
                                            {(inv.status === 'PENDING' ||
                                                inv.status === 'pending') && (
                                                <button
                                                    onClick={() =>
                                                        setSelectedInvoice(inv)
                                                    }
                                                    className={s.payBtn}
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
                                                        <rect
                                                            x="1"
                                                            y="4"
                                                            width="22"
                                                            height="16"
                                                            rx="2"
                                                            ry="2"
                                                        ></rect>
                                                        <line
                                                            x1="1"
                                                            y1="10"
                                                            x2="23"
                                                            y2="10"
                                                        ></line>
                                                    </svg>
                                                    Thanh toán
                                                </button>
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
                <div className={s.pagination}>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={s.paginationBtn}
                    >
                        Trước
                    </button>
                    <span className={s.paginationText}>
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className={s.paginationBtn}
                    >
                        Sau
                    </button>
                </div>
            )}

            {selectedInvoice && (
                <PaymentModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    )
}
