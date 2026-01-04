import React, { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type UserFormValues, userFormSchema } from '@/forms/user.schema'
import {
    type User,
    type Role,
    ALL_ROLES,
    type UpdateUserPayload,
} from '@/types/user.types'
import { Modal } from '@/components/core/Modal'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import styles from './UserFormModal.module.css'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { createUser, updateUser } from '@/lib/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listClasses } from '@/lib/classes'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useDialog } from '@/hooks/useDialog'

interface UserFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
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
    onSuccess,
    editingUser,
}) => {
    // const { can } = usePermissions()
    const qc = useQueryClient()
    const isEditMode = !!editingUser
    const { alert: showAlert } = useDialog()

    // 1. Fetch Classes (Create only)
    const { data: classesData, isLoading: isLoadingClasses } = useQuery({
        queryKey: ['classes', 'list'],
        queryFn: () => listClasses({ limit: 100 }),
        enabled: isOpen && !isEditMode, // Chỉ fetch khi tạo mới
        staleTime: 5 * 60 * 1000,
    })

    const classOptions = useMemo(() => {
        const list = classesData?.items || []
        return [
            { label: 'Không chọn', value: '' },
            ...list.map((c) => ({ label: c.name, value: c.id })),
        ]
    }, [classesData])

    // 2. Setup Form
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            role: 'student',
            defaultClassId: '',
            emergencyContact: { name: '', relationship: '', phone: '' },
        },
    })

    // 3. Reset form data
    useEffect(() => {
        if (isOpen) {
            if (editingUser) {
                // --- MAP DATA KHI EDIT ---
                // Lưu ý: BackendUser có thể chưa trả về emergency_contact nếu API get list chưa include
                // Giả sử editingUser đã có field emergency_contact (cần check lại type User frontend)
                // Nếu User frontend chưa có, ta tạm để trống hoặc fetch detail user nếu cần thiết.
                setValue('firstName', editingUser.firstName)
                setValue('lastName', editingUser.lastName)
                setValue('email', editingUser.email)
                setValue('phone', editingUser.phone || '')
                setValue('dateOfBirth', editingUser.dateOfBirth || '')
                setValue('address', editingUser.address || '')
                setValue('role', editingUser.role)
                setValue('id', editingUser.id)

                if (editingUser.emergencyContact) {
                    setValue(
                        'emergencyContact.name',
                        editingUser.emergencyContact.name || ''
                    )
                    setValue(
                        'emergencyContact.relationship',
                        editingUser.emergencyContact.relationship || ''
                    )
                    setValue(
                        'emergencyContact.phone',
                        editingUser.emergencyContact.phone || ''
                    )
                } else {
                    setValue('emergencyContact', {
                        name: '',
                        relationship: '',
                        phone: '',
                    })
                }
            } else {
                // --- RESET KHI CREATE ---
                reset({
                    role: 'student',
                    defaultClassId: '',
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    dateOfBirth: '',
                    emergencyContact: { name: '', relationship: '', phone: '' },
                })
            }
        }
    }, [isOpen, editingUser, reset, setValue])

    // 4. Mutations
    const createUserMutation = useMutation({
        mutationFn: async (data: { payload: any; opts: any }) => {
            return createUser(data.payload, data.opts)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] })
            onSuccess()
            reset()
            showAlert('Tạo người dùng thành công!')
        },
        onError: (err: any) => {
            showAlert(err?.message || 'Lỗi tạo người dùng')
        },
    })

    const updateUserMutation = useMutation({
        mutationFn: async (data: {
            id: string
            payload: UpdateUserPayload
        }) => {
            // Không truyền avatar file vì Admin không được sửa
            return updateUser(data.id, data.payload)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['users'] })
            onClose()
            reset()
            showAlert('Cập nhật thành công!')
        },
        onError: (err: any) => {
            alert(err?.message || 'Lỗi cập nhật người dùng')
        },
    })

    // 5. Submit Handler
    const onSubmit = (data: UserFormValues) => {
        if (isEditMode && editingUser) {
            const updatePayload: UpdateUserPayload = {
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                address: data.address,
                emergency_contact: data.emergencyContact,
            }

            updateUserMutation.mutate({
                id: editingUser.id,
                payload: updatePayload,
            })
        } else {
            // --- CREATE PAYLOAD ---
            createUserMutation.mutate({
                payload: {
                    email: data.email,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    phone: data.phone,
                    role: data.role,
                    date_of_birth: data.dateOfBirth,
                    address: data.address,
                    // Lưu ý: Nếu BE CreateUser model hỗ trợ emergency_contact thì thêm vào đây
                    // Hiện tại UserCreate model chỉ có fields cơ bản, nên ta bỏ qua hoặc update sau
                },
                opts: { defaultClassId: data.defaultClassId },
            })
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Cập nhật hồ sơ' : 'Thêm người dùng mới'}
            footer={
                <div className={styles.footer}>
                    <ButtonGhost
                        onClick={onClose}
                        className={styles.cancelButton}
                    >
                        Hủy
                    </ButtonGhost>
                    <ButtonPrimary
                        onClick={handleSubmit(onSubmit)}
                        disabled={
                            isSubmitting ||
                            createUserMutation.isPending ||
                            updateUserMutation.isPending
                        }
                        className={styles.submitButton}
                    >
                        {isEditMode ? 'Lưu thay đổi' : 'Tạo mới'}
                    </ButtonPrimary>
                </div>
            }
        >
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                {/* --- NHÓM 1: THÔNG TIN CƠ BẢN --- */}
                <h5 className={styles.sectionTitle}>Thông tin cơ bản</h5>

                <div className={styles.grid2Cols}>
                    <InputField
                        label="Họ"
                        id="firstName"
                        {...register('firstName')}
                        error={errors.firstName?.message}
                        autoFocus
                    />
                    <InputField
                        label="Tên"
                        id="lastName"
                        {...register('lastName')}
                        error={errors.lastName?.message}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        label="Email"
                        id="email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                        disabled={isEditMode} // Không cho sửa Email
                        placeholder="example@domain.com"
                    />
                    <SelectField
                        label="Vai trò"
                        id="role"
                        registration={register('role')}
                        options={roleOptions}
                        error={errors.role?.message}
                        disabled={isEditMode} // Không cho sửa Role
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        label="Ngày sinh"
                        id="dateOfBirth"
                        type="date"
                        {...register('dateOfBirth')}
                        error={errors.dateOfBirth?.message}
                        disabled={isEditMode} // Không cho sửa DoB theo BE
                    />
                    <InputField
                        label="Số điện thoại"
                        id="phone"
                        {...register('phone')}
                        error={errors.phone?.message}
                    />
                </div>

                <InputField
                    label="Địa chỉ"
                    id="address"
                    {...register('address')}
                    error={errors.address?.message}
                />

                {/* --- NHÓM 2: LIÊN HỆ KHẨN CẤP (MỚI) --- */}
                <h5 className={styles.sectionTitle} style={{ marginTop: 12 }}>
                    Liên hệ khẩn cấp
                </h5>

                <div className={styles.grid2Cols}>
                    <InputField
                        label="Tên người liên hệ"
                        {...register('emergencyContact.name')}
                    />
                    <InputField
                        label="Mối quan hệ"
                        {...register('emergencyContact.relationship')}
                        placeholder="VD: Bố, Mẹ..."
                    />
                </div>
                <InputField
                    label="SĐT Khẩn cấp"
                    {...register('emergencyContact.phone')}
                />

                {/* --- NHÓM 3: CẤU HÌNH LỚP (CHỈ CREATE) --- */}
                {!isEditMode && (
                    <>
                        <h5
                            className={styles.sectionTitle}
                            style={{ marginTop: 12 }}
                        >
                            Cấu hình học tập
                        </h5>
                        <SelectField
                            label="Gán vào lớp (Tùy chọn)"
                            id="defaultClassId"
                            registration={register('defaultClassId')}
                            options={classOptions}
                            error={errors.defaultClassId?.message}
                            disabled={isLoadingClasses}
                        />
                    </>
                )}
            </form>
        </Modal>
    )
}
