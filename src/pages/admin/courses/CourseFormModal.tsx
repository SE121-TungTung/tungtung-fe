import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
    createCourse,
    updateCourse,
    type Course,
    type CreateCourseDto,
} from '@/lib/courses'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import styles from './CourseFormModal.module.css'
import { useDialog } from '@/hooks/useDialog'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSaved?: (course: Course) => void
    editing: Course | null
}

const COURSE_LEVELS = [
    { label: 'Mất gốc', value: 'beginner' },
    { label: 'Cơ bản', value: 'elementary' },
    { label: 'Trung cấp', value: 'intermediate' },
    { label: 'Trung cấp+', value: 'upper_intermediate' },
    { label: 'Cao cấp', value: 'advanced' },
    { label: 'Chuyên gia', value: 'proficiency' },
]

const COURSE_STATUSES = [
    { label: 'Đang hoạt động', value: 'active' },
    { label: 'Không hoạt động', value: 'inactive' },
    { label: 'Lưu trữ', value: 'archived' },
]

export const CourseFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSaved,
    editing,
}) => {
    const isEdit = Boolean(editing)
    const formId = 'course-form'
    const { alert: showAlert } = useDialog()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateCourseDto>({
        defaultValues: {
            name: '',
            description: '',
            fee_amount: 500000,
            duration_hours: 40,
            level: 'beginner',
            status: 'active',
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (editing) {
                reset({
                    name: editing.name,
                    description: editing.description ?? '',
                    fee_amount: editing.feeAmount,
                    duration_hours: editing.durationHours,
                    level: editing.level,
                    status: editing.status,
                })
            } else {
                reset({
                    name: '',
                    description: '',
                    fee_amount: 500000,
                    duration_hours: 40,
                    level: 'beginner',
                    status: 'active',
                })
            }
        }
    }, [isOpen, editing, reset])

    const onSubmit = async (data: CreateCourseDto) => {
        try {
            const saved =
                isEdit && editing
                    ? await updateCourse(editing.id, data)
                    : await createCourse(data)
            onSaved?.(saved)
            onClose()
        } catch (error) {
            console.error('Failed to save course:', error)
            showAlert('Lưu khóa học thất bại. Vui lòng thử lại.')
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Cập nhật khóa học' : 'Tạo khóa học'}
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
                        {isEdit ? 'Lưu thay đổi' : 'Tạo khóa học'}
                    </ButtonPrimary>
                </div>
            }
        >
            <form
                id={formId}
                onSubmit={handleSubmit(onSubmit)}
                className={styles.form}
            >
                <InputField
                    label="Tên khóa học"
                    id="name"
                    placeholder="VD: IELTS 7.0 Intensive"
                    error={errors.name?.message}
                    {...register('name', { required: 'Bắt buộc' })}
                />

                {/* Chuyển sang grid 2 cột */}
                <div className={styles.grid2Cols}>
                    <InputField
                        type="number"
                        label="Học phí (VNĐ)"
                        id="fee_amount"
                        placeholder="500000"
                        error={errors.fee_amount?.message}
                        {...register('fee_amount', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 0, message: 'Không thể âm' },
                        })}
                    />
                    <InputField
                        type="number"
                        label="Thời lượng (giờ)"
                        id="duration_hours"
                        placeholder="40"
                        error={errors.duration_hours?.message}
                        {...register('duration_hours', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 1, message: 'Tối thiểu 1' },
                        })}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <SelectField
                        label="Cấp độ"
                        id="level"
                        options={COURSE_LEVELS}
                        registration={register('level', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.level?.message}
                    />
                    <SelectField
                        label="Trạng thái"
                        id="status"
                        options={COURSE_STATUSES}
                        registration={register('status')}
                        error={errors.status?.message}
                    />
                </div>

                {/* Dùng textarea cho Mô tả */}
                <InputField
                    label="Mô tả ngắn về nội dung khóa học"
                    id="description"
                    multiline
                    placeholder="Mô tả ngắn về nội dung khóa học..."
                    rows={4}
                    {...register('description')}
                />
            </form>
        </Modal>
    )
}
