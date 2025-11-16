import { type Class, type ClassStatus } from '@/lib/classes'
import s from './ClassTable.module.css' // Dùng CSS module
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import IconEdit from '@/assets/Edit Pen.svg'
import IconDelete from '@/assets/Trash Bin.svg'

const classStatusMap: Record<
    ClassStatus,
    { label: string; variant: StatusBadgeVariant }
> = {
    scheduled: { label: 'Đã lên lịch', variant: 'warning' },
    active: { label: 'Đang diễn ra', variant: 'success' },
    completed: { label: 'Đã hoàn thành', variant: 'neutral' },
    cancelled: { label: 'Đã hủy', variant: 'danger' },
    postponed: { label: 'Dời ngày', variant: 'neutral' },
}

const getClassStatusProps = (status: ClassStatus) => {
    return classStatusMap[status] || classStatusMap.cancelled
}

type Props = {
    classes: Class[]
    onEditClass: (classItem: Class) => void
    onDeleteClass: (classItem: Class) => void
    isLoading?: boolean
}

export default function ClassTable({
    classes,
    onEditClass,
    onDeleteClass,
    isLoading,
}: Props) {
    const { can } = usePermissions()

    const canEdit = can('class:update')
    const canDelete = can('class:delete')

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
                    <tr>
                        <td colSpan={7} className={s.loadingOrEmpty}>
                            Đang tải...
                        </td>
                    </tr>
                ) : classes.length === 0 ? (
                    <tr>
                        <td colSpan={7} className={s.loadingOrEmpty}>
                            Không có lớp học nào.
                        </td>
                    </tr>
                ) : (
                    classes.map((c) => {
                        const statusProps = getClassStatusProps(c.status)
                        return (
                            <tr key={c.id}>
                                <td>
                                    <div className={s.userInfo}>
                                        <span className={s.userName}>
                                            {c.name}
                                        </span>
                                        <span className={s.userEmail}>
                                            {c.maxStudents} học viên
                                        </span>
                                    </div>
                                </td>
                                <td>{c.course.name}</td>
                                <td>{c.teacher.name}</td>
                                <td>{c.room.name}</td>
                                <td>
                                    <StatusBadge
                                        variant={statusProps.variant}
                                        label={statusProps.label}
                                    />
                                </td>
                                <td>
                                    {c.startDate} - {c.endDate}
                                </td>
                                <td>
                                    <div className={s.actionsCell}>
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
