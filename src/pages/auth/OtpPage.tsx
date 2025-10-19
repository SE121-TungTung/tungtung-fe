import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import s from '@/pages/Auth/Login.module.css'
import FormCard from '@/components/common/form/FormCard'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import FieldMessage from '@/components/common/typography/FieldMessage'
import { validatePasswordResetOtp } from '@/lib/auth'
import { useState } from 'react'
import LiquidEther from '@/components/effect/LiquidEther'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'

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

    const { mutate, isPending, error } = useMutation({
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
                            Nhập <span className={s.h1_inside}>OTP</span> đã gửi
                            qua Email
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
                    onSubmit={handleSubmit((v) => mutate(v))}
                    actionsAlign="stretch"
                    actions={
                        <ButtonPrimary
                            type="submit"
                            variant="glass"
                            shape="rounded"
                            loading={isSubmitting || isPending}
                            disabled={isSubmitting || isPending}
                        >
                            Xác nhận
                        </ButtonPrimary>
                    }
                >
                    {emailFromQuery && (
                        <FieldMessage tone="info" variant="text">
                            OTP đã gửi tới: <strong>{emailFromQuery}</strong>
                        </FieldMessage>
                    )}

                    <InputField
                        label="Mã OTP"
                        inputMode="numeric"
                        placeholder="Nhập OTP"
                        {...register('otp')}
                    />
                    {errors.otp && (
                        <FieldMessage tone="error" variant="chip">
                            {errors.otp.message}
                        </FieldMessage>
                    )}
                    {error && (
                        <FieldMessage tone="error" variant="chip">
                            {apiError}
                        </FieldMessage>
                    )}
                </FormCard>
            </div>
        </div>
    )
}
