import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import AuthLayout from './AuthLayout'
import FormCard from '@/components/common/form/FormCard'
import Button from '@/components/common/button/Button'
import InputField from '@/components/common/input/InputField'
import FieldMessage from '@/components/common/typography/FieldMessage'
import SuccessModal from '@/components/core/SuccessModal'
import PasswordStrengthIndicator from '@/components/common/password/PasswordStrengthIndicator'
import PasswordRequirements from '@/components/common/password/PasswordRequirement'
import { confirmPasswordReset } from '@/lib/auth'
import ArrowIcon from '@/assets/arrow-left.svg'

/**
 * ResetPasswordPage Component
 *
 * Allows users to set a new password using OTP token
 *
 * Features:
 * - Password strength indicator
 * - Real-time validation feedback
 * - Password requirements checklist
 * - Success modal with redirect
 */

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
        setApiError(undefined)
        mut.mutate(v)
    }

    const handleModalClose = () => {
        setShowSuccessModal(false)
        navigate('/login', { replace: true })
    }

    return (
        <>
            <AuthLayout
                headingPrimary="Đặt lại"
                headingSecondary="mật khẩu"
                headingTertiary="mới"
            >
                <FormCard
                    onSubmit={handleSubmit(onSubmit)}
                    actionsAlign="stretch"
                    actions={
                        <Button
                            type="submit"
                            tone="brand"
                            variant="gradient"
                            size="lg"
                            shape="rounded"
                            glow
                            loading={isSubmitting || mut.isPending}
                            disabled={isSubmitting || mut.isPending}
                        >
                            Đặt lại mật khẩu
                        </Button>
                    }
                >
                    {/* Back Button */}
                    <div style={{ marginBottom: 'var(--primitive-space-6)' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<img src={ArrowIcon} alt="" />}
                            onClick={() => navigate('/login')}
                            type="button"
                        >
                            Trở về đăng nhập
                        </Button>
                    </div>

                    {/* Email Info */}
                    {email && (
                        <>
                            <FieldMessage tone="info" variant="chip">
                                Đặt lại mật khẩu cho: <strong>{email}</strong>
                            </FieldMessage>
                            <div
                                style={{ height: 'var(--primitive-space-4)' }}
                            />
                        </>
                    )}

                    {/* New Password Field */}
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
                    <PasswordStrengthIndicator password={password || ''} />

                    {errors.password && (
                        <FieldMessage
                            tone="error"
                            variant="chip"
                            messageId="pwd-error-msg"
                        >
                            {errors.password.message}
                        </FieldMessage>
                    )}

                    <div style={{ height: 'var(--primitive-space-8)' }} />

                    {/* Confirm Password Field */}
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
                    <PasswordRequirements password={password || ''} />

                    {/* API Error */}
                    {apiError && (
                        <FieldMessage tone="error" variant="chip">
                            {apiError}
                        </FieldMessage>
                    )}
                </FormCard>
            </AuthLayout>

            {/* Success Modal */}
            {showSuccessModal && (
                <SuccessModal
                    title="Đặt lại mật khẩu thành công!"
                    message="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
                    onClose={handleModalClose}
                    buttonText="Đăng nhập ngay"
                />
            )}
        </>
    )
}
