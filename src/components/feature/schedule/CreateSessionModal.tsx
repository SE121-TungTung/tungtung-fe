// src/components/feature/schedule/CreateSessionModal.tsx

import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { scheduleApi } from '@/lib/schedule'
import { SYSTEM_TIME_SLOTS } from '@/types/schedule.types'

// Import CSS Module
import s from './CreateSessionModal.module.css'
import { useDialog } from '@/hooks/useDialog'

interface Option {
    label: string
    value: string
}

interface CreateSessionModalProps {
    isOpen: boolean
    onClose: () => void
    classes: Option[]
    teachers: Option[]
    rooms: Option[]
}

interface FormValues {
    class_id: string
    teacher_id: string
    room_id: string
    session_date: string
    time_slots: number[]
}

export default function CreateSessionModal({
    isOpen,
    onClose,
    classes,
    teachers,
    rooms,
}: CreateSessionModalProps) {
    const qc = useQueryClient()
    const { alert } = useDialog()

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            class_id: '',
            teacher_id: '',
            room_id: '',
            session_date: new Date().toISOString().split('T')[0],
            time_slots: [],
        },
    })

    const selectedSlots = watch('time_slots') || []

    const createMutation = useMutation({
        mutationFn: scheduleApi.createSession,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['schedule'] })
            alert('Thêm buổi học thành công!')
            handleClose()
        },
        onError: (err: any) => {
            alert(err?.detail || err?.message || 'Lỗi khi tạo buổi học')
        },
    })

    const onSubmit = (data: FormValues) => {
        if (data.time_slots.length === 0) {
            alert('Vui lòng chọn ít nhất 1 tiết học')
            return
        }

        createMutation.mutate({
            class_id: data.class_id,
            teacher_id: data.teacher_id,
            room_id: data.room_id,
            session_date: data.session_date,
            time_slots: data.time_slots.map(Number),
            topic: 'Buổi học bổ sung',
        })
    }

    const toggleSlot = (slot: number) => {
        const current = selectedSlots
        const next = current.includes(slot)
            ? current.filter((s) => s !== slot)
            : [...current, slot].sort((a, b) => a - b)
        setValue('time_slots', next)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Thêm buổi học thủ công"
        >
            <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
                <div className={s.row}>
                    <SelectField
                        label="Lớp học"
                        registration={register('class_id', {
                            required: 'Vui lòng chọn lớp',
                        })}
                        options={[
                            { label: '-- Chọn lớp --', value: '' },
                            ...classes,
                        ]}
                        error={errors.class_id?.message}
                    />
                    <InputField
                        type="date"
                        label="Ngày học"
                        {...register('session_date', {
                            required: 'Vui lòng chọn ngày',
                        })}
                        error={errors.session_date?.message}
                    />
                </div>

                <div className={s.row}>
                    <SelectField
                        label="Giáo viên"
                        registration={register('teacher_id', {
                            required: 'Vui lòng chọn giáo viên',
                        })}
                        options={[
                            { label: '-- Chọn GV --', value: '' },
                            ...teachers,
                        ]}
                        error={errors.teacher_id?.message}
                    />
                    <SelectField
                        label="Phòng học"
                        registration={register('room_id', {
                            required: 'Vui lòng chọn phòng',
                        })}
                        options={[
                            { label: '-- Chọn phòng --', value: '' },
                            ...rooms,
                        ]}
                        error={errors.room_id?.message}
                    />
                </div>

                <div className={s.slotSection}>
                    <label className={s.label}>
                        Tiết học <span style={{ color: 'red' }}>*</span>
                    </label>

                    <div className={s.slotGrid}>
                        {SYSTEM_TIME_SLOTS.map((slot) => (
                            <button
                                key={slot.slot_number}
                                type="button"
                                onClick={() => toggleSlot(slot.slot_number)}
                                className={`${s.slotButton} ${
                                    selectedSlots.includes(slot.slot_number)
                                        ? s.selected
                                        : ''
                                }`}
                            >
                                Tiết {slot.slot_number} (
                                {slot.start_time.slice(0, 5)})
                            </button>
                        ))}
                    </div>
                    {selectedSlots.length === 0 && createMutation.isError && (
                        <p className={s.errorMessage}>Vui lòng chọn tiết học</p>
                    )}
                </div>

                <div className={s.footer}>
                    <ButtonGhost onClick={handleClose} type="button">
                        Hủy
                    </ButtonGhost>
                    <ButtonPrimary
                        type="submit"
                        loading={createMutation.isPending}
                    >
                        Lưu buổi học
                    </ButtonPrimary>
                </div>
            </form>
        </Modal>
    )
}
