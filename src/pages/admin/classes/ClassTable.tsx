import { type Class, type ClassStatus } from '@/lib/classes'
import s from './ClassTable.module.css'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
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
                                            onClick={() => onDeleteClass(c)}
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
