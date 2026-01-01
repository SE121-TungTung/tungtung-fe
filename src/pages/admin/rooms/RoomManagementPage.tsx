import { useEffect, useMemo, useState } from 'react'
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import RoomTable from './RoomTable'
import { RoomFormModal } from './RoomFormModal'
import {
    listRooms,
    deleteRoom,
    type Room,
    type RoomStatus,
    type RoomType,
} from '@/lib/rooms'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { Button } from '@/components/core/Button'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import Card from '@/components/common/card/Card'
import s from './RoomManagementPage.module.css'
import IconPlus from '@/assets/Plus Thin.svg'
import IconSearch from '@/assets/Lens.svg'
import { usePermissions } from '@/hooks/usePermissions'

type SortBy = 'name' | 'capacity' | 'created_at'
type SortOrder = 'asc' | 'desc'

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

export default function RoomManagementPage() {
    const qc = useQueryClient()
    const { can } = usePermissions()
    const canCreateRoom = can('room:create')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)

    const [searchValue, setSearchValue] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(searchValue), 300)
        return () => clearTimeout(id)
    }, [searchValue])

    const [roomType, setRoomType] = useState<RoomType | ''>('')
    const [status, setStatus] = useState<RoomStatus | ''>('')
    const [page, setPage] = useState(1)
    const [capacityAtLeast, setCapacityAtLeast] = useState<number | ''>('')

    const [sortBy, setSortBy] = useState<SortBy>('created_at')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
    const [includeDeleted] = useState(false)

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, roomType, status, capacityAtLeast, sortBy, sortOrder])

    const roomsQuery = useQuery({
        queryKey: [
            'rooms',
            {
                page,
                limit: 100,
                sortBy,
                sortOrder,
                includeDeleted,
            },
        ],
        queryFn: () =>
            listRooms({
                search: '',
                page: 1,
                limit: 100,
                sortBy,
                sortOrder,
                includeDeleted,
            }),
        placeholderData: keepPreviousData,
    })

    const rooms = useMemo(() => {
        let filtered = [...(roomsQuery.data?.items ?? [])]

        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase().trim()
            filtered = filtered.filter((r) => {
                const nameMatch = r.name.toLowerCase().includes(searchLower)
                const locationMatch = r.location
                    ?.toLowerCase()
                    .includes(searchLower)
                return nameMatch || locationMatch
            })
        }

        if (roomType) {
            filtered = filtered.filter((r) => r.roomType === roomType)
        }

        if (status) {
            filtered = filtered.filter((r) => r.status === status)
        }

        if (capacityAtLeast !== '' && capacityAtLeast >= 0) {
            filtered = filtered.filter(
                (r) => (r.capacity ?? 0) >= capacityAtLeast
            )
        }

        const dir = sortOrder === 'asc' ? 1 : -1
        filtered.sort((a, b) => {
            let va: any, vb: any
            switch (sortBy) {
                case 'name':
                    va = a.name.toLowerCase()
                    vb = b.name.toLowerCase()
                    break
                case 'capacity':
                    va = a.capacity
                    vb = b.capacity
                    break
                case 'created_at':
                default:
                    va = a.createdAt
                    vb = b.createdAt
            }
            if (va === vb) return 0
            return va > vb ? dir : -dir
        })

        return filtered
    }, [
        roomsQuery.data?.items,
        debouncedSearch,
        roomType,
        status,
        capacityAtLeast,
        sortBy,
        sortOrder,
    ])

    const { mutate: doDelete } = useMutation({
        mutationFn: async (room: Room) => {
            if (!window.confirm(`Xóa phòng "${room.name}"?`)) return
            await deleteRoom(room.id)
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['rooms'] })
        },
        onError: (err: any) => {
            window.alert(`Không thể xóa phòng: ${err.message}`)
        },
    })

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

    const data = roomsQuery.data
    const isLoading = roomsQuery.isLoading
    const isFetching = roomsQuery.isFetching

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
                            value={searchValue}
                            onChange={(e: any) =>
                                setSearchValue(e.target.value)
                            }
                            leftIcon={<img src={IconSearch} alt="" />}
                        />
                        <InputField
                            id="capacityAtLeast"
                            label="Sức chứa từ"
                            type="number"
                            min={0}
                            placeholder="VD: 30"
                            value={capacityAtLeast}
                            onChange={(e: any) =>
                                setCapacityAtLeast(
                                    e.target.value === ''
                                        ? ''
                                        : Math.max(0, Number(e.target.value))
                                )
                            }
                        />
                    </div>

                    <div className={s.filterControls}>
                        <SelectField
                            id="roomTypeFilter"
                            label="Loại phòng"
                            registration={{ name: 'roomTypeFilter' as any }}
                            value={roomType}
                            options={ROOM_TYPE_OPTIONS}
                            onChange={(e: any) => setRoomType(e.target.value)}
                        />

                        <SelectField
                            id="statusFilter"
                            label="Trạng thái"
                            registration={{ name: 'statusFilter' as any }}
                            value={status}
                            options={ROOM_STATUS_OPTIONS}
                            onChange={(e: any) => setStatus(e.target.value)}
                        />

                        <SelectField
                            id="sortBy"
                            label="Sắp xếp"
                            registration={{ name: 'sortBy' as any }}
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    (e.target as HTMLSelectElement)
                                        .value as SortBy
                                )
                            }
                            options={SORT_BY_OPTIONS}
                        />

                        <SelectField
                            id="sortOrder"
                            label="Thứ tự"
                            registration={{ name: 'sortOrder' as any }}
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(
                                    (e.target as HTMLSelectElement)
                                        .value as SortOrder
                                )
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
                        rooms={rooms}
                        onEditRoom={handleOpenEditModal}
                        onDeleteRoom={(r) => doDelete(r)}
                        isLoading={isLoading || isFetching}
                    />
                </Card>

                <div className={s.pagination}>
                    <div className={s.paginationInfo}>
                        {isFetching ? (
                            <span>Đang tải...</span>
                        ) : (
                            <span>
                                Hiển thị {rooms.length} / {data?.total ?? 0}{' '}
                                phòng
                                {(roomType ||
                                    status ||
                                    debouncedSearch ||
                                    capacityAtLeast !== '') &&
                                    ' (đã lọc)'}
                            </span>
                        )}
                    </div>

                    <div className={s.paginationControls}>
                        <ButtonPrimary
                            variant="outline"
                            size="sm"
                            disabled={(data?.page ?? 1) <= 1 || isFetching}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            ← Trước
                        </ButtonPrimary>

                        <span className={s.pageInfo}>
                            Trang {data?.page ?? page} / {data?.pages ?? 1}
                        </span>

                        <ButtonPrimary
                            variant="outline"
                            size="sm"
                            disabled={
                                (data?.page ?? 1) >= (data?.pages ?? 1) ||
                                isFetching
                            }
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Sau →
                        </ButtonPrimary>
                    </div>
                </div>
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
