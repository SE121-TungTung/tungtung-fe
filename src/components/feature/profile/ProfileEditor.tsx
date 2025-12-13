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

interface ProfileEditorProps {
    user?: User | null
    isSubmitting?: boolean
    onSubmit: (
        v: UserFormValues & { avatarFile?: File | null }
    ) => Promise<void> | void
}

type PasswordFormValues = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
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
        // watch,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormValues>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

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
                setTimeout(() => setPasswordMessage(null), 3000)
            },
            onError: () => {
                setPasswordMessage({
                    type: 'error',
                    text: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.',
                })
                setTimeout(() => setPasswordMessage(null), 3000)
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
        if (values.newPassword !== values.confirmPassword) {
            setPasswordMessage({
                type: 'error',
                text: 'Mật khẩu xác nhận không khớp.',
            })
            return
        }

        try {
            await changePasswordMutate({
                current_password: values.currentPassword,
                new_password: values.newPassword,
            })
        } catch (error) {
            console.error('Password change error:', error)
        }
    }

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
                        <div className={s.avatarRow}>
                            <img
                                src={
                                    previewUrl ||
                                    user?.avatarUrl ||
                                    '/avatar-placeholder.png'
                                }
                                className={s.avatarPreview}
                                alt="Avatar preview"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            <button
                                type="button"
                                className={s.clearBtn}
                                onClick={handleClearAvatar}
                                disabled={!avatarFile && !previewUrl}
                            >
                                Xóa avatar
                            </button>
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
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            backgroundColor:
                                passwordMessage.type === 'success'
                                    ? '#d4edda'
                                    : '#f8d7da',
                            color:
                                passwordMessage.type === 'success'
                                    ? '#155724'
                                    : '#721c24',
                        }}
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
                        {...registerPassword('currentPassword', {
                            required: 'Bắt buộc',
                        })}
                        error={passwordErrors.currentPassword?.message}
                    />

                    <InputField
                        id="newPassword"
                        label="Mật khẩu mới"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                        {...registerPassword('newPassword', {
                            required: 'Bắt buộc',
                            minLength: {
                                value: 6,
                                message: 'Mật khẩu phải có ít nhất 6 ký tự',
                            },
                        })}
                        error={passwordErrors.newPassword?.message}
                    />

                    <InputField
                        id="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        variant="soft"
                        mode="light"
                        className={s.fullWidth}
                        enablePasswordToggle
                        {...registerPassword('confirmPassword', {
                            required: 'Bắt buộc',
                        })}
                        error={passwordErrors.confirmPassword?.message}
                    />

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
