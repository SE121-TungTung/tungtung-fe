import { type Class, type ClassStatus } from '@/lib/classes'
import s from './ClassTable.module.css'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import IconEdit from '@/assets/Edit Pen.svg'
import IconDelete from '@/assets/Trash Bin.svg'
import Skeleton from '@/components/effect/Skeleton'

const classStatusMap: Record<
    ClassStatus,
    { label: string; variant: StatusBadgeVariant }
> = {
    scheduled: { label: 'Đã lên lịch', variant: 'warning' },
    active: { label: 'Đang diễn ra', variant: 'success' },
    completed: { label: 'Đã hoàn thành', variant: 'neutral' },
    cancelled: { label: 'Đã hủy', variant: 'danger' },
    postponed: { label: 'Dời ngày', variant: 'neutral' },
    draft: { label: 'Nháp (DRAFT)', variant: 'warning' },
    open: { label: 'Mở đăng ký (OPEN)', variant: 'success' },
    ongoing: { label: 'Bắt đầu học (ONGOING)', variant: 'success' },
}

const getClassStatusProps = (status: ClassStatus) => {
    return (
        classStatusMap[status] || {
            label: status,
            variant: 'neutral' as StatusBadgeVariant,
        }
    )
}

type Props = {
    classes: Class[]
    onEditClass: (classItem: Class) => void
    onDeleteClass: (classItem: Class) => void
    onUpdateStatus: (classItem: Class, newStatus: ClassStatus) => void
    onViewDetail?: (classItem: Class) => void
    isLoading?: boolean
}

export default function ClassTable({
    classes,
    onEditClass,
    onDeleteClass,
    onUpdateStatus,
    onViewDetail,
    isLoading,
}: Props) {
    const { can } = usePermissions()

    const canEdit = can('class:update')
    const canDelete = can('class:delete')

    const ClassRowSkeleton = () => (
        <tr>
            {/* Tên lớp & Sĩ số */}
            <td>
                <div className={s.userInfo}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <Skeleton width={160} height={16} />
                        <Skeleton width={80} height={12} />
                    </div>
                </div>
            </td>
            {/* Khóa học */}
            <td>
                <Skeleton width={120} height={16} />
            </td>
            {/* Giáo viên */}
            <td>
                <Skeleton width={100} height={16} />
            </td>
            {/* Phòng */}
            <td>
                <Skeleton width={60} height={16} />
            </td>
            {/* Trạng thái */}
            <td>
                <Skeleton
                    width={100}
                    height={24}
                    style={{ borderRadius: 12 }}
                />
            </td>
            {/* Thời gian */}
            <td>
                <Skeleton width={140} height={16} />
            </td>
            {/* Hành động */}
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
                    <th>Tên lớp học</th>
                    <th>Khóa học</th>
                    <th>Giáo viên</th>
                    <th>Phòng</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                    <th className={s.actionsHeader}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    // Render 5 skeleton rows
                    <>
                        {[...Array(5)].map((_, i) => (
                            <ClassRowSkeleton key={i} />
                        ))}
                    </>
                ) : classes.length === 0 ? (
                    <tr>
                        <td colSpan={7} className={s.emptyState}>
                            Không có lớp học nào.
                        </td>
                    </tr>
                ) : (
                    classes.map((c) => {
                        const statusProps = getClassStatusProps(c.status)
                        return (
                            <tr key={c.id} onClick={() => onViewDetail?.(c)}>
                                <td>
                                    <div className={s.userInfo}>
                                        <span className={s.userName}>
                                            {c.name}
                                        </span>
                                        <span className={s.userEmail}>
                                            {c.currentStudents}/{c.maxStudents}{' '}
                                            học viên
                                        </span>
                                    </div>
                                </td>
                                <td>{c.course.name}</td>
                                <td>{c.teacher.name}</td>
                                <td>{c.room.name}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <StatusBadge
                                        variant={statusProps.variant}
                                        label={statusProps.label}
                                    />
                                </td>
                                <td>
                                    {c.startDate} - {c.endDate}
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className={s.actionsCell}>
                                        {(c.status === 'draft' ||
                                            c.status === 'scheduled') && (
                                            <ButtonPrimary
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onUpdateStatus(c, 'open')
                                                }
                                                title="Mở đăng ký lớp học (Chuyển sang trạng thái OPEN)"
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 8px',
                                                    minHeight: 'unset',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Mở đăng ký
                                            </ButtonPrimary>
                                        )}
                                        {c.status === 'open' && (
                                            <ButtonPrimary
                                                variant="outline"
                                                tone="success"
                                                size="sm"
                                                onClick={() =>
                                                    onUpdateStatus(c, 'ongoing')
                                                }
                                                title="Bắt đầu lớp học (Chuyển sang trạng thái ONGOING)"
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 8px',
                                                    minHeight: 'unset',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                Bắt đầu lớp
                                            </ButtonPrimary>
                                        )}
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onEditClass(c)}
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
                                            onClick={() => onDeleteClass(c)}
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
