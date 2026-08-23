import React from 'react'
import { type Class } from '@/lib/classes'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import s from '../ClassDetailModal.module.css'

interface ClassInfoTabProps {
    classItem: Class
    statusInfo: { label: string; variant: StatusBadgeVariant }
    formattedFee: string
}

export const ClassInfoTab: React.FC<ClassInfoTabProps> = ({
    classItem,
    statusInfo,
    formattedFee,
}) => {
    return (
        <div className={s.infoGrid}>
            <div className={s.infoSection}>
                <h3 className={s.sectionTitle}>Thông tin cơ bản</h3>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Tên lớp học:</span>
                    <span className={s.infoValue}>{classItem.name}</span>
                </div>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Khóa học:</span>
                    <span className={s.infoValue}>{classItem.course.name}</span>
                </div>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Giáo viên:</span>
                    <span className={s.infoValue}>
                        {classItem.teacher.name}
                    </span>
                </div>
                {classItem.substituteTeacher && (
                    <div className={s.infoRow}>
                        <span className={s.infoLabel}>Giáo viên dạy thay:</span>
                        <span className={s.infoValue}>
                            {classItem.substituteTeacher.name}
                        </span>
                    </div>
                )}
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Phòng học:</span>
                    <span className={s.infoValue}>{classItem.room.name}</span>
                </div>
            </div>

            <div className={s.infoSection}>
                <h3 className={s.sectionTitle}>Học vụ & Lịch học</h3>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Trạng thái lớp:</span>
                    <span>
                        <StatusBadge
                            variant={statusInfo.variant}
                            label={statusInfo.label}
                        />
                    </span>
                </div>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Sĩ số lớp:</span>
                    <span className={s.infoValue}>
                        {classItem.currentStudents} / {classItem.maxStudents}{' '}
                        học viên
                    </span>
                </div>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Học phí:</span>
                    <span className={s.infoValue}>{formattedFee}</span>
                </div>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Thời gian học:</span>
                    <span className={s.infoValue}>
                        {classItem.startDate} đến {classItem.endDate}
                    </span>
                </div>
                <div className={s.infoRow}>
                    <span className={s.infoLabel}>Số buổi / tuần:</span>
                    <span className={s.infoValue}>
                        {classItem.sessionsPerWeek || 'Đang cập nhật'}
                    </span>
                </div>
            </div>

            {classItem.notes && (
                <div className={s.notesSection}>
                    <h3 className={s.sectionTitle}>Ghi chú</h3>
                    <p className={s.notesText}>{classItem.notes}</p>
                </div>
            )}
        </div>
    )
}

export default ClassInfoTab
