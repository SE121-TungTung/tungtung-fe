import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
    createCourse,
    updateCourse,
    type Course,
    type CreateCourseDto,
    type CourseType,
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

const COURSE_TYPES = [
    { label: 'Tiếng Anh tổng quát', value: 'general_english' },
    { label: 'IELTS', value: 'ielts' },
    { label: 'TOEIC', value: 'toeic' },
    { label: 'TOEFL', value: 'toefl' },
    { label: 'Tiếng Anh thương mại', value: 'business' },
    { label: 'Giao tiếp', value: 'conversation' },
    { label: 'Ngữ pháp', value: 'grammar' },
    { label: 'Viết', value: 'writing' },
]

const CURRENCIES = [
    { label: 'VND', value: 'VND' },
    { label: 'USD', value: 'USD' },
]

type FormValues = {
    name: string
    description: string
    fee_amount: number
    duration_hours: number
    level: string
    status: string
    course_type: CourseType
    max_students: number
    min_students: number
    currency: string
    syllabus_chapters: string[]
    objectivesText: string
    prerequisitesText: string
}

interface SyllabusEditorProps {
    value: string[]
    onChange: (value: string[]) => void
}

const SyllabusEditor: React.FC<SyllabusEditorProps> = ({
    value = [],
    onChange,
}) => {
    const handleAdd = () => {
        onChange([...value, ''])
    }

    const handleChange = (index: number, text: string) => {
        const copy = [...value]
        copy[index] = text
        onChange(copy)
    }

    const handleRemove = (index: number) => {
        const copy = value.filter((_, i) => i !== index)
        onChange(copy)
    }

    const handleMoveUp = (index: number) => {
        if (index === 0) return
        const copy = [...value]
        const temp = copy[index]
        copy[index] = copy[index - 1]
        copy[index - 1] = temp
        onChange(copy)
    }

    const handleMoveDown = (index: number) => {
        if (index === value.length - 1) return
        const copy = [...value]
        const temp = copy[index]
        copy[index] = copy[index + 1]
        copy[index + 1] = temp
        onChange(copy)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {value.map((chapter, idx) => (
                <div
                    key={idx}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <span
                        style={{
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                            minWidth: '70px',
                        }}
                    >
                        Chương {idx + 1}:
                    </span>
                    <input
                        type="text"
                        value={chapter}
                        placeholder={`Tên chương ${idx + 1}...`}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border-soft)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-primary)',
                            fontSize: '13px',
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border-soft)',
                            backgroundColor: 'transparent',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.3 : 1,
                            color: 'var(--color-text-primary)',
                        }}
                        title="Di chuyển lên"
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === value.length - 1}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border-soft)',
                            backgroundColor: 'transparent',
                            cursor:
                                idx === value.length - 1
                                    ? 'not-allowed'
                                    : 'pointer',
                            opacity: idx === value.length - 1 ? 0.3 : 1,
                            color: 'var(--color-text-primary)',
                        }}
                        title="Di chuyển xuống"
                    >
                        ▼
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--status-danger-500-light)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--status-danger-500-light)',
                            cursor: 'pointer',
                        }}
                        title="Xóa chương này"
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={handleAdd}
                style={{
                    alignSelf: 'flex-start',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px dashed var(--color-border-soft)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginTop: '4px',
                    transition: 'all 0.2s',
                }}
            >
                + Thêm chương mới
            </button>
        </div>
    )
}

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
        control,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: '',
            description: '',
            fee_amount: 500000,
            duration_hours: 40,
            level: 'beginner',
            status: 'active',
            course_type: 'general_english',
            max_students: 25,
            min_students: 8,
            currency: 'VND',
            syllabus_chapters: [''],
            objectivesText: '',
            prerequisitesText: '',
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
                    course_type: editing.courseType,
                    max_students: editing.maxStudents,
                    min_students: editing.minStudents,
                    currency: editing.currency || 'VND',
                    syllabus_chapters: editing.syllabus?.chapters || [''],
                    objectivesText: (editing.learningObjectives ?? []).join(
                        '\n'
                    ),
                    prerequisitesText: (editing.prerequisites ?? []).join('\n'),
                })
            } else {
                reset({
                    name: '',
                    description: '',
                    fee_amount: 500000,
                    duration_hours: 40,
                    level: 'beginner',
                    status: 'active',
                    course_type: 'general_english',
                    max_students: 25,
                    min_students: 8,
                    currency: 'VND',
                    syllabus_chapters: [''],
                    objectivesText: '',
                    prerequisitesText: '',
                })
            }
        }
    }, [isOpen, editing, reset])

    const onSubmit = async (data: FormValues) => {
        const syllabusObj = {
            chapters: (data.syllabus_chapters || [])
                .map((ch) => ch.trim())
                .filter(Boolean),
        }

        const payload: CreateCourseDto = {
            name: data.name,
            description: data.description || null,
            fee_amount: Number(data.fee_amount),
            duration_hours: Number(data.duration_hours),
            level: data.level as any,
            status: data.status as any,
            course_type: data.course_type,
            max_students: Number(data.max_students),
            min_students: Number(data.min_students),
            currency: data.currency,
            syllabus: syllabusObj,
            learning_objectives: data.objectivesText
                ? data.objectivesText
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                : [],
            prerequisites: data.prerequisitesText
                ? data.prerequisitesText
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                : [],
        }

        try {
            const saved =
                isEdit && editing
                    ? await updateCourse(editing.id, payload)
                    : await createCourse(payload)
            onSaved?.(saved)
            onClose()
        } catch (error: any) {
            console.error('Failed to save course:', error)
            showAlert(
                error?.message ?? 'Lưu khóa học thất bại. Vui lòng thử lại.'
            )
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

                <div className={styles.grid2Cols}>
                    <SelectField
                        label="Phân loại khóa học"
                        id="course_type"
                        options={COURSE_TYPES}
                        registration={register('course_type', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.course_type?.message}
                    />
                    <SelectField
                        label="Cấp độ"
                        id="level"
                        options={COURSE_LEVELS}
                        registration={register('level', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.level?.message}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        type="number"
                        label="Học phí"
                        id="fee_amount"
                        placeholder="500000"
                        error={errors.fee_amount?.message}
                        {...register('fee_amount', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 0, message: 'Không thể âm' },
                        })}
                    />
                    <SelectField
                        label="Đơn vị tiền tệ"
                        id="currency"
                        options={CURRENCIES}
                        registration={register('currency', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.currency?.message}
                    />
                </div>

                <div className={styles.grid2Cols}>
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
                    <SelectField
                        label="Trạng thái"
                        id="status"
                        options={COURSE_STATUSES}
                        registration={register('status')}
                        error={errors.status?.message}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        type="number"
                        label="Sĩ số tối thiểu"
                        id="min_students"
                        placeholder="8"
                        error={errors.min_students?.message}
                        {...register('min_students', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 3, message: 'Tối thiểu 3' },
                        })}
                    />
                    <InputField
                        type="number"
                        label="Sĩ số tối đa"
                        id="max_students"
                        placeholder="25"
                        error={errors.max_students?.message}
                        {...register('max_students', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 5, message: 'Tối thiểu 5' },
                            max: { value: 30, message: 'Tối đa 30' },
                        })}
                    />
                </div>

                <InputField
                    label="Mô tả ngắn về nội dung khóa học"
                    id="description"
                    multiline
                    placeholder="Mô tả ngắn về nội dung khóa học..."
                    rows={3}
                    {...register('description')}
                />

                <InputField
                    label="Điều kiện tiên quyết (Prerequisites - Mỗi dòng một dòng)"
                    id="prerequisitesText"
                    multiline
                    placeholder="Ví dụ:&#10;Đạt bài test đầu vào&#10;Đã hoàn thành khóa A1"
                    rows={3}
                    {...register('prerequisitesText')}
                />

                <InputField
                    label="Mục tiêu đầu ra (Learning Objectives - Mỗi dòng một dòng)"
                    id="objectivesText"
                    multiline
                    placeholder="Ví dụ:&#10;Giao tiếp tự tin trôi chảy&#10;Đạt tối thiểu IELTS 5.0"
                    rows={3}
                    {...register('objectivesText')}
                />

                <div>
                    <label
                        className={styles.inputLabel}
                        style={{ marginBottom: '10px', display: 'block' }}
                    >
                        Giáo trình (Syllabus)
                    </label>
                    <Controller
                        control={control}
                        name="syllabus_chapters"
                        render={({ field: { value, onChange } }) => (
                            <SyllabusEditor value={value} onChange={onChange} />
                        )}
                    />
                </div>
            </form>
        </Modal>
    )
}
