import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import { useMyInvoices, useProcessPayment } from '@/hooks/domain/useFinance'
import { useDialog } from '@/hooks/useDialog'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import s from '../../admin/finance/Finance.module.css'
import type { InvoiceResponse, PaymentGateway } from '@/types/finance.types'

function PaymentModal({
    invoice,
    onClose,
}: {
    invoice: InvoiceResponse
    onClose: () => void
}) {
    const { mutate: processPayment, isPending } = useProcessPayment()
    const { alert, confirm } = useDialog()
    const queryClient = useQueryClient()
    const [gateway, setGateway] = useState<PaymentGateway>('VNPAY')

    const handlePay = () => {
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
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--color-surface-overlay)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Card variant="glass" style={{ width: '400px', padding: '24px' }}>
                <h3 style={{ marginTop: 0, fontSize: '20px' }}>
                    Thanh toán Hóa đơn
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Khóa học: {invoice.course_name || '—'}
                </p>
                <div
                    style={{
                        margin: '20px 0',
                        padding: '16px',
                        background: 'rgba(var(--primitive-blue-500), 0.1)',
                        borderRadius: '8px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                        }}
                    >
                        <span>Học phí gốc:</span>
                        <span>
                            {invoice.original_amount.toLocaleString()} đ
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            color: 'var(--color-brand-secondary)',
                        }}
                    >
                        <span>Giảm giá:</span>
                        <span>
                            - {invoice.discount_amount.toLocaleString()} đ
                        </span>
                    </div>
                    <hr
                        style={{
                            border: 0,
                            borderTop: '1px solid var(--color-border-soft)',
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '8px',
                            fontWeight: 'bold',
                            fontSize: '18px',
                        }}
                    >
                        <span>Cần thanh toán:</span>
                        <span style={{ color: 'var(--color-brand-primary)' }}>
                            {invoice.final_amount.toLocaleString()} đ
                        </span>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: 500,
                        }}
                    >
                        Phương thức thanh toán:
                    </label>
                    <select
                        value={gateway}
                        onChange={(e) =>
                            setGateway(e.target.value as PaymentGateway)
                        }
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 'var(--input-radius)',
                            border: '1px solid var(--input-border)',
                            background: 'var(--input-bg)',
                            color: 'var(--input-text)',
                        }}
                    >
                        <option value="VNPAY">VNPay</option>
                        <option value="MOMO">Ví MoMo</option>
                    </select>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handlePay}
                        disabled={isPending}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--color-brand-primary)',
                            color: 'white',
                            fontWeight: 600,
                            cursor: isPending ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1
                    style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                    }}
                >
                    Hóa đơn của tôi
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                    Theo dõi lịch sử đóng học phí và thanh toán trực tuyến.
                </p>
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
                                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors"
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

            {selectedInvoice && (
                <PaymentModal
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    )
}
