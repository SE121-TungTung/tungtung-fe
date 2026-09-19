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
        onError: (err: Error) => {
            setApiError(
                err.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.'
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
                padding: '24px 16px',
                background: 'var(--modal-backdrop)',
                backdropFilter: 'blur(12px)',
                overflowY: 'auto',
            }}
        >
            {/* Modal Content */}
            <div
                className="first-login-modal"
                style={{
                    position: 'relative',
                    maxWidth: '480px',
                    width: '100%',
                    maxHeight: 'min(90vh, 680px)',
                    overflowY: 'auto',
                    margin: 'auto',
                    background:
                        'color-mix(in srgb, var(--modal-bg) 85%, transparent)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid var(--color-border-soft)',
                    borderRadius: 'var(--modal-radius, 24px)',
                    padding: '32px 28px',
                    boxShadow: 'var(--modal-shadow)',
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
                        marginBottom: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background:
                                'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(250, 173, 20, 0.35)',
                        }}
                    >
                        <svg
                            width="28"
                            height="28"
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
                        margin: '0 0 6px 0',
                        fontSize: '22px',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        textAlign: 'center',
                        letterSpacing: '-0.5px',
                    }}
                >
                    Đổi mật khẩu bắt buộc
                </h2>

                {/* Description */}
                <p
                    style={{
                        margin: '0 0 20px 0',
                        fontSize: '13.5px',
                        color: 'var(--color-text-secondary)',
                        textAlign: 'center',
                        lineHeight: 1.5,
                    }}
                >
                    Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để
                    bảo mật tài khoản.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Current Password */}
                    <div style={{ marginBottom: '14px' }}>
                        <InputField
                            label="Mật khẩu hiện tại"
                            type="password"
                            enablePasswordToggle={true}
                            placeholder="Nhập mật khẩu hiện tại"
                            {...register('currentPassword')}
                        />
                        {errors.currentPassword && (
                            <FieldMessage tone="error" variant="chip">
                                {errors.currentPassword.message}
                            </FieldMessage>
                        )}
                    </div>

                    {/* New Password */}
                    <div style={{ marginBottom: '14px' }}>
                        <InputField
                            label="Mật khẩu mới"
                            type="password"
                            enablePasswordToggle={true}
                            placeholder="Nhập mật khẩu mới"
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
                                            color: 'var(--color-text-muted)',
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
                                        background: 'var(--color-border-soft)',
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
                    <div style={{ marginBottom: '14px' }}>
                        <InputField
                            label="Xác nhận mật khẩu mới"
                            type="password"
                            enablePasswordToggle={true}
                            placeholder="Nhập lại mật khẩu mới"
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
                            marginBottom: '18px',
                            padding: '10px 14px',
                            background: 'var(--color-surface-raised)',
                            borderRadius: '10px',
                            border: '1px solid var(--color-border-soft)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--color-text-primary)',
                                marginBottom: 6,
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
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
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
                                padding: '11px 14px',
                                background: 'var(--color-status-danger-bg)',
                                border: '1px solid var(--color-status-danger)',
                                borderRadius: '10px',
                                color: 'var(--color-status-danger)',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                lineHeight: 1.5,
                            }}
                            role="alert"
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ flexShrink: 0 }}
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{apiError}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <ButtonPrimary
                        type="submit"
                        variant="solid"
                        size="lg"
                        shape="rounded"
                        loading={mut.isPending}
                        disabled={mut.isPending}
                        style={{
                            width: '100%',
                            minHeight: '48px',
                            fontSize: '15px',
                            fontWeight: 600,
                        }}
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
                            color: 'var(--color-text-muted)',
                            textAlign: 'center',
                            lineHeight: 1.5,
                        }}
                    >
                        ⚠️ Bạn phải đổi mật khẩu để tiếp tục sử dụng hệ thống
                    </p>
                </form>
            </div>

            {/* Animation & Custom Scrollbar */}
            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-24px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .first-login-modal::-webkit-scrollbar {
                    width: 6px;
                }
                .first-login-modal::-webkit-scrollbar-track {
                    background: transparent;
                }
                .first-login-modal::-webkit-scrollbar-thumb {
                    background: var(--color-border-soft);
                    border-radius: 3px;
                }
                .first-login-modal::-webkit-scrollbar-thumb:hover {
                    background: var(--color-text-muted);
                }
            `}</style>
        </div>
    )
}
