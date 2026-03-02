import { type Course, type CourseLevel, type CourseStatus } from '@/lib/courses'
import s from './CourseTable.module.css'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import { usePermissions } from '@/hooks/usePermissions'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import IconEdit from '@/assets/Edit Pen.svg'
import IconDelete from '@/assets/Trash Bin.svg'
import Skeleton from '@/components/effect/Skeleton'

const courseLevelDisplayNames: Record<CourseLevel, string> = {
    beginner: 'Mất gốc',
    elementary: 'Cơ bản',
    intermediate: 'Trung cấp',
    upper_intermediate: 'Trung cấp+',
    advanced: 'Cao cấp',
    proficiency: 'Chuyên gia',
}

const courseStatusMap: Record<
    CourseStatus,
    { label: string; variant: StatusBadgeVariant }
> = {
    active: { label: 'Đang hoạt động', variant: 'success' },
    inactive: { label: 'Không hoạt động', variant: 'neutral' },
    archived: { label: 'Lưu trữ', variant: 'neutral' },
}

const getCourseStatusProps = (status: CourseStatus) => {
    return courseStatusMap[status] || courseStatusMap.archived
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
})

type Props = {
    courses: Course[]
    onEditCourse: (course: Course) => void
    onDeleteCourse: (course: Course) => void
    isLoading?: boolean
}

export default function CourseTable({
    courses,
    onEditCourse,
    onDeleteCourse,
    isLoading,
}: Props) {
    const { can } = usePermissions()

    const canEdit = can('course:update')
    const canDelete = can('course:delete')

    const getCourseLevelName = (level: CourseLevel) => {
        return courseLevelDisplayNames[level] || level
    }

    const CourseRowSkeleton = () => (
        <tr>
            {/* Tên & Mô tả */}
            <td>
                <div className={s.userInfo}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                        }}
                    >
                        <Skeleton width={140} height={16} />
                        <Skeleton width={200} height={12} />
                    </div>
                </div>
            </td>
            {/* Học phí */}
            <td>
                <Skeleton width={80} height={16} />
            </td>
            {/* Cấp độ */}
            <td>
                <Skeleton width={90} height={16} />
            </td>
            {/* Trạng thái */}
            <td>
                <Skeleton
                    width={100}
                    height={24}
                    style={{ borderRadius: 12 }}
                />
            </td>
            {/* Thời lượng */}
            <td>
                <Skeleton width={60} height={16} />
            </td>
            {/* Ngày tạo */}
            <td>
                <Skeleton width={80} height={16} />
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
                    <th>Tên khóa học</th>
                    <th>Học phí</th>
                    <th>Cấp độ</th>
                    <th>Trạng thái</th>
                    <th>Thời lượng</th>
                    <th>Ngày tạo</th>
                    <th className={s.actionsHeader}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    // Render 5 skeleton rows
                    <>
                        {[...Array(5)].map((_, i) => (
                            <CourseRowSkeleton key={i} />
                        ))}
                    </>
                ) : courses.length === 0 ? (
                    <tr>
                        <td
                            colSpan={7}
                            style={{ textAlign: 'center', padding: '24px' }}
                        >
                            Không có khóa học nào.
                        </td>
                    </tr>
                ) : (
                    courses.map((c) => {
                        const statusProps = getCourseStatusProps(c.status)
                        return (
                            <tr key={c.id}>
                                <td>
                                    <div className={s.userInfo}>
                                        <span className={s.userName}>
                                            {c.name}
                                        </span>
                                        <span className={s.userEmail}>
                                            {c.description
                                                ? c.description.substring(
                                                      0,
                                                      40
                                                  ) +
                                                  (c.description.length > 40
                                                      ? '...'
                                                      : '')
                                                : 'Chưa có mô tả'}
                                        </span>
                                    </div>
                                </td>
                                <td>{currencyFormatter.format(c.feeAmount)}</td>
                                <td>{getCourseLevelName(c.level)}</td>
                                <td>
                                    <StatusBadge
                                        variant={statusProps.variant}
                                        label={statusProps.label}
                                    />
                                </td>
                                <td>{c.durationHours} giờ</td>
                                <td>
                                    {new Date(c.createdAt).toLocaleDateString(
                                        'vi-VN'
                                    )}
                                </td>
                                <td>
                                    <div className={s.actionsCell}>
                                        <ButtonPrimary
                                            variant="ghost"
                                            size="sm"
                                            iconOnly
                                            onClick={() => onEditCourse(c)}
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
                                            onClick={() => onDeleteCourse(c)}
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
