import React, { useState, useEffect } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import { useCreateInvoice } from '@/hooks/domain/useFinance'
import { api } from '@/lib/api'
import { createPortal } from 'react-dom'

interface EnrollmentItem {
    id: string
    student_id: string
    class_id: string
    status: string
    // These may come from the auto-generated CRUD
    student_name?: string
    class_name?: string
    created_at?: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: Props) {
    const { mutate: createInvoice, isPending } = useCreateInvoice()

    const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
    const [loadingEnrollments, setLoadingEnrollments] = useState(false)
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('')
    const [discountAmount, setDiscountAmount] = useState('')
    const [note, setNote] = useState('')
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

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
            e.id.toLowerCase().includes(q) ||
            (e.student_id || '').toLowerCase().includes(q)
        )
    })

    const selectedEnrollment = enrollments.find(
        (e) => e.id === selectedEnrollmentId
    )

    const handleSubmit = (ev: React.FormEvent) => {
        ev.preventDefault()
        setError('')

        if (!selectedEnrollmentId) {
            setError('Vui lòng chọn một đăng ký lớp học.')
            return
        }

        createInvoice(
            {
                enrollment_id: selectedEnrollmentId,
                discount_amount: discountAmount
                    ? Number(discountAmount)
                    : undefined,
                note: note || undefined,
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                    onClose()
                },
                onError: (err: any) => {
                    const msg =
                        err?.response?.data?.error?.message ||
                        err?.response?.data?.detail ||
                        err?.message ||
                        'Có lỗi xảy ra khi tạo hóa đơn.'
                    setError(msg)
                },
            }
        )
    }

    const handleReset = () => {
        setSelectedEnrollmentId('')
        setDiscountAmount('')
        setNote('')
        setError('')
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
                style={{ width: '520px', maxHeight: '90vh', overflow: 'auto' }}
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
                        Tạo Hóa Đơn Mới
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}
                    >
                        {/* Enrollment picker */}
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                }}
                            >
                                Chọn đăng ký lớp học{' '}
                                <span
                                    style={{
                                        color: 'var(--color-status-danger)',
                                    }}
                                >
                                    *
                                </span>
                            </label>

                            {/* Search box */}
                            <input
                                type="text"
                                placeholder="Tìm theo tên học viên, lớp, hoặc ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border-soft)',
                                    background: 'var(--input-bg, transparent)',
                                    color: 'var(--input-text, inherit)',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box',
                                }}
                            />

                            {/* Enrollment list */}
                            <div
                                style={{
                                    maxHeight: '200px',
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
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Đang tải danh sách...
                                    </div>
                                ) : filteredEnrollments.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        Không tìm thấy đăng ký nào.
                                    </div>
                                ) : (
                                    filteredEnrollments.map((enr) => {
                                        const isSelected =
                                            enr.id === selectedEnrollmentId
                                        return (
                                            <div
                                                key={enr.id}
                                                onClick={() =>
                                                    setSelectedEnrollmentId(
                                                        enr.id
                                                    )
                                                }
                                                style={{
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    borderBottom:
                                                        '1px solid var(--color-border-soft)',
                                                    background: isSelected
                                                        ? 'var(--color-brand-primary-light, rgba(59, 130, 246, 0.1))'
                                                        : 'transparent',
                                                    transition:
                                                        'background 0.15s',
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{ fontSize: '13px' }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {enr.student_name ||
                                                            `Student: ${enr.student_id?.slice(0, 8)}...`}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        {enr.class_name ||
                                                            `Class: ${enr.class_id?.slice(0, 8)}...`}
                                                        {' · '}
                                                        <span
                                                            style={{
                                                                textTransform:
                                                                    'uppercase',
                                                            }}
                                                        >
                                                            {enr.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="var(--color-brand-primary)"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {selectedEnrollment && (
                                <div
                                    style={{
                                        marginTop: '8px',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        background:
                                            'var(--color-brand-primary-light, rgba(59, 130, 246, 0.08))',
                                        fontSize: '13px',
                                        color: 'var(--color-brand-primary)',
                                        fontWeight: 500,
                                    }}
                                >
                                    Đã chọn:{' '}
                                    {selectedEnrollment.student_name ||
                                        selectedEnrollment.student_id}{' '}
                                    —{' '}
                                    {selectedEnrollment.class_name ||
                                        selectedEnrollment.class_id}
                                </div>
                            )}
                        </div>

                        {/* Discount Amount */}
                        <InputField
                            label="Giảm giá (VNĐ, tùy chọn)"
                            type="number"
                            value={discountAmount}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setDiscountAmount(e.target.value)}
                            placeholder="VD: 500000"
                        />

                        {/* Note */}
                        <InputField
                            label="Ghi chú (tùy chọn)"
                            value={note}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => setNote(e.target.value)}
                            placeholder="VD: Học phí tháng 5/2026"
                        />

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
                                disabled={isPending || !selectedEnrollmentId}
                            >
                                {isPending ? 'Đang tạo...' : 'Tạo hóa đơn'}
                            </ButtonPrimary>
                        </div>
                    </form>
                </Card>
            </div>
        </div>,
        document.body
    )
}
