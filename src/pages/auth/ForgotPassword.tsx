import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import InputField from '@/components/common/input/InputField'
import Button from '@/components/common/button/Button'
import FormCard from '@/components/common/form/FormCard'
import FieldMessage from '@/components/common/typography/FieldMessage'
import AuthLayout from './AuthLayout'
import { requestPasswordReset } from '@/lib/auth'
import { useState } from 'react'
import ArrowIcon from '@/assets/arrow-left.svg'

const schema = z.object({
    email: z.string().email('Email không hợp lệ'),
})
type Values = z.infer<typeof schema>

export function ForgotPasswordPage() {
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(schema) })
    const [apiError, setApiError] = useState<string | undefined>()

    const mut = useMutation({
        mutationFn: ({ email }: Values) => requestPasswordReset({ email }),
        onSuccess: (_data, { email }) => {
            navigate(`/otp?email=${encodeURIComponent(email)}`, {
                replace: true,
            })
        },
        onError: async (err: any) => {
            setApiError(
                err?.detail || err?.message || 'Không thể gửi OTP, thử lại.'
            )
        },
    })

    const onSubmit = (v: Values) => mut.mutate(v)

    return (
        <AuthLayout
            headingPrimary="Nhập email"
            headingSecondary="để nhận"
            headingTertiary="mã OTP"
        >
            <FormCard
                onSubmit={handleSubmit(onSubmit)}
                actionsAlign="stretch"
                actions={
                    <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        shape="rounded"
                        glow
                        loading={isSubmitting || mut.isPending}
                        disabled={isSubmitting || mut.isPending}
                    >
                        Gửi mã OTP
                    </Button>
                }
            >
                {/* Back to Login Button */}
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

                {/* Email Field */}
                <InputField
                    label="Email"
                    type="email"
                    placeholder="Nhập địa chỉ email của bạn"
                    mode="dark"
                    {...register('email')}
                    aria-describedby={errors.email ? 'fp-email-msg' : undefined}
                />
                {errors.email && (
                    <FieldMessage
                        tone="error"
                        variant="chip"
                        messageId="fp-email-msg"
                    >
                        {errors.email.message}
                    </FieldMessage>
                )}

                {/* API Error Message */}
                {apiError && (
                    <FieldMessage tone="error" variant="chip">
                        {apiError}
                    </FieldMessage>
                )}

                {/* Helper Text */}
                <FieldMessage tone="info" variant="text">
                    Chúng tôi sẽ gửi mã OTP đến email của bạn để xác thực
                </FieldMessage>
            </FormCard>
        </AuthLayout>
    )
}
