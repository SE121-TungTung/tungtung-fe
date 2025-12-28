import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { changePassword } from '@/lib/users'
import { getMe } from '@/lib/users'
import { useSession } from '@/stores/session.store'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import FieldMessage from '@/components/common/typography/FieldMessage'

const schema = z
    .object({
        currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu tối thiểu 8 ký tự')
            .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

type Values = z.infer<typeof schema>

interface FirstLoginPasswordModalProps {
    onSuccess?: () => void
}

export default function FirstLoginPasswordModal({
    onSuccess,
}: FirstLoginPasswordModalProps) {
    const setUser = useSession((s) => s.setUser)
    const [apiError, setApiError] = useState<string | undefined>()

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<Values>({
        resolver: zodResolver(schema),
    })

    const newPassword = watch('newPassword')

    const mut = useMutation({
        mutationFn: (payload: {
            current_password: string
            new_password: string
        }) => changePassword(payload),
        onSuccess: async () => {
            try {
                localStorage.removeItem('is_first_login')

                const updatedUser = await getMe()
                setUser(updatedUser)
                onSuccess?.()
            } catch (error) {
                console.error('Failed to refresh user data:', error)
                onSuccess?.()
            }
        },
        onError: (err: any) => {
            setApiError(
                err?.detail ||
                    err?.message ||
                    'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.'
            )
        },
    })

    const onSubmit = (values: Values) => {
        setApiError(undefined)
        mut.mutate({
            current_password: values.currentPassword,
            new_password: values.newPassword,
        })
    }

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    // Password strength indicator
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { label: '', percent: 0, color: '' }

        let strength = 0
        if (pwd.length >= 8) strength += 25
        if (/[A-Z]/.test(pwd)) strength += 25
        if (/[a-z]/.test(pwd)) strength += 25
        if (/[0-9]/.test(pwd)) strength += 25

        if (strength <= 25)
            return { label: 'Yếu', percent: 25, color: '#ff4d4f' }
        if (strength <= 50)
            return { label: 'Trung bình', percent: 50, color: '#faad14' }
        if (strength <= 75)
            return { label: 'Khá', percent: 75, color: '#52c41a' }
        return { label: 'Mạnh', percent: 100, color: '#52c41a' }
    }

    const strength = getPasswordStrength(newPassword)

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Modal Content */}
            <div
                style={{
                    position: 'relative',
                    maxWidth: '500px',
                    width: '100%',
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 24px 72px rgba(0, 0, 0, 0.5)',
                    animation: 'modalSlideIn 0.4s ease-out',
                }}
                role="dialog"
                aria-labelledby="first-login-title"
                aria-modal="true"
            >
                {/* Warning Icon */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background:
                                'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(250, 173, 20, 0.4)',
                        }}
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2
                    id="first-login-title"
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '26px',
                        fontWeight: 600,
                        color: '#fff',
                        textAlign: 'center',
                        letterSpacing: '-0.5px',
                    }}
                >
                    Đổi mật khẩu bắt buộc
                </h2>

                {/* Description */}
                <p
                    style={{
                        margin: '0 0 28px 0',
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.75)',
                        textAlign: 'center',
                        lineHeight: 1.6,
                    }}
                >
                    Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để
                    bảo mật tài khoản.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Current Password */}
                    <div style={{ marginBottom: '16px' }}>
                        <InputField
                            label="Mật khẩu hiện tại"
                            type="password"
                            enablePasswordToggle={true}
                            placeholder="Nhập mật khẩu hiện tại"
                            mode="dark"
                            {...register('currentPassword')}
                        />
                        {errors.currentPassword && (
                            <FieldMessage tone="error" variant="chip">
                                {errors.currentPassword.message}
                            </FieldMessage>
                        )}
                    </div>

                    {/* New Password */}
                    <div style={{ marginBottom: '16px' }}>
                        <InputField
                            label="Mật khẩu mới"
                            type="password"
                            enablePasswordToggle={true}
                            placeholder="Nhập mật khẩu mới"
                            mode="dark"
                            {...register('newPassword')}
                        />

                        {/* Password Strength */}
                        {newPassword && (
                            <div style={{ marginTop: 8 }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 4,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: 'rgba(255,255,255,0.6)',
                                        }}
                                    >
                                        Độ mạnh:
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: strength.color,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {strength.label}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: 3,
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${strength.percent}%`,
                                            height: '100%',
                                            background: strength.color,
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {errors.newPassword && (
                            <FieldMessage tone="error" variant="chip">
                                {errors.newPassword.message}
                            </FieldMessage>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <InputField
                            label="Xác nhận mật khẩu mới"
                            type="password"
                            enablePasswordToggle={true}
                            placeholder="Nhập lại mật khẩu mới"
                            mode="dark"
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <FieldMessage tone="error" variant="chip">
                                {errors.confirmPassword.message}
                            </FieldMessage>
                        )}
                    </div>

                    {/* Requirements Box */}
                    <div
                        style={{
                            marginBottom: '24px',
                            padding: '12px 14px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                color: 'rgba(255,255,255,0.85)',
                                marginBottom: 8,
                                fontWeight: 500,
                            }}
                        >
                            Yêu cầu mật khẩu:
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                fontSize: 11,
                                color: 'rgba(255,255,255,0.65)',
                                lineHeight: 1.7,
                            }}
                        >
                            <li
                                style={{
                                    color:
                                        newPassword && newPassword.length >= 8
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Tối thiểu 8 ký tự
                            </li>
                            <li
                                style={{
                                    color:
                                        newPassword && /[A-Z]/.test(newPassword)
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Ít nhất 1 chữ hoa (A-Z)
                            </li>
                            <li
                                style={{
                                    color:
                                        newPassword && /[a-z]/.test(newPassword)
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Ít nhất 1 chữ thường (a-z)
                            </li>
                            <li
                                style={{
                                    color:
                                        newPassword && /[0-9]/.test(newPassword)
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Ít nhất 1 chữ số (0-9)
                            </li>
                        </ul>
                    </div>

                    {/* API Error */}
                    {apiError && (
                        <div
                            style={{
                                marginBottom: '16px',
                                padding: '10px 12px',
                                background: 'rgba(255, 77, 79, 0.15)',
                                border: '1px solid rgba(255, 77, 79, 0.3)',
                                borderRadius: '8px',
                                color: '#ff9aa2',
                                fontSize: '13px',
                            }}
                            role="alert"
                        >
                            {apiError}
                        </div>
                    )}

                    {/* Submit Button */}
                    <ButtonPrimary
                        type="submit"
                        variant="glass"
                        shape="rounded"
                        loading={mut.isPending}
                        disabled={mut.isPending}
                        style={{ width: '100%' }}
                    >
                        {mut.isPending
                            ? 'Đang đổi mật khẩu...'
                            : 'Xác nhận đổi mật khẩu'}
                    </ButtonPrimary>

                    {/* Info Note */}
                    <p
                        style={{
                            marginTop: '16px',
                            marginBottom: 0,
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            textAlign: 'center',
                            lineHeight: 1.5,
                        }}
                    >
                        ⚠️ Bạn phải đổi mật khẩu để tiếp tục sử dụng hệ thống
                    </p>
                </form>
            </div>

            {/* Animation */}
            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-30px) scale(0.92);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    )
}
