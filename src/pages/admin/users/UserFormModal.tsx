import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type UserFormValues, userFormSchema } from '@/forms/user.schema'
import { type User, type Role, ALL_ROLES } from '@/types/auth'
import { Modal } from '@/components/core/Modal'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import styles from './UserFormModal.module.css'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { createUser, updateUser } from '@/lib/users'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listClasses } from '@/lib/classes'

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    editingUser: User | null
}

const roleDisplayNames: Record<Role, string> = {
    student: 'Học sinh',
    teacher: 'Giáo viên',
    office_admin: 'Admin Văn phòng',
    center_admin: 'Admin Trung tâm',
    system_admin: 'Admin Hệ thống',
}

const roleOptions = ALL_ROLES.map((role) => ({
    label: roleDisplayNames[role],
    value: role,
}))

export const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    editingUser,
}) => {
    const { can } = usePermissions()
    const isEditMode = !!editingUser
    const formId = 'user-form'
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit: rhfHandleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            address: '',
            role: 'student',
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                reset({
                    id: editingUser.id,
                    firstName: editingUser.firstName,
                    lastName: editingUser.lastName,
                    email: editingUser.email,
                    phone: editingUser.phone || '',
                    dateOfBirth: editingUser.dateOfBirth?.split('T')[0] || '',
                    address: editingUser.address || '',
                    role: editingUser.role,
                })
            } else {
                reset({
                    id: undefined,
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    address: '',
                    role: 'student',
                })
            }
        }
    }, [isOpen, isEditMode, editingUser, reset])

    const availableRoles = roleOptions.filter((option) => {
        const currentUserRole = can('user:create:admin')
            ? 'system_admin'
            : can('user:delete')
              ? 'center_admin'
              : 'office_admin'

        if (currentUserRole === 'system_admin') {
            return true
        }
        if (currentUserRole === 'center_admin') {
            return option.value !== 'system_admin'
        }
        if (currentUserRole === 'office_admin') {
            return option.value === 'student' || option.value === 'teacher'
        }
        return false
    })

    const queryKey = useMemo(
        () => [
            'classes',
            {
                status: 'active',
                limit: 100,
            },
        ],
        []
    )

    const { data: classPage, isLoading: isLoadingClasses } = useQuery({
        queryKey: queryKey,
        queryFn: () =>
            listClasses({
                status: 'active',
                limit: 100,
            }),
        staleTime: 60_000,
    })
    const classOptions = (classPage?.items ?? []).map((c) => ({
        label: c.name,
        value: c.id,
    }))

    const onSubmitForm = async (values: UserFormValues) => {
        if (isEditMode && editingUser) {
            const payload = {
                first_name: values.firstName || undefined,
                last_name: values.lastName || undefined,
                phone: values.phone || undefined,
                address: values.address || undefined,
                // Add other fields as necessary:
                // emergency_contact: values.emergencyContact,
                // preferences: values.preferences,
            }
            await updateUser(editingUser.id, payload)
            await queryClient.invalidateQueries({ queryKey: ['users'] })
            onClose()
            return
        }

        const payload = {
            email: values.email,
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone || undefined,
            date_of_birth: values.dateOfBirth || undefined,
            address: values.address || undefined,
            role: values.role,
        }
        const defaultClassId = values.defaultClassId || undefined
        await createUser(payload, { defaultClassId })
        await queryClient.invalidateQueries({ queryKey: ['users'] })
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Chỉnh sửa Người dùng' : 'Tạo Người dùng Mới'}
            footer={
                <div className={styles.footer}>
                    <ButtonPrimary
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </ButtonPrimary>
                    <ButtonPrimary
                        variant="solid"
                        type="submit"
                        form={formId}
                        loading={isSubmitting}
                    >
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo người dùng'}
                    </ButtonPrimary>
                </div>
            }
        >
            <form
                id={formId}
                onSubmit={rhfHandleSubmit(onSubmitForm)}
                className={styles.form}
            >
                <div className={styles.grid2Cols}>
                    <InputField
                        label="Họ"
                        id="firstName"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                        placeholder="Nguyễn Văn"
                    />
                    <InputField
                        label="Tên"
                        id="lastName"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                        placeholder="An"
                    />
                </div>

                <InputField
                    label="Email"
                    id="email"
                    type="email"
                    disabled={isEditMode}
                    {...register('email')}
                    error={errors.email?.message}
                    placeholder="example@email.com"
                />
                <div className={styles.grid2Cols}>
                    <InputField
                        label="Số điện thoại"
                        id="phone"
                        {...register('phone')}
                        error={errors.phone?.message}
                        placeholder="090..."
                    />
                    <InputField
                        label="Ngày sinh"
                        id="dateOfBirth"
                        type="date"
                        {...register('dateOfBirth')}
                        error={errors.dateOfBirth?.message}
                    />
                </div>

                <SelectField
                    label="Vai trò"
                    id="role"
                    registration={register('role')}
                    options={availableRoles}
                    error={errors.role?.message}
                    disabled={isEditMode && !can('user:delete')}
                />

                <SelectField
                    label="Lớp mặc định (tùy chọn)"
                    id="defaultClassId"
                    registration={register('defaultClassId')}
                    options={classOptions}
                    error={errors.defaultClassId?.message}
                    disabled={isLoadingClasses}
                />

                <InputField
                    label="Địa chỉ (Tùy chọn)"
                    id="address"
                    {...register('address')}
                    error={errors.address?.message}
                />
            </form>
        </Modal>
    )
}
