import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/forms/login.schema'
import { useMutation } from '@tanstack/react-query'
import { login, me } from '@/lib/auth'
import { useSession } from '@/stores/session.store'
import { useNavigate } from 'react-router-dom'
import { homePathByRole } from '@/utils/role'
import s from './Login.module.css'
import { useState } from 'react'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

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
        mutationFn: (v: LoginValues) => login(v),
        onSuccess: async ({ access_token }) => {
            localStorage.setItem('token', access_token)
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
        onError: (e: any) => {
            console.log(e)
            setApiError(
                'Thông tin đăng nhập không chính xác hoặc tài khoản bị khóa.'
            )
        },
    })

    const onSubmit = (v: LoginValues) => mut.mutate(v)

    return (
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
                        buttonLogoIcon={
                            <img
                                src={ChatSquare}
                                className="chat-square"
                                color="white"
                            />
                        }
                        buttonLogoStyle="glass"
                        buttonPrimaryClassName="text-horizontal-2"
                        className="text-horizontal-instance"
                        text="TungTung - Website quản lý trung tâm Anh ngữ số 1 Việt Nam, cung cấp hệ sinh thái đa dạng cho người dạy lẫn người học"
                        text1="Tìm hiểu thêm"
                    />
                </div>
            </div>

            <form
                className={s.card}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <InputField
                    label="Email"
                    variant="glass"
                    placeholder="Nhập email"
                    type="email"
                    {...register('email')}
                ></InputField>
                {errors.email && (
                    <div className={s.error}>{errors.email.message}</div>
                )}

                <div style={{ height: 20 }} />

                <InputField
                    label="Password"
                    variant="glass"
                    placeholder="Nhập password"
                    type="password"
                    enablePasswordToggle={true}
                    {...register('password')}
                ></InputField>
                {errors.email && (
                    <div className={s.error}>{errors.email.message}</div>
                )}
                {errors.password && (
                    <div className={s.error}>{errors.password.message}</div>
                )}

                <div style={{ height: 20 }} />

                <div className={s.row}>
                    <label>
                        <input type="checkbox" {...register('remember')} /> Ghi
                        nhớ đăng nhập
                    </label>
                    <a href="/forgot-password">Quên mật khẩu?</a>
                </div>

                {apiError && (
                    <div className={s.error} role="alert">
                        {apiError}
                    </div>
                )}
                <ButtonPrimary
                    type="submit"
                    variant="glass"
                    shape="rounded"
                    loading={isSubmitting}
                    disabled={isSubmitting || mut.isPending}
                    onClick={() => onSubmit}
                    style={{ width: '100%', height: '100%', padding: '10px' }}
                >
                    Đăng nhập
                </ButtonPrimary>
            </form>
        </div>
    )
}
