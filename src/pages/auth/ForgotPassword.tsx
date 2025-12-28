import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import s from '@/pages/auth/Login.module.css'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import ArrowIcon from '@/assets/arrow-left.svg'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import FormCard from '@/components/common/form/FormCard'
import FieldMessage from '@/components/common/typography/FieldMessage'
import { requestPasswordReset } from '@/lib/auth'
import { useState } from 'react'
import LiquidEther from '@/components/effect/LiquidEther'

const schema = z.object({
    email: z.email('Email không hợp lệ'),
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
                            Nhập email{' '}
                            <span className={s.h1_inside}>để nhận</span> mã OTP
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
                            onClick={() =>
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
                            Gửi OTP
                        </ButtonPrimary>
                    }
                >
                    <div className={s.row} style={{ margin: '-8px 0 4px' }}>
                        <ButtonGhost
                            size="sm"
                            mode="dark"
                            leftIcon={<img src={ArrowIcon} />}
                            onClick={() => navigate('/login')}
                        >
                            Trở về Login
                        </ButtonGhost>
                    </div>

                    <InputField
                        label="Email"
                        type="email"
                        placeholder="Nhập Email"
                        mode="dark"
                        {...register('email')}
                        aria-describedby={
                            errors.email ? 'fp-email-msg' : undefined
                        }
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

                    {apiError && (
                        <div className={s.error} role="alert">
                            {apiError}
                        </div>
                    )}
                </FormCard>
            </div>
        </div>
    )
}
