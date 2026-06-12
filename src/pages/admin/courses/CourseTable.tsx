import React, { useState } from 'react'
import {
    type Course,
    type CourseLevel,
    type CourseStatus,
    type CourseType,
} from '@/lib/courses'
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

const courseTypeDisplayNames: Record<CourseType, string> = {
    general_english: 'Tiếng Anh tổng quát',
    ielts: 'IELTS',
    toeic: 'TOEIC',
    toefl: 'TOEFL',
    business: 'Tiếng Anh thương mại',
    conversation: 'Giao tiếp',
    grammar: 'Ngữ pháp',
    writing: 'Viết',
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
    const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(
        new Set()
    )

    const canEdit = can('course:update')
    const canDelete = can('course:delete')

    const getCourseLevelName = (level: CourseLevel) => {
        return courseLevelDisplayNames[level] || level
    }

    const toggleExpand = (id: string) => {
        setExpandedCourseIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
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
                        const isExpanded = expandedCourseIds.has(c.id)
                        return (
                            <React.Fragment key={c.id}>
                                <tr onClick={() => toggleExpand(c.id)}>
                                    <td>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    transform: isExpanded
                                                        ? 'rotate(90deg)'
                                                        : 'rotate(0deg)',
                                                    transition:
                                                        'transform 0.2s',
                                                    display: 'inline-block',
                                                    cursor: 'pointer',
                                                    fontSize: '10px',
                                                    color: 'var(--color-text-secondary)',
                                                    userSelect: 'none',
                                                }}
                                            >
                                                ▶
                                            </span>
                                            <div className={s.userInfo}>
                                                <span className={s.userName}>
                                                    {c.name}
                                                </span>
                                                <span className={s.userEmail}>
                                                    {c.description
                                                        ? c.description.substring(
                                                              0,
                                                              80
                                                          ) +
                                                          (c.description
                                                              .length > 80
                                                              ? '...'
                                                              : '')
                                                        : 'Chưa có mô tả'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: c.currency || 'VND',
                                        }).format(c.feeAmount)}
                                    </td>
                                    <td>{getCourseLevelName(c.level)}</td>
                                    <td>
                                        <StatusBadge
                                            variant={statusProps.variant}
                                            label={statusProps.label}
                                        />
                                    </td>
                                    <td>{c.durationHours} giờ</td>
                                    <td>
                                        {new Date(
                                            c.createdAt
                                        ).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td>
                                        <div
                                            className={s.actionsCell}
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
                                                onClick={() =>
                                                    onDeleteCourse(c)
                                                }
                                                disabled={!canDelete}
                                                title={
                                                    canDelete
                                                        ? 'Xóa'
                                                        : 'Không có quyền xóa'
                                                }
                                                className={s.dangerButton}
                                            >
                                                <img
                                                    src={IconDelete}
                                                    alt="Xóa"
                                                />
                                            </ButtonPrimary>
                                        </div>
                                    </td>
                                </tr>
                                {isExpanded && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            style={{
                                                background:
                                                    'var(--color-bg-muted)',
                                                padding: '20px 24px',
                                                borderBottom:
                                                    '1px solid var(--color-border-soft)',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns:
                                                        '1fr 1.2fr',
                                                    gap: '32px',
                                                }}
                                            >
                                                <div>
                                                    <p
                                                        style={{
                                                            margin: '0 0 10px 0',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        <strong>
                                                            Phân loại:
                                                        </strong>{' '}
                                                        {courseTypeDisplayNames[
                                                            c.courseType
                                                        ] || c.courseType}
                                                    </p>
                                                    <p
                                                        style={{
                                                            margin: '0 0 16px 0',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        <strong>Sĩ số:</strong>{' '}
                                                        Tối thiểu{' '}
                                                        {c.minStudents} • Tối đa{' '}
                                                        {c.maxStudents} học viên
                                                    </p>

                                                    <p
                                                        style={{
                                                            margin: '0 0 6px 0',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        <strong>
                                                            Điều kiện tiên
                                                            quyết:
                                                        </strong>
                                                    </p>
                                                    {c.prerequisites &&
                                                    c.prerequisites.length >
                                                        0 ? (
                                                        <ul
                                                            style={{
                                                                margin: '0 0 16px 0',
                                                                paddingLeft:
                                                                    '20px',
                                                                fontSize:
                                                                    '13px',
                                                                lineHeight:
                                                                    '1.5',
                                                            }}
                                                        >
                                                            {c.prerequisites.map(
                                                                (p, i) => (
                                                                    <li key={i}>
                                                                        {p}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p
                                                            style={{
                                                                margin: '0 0 16px 0',
                                                                fontSize:
                                                                    '13px',
                                                                color: 'var(--color-text-secondary)',
                                                            }}
                                                        >
                                                            Không có
                                                        </p>
                                                    )}

                                                    <p
                                                        style={{
                                                            margin: '0 0 6px 0',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        <strong>
                                                            Mục tiêu đầu ra:
                                                        </strong>
                                                    </p>
                                                    {c.learningObjectives &&
                                                    c.learningObjectives
                                                        .length > 0 ? (
                                                        <ul
                                                            style={{
                                                                margin: '0',
                                                                paddingLeft:
                                                                    '20px',
                                                                fontSize:
                                                                    '13px',
                                                                lineHeight:
                                                                    '1.5',
                                                            }}
                                                        >
                                                            {c.learningObjectives.map(
                                                                (obj, i) => (
                                                                    <li key={i}>
                                                                        {obj}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p
                                                            style={{
                                                                margin: '0',
                                                                fontSize:
                                                                    '13px',
                                                                color: 'var(--color-text-secondary)',
                                                            }}
                                                        >
                                                            Không có
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <p
                                                        style={{
                                                            margin: '0 0 10px 0',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        <strong>
                                                            Giáo trình
                                                            (Syllabus):
                                                        </strong>
                                                    </p>
                                                    {c.syllabus &&
                                                    c.syllabus.chapters &&
                                                    c.syllabus.chapters.length >
                                                        0 ? (
                                                        <ol
                                                            style={{
                                                                margin: '0',
                                                                paddingLeft:
                                                                    '20px',
                                                                fontSize:
                                                                    '13px',
                                                                lineHeight:
                                                                    '1.6',
                                                            }}
                                                        >
                                                            {c.syllabus.chapters.map(
                                                                (
                                                                    ch: string,
                                                                    i: number
                                                                ) => (
                                                                    <li key={i}>
                                                                        {ch}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ol>
                                                    ) : (
                                                        <p
                                                            style={{
                                                                margin: '0',
                                                                fontSize:
                                                                    '13px',
                                                                color: 'var(--color-text-secondary)',
                                                            }}
                                                        >
                                                            Chưa cấu hình giáo
                                                            trình
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )
                    })
                )}
            </tbody>
        </table>
    )
}
