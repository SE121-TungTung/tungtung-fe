import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// Components
import RoomTable from './RoomTable'
import { RoomFormModal } from './RoomFormModal'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Button } from '@/components/core/Button'
import Card from '@/components/common/card/Card'
import Pagination from '@/components/common/menu/Pagination'

// Assets & Styles
import s from './RoomManagementPage.module.css'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'

// Hooks & Types
import { usePermissions } from '@/hooks/usePermissions'
import { useTableParams } from '@/hooks/useTableParams'
import { useRooms, useDeleteRoom } from '@/hooks/domain/useRooms'
import {
    type Room,
    type RoomStatus,
    type RoomType,
    type ListRoomsParams,
} from '@/lib/rooms'
import { useDialog } from '@/hooks/useDialog'

// Options Constants
const ROOM_TYPE_OPTIONS = [
    { label: 'Tất cả loại', value: '' },
    { label: 'Phòng học', value: 'classroom' },
    { label: 'Lab máy tính', value: 'computer_lab' },
    { label: 'Phòng họp', value: 'meeting_room' },
    { label: 'Hội trường', value: 'auditorium' },
    { label: 'Thư viện', value: 'library' },
]

const ROOM_STATUS_OPTIONS = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Sẵn sàng', value: 'available' },
    { label: 'Bảo trì', value: 'maintenance' },
    { label: 'Không khả dụng', value: 'unavailable' },
    { label: 'Đang giữ chỗ', value: 'reserved' },
]

const SORT_BY_OPTIONS = [
    { label: 'Sắp theo ngày tạo', value: 'created_at' },
    { label: 'Sắp theo tên', value: 'name' },
    { label: 'Sắp theo sức chứa', value: 'capacity' },
]

const SORT_ORDER_OPTIONS = [
    { label: 'Giảm dần', value: 'desc' },
    { label: 'Tăng dần', value: 'asc' },
]

// Định nghĩa kiểu Filter cho Room
interface RoomFilters {
    roomType: RoomType | ''
    status: RoomStatus | ''
    capacity: number | ''
}

export default function RoomManagementPage() {
    const qc = useQueryClient()
    const { can } = usePermissions()
    const { confirm, alert } = useDialog()

    const canCreateRoom = can('room:create')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)

    // 1. Setup Table Logic
    const {
        page,
        search,
        filters,
        sort,
        setPage,
        setSearch,
        setFilters,
        setSort,
        apiParams,
    } = useTableParams<RoomFilters>({
        roomType: '',
        status: '',
        capacity: '',
    })

    // 2. Data Fetching Hook
    const {
        data: roomsData,
        isLoading,
        isFetching,
    } = useRooms({
        ...apiParams,
        roomType: (apiParams.roomType as RoomType) || undefined,
        status: (apiParams.status as RoomStatus) || undefined,
        minCapacity:
            apiParams.capacity === '' ? undefined : Number(apiParams.capacity),
        sortBy: apiParams.sortBy as ListRoomsParams['sortBy'],
        sortDir: sort.order as 'asc' | 'desc',
    })

    // 3. Delete Hook
    const { mutateAsync: deleteRoomMutate } = useDeleteRoom()

    // Handlers
    const handleOpenCreateModal = () => {
        setEditingRoom(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (r: Room) => {
        setEditingRoom(r)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingRoom(null)
    }

    const handleDeleteRoom = async (room: Room) => {
        const ok = confirm(`Xóa phòng "${room.name}"?`)
        if (!ok) return

        try {
            await deleteRoomMutate(room.id)
        } catch (err: any) {
            alert(`Không thể xóa phòng: ${err.message}`)
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý phòng học</h1>

                <Card className={s.filterCard} variant="outline">
                    <div className={s.searchWrapper}>
                        <InputField
                            id="search"
                            label=""
                            placeholder="Tìm theo tên hoặc vị trí..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                        <InputField
                            id="capacityAtLeast"
                            label="Sức chứa từ"
                            type="number"
                            min={0}
                            placeholder="VD: 30"
                            value={filters.capacity}
                            onChange={(e) =>
                                setFilters({
                                    capacity:
                                        e.target.value === ''
                                            ? ''
                                            : Math.max(
                                                  0,
                                                  Number(e.target.value)
                                              ),
                                })
                            }
                        />
                    </div>

                    <div className={s.filterControls}>
                        <SelectField
                            id="roomTypeFilter"
                            label="Loại phòng"
                            registration={{ name: 'roomTypeFilter' as any }}
                            value={filters.roomType}
                            options={ROOM_TYPE_OPTIONS}
                            onChange={(e) =>
                                setFilters({
                                    roomType: e.target.value as RoomType | '',
                                })
                            }
                        />

                        <SelectField
                            id="statusFilter"
                            label="Trạng thái"
                            registration={{ name: 'statusFilter' as any }}
                            value={filters.status}
                            options={ROOM_STATUS_OPTIONS}
                            onChange={(e) =>
                                setFilters({
                                    status: e.target.value as RoomStatus | '',
                                })
                            }
                        />

                        <SelectField
                            id="sortBy"
                            label="Sắp xếp"
                            registration={{ name: 'sortBy' as any }}
                            value={sort.field}
                            onChange={(e) =>
                                setSort({ ...sort, field: e.target.value })
                            }
                            options={SORT_BY_OPTIONS}
                        />

                        <SelectField
                            id="sortOrder"
                            label="Thứ tự"
                            registration={{ name: 'sortOrder' as any }}
                            value={sort.order}
                            onChange={(e) =>
                                setSort({
                                    ...sort,
                                    order: e.target.value as 'asc' | 'desc',
                                })
                            }
                            options={SORT_ORDER_OPTIONS}
                        />
                    </div>

                    {canCreateRoom && (
                        <Button
                            variant="primary"
                            onClick={handleOpenCreateModal}
                        >
                            <img
                                src={IconPlus}
                                alt=""
                                className={s.buttonIcon}
                            />
                            Tạo phòng
                        </Button>
                    )}
                </Card>

                <Card className={s.tableCard} variant="outline">
                    <RoomTable
                        rooms={roomsData?.items || []}
                        onEditRoom={handleOpenEditModal}
                        onDeleteRoom={handleDeleteRoom}
                        isLoading={isLoading || isFetching}
                    />

                    <div className={s.pagination}>
                        <Pagination
                            currentPage={page}
                            totalPages={roomsData?.pages || 0}
                            onPageChange={setPage}
                        />

                        {!isLoading && roomsData && (
                            <div className={s.paginationInfo}>
                                Hiển thị {roomsData.items?.length || 0} /{' '}
                                {roomsData.total || 0} phòng
                            </div>
                        )}
                    </div>
                </Card>
            </main>

            <RoomFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editing={editingRoom}
                onSaved={() => {
                    qc.invalidateQueries({ queryKey: ['rooms'] })
                }}
            />
        </div>
    )
}
