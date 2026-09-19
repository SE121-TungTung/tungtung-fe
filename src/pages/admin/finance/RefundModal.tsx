import React, { useState, useEffect } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useCreateRefund } from '@/hooks/domain/useFinance'
import { api } from '@/lib/api'
import { createPortal } from 'react-dom'

interface EnrollmentItem {
    id: string
    student_id: string
    class_id: string
    status: string
    payment_status: string
    student_name?: string
    class_name?: string
}

interface RefundCalculationResponse {
    sessions_total: number
    sessions_attended: number
    sessions_remaining: number
    original_fee: number
    refundable_amount: number
}

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function RefundModal({ isOpen, onClose, onSuccess }: Props) {
    const { mutate: createRefund, isPending: isSubmitting } = useCreateRefund()

    const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
    const [loadingEnrollments, setLoadingEnrollments] = useState(false)
    const [enrollmentId, setEnrollmentId] = useState('')
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    // Calculation states
    const [calcResult, setCalcResult] =
        useState<RefundCalculationResponse | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)
    const [calcError, setCalcError] = useState('')

    useEffect(() => {
        if (!isOpen) return
        setLoadingEnrollments(true)
        api<any>('/api/v1/classenrollments?limit=100')
            .then((res: any) => {
                const items =
                    res?.data || res?.items || (Array.isArray(res) ? res : [])
                setEnrollments(items)
            })
            .catch(() => setEnrollments([]))
            .finally(() => setLoadingEnrollments(false))
    }, [isOpen])

    if (!isOpen) return null

    const filteredEnrollments = enrollments.filter((e) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            (e.student_name || '').toLowerCase().includes(q) ||
            (e.class_name || '').toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q)
        )
    })

    const handleCalculate = async () => {
        if (!enrollmentId) {
            setCalcError('Vui lòng nhập hoặc chọn ID đăng ký.')
            return
        }
        setIsCalculating(true)
        setCalcError('')
        setCalcResult(null)
        setError('')
        try {
            const res = await api<any>(
                `/api/v1/refunds/calculate?enrollment_id=${enrollmentId}`
            )
            const data = res?.data || res
            if (
                data &&
                (data.refundable_amount !== undefined ||
                    data.original_fee !== undefined)
            ) {
                setCalcResult({
                    sessions_total: Number(data.sessions_total || 0),
                    sessions_attended: Number(data.sessions_attended || 0),
                    sessions_remaining: Number(data.sessions_remaining || 0),
                    original_fee: Number(data.original_fee || 0),
                    refundable_amount: Number(data.refundable_amount || 0),
                })
            } else {
                setCalcError('Không thể tính toán số tiền hoàn.')
            }
        } catch (err: any) {
            setCalcError(
                err?.response?.data?.detail ||
                    err?.message ||
                    'Có lỗi xảy ra khi tính toán hoàn tiền. Đảm bảo đăng ký này đã thanh toán hóa đơn.'
            )
        } finally {
            setIsCalculating(false)
        }
    }

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault()
        setError('')

        if (!enrollmentId) {
            setError('Vui lòng nhập hoặc chọn một đăng ký.')
            return
        }

        if (!calcResult) {
            setError('Vui lòng thực hiện tính tiền hoàn trước.')
            return
        }

        createRefund(
            {
                enrollment_id: enrollmentId,
                requested_amount: calcResult.refundable_amount,
                reason: reason || 'Yêu cầu hoàn tiền giữa khóa',
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                    handleClose()
                },
                onError: (err: any) => {
                    const msg =
                        err?.response?.data?.detail ||
                        err?.message ||
                        'Có lỗi xảy ra khi tạo yêu cầu hoàn tiền.'
                    setError(msg)
                },
            }
        )
    }

    const handleReset = () => {
        setEnrollmentId('')
        setReason('')
        setError('')
        setCalcResult(null)
        setCalcError('')
        setSearchQuery('')
    }

    const handleClose = () => {
        handleReset()
        onClose()
    }

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
            onClick={handleClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '560px', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <Card variant="glass" style={{ padding: '28px' }}>
                    <h2
                        style={{
                            marginTop: 0,
                            marginBottom: '20px',
                            fontSize: '20px',
                            fontWeight: 700,
                        }}
                    >
                        Yêu cầu hoàn tiền (Tính toán)
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        {/* Enrollment Selection */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                }}
                            >
                                Nhập ID đăng ký hoặc chọn từ danh sách{' '}
                                <span
                                    style={{
                                        color: 'var(--color-status-danger)',
                                    }}
                                >
                                    *
                                </span>
                            </label>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Nhập ID đăng ký (Enrollment UUID)..."
                                    value={enrollmentId}
                                    onChange={(e) => {
                                        setEnrollmentId(e.target.value)
                                        setCalcResult(null)
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border-soft)',
                                        background:
                                            'var(--input-bg, transparent)',
                                        color: 'var(--input-text, inherit)',
                                        fontSize: '14px',
                                    }}
                                />
                                <ButtonPrimary
                                    type="button"
                                    onClick={handleCalculate}
                                    disabled={isCalculating || !enrollmentId}
                                    variant="solid"
                                    tone="brand"
                                >
                                    {isCalculating
                                        ? 'Đang tính...'
                                        : 'Tính hoàn tiền'}
                                </ButtonPrimary>
                            </div>

                            {/* Search box for selecting from list */}
                            <input
                                type="text"
                                placeholder="Tìm nhanh học viên để lấy ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border-soft)',
                                    background: 'var(--input-bg, transparent)',
                                    color: 'var(--input-text, inherit)',
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    boxSizing: 'border-box',
                                }}
                            />

                            {/* Enrollment picker list */}
                            <div
                                style={{
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    border: '1px solid var(--color-border-soft)',
                                    borderRadius: '8px',
                                    background:
                                        'var(--color-bg-secondary, #f8fafc)',
                                }}
                            >
                                {loadingEnrollments ? (
                                    <div
                                        style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Đang tải danh sách...
                                    </div>
                                ) : filteredEnrollments.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '12px',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Không tìm thấy đăng ký nào.
                                    </div>
                                ) : (
                                    filteredEnrollments.map((enr) => {
                                        const isSelected =
                                            enr.id === enrollmentId
                                        return (
                                            <div
                                                key={enr.id}
                                                onClick={() => {
                                                    setEnrollmentId(enr.id)
                                                    setCalcResult(null)
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                    background: isSelected
                                                        ? 'var(--color-brand-primary-light, rgba(59, 130, 246, 0.1))'
                                                        : 'transparent',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div>
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {enr.student_name ||
                                                            'Học viên'}
                                                    </span>
                                                    {' - '}
                                                    <span
                                                        style={{
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        {enr.class_name ||
                                                            'Lớp'}
                                                    </span>
                                                    <div
                                                        style={{
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-muted)',
                                                        }}
                                                    >
                                                        ID: {enr.id}
                                                    </div>
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background:
                                                            enr.payment_status ===
                                                            'paid'
                                                                ? 'rgba(34, 197, 94, 0.1)'
                                                                : 'rgba(239, 68, 68, 0.1)',
                                                        color:
                                                            enr.payment_status ===
                                                            'paid'
                                                                ? 'rgb(34, 197, 94)'
                                                                : 'rgb(239, 68, 68)',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {enr.payment_status ===
                                                    'paid'
                                                        ? 'Đã thanh toán'
                                                        : 'Chưa thanh toán'}
                                                </span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Calculation Error */}
                        {calcError && (
                            <div
                                style={{
                                    color: 'var(--color-status-danger)',
                                    fontSize: '13px',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                }}
                            >
                                {calcError}
                            </div>
                        )}

                        {/* Calculation Results */}
                        {calcResult && (
                            <div
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    background:
                                        'var(--color-bg-secondary, rgba(255, 255, 255, 0.05))',
                                    border: '1px solid var(--color-border-soft)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    fontSize: '14px',
                                }}
                            >
                                <h4
                                    style={{
                                        margin: '0 0 4px 0',
                                        fontWeight: 600,
                                    }}
                                >
                                    Kết quả tính toán hoàn tiền
                                </h4>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Tổng số buổi học:
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {calcResult.sessions_total} buổi
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Số buổi đã học:
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {calcResult.sessions_attended} buổi
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Số buổi còn lại:
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: 'var(--color-brand-primary)',
                                        }}
                                    >
                                        {calcResult.sessions_remaining} buổi
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        borderTop:
                                            '1px solid var(--color-border-soft)',
                                        paddingTop: '8px',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        Học phí đã đóng:
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {calcResult.original_fee.toLocaleString()}{' '}
                                        đ
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '16px',
                                        fontWeight: 700,
                                        color: 'var(--color-status-success)',
                                        borderTop:
                                            '1px double var(--color-border-soft)',
                                        paddingTop: '8px',
                                    }}
                                >
                                    <span>Số tiền hoàn đề xuất:</span>
                                    <span>
                                        {calcResult.refundable_amount.toLocaleString()}{' '}
                                        đ
                                    </span>
                                </div>
                                <p
                                    style={{
                                        fontSize: '11px',
                                        color: 'var(--color-text-muted)',
                                        margin: '4px 0 0 0',
                                        fontStyle: 'italic',
                                    }}
                                >
                                    * Công thức: (Sessions còn lại / Tổng
                                    Sessions) × Học phí đóng. Làm tròn xuống
                                    hàng ngàn.
                                </p>
                            </div>
                        )}

                        {/* Reason */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                            }}
                        >
                            <label
                                style={{ fontWeight: 600, fontSize: '14px' }}
                            >
                                Lý do hoàn tiền
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Nhập lý do hoàn tiền (ví dụ: Học viên chuyển chỗ ở, v.v.)..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border-soft)',
                                    background: 'var(--input-bg, transparent)',
                                    color: 'var(--input-text, inherit)',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {error && (
                            <div
                                style={{
                                    color: 'var(--color-status-danger)',
                                    fontSize: '14px',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                marginTop: '8px',
                            }}
                        >
                            <ButtonPrimary
                                type="button"
                                onClick={handleClose}
                                style={{
                                    background: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    border: '1px solid var(--color-border-soft)',
                                }}
                            >
                                Hủy
                            </ButtonPrimary>
                            <ButtonPrimary
                                type="submit"
                                disabled={isSubmitting || !calcResult}
                            >
                                {isSubmitting
                                    ? 'Đang tạo yêu cầu...'
                                    : 'Gửi yêu cầu hoàn tiền'}
                            </ButtonPrimary>
                        </div>
                    </form>
                </Card>
            </div>
        </div>,
        document.body
    )
}
