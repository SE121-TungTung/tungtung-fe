import { type Room, type RoomType, type RoomStatus } from '@/lib/rooms'
import s from './RoomTable.module.css'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import Skeleton from '@/components/effect/Skeleton'

const roomTypeDisplayNames: Record<RoomType, string> = {
    classroom: 'Phòng học',
    computer_lab: 'Lab máy tính',
    meeting_room: 'Phòng họp',
    auditorium: 'Hội trường',
    library: 'Thư viện',
}

const roomStatusMap: Record<
    RoomStatus,
    { label: string; variant: StatusBadgeVariant }
> = {
    available: { label: 'Sẵn sàng', variant: 'success' },
    maintenance: { label: 'Bảo trì', variant: 'warning' },
    unavailable: { label: 'Không khả dụng', variant: 'neutral' },
    reserved: { label: 'Đang giữ chỗ', variant: 'danger' },
}

const getRoomStatusProps = (status: RoomStatus) => {
    return roomStatusMap[status] || roomStatusMap.unavailable
}

type Props = {
    rooms: Room[]
    onEditRoom: (room: Room) => void
    onDeleteRoom: (room: Room) => void
    isLoading?: boolean
}

export default function RoomTable({
    rooms,
    onEditRoom,
    onDeleteRoom,
    isLoading,
}: Props) {
    const { can } = usePermissions()

    const canEdit = can('room:update')
    const canDelete = can('room:delete')

    const getRoomTypeName = (type: RoomType) => {
        return roomTypeDisplayNames[type] || type
    }

    const RoomRowSkeleton = () => (
        <tr>
            <td>
                <div className={s.userInfo}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <Skeleton width={120} height={16} />
                        <Skeleton width={80} height={12} />
                    </div>
                </div>
            </td>
            <td>
                <Skeleton width={40} height={16} />
            </td>
            <td>
                <Skeleton width={100} height={16} />
            </td>
            <td>
                <Skeleton width={90} height={24} style={{ borderRadius: 12 }} />
            </td>
            <td>
                <Skeleton width={30} height={16} />
            </td>
            <td>
                <Skeleton width={80} height={16} />
            </td>
            <td>
                <div className={s.actionsCell}>
                    <Skeleton
                        width={36}
                        height={36}
                        style={{ borderRadius: 8 }}
                    />
                    <Skeleton
                        width={36}
                        height={36}
                        style={{ borderRadius: 8 }}
                    />
                </div>
            </td>
        </tr>
    )

    return (
        <table className={s.table}>
            <thead>
                <tr>
                    <th>Tên phòng</th>
                    <th>Sức chứa</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Thiết bị</th>
                    <th>Ngày tạo</th>
                    <th className={s.actionsHeader}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <>
                        {[...Array(5)].map((_, i) => (
                            <RoomRowSkeleton key={i} />
                        ))}
                    </>
                ) : rooms.length === 0 ? (
                    <tr>
                        <td
                            colSpan={7}
                            style={{
                                textAlign: 'center',
                                padding: 'var(--space-24)',
                            }}
                        >
                            Không có phòng học nào.
                        </td>
                    </tr>
                ) : (
                    rooms.map((r) => {
                        const statusProps = getRoomStatusProps(r.status)
                        return (
                            <tr key={r.id}>
                                <td>
                                    <div className={s.userInfo}>
                                        <span className={s.userName}>
                                            {r.name}
                                        </span>
                                        <span className={s.userEmail}>
                                            {r.location || 'Chưa có vị trí'}
                                        </span>
                                    </div>
                                </td>
                                <td>{r.capacity}</td>
                                <td>{getRoomTypeName(r.roomType)}</td>
                                <td>
                                    <StatusBadge
                                        variant={statusProps.variant}
                                        label={statusProps.label}
                                    />
                                </td>
                                <td>{r.equipment?.length ?? 0}</td>
                                <td>
                                    {new Date(r.createdAt).toLocaleDateString(
                                        'vi-VN'
                                    )}
                                </td>
                                <td>
                                    <div className={s.actionsCell}>
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onEditRoom(r)}
                                            disabled={!canEdit}
                                            title={
                                                canEdit
                                                    ? 'Chỉnh sửa'
                                                    : 'Không có quyền sửa'
                                            }
                                        >
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
                                                <path d="M20 12V21C20 21.55 19.55 22 19 22H3C2.45 22 2 21.55 2 21V5C2 4.45 2.45 4 3 4H12" />
                                                <path d="M19.15 2.38L9.24 12.29L8 16L11.71 14.76L21.62 4.85C22.07 4.4 22.13 3.71 21.74 3.32L20.68 2.26C20.29 1.87 19.6 1.92 19.15 2.38Z" />
                                            </svg>
                                        </ButtonPrimary>
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onDeleteRoom(r)}
                                            disabled={!canDelete}
                                            title={
                                                canDelete
                                                    ? 'Xóa'
                                                    : 'Không có quyền xóa'
                                            }
                                            className={s.dangerButton}
                                        >
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
                                                <path d="M16.13 22H7.87C7.37 22 6.95 21.63 6.88 21.14L5 8H19L17.12 21.14C17.05 21.63 16.63 22 16.13 22Z" />
                                                <path d="M3.5 8H20.5" />
                                                <path d="M10 12V18" />
                                                <path d="M14 12V18" />
                                                <path d="M16 5H8L9.7 2.45C9.89 2.17 10.2 2 10.54 2H13.47C13.8 2 14.12 2.17 14.3 2.45L16 5Z" />
                                                <path d="M3 5H21" />
                                            </svg>
                                        </ButtonPrimary>
                                    </div>
                                </td>
                            </tr>
                        )
                    })
                )}
            </tbody>
        </table>
    )
}
