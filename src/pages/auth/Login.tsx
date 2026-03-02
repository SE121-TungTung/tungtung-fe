import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/forms/login.schema'
import { useMutation } from '@tanstack/react-query'
import { login, me } from '@/lib/auth'
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
                        loading={isSubmitting || mut.isPending}
                        disabled={isSubmitting || mut.isPending}
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
