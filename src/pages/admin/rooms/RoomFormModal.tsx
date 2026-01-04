import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import styles from './RoomFormModal.module.css'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSaved?: (room: Room) => void
    editing: Room | null
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

// Định nghĩa form interface mở rộng để chứa mảng thiết bị tạm thời
type RoomFormValues = Omit<CreateRoomDto, 'equipment'> & {
    equipmentList: { name: string; quantity: number }[]
}

export const RoomFormModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onSaved,
    editing,
}) => {
    const isEdit = Boolean(editing)
    const formId = 'room-form'

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RoomFormValues>({
        defaultValues: {
            name: '',
            capacity: 25,
            location: '',
            room_type: 'classroom',
            status: 'available',
            notes: '',
            equipmentList: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'equipmentList',
    })

    useEffect(() => {
        if (isOpen) {
            if (editing) {
                const equipmentArray = editing.equipment
                    ? Object.entries(editing.equipment).map(
                          ([key, value]: [string, any]) => ({
                              name: key,
                              quantity: value.quantity || 1,
                          })
                      )
                    : []

                reset({
                    name: editing.name,
                    capacity: editing.capacity,
                    location: editing.location ?? '',
                    room_type: editing.roomType,
                    status: editing.status,
                    notes: editing.notes ?? '',
                    equipmentList: equipmentArray,
                })
            } else {
                reset({
                    name: '',
                    capacity: 25,
                    location: '',
                    room_type: 'classroom',
                    status: 'available',
                    notes: '',
                    equipmentList: [],
                })
            }
        }
    }, [isOpen, editing, reset])

    const onSubmit = async (data: RoomFormValues) => {
        const equipmentJson = data.equipmentList.reduce(
            (acc, item) => {
                if (item.name.trim()) {
                    acc[item.name.trim()] = { quantity: item.quantity }
                }
                return acc
            },
            {} as Record<string, { quantity: number }>
        )

        const payload: CreateRoomDto = {
            name: data.name,
            capacity: data.capacity,
            location: data.location,
            room_type: data.room_type,
            status: data.status,
            notes: data.notes,
            equipment: equipmentJson,
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

                <div className={styles.sectionDivider} />

                <div>
                    <h3 className={styles.inputLabel}>Thiết bị (Tùy chọn)</h3>

                    <div className={styles.equipmentList}>
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className={styles.equipmentItem}
                            >
                                {/* Input Tên thiết bị */}
                                <InputField
                                    label="Tên thiết bị"
                                    id={`equip-${index}-name`}
                                    placeholder="VD: Máy chiếu"
                                    {...register(
                                        `equipmentList.${index}.name`,
                                        {
                                            required: 'Nhập tên',
                                        }
                                    )}
                                    error={
                                        errors.equipmentList?.[index]?.name
                                            ?.message
                                    }
                                    className={styles.inputGroup}
                                />

                                {/* Input Số lượng */}
                                <InputField
                                    type="number"
                                    label="Số lượng"
                                    id={`equip-${index}-qty`}
                                    placeholder="1"
                                    {...register(
                                        `equipmentList.${index}.quantity`,
                                        {
                                            valueAsNumber: true,
                                            min: { value: 1, message: 'Min 1' },
                                        }
                                    )}
                                    error={
                                        errors.equipmentList?.[index]?.quantity
                                            ?.message
                                    }
                                    className={styles.inputGroup}
                                />

                                {/* Nút Xóa */}
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => remove(index)}
                                    title="Xóa thiết bị"
                                >
                                    {/* Icon thùng rác đơn giản (SVG) */}
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Nút Thêm mới */}
                    <button
                        type="button"
                        className={styles.addBtn}
                        onClick={() => append({ name: '', quantity: 1 })}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Thêm thiết bị
                    </button>
                </div>
            </form>
        </Modal>
    )
}
