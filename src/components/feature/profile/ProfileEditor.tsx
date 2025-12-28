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

// Helper: Format date for input type="date" (YYYY-MM-DD)
const formatDateForInput = (isoString?: string | null) => {
    if (!isoString) return ''
    try {
        return isoString.split('T')[0]
    } catch {
        return ''
    }
}

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

    // Form Profile
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<UserFormValues>({
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            phone: user?.phone ?? '',
            address: user?.address ?? '',
            dateOfBirth: formatDateForInput(user?.dateOfBirth), // Set default value formatting
        },
    })

    // Form Password
    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        watch: watchPassword,
        formState: { errors: passwordErrors, isDirty: isPasswordDirty },
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

    // Reset form when user data loads
    useEffect(() => {
        reset({
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            phone: user?.phone ?? '',
            address: user?.address ?? '',
            dateOfBirth: formatDateForInput(user?.dateOfBirth),
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

    // Helper for Requirement Item
    const RequirementItem = ({
        isValid,
        text,
    }: {
        isValid: boolean
        text: string
    }) => (
        <li className={`${s.reqItem} ${isValid ? s.valid : ''}`}>
            {isValid ? '✓' : '○'} {text}
        </li>
    )

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
                        disabled
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
                        {...register('dateOfBirth')}
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
                        <ButtonPrimary
                            type="submit"
                            disabled={(!isDirty && !avatarFile) || isSubmitting}
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </ButtonPrimary>
                    </div>
                </form>
            </Card>

            <Card title="Đổi mật khẩu" variant="flat" mode="light">
                {passwordMessage && (
                    <div
                        className={`${s.alertMessage} ${
                            passwordMessage.type === 'success'
                                ? s.alertSuccess
                                : s.alertError
                        }`}
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

                    {/* Updated Password Strength UI */}
                    {newPassword && (
                        <div
                            className={`${s.passwordStrengthContainer} ${s.fullWidth}`}
                        >
                            <div className={s.strengthHeader}>
                                <span className={s.strengthLabel}>
                                    Độ mạnh mật khẩu:
                                </span>
                                <span
                                    className={s.strengthValue}
                                    style={{ color: strength.color }}
                                >
                                    {strength.label}
                                </span>
                            </div>
                            <div className={s.strengthBarBg}>
                                <div
                                    className={s.strengthBarFill}
                                    style={{
                                        width: `${strength.percent}%`,
                                        background: strength.color,
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

                    {/* Updated Password Requirements UI */}
                    <div className={`${s.passwordRequirements} ${s.fullWidth}`}>
                        <div className={s.reqTitle}>Yêu cầu mật khẩu:</div>
                        <ul className={s.reqList}>
                            <RequirementItem
                                isValid={Boolean(
                                    newPassword && newPassword.length >= 8
                                )}
                                text="Tối thiểu 8 ký tự"
                            />
                            <RequirementItem
                                isValid={Boolean(
                                    newPassword && /[A-Z]/.test(newPassword)
                                )}
                                text="Ít nhất 1 chữ hoa (A-Z)"
                            />
                            <RequirementItem
                                isValid={Boolean(
                                    newPassword && /[a-z]/.test(newPassword)
                                )}
                                text="Ít nhất 1 chữ thường (a-z)"
                            />
                            <RequirementItem
                                isValid={Boolean(
                                    newPassword && /[0-9]/.test(newPassword)
                                )}
                                text="Ít nhất 1 chữ số (0-9)"
                            />
                        </ul>
                    </div>

                    <div className={`${s.formActions} ${s.fullWidth}`}>
                        <ButtonPrimary
                            type="submit"
                            disabled={!isPasswordDirty || isChangingPassword}
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
