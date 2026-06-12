import React, { useState, useEffect } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import { useUpdateRefundStatus } from '@/hooks/domain/useFinance'
import type { RefundResponse } from '@/types/finance.types'
import { createPortal } from 'react-dom'

interface Props {
    isOpen: boolean
    onClose: () => void
    refund: RefundResponse | null
    actionType: 'APPROVE' | 'REJECT'
    onSuccess?: () => void
}

export function ApproveRejectRefundModal({
    isOpen,
    onClose,
    refund,
    actionType,
    onSuccess,
}: Props) {
    const { mutate: updateRefundStatus, isPending } = useUpdateRefundStatus()
    const [approvedAmount, setApprovedAmount] = useState('')
    const [note, setNote] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (refund && isOpen) {
            setApprovedAmount(refund.requested_amount.toString())
            setNote('')
            setRejectionReason('')
            setError('')
        }
    }, [refund, isOpen])

    if (!isOpen || !refund) return null

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault()
        setError('')

        if (actionType === 'REJECT' && !rejectionReason.trim()) {
            setError('Vui lòng nhập lý do từ chối.')
            return
        }

        const payload: any = {
            status: actionType === 'APPROVE' ? 'approved' : 'rejected',
        }

        if (actionType === 'APPROVE') {
            payload.approved_amount = approvedAmount
                ? Number(approvedAmount)
                : refund.requested_amount
            if (note.trim()) {
                payload.admin_note = note.trim()
            }
        } else {
            payload.rejection_reason = rejectionReason.trim()
        }

        updateRefundStatus(
            {
                refundId: refund.id,
                payload,
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                    onClose()
                },
                onError: (err: any) => {
                    const msg =
                        err?.response?.data?.detail ||
                        err?.message ||
                        'Có lỗi xảy ra khi cập nhật trạng thái yêu cầu hoàn tiền.'
                    setError(msg)
                },
            }
        )
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
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '480px', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <Card variant="glass" style={{ padding: '24px' }}>
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: '16px',
                            fontSize: '18px',
                            fontWeight: 700,
                            color:
                                actionType === 'APPROVE'
                                    ? 'var(--color-status-success, #22c55e)'
                                    : 'var(--color-status-danger, #ef4444)',
                        }}
                    >
                        {actionType === 'APPROVE'
                            ? 'Phê duyệt yêu cầu hoàn tiền'
                            : 'Từ chối yêu cầu hoàn tiền'}
                    </h3>

                    <div
                        style={{
                            fontSize: '14px',
                            marginBottom: '16px',
                            background:
                                'var(--color-bg-secondary, rgba(255,255,255,0.03))',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border-soft)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                        }}
                    >
                        <div>
                            <strong>Học viên:</strong>{' '}
                            {refund.student_name || 'Học viên'}
                        </div>
                        <div>
                            <strong>Khóa học:</strong>{' '}
                            {refund.course_name || 'Khóa học'}
                        </div>
                        <div>
                            <strong>Số tiền yêu cầu:</strong>{' '}
                            {refund.requested_amount?.toLocaleString()} đ
                        </div>
                        {refund.reason && (
                            <div>
                                <strong>Lý do yêu cầu:</strong> {refund.reason}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '14px',
                        }}
                    >
                        {actionType === 'APPROVE' ? (
                            <>
                                <InputField
                                    label="Số tiền phê duyệt thực tế (VNĐ)"
                                    type="number"
                                    value={approvedAmount}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => setApprovedAmount(e.target.value)}
                                    required
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                    }}
                                >
                                    <label
                                        style={{
                                            fontWeight: 600,
                                            fontSize: '13px',
                                        }}
                                    >
                                        Ghi chú nội bộ
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                        placeholder="Nhập ghi chú nội bộ (nếu có)..."
                                        style={{
                                            width: '100%',
                                            minHeight: '60px',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-border-soft)',
                                            background:
                                                'var(--input-bg, transparent)',
                                            color: 'var(--input-text, inherit)',
                                            fontSize: '14px',
                                            resize: 'vertical',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                }}
                            >
                                <label
                                    style={{
                                        fontWeight: 600,
                                        fontSize: '13px',
                                    }}
                                >
                                    Lý do từ chối{' '}
                                    <span
                                        style={{
                                            color: 'var(--color-status-danger)',
                                        }}
                                    >
                                        *
                                    </span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                    }
                                    placeholder="Nhập lý do từ chối yêu cầu hoàn tiền..."
                                    required
                                    style={{
                                        width: '100%',
                                        minHeight: '80px',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border-soft)',
                                        background:
                                            'var(--input-bg, transparent)',
                                        color: 'var(--input-text, inherit)',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        )}

                        {error && (
                            <div
                                style={{
                                    color: 'var(--color-status-danger)',
                                    fontSize: '13px',
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
                                marginTop: '6px',
                            }}
                        >
                            <ButtonPrimary
                                type="button"
                                onClick={onClose}
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
                                disabled={isPending}
                                style={{
                                    background:
                                        actionType === 'APPROVE'
                                            ? 'var(--color-status-success, #22c55e)'
                                            : 'var(--color-status-danger, #ef4444)',
                                    border: 'none',
                                }}
                            >
                                {isPending ? 'Đang lưu...' : 'Xác nhận'}
                            </ButtonPrimary>
                        </div>
                    </form>
                </Card>
            </div>
        </div>,
        document.body
    )
}
