import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/forms/login.schema'
import { useMutation } from '@tanstack/react-query'
import { login, me } from '@/lib/auth'
import { useSession } from '@/stores/session.store'
import { Link, useNavigate } from 'react-router-dom'
import { homePathByRole } from '@/utils/role'
import s from './Login.module.css'
import { useState } from 'react'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import TextCheck from '@/components/common/text/TextCheck'
import FieldMessage from '@/components/common/typography/FieldMessage'
import FormCard from '@/components/common/form/FormCard'
import LiquidEther from '@/components/effect/LiquidEther'

const emailMsgId = 'email-msg'
const passMsgId = 'pass-msg'

export function LoginPage() {
    const setUser = useSession((st) => st.setUser)
    const navigate = useNavigate()
    const [apiError, setApiError] = useState<string | undefined>()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { remember: true },
    })

    const mut = useMutation({
        mutationFn: login,
        onSuccess: async ({ access_token }, variables) => {
            const storage = variables?.remember ? localStorage : sessionStorage
            storage.setItem('token', access_token)
            try {
                const user = await me()
                setUser(user)
                if (user.isFirstLogin)
                    return navigate('/forgot-password', { replace: true })
                navigate(homePathByRole(user.role), { replace: true })
            } catch (error) {
                console.log(error)
            }
        },
        onError: () => {
            setApiError(
                'Thông tin đăng nhập không chính xác hoặc tài khoản bị khóa.'
            )
        },
    })

    const onSubmit = (v: LoginValues) => mut.mutate(v)

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
                    <div style={{ width: '298px' }}>
                        <h1 className={s.h1}>
                            Đăng nhập{' '}
                            <span className={s.h1_inside}>để truy cập</span>{' '}
                            TungTung
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
                            loading={isSubmitting}
                            disabled={isSubmitting || mut.isPending}
                        >
                            Đăng nhập
                        </ButtonPrimary>
                    }
                >
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="Nhập email"
                        aria-describedby={errors.email ? emailMsgId : undefined}
                        {...register('email', {
                            required: 'Email không hợp lệ',
                        })}
                    />
                    {errors.email && (
                        <FieldMessage
                            tone="error"
                            variant="chip"
                            messageId={emailMsgId}
                        >
                            {errors.email.message || 'Email không hợp lệ'}
                        </FieldMessage>
                    )}

                    <div style={{ height: 20 }} />

                    <InputField
                        label="Password"
                        type="password"
                        placeholder="Nhập password"
                        aria-describedby={
                            errors.password ? passMsgId : undefined
                        }
                        {...register('password', {
                            minLength: {
                                value: 8,
                                message: 'Tối thiểu 8 ký tự',
                            },
                        })}
                    />
                    {errors.password && (
                        <FieldMessage
                            tone="warning"
                            variant="chip"
                            messageId={passMsgId}
                        >
                            {errors.password.message ||
                                'Mật khẩu tối thiểu 8 ký tự'}
                        </FieldMessage>
                    )}

                    <div style={{ height: 20 }} />

                    <div className={`${s.row} ${s.rowCompact}`}>
                        <TextCheck
                            className={s.remember}
                            variant="glass"
                            size="sm"
                            inputProps={register('remember')}
                            defaultChecked
                        >
                            Ghi nhớ đăng nhập
                        </TextCheck>

                        <Link to="/forgot-password" className={s.forgot}>
                            Quên mật khẩu?
                        </Link>
                    </div>

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
