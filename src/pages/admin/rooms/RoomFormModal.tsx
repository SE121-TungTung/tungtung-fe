import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
    createRoom,
    updateRoom,
    type Room,
    type RoomType,
    type RoomStatus,
    type CreateRoomDto,
} from '@/lib/rooms'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Modal } from '@/components/core/Modal' // Thêm Modal
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary' // Thêm ButtonPrimary
import styles from './RoomFormModal.module.css' // Sử dụng CSS Module

interface Props {
    isOpen: boolean // Đổi 'open' thành 'isOpen' cho nhất quán
    onClose: () => void
    onSaved?: (room: Room) => void
    editing: Room | null // Bỏ '?' vì logic ở page đã xử lý null
}

const ROOM_TYPES: { label: string; value: RoomType }[] = [
    { label: 'Phòng học', value: 'classroom' },
    { label: 'Lab máy tính', value: 'computer_lab' },
    { label: 'Phòng họp', value: 'meeting_room' },
    { label: 'Hội trường', value: 'auditorium' },
    { label: 'Thư viện', value: 'library' },
]

const ROOM_STATUS: { label: string; value: RoomStatus }[] = [
    { label: 'Sẵn sàng', value: 'available' },
    { label: 'Bảo trì', value: 'maintenance' },
    { label: 'Không khả dụng', value: 'unavailable' },
    { label: 'Đang giữ chỗ', value: 'reserved' },
]

// Đổi 'export default function' thành 'export const'
export const RoomFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSaved,
    editing,
}) => {
    const isEdit = Boolean(editing)
    const formId = 'room-form' // ID cho form

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateRoomDto>({
        defaultValues: {
            name: '',
            capacity: 25,
            location: '',
            room_type: 'classroom',
            status: 'available',
            notes: '',
            equipment: {},
        },
    })

    useEffect(() => {
        // Logic reset form khi modal mở/thay đổi 'editing'
        if (isOpen) {
            if (editing) {
                reset({
                    name: editing.name,
                    capacity: editing.capacity,
                    location: editing.location ?? '',
                    room_type: editing.roomType,
                    status: editing.status,
                    notes: editing.notes ?? '',
                    equipment: editing.equipment ?? {},
                })
            } else {
                // Reset về defaultValues khi tạo mới
                reset({
                    name: '',
                    capacity: 25,
                    location: '',
                    room_type: 'classroom',
                    status: 'available',
                    notes: '',
                    equipment: {},
                })
            }
        }
    }, [isOpen, editing, reset])

    const onSubmit = async (data: CreateRoomDto) => {
        const payload = {
            ...data,
        }
        try {
            const saved =
                isEdit && editing
                    ? await updateRoom(editing.id, payload)
                    : await createRoom(payload)
            onSaved?.(saved)
            onClose()
        } catch (error) {
            console.error('Failed to save room:', error)
            // TODO: Hiển thị lỗi cho người dùng
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Cập nhật phòng học' : 'Tạo phòng học'}
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
                        {isEdit ? 'Lưu thay đổi' : 'Tạo phòng'}
                    </ButtonPrimary>
                </div>
            }
        >
            <form
                id={formId}
                onSubmit={handleSubmit(onSubmit)}
                className={styles.form}
            >
                {/* Sử dụng grid2Cols cho layout */}
                <div className={styles.grid2Cols}>
                    <InputField
                        label="Tên phòng"
                        id="name"
                        placeholder="VD: A101"
                        error={errors.name?.message}
                        {...register('name', { required: 'Bắt buộc' })}
                    />

                    <InputField
                        type="number"
                        label="Sức chứa"
                        id="capacity"
                        placeholder="25"
                        error={errors.capacity?.message}
                        {...register('capacity', {
                            required: 'Bắt buộc',
                            valueAsNumber: true,
                            min: { value: 5, message: 'Tối thiểu 5' },
                            max: { value: 50, message: 'Tối đa 50' },
                        })}
                    />
                </div>

                <InputField
                    label="Vị trí (Tùy chọn)"
                    id="location"
                    placeholder="Tầng 1 – Khu A"
                    {...register('location')}
                />

                <div className={styles.grid2Cols}>
                    <SelectField
                        label="Loại phòng"
                        id="room_type"
                        options={ROOM_TYPES}
                        registration={register('room_type', {
                            required: 'Bắt buộc',
                        })}
                        error={errors.room_type?.message}
                    />

                    <SelectField
                        label="Trạng thái"
                        id="status"
                        options={ROOM_STATUS}
                        registration={register('status')}
                        error={errors.status?.message}
                    />
                </div>

                <InputField
                    label="Ghi chú (Tùy chọn)"
                    id="notes"
                    placeholder="Gần ổ điện, máy chiếu..."
                    {...register('notes')}
                />

                <div>
                    <label htmlFor="equipment" className={styles.inputLabel}>
                        Thiết bị (JSON - Tùy chọn)
                    </label>
                    <textarea
                        id="equipment"
                        placeholder='{"projector": {"quantity": 1, "status": "working"}}'
                        rows={4}
                        defaultValue={
                            editing?.equipment
                                ? JSON.stringify(editing.equipment, null, 2)
                                : ''
                        }
                        {...register('equipment', {
                            setValueAs: (v) => {
                                if (!v) return {}

                                if (
                                    typeof v === 'object' &&
                                    !Array.isArray(v)
                                ) {
                                    return v
                                }

                                if (typeof v === 'string') {
                                    const trimmed = v.trim()
                                    if (trimmed === '') return {}

                                    try {
                                        const parsed = JSON.parse(trimmed)
                                        return typeof parsed === 'object' &&
                                            !Array.isArray(parsed)
                                            ? parsed
                                            : {}
                                    } catch {
                                        return {}
                                    }
                                }
                                return {}
                            },
                        })}
                    />
                    <p className={styles.fieldHelperText}>
                        JSON thiết bị. Ví dụ: {`{"projector": {"quantity": 1}}`}
                        . Để trống nếu không có.
                    </p>
                </div>
            </form>
        </Modal>
    )
}
