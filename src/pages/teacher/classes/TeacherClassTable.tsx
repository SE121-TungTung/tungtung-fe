import { useNavigate } from 'react-router-dom'
import { type Class, type ClassStatus } from '@/lib/classes'
import s from '@/pages/admin/classes/ClassTable.module.css'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'

const classStatusMap: Record<
    ClassStatus,
    { label: string; variant: StatusBadgeVariant }
> = {
    scheduled: { label: 'Sắp diễn ra', variant: 'warning' },
    active: { label: 'Đang dạy', variant: 'success' },
    completed: { label: 'Đã xong', variant: 'neutral' },
    cancelled: { label: 'Đã hủy', variant: 'danger' },
    postponed: { label: 'Hoãn', variant: 'neutral' },
}

type Props = {
    classes: Class[]
    isLoading?: boolean
}

export default function TeacherClassTable({ classes, isLoading }: Props) {
    const navigate = useNavigate()

    const handleRowClick = (classId: string) => {
        navigate(`/teacher/classes/${classId}`)
    }

    return (
        <table className={s.table}>
            <thead>
                <tr>
                    <th>Lớp học</th>
                    <th>Khóa học</th>
                    <th>Phòng</th>
                    <th>Thời gian</th>
                    <th>Sĩ số</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td
                            colSpan={6}
                            style={{ textAlign: 'center', padding: '40px' }}
                        >
                            Đang tải dữ liệu lớp học...
                        </td>
                    </tr>
                ) : classes.length === 0 ? (
                    <tr>
                        <td
                            colSpan={6}
                            style={{ textAlign: 'center', padding: '40px' }}
                        >
                            Bạn chưa được phân công lớp nào.
                        </td>
                    </tr>
                ) : (
                    classes.map((c) => {
                        const statusInfo =
                            classStatusMap[c.status] || classStatusMap.cancelled
                        return (
                            <tr
                                key={c.id}
                                onClick={() => handleRowClick(c.id)}
                                style={{ cursor: 'pointer' }}
                                title="Nhấn để xem chi tiết"
                                className={s.tableRow}
                            >
                                <td>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            color: 'var(--text-primary-light)',
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                </td>
                                <td>{c.course.name}</td>
                                <td>
                                    <span
                                        style={{
                                            backgroundColor: '#f1f5f9',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontWeight: 500,
                                            fontSize: '12px',
                                        }}
                                    >
                                        {c.room.name}
                                    </span>
                                </td>
                                <td>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            fontSize: 13,
                                        }}
                                    >
                                        <span>
                                            BĐ:{' '}
                                            {new Date(
                                                c.startDate
                                            ).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span style={{ color: '#888' }}>
                                            KT:{' '}
                                            {new Date(
                                                c.endDate
                                            ).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    {c.currentStudents} / {c.maxStudents}
                                </td>
                                <td>
                                    <StatusBadge
                                        variant={statusInfo.variant}
                                        label={statusInfo.label}
                                    />
                                </td>
                            </tr>
                        )
                    })
                )}
            </tbody>
        </table>
    )
}
