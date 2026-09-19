import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

export default function PaymentCallbackPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'success' | 'failed' | 'loading'>(
        'loading'
    )

    useEffect(() => {
        // VNPay success: vnp_ResponseCode === '00'
        // MoMo success: resultCode === '0'
        const vnpCode = searchParams.get('vnp_ResponseCode')
        const momoCode = searchParams.get('resultCode')

        if (vnpCode !== null) {
            setStatus(vnpCode === '00' ? 'success' : 'failed')
        } else if (momoCode !== null) {
            setStatus(momoCode === '0' ? 'success' : 'failed')
        } else {
            // Trường hợp không có param nào, có thể do user F5
            setStatus('failed')
        }
    }, [searchParams])

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
            }}
        >
            <Card
                variant="glass"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '40px 24px',
                    textAlign: 'center',
                }}
            >
                {status === 'loading' ? (
                    <div>Đang xử lý kết quả giao dịch...</div>
                ) : status === 'success' ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                color: 'var(--color-status-success-dark, #02bc2a)',
                            }}
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h2 style={{ fontSize: '24px', margin: 0 }}>
                            Thanh toán thành công!
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-secondary)',
                                marginBottom: '24px',
                            }}
                        >
                            Hệ thống đã ghi nhận khoản thanh toán của bạn. Hóa
                            đơn sẽ sớm được cập nhật trạng thái.
                        </p>
                        <ButtonPrimary
                            onClick={() =>
                                navigate('/student/finance/invoices')
                            }
                        >
                            Về danh sách hóa đơn
                        </ButtonPrimary>
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ color: 'var(--color-status-danger)' }}
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        <h2 style={{ fontSize: '24px', margin: 0 }}>
                            Giao dịch thất bại!
                        </h2>
                        <p
                            style={{
                                color: 'var(--color-text-secondary)',
                                marginBottom: '24px',
                            }}
                        >
                            Quá trình thanh toán đã bị hủy hoặc xảy ra lỗi. Vui
                            lòng thử lại sau.
                        </p>
                        <ButtonPrimary
                            onClick={() =>
                                navigate('/student/finance/invoices')
                            }
                        >
                            Thu lại trang Hóa đơn
                        </ButtonPrimary>
                    </div>
                )}
            </Card>
        </div>
    )
}
