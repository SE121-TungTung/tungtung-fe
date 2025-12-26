import React, { useEffect, useState } from 'react'
import s from './ProfileEditor.module.css'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import type { User } from '@/types/auth'
import type { UserFormValues } from '@/forms/user.schema'
import { useForm } from 'react-hook-form'
import { changePassword } from '@/lib/users'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FieldMessage from '@/components/common/typography/FieldMessage'

import DefaultAvatar from '@/assets/avatar-placeholder.png'

interface ProfileEditorProps {
    user?: User | null
    isSubmitting?: boolean
    onSubmit: (
        v: UserFormValues & { avatarFile?: File | null }
    ) => Promise<void> | void
}

// Password validation schema
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Bắt buộc'),
        newPassword: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
            .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
            .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số'),
        confirmPassword: z.string().min(1, 'Bắt buộc'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })

type PasswordFormValues = z.infer<typeof passwordSchema>

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
    user,
    isSubmitting,
    onSubmit,
}) => {
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [passwordMessage, setPasswordMessage] = useState<{
        type: 'success' | 'error'
        text: string
    } | null>(null)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormValues>({
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            phone: user?.phone ?? '',
            address: user?.address ?? '',
        },
    })

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        watch: watchPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const newPassword = watchPassword('newPassword')

    const { mutateAsync: changePasswordMutate, isPending: isChangingPassword } =
        useMutation({
            mutationFn: (payload: {
                current_password: string
                new_password: string
            }) => changePassword(payload),
            onSuccess: () => {
                setPasswordMessage({
                    type: 'success',
                    text: 'Đổi mật khẩu thành công!',
                })
                resetPassword()
                setTimeout(() => setPasswordMessage(null), 5000)
            },
            onError: (error: any) => {
                setPasswordMessage({
                    type: 'error',
                    text:
                        error?.message ||
                        'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.',
                })
                setTimeout(() => setPasswordMessage(null), 5000)
            },
        })

    useEffect(() => {
        reset({
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            phone: user?.phone ?? '',
            address: user?.address ?? '',
        })
    }, [user, reset])

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setAvatarFile(file)

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }

        if (file) {
            setPreviewUrl(URL.createObjectURL(file))
        } else {
            setPreviewUrl(null)
        }
    }

    const handleClearAvatar = () => {
        setAvatarFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
    }

    const onPasswordSubmit = async (values: PasswordFormValues) => {
        setPasswordMessage(null)
        try {
            await changePasswordMutate({
                current_password: values.currentPassword,
                new_password: values.newPassword,
            })
        } catch (error) {
            console.error('Password change error:', error)
        }
    }

    // Password strength indicator
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { label: '', percent: 0, color: '' }

        let strength = 0
        if (pwd.length >= 8) strength += 25
        if (/[A-Z]/.test(pwd)) strength += 25
        if (/[a-z]/.test(pwd)) strength += 25
        if (/[0-9]/.test(pwd)) strength += 25

        if (strength <= 25)
            return { label: 'Yếu', percent: 25, color: '#ff4d4f' }
        if (strength <= 50)
            return { label: 'Trung bình', percent: 50, color: '#faad14' }
        if (strength <= 75)
            return { label: 'Khá', percent: 75, color: '#52c41a' }
        return { label: 'Mạnh', percent: 100, color: '#52c41a' }
    }

    const strength = getPasswordStrength(newPassword)

    return (
        <div className={s.wrapper}>
            <Card title="Thông tin cá nhân" variant="flat" mode="light">
                <form
                    onSubmit={handleSubmit((v) =>
                        onSubmit({
                            ...v,
                            avatarFile: avatarFile,
                        })
                    )}
                    className={s.formGrid}
                >
                    <div className={s.fullWidth}>
                        <label className={s.label}>Ảnh đại diện</label>

                        <div className={s.avatarSection}>
                            <img
                                src={
                                    previewUrl ||
                                    user?.avatarUrl ||
                                    DefaultAvatar
                                }
                                className={s.avatar}
                                alt="Avatar preview"
                            />

                            <div className={s.avatarControls}>
                                <label className={s.uploadLabel}>
                                    Thay ảnh mới
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                <ButtonPrimary
                                    type="button"
                                    variant="subtle"
                                    onClick={handleClearAvatar}
                                    disabled={
                                        !avatarFile &&
                                        !previewUrl &&
                                        !user?.avatarUrl
                                    }
                                >
                                    Gỡ ảnh hiện tại
                                </ButtonPrimary>
                            </div>
                        </div>
                    </div>

                    <InputField
                        id="lastName"
                        label="Họ"
                        variant="soft"
                        mode="light"
                        className={s.gridItem}
                        {...register('lastName', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.lastName?.message}
                    />

                    <InputField
                        id="firstName"
                        label="Tên"
                        variant="soft"
                        mode="light"
                        className={s.gridItem}
                        {...register('firstName', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.firstName?.message}
                    />

                    <InputField
                        id="email"
                        label="Email"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        value={user?.email ?? ''}
                        readOnly
                    />

                    <InputField
                        id="phone"
                        label="Số điện thoại"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        {...register('phone')}
                    />

                    <InputField
                        id="dateOfBirth"
                        label="Ngày sinh"
                        type="date"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        value={
                            user?.dateOfBirth
                                ? user.dateOfBirth.split('T')[0]
                                : ''
                        }
                        readOnly
                    />

                    <InputField
                        id="address"
                        label="Địa chỉ"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        {...register('address')}
                    />

                    <div className={`${s.formActions} ${s.fullWidth}`}>
                        <ButtonPrimary type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </ButtonPrimary>
                    </div>
                </form>
            </Card>

            <Card title="Đổi mật khẩu" variant="flat" mode="light">
                {passwordMessage && (
                    <div
                        style={{
                            marginBottom: '1.25rem',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor:
                                passwordMessage.type === 'success'
                                    ? '#f6ffed'
                                    : '#fff2f0',
                            border: `1px solid ${
                                passwordMessage.type === 'success'
                                    ? '#b7eb8f'
                                    : '#ffccc7'
                            }`,
                            color:
                                passwordMessage.type === 'success'
                                    ? '#389e0d'
                                    : '#cf1322',
                            fontSize: '14px',
                            fontWeight: 500,
                        }}
                        role="alert"
                    >
                        {passwordMessage.text}
                    </div>
                )}

                <form
                    onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                    className={s.formGrid}
                >
                    <InputField
                        id="currentPassword"
                        label="Mật khẩu cũ"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                        {...registerPassword('currentPassword')}
                    />
                    {passwordErrors.currentPassword && (
                        <div className={s.fullWidth}>
                            <FieldMessage tone="error" variant="chip">
                                {passwordErrors.currentPassword.message}
                            </FieldMessage>
                        </div>
                    )}

                    <InputField
                        id="newPassword"
                        label="Mật khẩu mới"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                        {...registerPassword('newPassword')}
                    />

                    {/* Password Strength Indicator */}
                    {newPassword && (
                        <div className={s.fullWidth}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 6,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: '#8c8c8c',
                                    }}
                                >
                                    Độ mạnh mật khẩu:
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: strength.color,
                                        fontWeight: 600,
                                    }}
                                >
                                    {strength.label}
                                </span>
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: 6,
                                    background: '#f0f0f0',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${strength.percent}%`,
                                        height: '100%',
                                        background: strength.color,
                                        transition: 'all 0.3s ease',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {passwordErrors.newPassword && (
                        <div className={s.fullWidth}>
                            <FieldMessage tone="error" variant="chip">
                                {passwordErrors.newPassword.message}
                            </FieldMessage>
                        </div>
                    )}

                    <InputField
                        id="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                        {...registerPassword('confirmPassword')}
                    />
                    {passwordErrors.confirmPassword && (
                        <div className={s.fullWidth}>
                            <FieldMessage tone="error" variant="chip">
                                {passwordErrors.confirmPassword.message}
                            </FieldMessage>
                        </div>
                    )}

                    {/* Password Requirements */}
                    <div
                        className={s.fullWidth}
                        style={{
                            marginTop: '8px',
                            padding: '12px 14px',
                            background: '#fafafa',
                            borderRadius: '8px',
                            border: '1px solid #e8e8e8',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                color: '#262626',
                                marginBottom: 8,
                                fontWeight: 500,
                            }}
                        >
                            Yêu cầu mật khẩu:
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 20,
                                fontSize: 12,
                                color: '#595959',
                                lineHeight: 1.8,
                            }}
                        >
                            <li
                                style={{
                                    color:
                                        newPassword && newPassword.length >= 8
                                            ? '#52c41a'
                                            : 'inherit',
                                    fontWeight:
                                        newPassword && newPassword.length >= 8
                                            ? 500
                                            : 400,
                                }}
                            >
                                {newPassword && newPassword.length >= 8
                                    ? '✓'
                                    : '○'}{' '}
                                Tối thiểu 8 ký tự
                            </li>
                            <li
                                style={{
                                    color:
                                        newPassword && /[A-Z]/.test(newPassword)
                                            ? '#52c41a'
                                            : 'inherit',
                                    fontWeight:
                                        newPassword && /[A-Z]/.test(newPassword)
                                            ? 500
                                            : 400,
                                }}
                            >
                                {newPassword && /[A-Z]/.test(newPassword)
                                    ? '✓'
                                    : '○'}{' '}
                                Ít nhất 1 chữ hoa (A-Z)
                            </li>
                            <li
                                style={{
                                    color:
                                        newPassword && /[a-z]/.test(newPassword)
                                            ? '#52c41a'
                                            : 'inherit',
                                    fontWeight:
                                        newPassword && /[a-z]/.test(newPassword)
                                            ? 500
                                            : 400,
                                }}
                            >
                                {newPassword && /[a-z]/.test(newPassword)
                                    ? '✓'
                                    : '○'}{' '}
                                Ít nhất 1 chữ thường (a-z)
                            </li>
                            <li
                                style={{
                                    color:
                                        newPassword && /[0-9]/.test(newPassword)
                                            ? '#52c41a'
                                            : 'inherit',
                                    fontWeight:
                                        newPassword && /[0-9]/.test(newPassword)
                                            ? 500
                                            : 400,
                                }}
                            >
                                {newPassword && /[0-9]/.test(newPassword)
                                    ? '✓'
                                    : '○'}{' '}
                                Ít nhất 1 chữ số (0-9)
                            </li>
                        </ul>
                    </div>

                    <div className={`${s.formActions} ${s.fullWidth}`}>
                        <ButtonPrimary
                            type="submit"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword
                                ? 'Đang đổi...'
                                : 'Đổi mật khẩu'}
                        </ButtonPrimary>
                    </div>
                </form>
            </Card>
        </div>
    )
}
