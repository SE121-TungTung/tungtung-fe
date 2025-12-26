import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import s from '@/pages/auth/Login.module.css'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import ArrowIcon from '@/assets/arrow-left.svg'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import FormCard from '@/components/common/form/FormCard'
import FieldMessage from '@/components/common/typography/FieldMessage'
import LiquidEther from '@/components/effect/LiquidEther'
import { confirmPasswordReset } from '@/lib/auth'
import SuccessModal from '@/components/core/SuccessModal'

// Validation schema
const schema = z
    .object({
        password: z
            .string()
            .min(8, 'Mật khẩu tối thiểu 8 ký tự')
            .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số'),
        confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

type Values = z.infer<typeof schema>

export function ResetPasswordPage() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('otp') || params.get('token') || ''
    const email = params.get('email') || ''

    const [apiError, setApiError] = useState<string | undefined>()
    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<Values>({
        resolver: zodResolver(schema),
    })

    const password = watch('password')

    const mut = useMutation({
        mutationFn: ({ password }: Values) =>
            confirmPasswordReset({ token, new_password: password }),
        onSuccess: () => {
            setShowSuccessModal(true)
        },
        onError: (err: any) => {
            setApiError(
                err?.detail ||
                    err?.message ||
                    'Không thể đổi mật khẩu. Vui lòng thử lại.'
            )
        },
    })

    const onSubmit = (v: Values) => {
        if (!token) {
            setApiError('Mã OTP không hợp lệ. Vui lòng thử lại.')
            return
        }
        mut.mutate(v)
    }

    const handleModalClose = () => {
        setShowSuccessModal(false)
        navigate('/login', { replace: true })
    }

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

    const strength = getPasswordStrength(password)

    return (
        <div>
            <div className={s.bg} aria-hidden="true">
                <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={true}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={1000}
                    autoRampDuration={0.6}
                />
            </div>

            <div className={s.wrap}>
                <div className={s.info}>
                    <div style={{ width: 298 }}>
                        <h1 className={s.h1}>
                            Đặt lại{' '}
                            <span className={s.h1_inside}>mật khẩu mới</span>
                        </h1>
                    </div>
                    <div className="frame">
                        <TextHorizontal
                            className="text-horizontal-instance"
                            icon={
                                <img
                                    src={ChatSquare}
                                    className="chat-square"
                                    alt="chat icon"
                                />
                            }
                            iconStyle="glass"
                            description="Website quản lý trung tâm Anh ngữ số 1 Việt Nam, cung cấp hệ sinh thái đa dạng cho người dạy lẫn người học."
                            ctaText="Tìm hiểu thêm"
                            onCtaClick={() =>
                                window.open(
                                    'https://tungtung-fe.vercel.app',
                                    '_blank'
                                )
                            }
                        />
                    </div>
                </div>

                <FormCard
                    onSubmit={handleSubmit(onSubmit)}
                    actionsAlign="stretch"
                    actions={
                        <ButtonPrimary
                            type="submit"
                            variant="glass"
                            shape="rounded"
                            loading={isSubmitting || mut.isPending}
                            disabled={isSubmitting || mut.isPending}
                        >
                            Đặt lại mật khẩu
                        </ButtonPrimary>
                    }
                >
                    <div className={s.row} style={{ margin: '-8px 0 4px' }}>
                        <ButtonGhost
                            size="sm"
                            mode="dark"
                            leftIcon={<img src={ArrowIcon} alt="back" />}
                            onClick={() => navigate('/login')}
                        >
                            Trở về Login
                        </ButtonGhost>
                    </div>

                    {email && (
                        <FieldMessage tone="info" variant="text">
                            Đặt lại mật khẩu cho: <strong>{email}</strong>
                        </FieldMessage>
                    )}

                    <div style={{ height: 12 }} />

                    {/* New Password */}
                    <InputField
                        label="Mật khẩu mới"
                        type="password"
                        enablePasswordToggle={true}
                        placeholder="Nhập mật khẩu mới"
                        mode="dark"
                        {...register('password')}
                        aria-describedby={
                            errors.password ? 'pwd-error-msg' : undefined
                        }
                    />

                    {/* Password Strength Indicator */}
                    {password && (
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
                                        fontSize: 12,
                                        color: 'rgba(255,255,255,0.7)',
                                    }}
                                >
                                    Độ mạnh mật khẩu:
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
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
                                    height: 4,
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

                    {errors.password && (
                        <FieldMessage
                            tone="error"
                            variant="chip"
                            messageId="pwd-error-msg"
                        >
                            {errors.password.message}
                        </FieldMessage>
                    )}

                    <div style={{ height: 16 }} />

                    {/* Confirm Password */}
                    <InputField
                        label="Xác nhận mật khẩu"
                        type="password"
                        enablePasswordToggle={true}
                        placeholder="Nhập lại mật khẩu mới"
                        mode="dark"
                        {...register('confirmPassword')}
                        aria-describedby={
                            errors.confirmPassword
                                ? 'confirm-pwd-error-msg'
                                : undefined
                        }
                    />
                    {errors.confirmPassword && (
                        <FieldMessage
                            tone="error"
                            variant="chip"
                            messageId="confirm-pwd-error-msg"
                        >
                            {errors.confirmPassword.message}
                        </FieldMessage>
                    )}

                    {/* Password Requirements */}
                    <div
                        style={{
                            marginTop: 12,
                            padding: 12,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 8,
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.9)',
                                marginBottom: 8,
                                fontWeight: 500,
                            }}
                        >
                            Yêu cầu mật khẩu:
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 20,
                                fontSize: 12,
                                color: 'rgba(255,255,255,0.7)',
                                lineHeight: 1.8,
                            }}
                        >
                            <li
                                style={{
                                    color:
                                        password && password.length >= 8
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Tối thiểu 8 ký tự
                            </li>
                            <li
                                style={{
                                    color:
                                        password && /[A-Z]/.test(password)
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Ít nhất 1 chữ hoa (A-Z)
                            </li>
                            <li
                                style={{
                                    color:
                                        password && /[a-z]/.test(password)
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Ít nhất 1 chữ thường (a-z)
                            </li>
                            <li
                                style={{
                                    color:
                                        password && /[0-9]/.test(password)
                                            ? '#52c41a'
                                            : 'inherit',
                                }}
                            >
                                Ít nhất 1 chữ số (0-9)
                            </li>
                        </ul>
                    </div>

                    {apiError && (
                        <div className={s.error} role="alert">
                            {apiError}
                        </div>
                    )}
                </FormCard>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal
                    title="Đặt lại mật khẩu thành công!"
                    message="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
                    onClose={handleModalClose}
                    buttonText="Đăng nhập ngay"
                />
            )}
        </div>
    )
}
