import { useState } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useCalculateRefund, useCreateRefund } from '@/hooks/domain/useFinance'

interface Props {
    enrollmentId: string
    onClose: () => void
}

export function RefundCalculateModal({ enrollmentId, onClose }: Props) {
    const {
        data: calcRes,
        isLoading,
        isError,
    } = useCalculateRefund(enrollmentId)
    const { mutate: createRefund, isPending: isCreating } = useCreateRefund()

    const [reason, setReason] = useState('')
    const [success, setSuccess] = useState(false)

    const calc = calcRes

    const handleCreate = () => {
        if (!calc) return
        createRefund(
            {
                enrollment_id: enrollmentId,
                requested_amount: calc.refundable_amount,
                reason,
            },
            {
                onSuccess: () => {
                    setSuccess(true)
                },
                onError: (err: any) => {
                    alert(
                        'Lỗi khi tạo yêu cầu: ' + (err.message || 'Thử lại sau')
                    )
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
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Card
                variant="glass"
                style={{ width: '100%', maxWidth: '450px', padding: '24px' }}
            >
                {success ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                        }}
                    >
                        <svg
                            width="48"
                            height="48"
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
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 11.5l3 3 6-6"></path>
                        </svg>
                        <h3 style={{ margin: 0, fontSize: '20px' }}>
                            Gửi yêu cầu thành công
                        </h3>
                        <p
                            style={{
                                textAlign: 'center',
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                            }}
                        >
                            Yêu cầu hoàn tiền đã được chuyển đến quản trị viên
                            để phê duyệt.
                        </p>
                        <ButtonPrimary
                            onClick={onClose}
                            style={{ marginTop: '16px' }}
                        >
                            Đóng
                        </ButtonPrimary>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '20px',
                            }}
                        >
                            <div
                                style={{
                                    padding: '8px',
                                    background:
                                        'rgba(var(--primitive-cyan-500), 0.1)',
                                    borderRadius: '8px',
                                    color: 'var(--color-brand-primary)',
                                }}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="4"
                                        y="2"
                                        width="16"
                                        height="20"
                                        rx="2"
                                        ry="2"
                                    ></rect>
                                    <line x1="8" y1="6" x2="16" y2="6"></line>
                                    <line
                                        x1="16"
                                        y1="14"
                                        x2="16.01"
                                        y2="14"
                                    ></line>
                                    <line
                                        x1="12"
                                        y1="14"
                                        x2="12.01"
                                        y2="14"
                                    ></line>
                                    <line
                                        x1="8"
                                        y1="14"
                                        x2="8.01"
                                        y2="14"
                                    ></line>
                                    <line
                                        x1="16"
                                        y1="18"
                                        x2="16.01"
                                        y2="18"
                                    ></line>
                                    <line
                                        x1="12"
                                        y1="18"
                                        x2="12.01"
                                        y2="18"
                                    ></line>
                                    <line
                                        x1="8"
                                        y1="18"
                                        x2="8.01"
                                        y2="18"
                                    ></line>
                                </svg>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '20px' }}>
                                Tính toán hoàn tiền
                            </h3>
                        </div>

                        {isLoading ? (
                            <div
                                style={{
                                    padding: '40px 0',
                                    textAlign: 'center',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Đang tính toán dữ liệu học tập...
                            </div>
                        ) : isError || !calc ? (
                            <div
                                style={{
                                    padding: '16px',
                                    background: 'var(--color-status-danger-bg)',
                                    borderRadius: '8px',
                                    color: 'var(--color-status-danger)',
                                }}
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
                                    style={{ marginBottom: '8px' }}
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
                                <br />
                                Không thể lấy thông tin thanh toán hoặc học viên
                                chưa thanh toán học phí khóa này.
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                }}
                            >
                                <div
                                    style={{
                                        background:
                                            'var(--color-surface-raised)',
                                        padding: '16px',
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
                                        <span
                                            style={{
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            Tổng số buổi:
                                        </span>
                                        <span style={{ fontWeight: 600 }}>
                                            {calc.total_sessions} buổi
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            Đã học:
                                        </span>
                                        <span style={{ fontWeight: 600 }}>
                                            {calc.attended_sessions} buổi
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            Còn lại:
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: 'var(--color-status-info)',
                                            }}
                                        >
                                            {calc.remaining_sessions} buổi
                                        </span>
                                    </div>
                                    <hr
                                        style={{
                                            border: 0,
                                            borderTop:
                                                '1px dashed var(--color-border-medium)',
                                            margin: '12px 0',
                                        }}
                                    />
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: 'var(--color-text-secondary)',
                                            }}
                                        >
                                            Học phí gốc đã đóng:
                                        </span>
                                        <span style={{ fontWeight: 600 }}>
                                            {calc.total_fee.toLocaleString()} đ
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginTop: '8px',
                                            fontSize: '18px',
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>
                                            Số tiền hoàn lại:
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                color: 'var(--color-brand-primary)',
                                            }}
                                        >
                                            {calc.refundable_amount.toLocaleString()}{' '}
                                            đ
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}
                                >
                                    <label
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Lý do hoàn tiền (Bắt buộc):
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) =>
                                            setReason(e.target.value)
                                        }
                                        placeholder="Ví dụ: Chuyển công tác, không thể tiếp tục học..."
                                        rows={3}
                                        style={{
                                            padding: '12px',
                                            borderRadius: 'var(--input-radius)',
                                            border: '1px solid var(--input-border)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--input-text)',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        marginTop: '8px',
                                    }}
                                >
                                    <button
                                        onClick={onClose}
                                        disabled={isCreating}
                                        style={{
                                            padding: '8px 16px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--color-text-secondary)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <ButtonPrimary
                                        onClick={handleCreate}
                                        disabled={
                                            !reason.trim() ||
                                            isCreating ||
                                            calc.refundable_amount <= 0
                                        }
                                    >
                                        {isCreating
                                            ? 'Đang gửi...'
                                            : 'Tạo yêu cầu hoàn tiền'}
                                    </ButtonPrimary>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    )
}
