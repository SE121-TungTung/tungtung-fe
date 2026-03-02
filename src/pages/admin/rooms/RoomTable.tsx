import { type Room, type RoomType, type RoomStatus } from '@/lib/rooms'
import s from './RoomTable.module.css'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import IconEdit from '@/assets/Edit Pen.svg'
import IconDelete from '@/assets/Trash Bin.svg'
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
                                            <img src={IconEdit} alt="Sửa" />
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
                                            <img src={IconDelete} alt="Xóa" />
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
