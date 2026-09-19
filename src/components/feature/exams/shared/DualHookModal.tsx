import React, { useState } from 'react'
import s from './DualHookModal.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import { submitDualHook } from '@/lib/auth'
import { useGuestSession } from '@/stores/guestSession.store'
import { useSession } from '@/stores/session.store'
import { useNavigate } from 'react-router-dom'
import { useDialog } from '@/hooks/useDialog'

interface DualHookModalProps {
    isOpen: boolean
    onClose?: () => void
    attemptId: string
}

export default function DualHookModal({
    isOpen,
    onClose,
    attemptId,
}: DualHookModalProps) {
    const { getGuestSessionId, clearGuestSessionId } = useGuestSession()
    const { fetchUser } = useSession()
    const navigate = useNavigate()
    const { alert } = useDialog()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const guestSessionId = getGuestSessionId()
        if (!guestSessionId) return

        setLoading(true)
        try {
            const res = await submitDualHook({
                guest_session_id: guestSessionId,
                full_name: fullName,
                email: email,
                phone: phoneNumber,
                intent: 'GUEST_EXAM_CONVERSION',
            })

            // Log user in
            localStorage.setItem('access_token', res.access_token)
            localStorage.setItem('refresh_token', res.refresh_token)
            await fetchUser()

            // Clear guest session
            clearGuestSessionId()

            // Navigate to real test result
            navigate(`/student/tests/results/${attemptId}`)
        } catch (error: any) {
            console.error('Failed to submit dual hook:', error)
            alert(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={s.overlay}>
            <div className={s.modal}>
                {onClose && (
                    <button className={s.closeButton} onClick={onClose}>
                        &times;
                    </button>
                )}
                <h2 className={s.title}>Mở Khóa Giải Thích Chi Tiết</h2>
                <p className={s.description}>
                    Tuyệt vời! Bạn đã hoàn thành bài thi thử. Để xem chi tiết
                    đáp án đúng sai, lời giải chi tiết và nhận tư vấn lộ trình
                    học phù hợp, vui lòng điền thông tin bên dưới nhé.
                </p>
                <form onSubmit={handleSubmit} className={s.form}>
                    <InputField
                        label="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        required
                    />
                    <InputField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                    />
                    <InputField
                        label="Số điện thoại"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0912345678"
                        required
                    />
                    <ButtonPrimary
                        type="submit"
                        disabled={loading}
                        className={s.submitBtn}
                    >
                        {loading ? 'Đang xử lý...' : 'Xem đáp án & Nhận tư vấn'}
                    </ButtonPrimary>
                </form>
            </div>
        </div>
    )
}
