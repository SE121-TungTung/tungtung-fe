import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FormCard from '@/components/common/form/FormCard'
import Button from '@/components/common/button/Button'
import InputField from '@/components/common/input/InputField'
import FieldMessage from '@/components/common/typography/FieldMessage'
import AuthLayout from './AuthLayout'
import { validatePasswordResetOtp } from '@/lib/auth'
import { useState } from 'react'

const schema = z.object({
    otp: z.string().regex(/^\d+$/, 'OTP chỉ gồm chữ số'),
})
type Values = z.infer<typeof schema>

export default function OtpPage() {
    const [params] = useSearchParams()
    const emailFromQuery = params.get('email')
    const navigate = useNavigate()
    const [apiError, setApiError] = useState<string | undefined>()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Values>({ resolver: zodResolver(schema) })

    const { mutate, isPending } = useMutation({
        mutationFn: ({ otp }: Values) => validatePasswordResetOtp(otp),
        retry: false,
        onSuccess: (res, { otp }) => {
            if (!res?.valid) {
                setApiError('OTP không hợp lệ hoặc đã hết hạn.')
                return
            }
            const emailSrv = (res.email || '').trim().toLowerCase()
            const emailQuery = (emailFromQuery || '').trim().toLowerCase()
            if (emailQuery && emailSrv && emailSrv !== emailQuery) {
                setApiError('Sử dụng đúng mã OTP đã gửi qua mail.')
                return
            }
            navigate(
                `/reset-password?email=${encodeURIComponent(emailSrv)}&otp=${encodeURIComponent(otp)}`,
                { replace: true }
            )
        },
        onError: () => setApiError('Không thể xác thực OTP. Vui lòng thử lại.'),
    })

    return (
        <AuthLayout
            headingPrimary="Nhập"
            headingSecondary="mã OTP"
            headingTertiary="đã gửi qua Email"
        >
            <FormCard
                onSubmit={handleSubmit((v) => mutate(v))}
                actionsAlign="stretch"
                actions={
                    <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        shape="rounded"
                        glow
                        loading={isSubmitting || isPending}
                        disabled={isSubmitting || isPending}
                    >
                        Xác nhận OTP
                    </Button>
                }
            >
                {/* Email Info */}
                {emailFromQuery && (
                    <FieldMessage tone="info" variant="chip">
                        Mã OTP đã được gửi tới:{' '}
                        <strong>{emailFromQuery}</strong>
                    </FieldMessage>
                )}

                <div style={{ height: 'var(--primitive-space-4)' }} />

                {/* OTP Input */}
                <InputField
                    label="Mã OTP"
                    inputMode="numeric"
                    placeholder="Nhập 6 chữ số OTP"
                    mode="dark"
                    maxLength={6}
                    {...register('otp')}
                    aria-describedby={errors.otp ? 'otp-msg' : undefined}
                />
                {errors.otp && (
                    <FieldMessage
                        tone="error"
                        variant="chip"
                        messageId="otp-msg"
                    >
                        {errors.otp.message}
                    </FieldMessage>
                )}

                {/* API Error */}
                {apiError && (
                    <FieldMessage tone="error" variant="chip">
                        {apiError}
                    </FieldMessage>
                )}

                {/* Helper Text */}
                <FieldMessage tone="info" variant="text">
                    Không nhận được mã?{' '}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/forgot-password')}
                        type="button"
                        style={{
                            display: 'inline-flex',
                            padding: 0,
                            textDecoration: 'underline',
                        }}
                    >
                        Gửi lại
                    </Button>
                </FieldMessage>
            </FormCard>
        </AuthLayout>
    )
}
