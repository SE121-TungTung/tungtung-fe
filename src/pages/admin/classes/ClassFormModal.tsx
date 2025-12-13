import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { prune } from '@/utils/prune'

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
    const teacherOptions = (teachersData?.items ?? []).map((t) => ({
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

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateClassDto>({
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
            schedule: '{"type":"weekly","days":[1,3,5],"time":"18:00"}',
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (editing) {
                reset({
                    name: editing.name,
                    course_id: editing.course.id,
                    teacher_id: editing.teacher.id,
                    room_id: editing.room.id,
                    status: editing.status,
                    start_date: editing.startDate,
                    end_date: editing.endDate,
                    max_students: editing.maxStudents,
                    schedule: JSON.stringify(editing.scheduleDefinition),
                })
            } else {
                reset({
                    name: '',
                    course_id: '',
                    teacher_id: '',
                    room_id: '',
                    status: 'scheduled',
                    start_date: '',
                    end_date: '',
                    max_students: 20,
                    schedule:
                        '{"type": "weekly", "days": [1,3,5], "time": "18:00"}',
                })
            }
        }
    }, [isOpen, editing, reset])

    const onSubmit = async (form: CreateClassDto) => {
        let scheduleObj: any = form.schedule
        if (typeof scheduleObj === 'string') {
            try {
                scheduleObj = JSON.parse(scheduleObj)
            } catch {
                alert('Lịch học không phải JSON hợp lệ')
                return
            }
        }

        const payload = prune({
            ...form,
            status: form.status || 'scheduled',
            schedule: scheduleObj,
            fee_amount:
                typeof form.fee_amount === 'number' &&
                !Number.isNaN(form.fee_amount)
                    ? form.fee_amount
                    : undefined,
            sessions_per_week:
                typeof form.sessions_per_week === 'number' &&
                Number.isInteger(form.sessions_per_week)
                    ? form.sessions_per_week
                    : undefined,
            substitute_teacher_id: form.substitute_teacher_id || undefined,
            notes: form.notes?.trim() || undefined,
            current_students: undefined,
        })

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

    const getErrorMessage = (error: any): string | undefined => {
        if (!error) return undefined
        if (typeof error === 'string') return error
        if (error.message) return error.message
        return undefined
    }

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
                        label="Học phí (tuỳ chọn)"
                        id="fee_amount"
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

                <div>
                    <label
                        htmlFor="schedule_definition"
                        className={styles.inputLabel}
                    >
                        Lịch học (JSON)
                    </label>
                    <textarea
                        id="schedule_definition"
                        rows={4}
                        {...register('schedule', {
                            validate: (value) => {
                                try {
                                    JSON.parse(value)
                                    return true
                                } catch {
                                    return 'JSON không hợp lệ'
                                }
                            },
                        })}
                    />
                    {errors.schedule?.message && (
                        <p className={styles.fieldHelperText}>
                            {getErrorMessage(errors.schedule)}
                        </p>
                    )}
                </div>
            </form>
        </Modal>
    )
}
