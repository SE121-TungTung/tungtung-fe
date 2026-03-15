import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/forms/login.schema'
import { useMutation } from '@tanstack/react-query'
import { login } from '@/lib/auth'
import { useSession } from '@/stores/session.store'
import { Link, useNavigate } from 'react-router-dom'
import { homePathByRole } from '@/utils/role'
import { useState } from 'react'
import InputField from '@/components/common/input/InputField'
import Button from '@/components/common/button/Button'
import TextCheck from '@/components/common/text/TextCheck'
import FieldMessage from '@/components/common/typography/FieldMessage'
import FormCard from '@/components/common/form/FormCard'
import AuthLayout from './AuthLayout'
import s from './Login.module.css'
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
        formState: { errors, isSubmitting },
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

            if (data.is_first_login) {
                localStorage.setItem('is_first_login', 'true')
            } else {
                localStorage.removeItem('is_first_login')
            }

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
        <AuthLayout
            headingPrimary="Đăng nhập"
            headingSecondary="để truy cập"
            headingTertiary="TungTung"
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
                        loading={isSubmitting || mutation.isPending}
                        disabled={isSubmitting || mutation.isPending}
                    >
                        Đăng nhập
                    </Button>
                }
            >
                {/* Email Field */}
                <InputField
                    label="Email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    mode="light"
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

                <div style={{ height: 'var(--primitive-space-8)' }} />

                {/* Password Field */}
                <InputField
                    label="Mật khẩu"
                    type="password"
                    enablePasswordToggle={true}
                    placeholder="Nhập mật khẩu"
                    mode="dark"
                    aria-describedby={errors.password ? passMsgId : undefined}
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

                <div style={{ height: 'var(--primitive-space-8)' }} />

                {/* Remember & Forgot Password Row */}
                <div className={s.rememberRow}>
                    <TextCheck
                        className={s.rememberCheck}
                        variant="glass"
                        size="sm"
                        inputProps={register('remember')}
                        defaultChecked
                    >
                        Ghi nhớ đăng nhập
                    </TextCheck>

                    <Link to="/forgot-password" className={s.forgotLink}>
                        Quên mật khẩu?
                    </Link>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <FieldMessage tone="error" variant="chip">
                        {apiError}
                    </FieldMessage>
                )}
            </FormCard>
        </AuthLayout>
    )
}
