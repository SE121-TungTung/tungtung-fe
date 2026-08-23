import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createSubstitutionRequest } from '@/lib/substitutions'
import { useDialog } from '@/hooks/useDialog'

interface SubstitutionRequestModalProps {
    session: any
    teachers: any[]
    onClose: () => void
}

export function SubstitutionRequestModal({
    session,
    teachers,
    onClose,
}: SubstitutionRequestModalProps) {
    const [subId, setSubId] = useState<string>('')
    const [reason, setReason] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim()) {
            alert('Vui lòng nhập lý do vắng mặt/dạy thế', 'Yêu cầu nhập lý do')
            return
        }

        setIsSubmitting(true)
        try {
            await createSubstitutionRequest({
                class_session_id: session.id,
                target_substitute_id: subId || null,
                reason: reason,
            })
            alert(
                'Gửi yêu cầu dạy thế thành công! Đang chờ phê duyệt/xác nhận.',
                'Thành công'
            )
            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            onClose()
        } catch (err: any) {
            alert(err.message || 'Không thể tạo yêu cầu dạy thế')
        } finally {
            setIsSubmitting(false)
        }
    }

    const sessionDate = new Date(session.session_date)

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                textAlign: 'left',
            }}
        >
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0,
                }}
            >
                Yêu cầu dạy thế
            </h2>

            <div
                style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#475569',
                }}
            >
                <div style={{ marginBottom: '8px' }}>
                    <strong>Buổi học:</strong>{' '}
                    {session.topic || session.title || 'Tổng quan'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                    <strong>Ngày học:</strong>{' '}
                    {sessionDate.toLocaleDateString('vi-VN')}
                </div>
                <div>
                    <strong>Thời gian:</strong> {session.start_time.slice(0, 5)}{' '}
                    - {session.end_time.slice(0, 5)}
                </div>
            </div>

            <div>
                <label
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#334155',
                        marginBottom: '8px',
                    }}
                >
                    Đề xuất giáo viên dạy thế (Tùy chọn)
                </label>
                <select
                    value={subId}
                    onChange={(e) => setSubId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        color: '#1e293b',
                        outline: 'none',
                    }}
                >
                    <option value="">-- Để trống (Admin tự chỉ định) --</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.fullName} ({t.email})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#334155',
                        marginBottom: '8px',
                    }}
                >
                    Lý do vắng mặt / dạy thế{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '8px',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        color: '#475569',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
            </div>
        </form>
    )
}

export default SubstitutionRequestModal
