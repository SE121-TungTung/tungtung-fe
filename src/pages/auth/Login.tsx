import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/forms/login.schema'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/lib/auth'
import { useSession } from '@/stores/session.store'
import { Link, useNavigate } from 'react-router-dom'
import { homePathByRole } from '@/utils/role'
import s from '@/pages/auth/Login.module.css'
import { useState } from 'react'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import TextCheck from '@/components/common/text/TextCheck'
import FieldMessage from '@/components/common/typography/FieldMessage'
import FormCard from '@/components/common/form/FormCard'
import LiquidEther from '@/components/effect/LiquidEther'
import { getMe } from '@/lib/users'

const emailMsgId = 'email-msg'
const passMsgId = 'pass-msg'

export function LoginPage() {
    const loginStore = useSession((st) => st.login)
    const setUser = useSession((st) => st.setUser)
    const navigate = useNavigate()
    const [apiError, setApiError] = useState<string | undefined>()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { remember: true },
    })

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: async (data) => {
            // Clear any previous errors
            setApiError(undefined)

            // Save tokens
            loginStore(data.access_token, data.refresh_token)

            try {
                // Fetch full user info
                const me = await getMe()

                // Update user in store
                setUser(me)

                // Navigate to dashboard
                // FirstLoginGuard will handle first login modal
                const redirectPath = homePathByRole(me.role)
                navigate(redirectPath, { replace: true })
            } catch (e: any) {
                console.error('Failed to fetch user info', e)
                setApiError(
                    'Không thể tải thông tin người dùng. Vui lòng thử lại.'
                )
            }
        },
        onError: (error: any) => {
            console.error('Login error:', error)

            // Parse error message
            let errorMessage = 'Đăng nhập thất bại'

            if (error?.status === 401) {
                // Unauthorized - wrong credentials
                errorMessage = 'Email hoặc mật khẩu không chính xác'
            } else if (error?.status === 403) {
                // Forbidden - account not active
                errorMessage = 'Tài khoản chưa được kích hoạt hoặc đã bị khóa'
            } else if (error?.message) {
                // Use backend error message if available
                const msg = error.message.toLowerCase()

                if (
                    msg.includes('email') ||
                    msg.includes('password') ||
                    msg.includes('incorrect')
                ) {
                    errorMessage = 'Email hoặc mật khẩu không chính xác'
                } else if (msg.includes('account') || msg.includes('active')) {
                    errorMessage = 'Tài khoản chưa được kích hoạt'
                } else if (msg.includes('network') || msg.includes('fetch')) {
                    errorMessage =
                        'Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.'
                } else {
                    errorMessage = error.message
                }
            } else if (!navigator.onLine) {
                errorMessage =
                    'Không có kết nối internet. Vui lòng kiểm tra và thử lại.'
            }

            setApiError(errorMessage)
        },
    })

    const onSubmit = (v: LoginValues) => {
        // Clear previous errors before submitting
        setApiError(undefined)
        mutation.mutate(v)
    }

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
                            loading={mutation.isPending}
                            disabled={mutation.isPending}
                        >
                            Đăng nhập
                        </ButtonPrimary>
                    }
                >
                    <InputField
                        label="Email"
                        type="email"
                        placeholder="Nhập email"
                        mode="dark"
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
                        enablePasswordToggle={true}
                        placeholder="Nhập password"
                        mode="dark"
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

                    {/* API Error Display */}
                    {apiError && (
                        <div
                            className={s.error}
                            role="alert"
                            style={{
                                marginTop: '16px',
                                padding: '12px 14px',
                                background: 'rgba(255, 77, 79, 0.15)',
                                border: '1px solid rgba(255, 77, 79, 0.3)',
                                borderRadius: '8px',
                                color: '#ff9aa2',
                                fontSize: '14px',
                                lineHeight: '1.5',
                            }}
                        >
                            {apiError}
                        </div>
                    )}
                </FormCard>
            </div>
        </div>
    )
}
