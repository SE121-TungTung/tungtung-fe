import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
    createClass,
    updateClass,
    type Class,
    type ClassStatus,
    type CreateClassDto,
} from '@/lib/classes'
import { listCourses } from '@/lib/courses'
import { listUsers } from '@/lib/users'
import { listRooms, type Room } from '@/lib/rooms'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import styles from './ClassFormModal.module.css'
import { useQuery } from '@tanstack/react-query'
import { useDialog } from '@/hooks/useDialog'
import { SlotSelectionMatrix } from '@/components/feature/schedule/SlotSelectionMatrix'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSaved?: (classItem: Class) => void
    editing: Class | null
}

const CLASS_STATUSES: { label: string; value: ClassStatus }[] = [
    { label: 'Đã lên lịch', value: 'scheduled' },
    { label: 'Đang diễn ra', value: 'active' },
    { label: 'Đã hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
    { label: 'Dời ngày', value: 'postponed' },
]

export const ClassFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSaved,
    editing,
}) => {
    const isEdit = Boolean(editing)
    const formId = 'class-form'
    const { alert } = useDialog()

    const {
        data: coursesData,
        isLoading: isLoadingCourses,
        // isError: isErrCourses,
        // refetch: refetchCourses,
    } = useQuery({
        queryKey: ['courses', { limit: 100 }],
        queryFn: () => listCourses({ limit: 100 }),
        staleTime: 60_000,
        retry: 0,
        refetchOnWindowFocus: false,
    })
    const courseOptions = (coursesData?.items ?? []).map((c) => ({
        label: c.name,
        value: c.id,
    }))

    const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
        queryKey: ['users', { role: 'teacher', limit: 100 }],
        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),
        staleTime: 60_000,
        retry: 0,
        refetchOnWindowFocus: false,
    })
    const teacherOptions = (teachersData?.users ?? []).map((t) => ({
        label: `${t.lastName} ${t.firstName}`,
        value: t.id,
    }))

    const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
        queryKey: ['rooms', { limit: 100 }],
        queryFn: () => listRooms({ limit: 100 }),
        staleTime: 60_000,
        retry: 0,
        refetchOnWindowFocus: false,
    })
    const roomOptions = (roomsData?.items ?? []).map((r: Room) => ({
        label: r.name,
        value: r.id,
    }))

    type FormValues = {
        name: string
        course_id: string
        teacher_id: string
        substitute_teacher_id?: string | null
        room_id: string
        status: ClassStatus
        start_date: string
        end_date: string
        max_students: number
        sessions_per_week?: number | null
        fee_amount?: number | string | null
        notes?: string | null
        preferred_slots: any[]
        unavailable_slots: any[]
    }

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            name: '',
            course_id: '',
            teacher_id: '',
            substitute_teacher_id: '',
            room_id: '',
            status: 'scheduled',
            start_date: '',
            end_date: '',
            max_students: 20,
            sessions_per_week: undefined,
            fee_amount: undefined,
            notes: '',
            preferred_slots: [{ day: 'monday', slots: [1, 2] }],
            unavailable_slots: [],
        },
    })

    const watchedCourseId = watch('course_id')

    useEffect(() => {
        if (!editing && watchedCourseId && coursesData?.items) {
            const selectedCourse = coursesData.items.find(
                (c) => c.id === watchedCourseId
            )
            if (selectedCourse) {
                setValue('fee_amount', selectedCourse.feeAmount)
                setValue('max_students', selectedCourse.maxStudents)
            }
        }
    }, [watchedCourseId, coursesData?.items, editing, setValue])

    useEffect(() => {
        if (isOpen) {
            if (editing) {
                reset({
                    name: editing.name,
                    course_id: editing.course.id,
                    teacher_id: editing.teacher.id,
                    substitute_teacher_id: editing.substituteTeacher?.id || '',
                    room_id: editing.room.id,
                    status: editing.status,
                    start_date: editing.startDate,
                    end_date: editing.endDate,
                    max_students: editing.maxStudents,
                    sessions_per_week: editing.sessionsPerWeek ?? undefined,
                    fee_amount: editing.feeAmount ?? undefined,
                    notes: editing.notes || '',
                    preferred_slots: editing.preferredSlots || [],
                    unavailable_slots: editing.unavailableSlots || [],
                })
            } else {
                reset({
                    name: '',
                    course_id: '',
                    teacher_id: '',
                    substitute_teacher_id: '',
                    room_id: '',
                    status: 'scheduled',
                    start_date: '',
                    end_date: '',
                    max_students: 20,
                    sessions_per_week: undefined,
                    fee_amount: undefined,
                    notes: '',
                    preferred_slots: [{ day: 'monday', slots: [1, 2] }],
                    unavailable_slots: [],
                })
            }
        }
    }, [isOpen, editing, reset])

    const onSubmit = async (form: FormValues) => {
        const payload: CreateClassDto = {
            name: form.name,
            course_id: form.course_id,
            teacher_id: form.teacher_id,
            substitute_teacher_id: form.substitute_teacher_id || null,
            room_id: form.room_id,
            status: form.status || 'scheduled',
            start_date: form.start_date,
            end_date: form.end_date,
            max_students: Number(form.max_students),
            sessions_per_week:
                typeof form.sessions_per_week === 'number' &&
                Number.isInteger(form.sessions_per_week)
                    ? form.sessions_per_week
                    : null,
            fee_amount:
                typeof form.fee_amount === 'number' &&
                !Number.isNaN(form.fee_amount)
                    ? form.fee_amount
                    : null,
            notes: form.notes?.trim() || null,
            preferred_slots: form.preferred_slots || [],
            unavailable_slots: form.unavailable_slots || [],
        }

        try {
            const saved = editing
                ? await updateClass(editing.id, payload)
                : await createClass(payload)
            onSaved?.(saved)
            onClose()
        } catch (e: any) {
            alert(e?.message ?? 'Không thể tạo/cập nhật lớp học')
        }
    }

    const isLoadingDropdowns =
        isLoadingCourses || isLoadingTeachers || isLoadingRooms

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Cập nhật Lớp học' : 'Tạo Lớp học'}
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
                        disabled={isSubmitting || isLoadingDropdowns}
                    >
                        {isEdit ? 'Lưu thay đổi' : 'Tạo lớp học'}
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
                    label="Tên Lớp học"
                    id="name"
                    placeholder="VD: IELTS 7.0 - Tối 2-4-6"
                    error={errors.name?.message}
                    {...register('name', { required: 'Bắt buộc' })}
                />

                <SelectField
                    label="Thuộc Khóa học"
                    id="course_id"
                    options={courseOptions}
                    registration={register('course_id', {
                        required: 'Bắt buộc',
                    })}
                    error={errors.course_id?.message}
                    disabled={isLoadingDropdowns}
                />

                <div className={styles.grid2Cols}>
                    <SelectField
                        label="Giáo viên phụ trách"
                        id="teacher_id"
                        options={teacherOptions}
                        registration={register('teacher_id', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.teacher_id?.message}
                        disabled={isLoadingDropdowns}
                    />
                    <SelectField
                        label="Phòng học"
                        id="room_id"
                        options={roomOptions}
                        registration={register('room_id', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.room_id?.message}
                        disabled={isLoadingDropdowns}
                    />
                </div>
                <div className={styles.grid2Cols}>
                    <SelectField
                        label="Giáo viên thay thế (tuỳ chọn)"
                        id="substitute_teacher_id"
                        options={teacherOptions}
                        registration={register('substitute_teacher_id')}
                        disabled={isLoadingDropdowns}
                    />
                    <InputField
                        type="number"
                        step="0.01"
                        label="Học phí"
                        id="fee_amount"
                        required
                        {...register('fee_amount', { valueAsNumber: true })}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        label="Ngày bắt đầu"
                        id="start_date"
                        type="date"
                        error={errors.start_date?.message}
                        {...register('start_date', { required: 'Bắt buộc' })}
                    />
                    <InputField
                        label="Ngày kết thúc"
                        id="end_date"
                        type="date"
                        error={errors.end_date?.message}
                        {...register('end_date', { required: 'Bắt buộc' })}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        type="number"
                        label="Sĩ số tối đa"
                        id="max_students"
                        error={errors.max_students?.message}
                        {...register('max_students', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 1, message: 'Tối thiểu 1' },
                        })}
                    />
                    <SelectField
                        label="Trạng thái"
                        id="status"
                        options={CLASS_STATUSES}
                        registration={register('status', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.status?.message}
                    />
                </div>

                <div className={styles.grid2Cols}>
                    <InputField
                        type="number"
                        label="Số buổi/tuần (tuỳ chọn)"
                        id="sessions_per_week"
                        {...register('sessions_per_week', {
                            valueAsNumber: true,
                        })}
                    />
                    <InputField
                        label="Ghi chú (tuỳ chọn)"
                        id="notes"
                        {...register('notes')}
                    />
                </div>

                <div
                    className={styles.grid2Cols}
                    style={{ gridTemplateColumns: '1fr', gap: '24px' }}
                >
                    <div>
                        <label
                            className={styles.inputLabel}
                            style={{ marginBottom: 12, display: 'block' }}
                        >
                            Lịch học mong muốn (Preferred Slots)
                        </label>
                        <Controller
                            control={control}
                            name="preferred_slots"
                            render={({ field: { value, onChange } }) => (
                                <SlotSelectionMatrix
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label
                            className={styles.inputLabel}
                            style={{ marginBottom: 12, display: 'block' }}
                        >
                            Lịch bận cố định (Unavailable Slots)
                        </label>
                        <Controller
                            control={control}
                            name="unavailable_slots"
                            render={({ field: { value, onChange } }) => (
                                <SlotSelectionMatrix
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    )
}
