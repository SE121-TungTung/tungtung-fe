import React from 'react'
import { type Class } from '@/lib/classes'
import { type EnrollmentResponse } from '@/lib/enrollments'
import { SelectField } from '@/components/common/input/SelectField'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import s from '../ClassDetailModal.module.css'

interface ClassEnrollmentTabProps {
    classItem: Class
    canEnroll: boolean
    isClassOpen: boolean
    isClassFull: boolean
    selectedStudentId: string
    setSelectedStudentId: (id: string) => void
    enrollNotes: string
    setEnrollNotes: (notes: string) => void
    studentOptions: { label: string; value: string }[]
    isLoadingStudents: boolean
    isLoadingEnrollments: boolean
    isSubmittingEnrollment: boolean
    enrollments: EnrollmentResponse[]
    onEnrollSubmit: (e: React.FormEvent) => void
}

export const ClassEnrollmentTab: React.FC<ClassEnrollmentTabProps> = ({
    classItem,
    canEnroll,
    isClassOpen,
    isClassFull,
    selectedStudentId,
    setSelectedStudentId,
    enrollNotes,
    setEnrollNotes,
    studentOptions,
    isLoadingStudents,
    isLoadingEnrollments,
    isSubmittingEnrollment,
    enrollments,
    onEnrollSubmit,
}) => {
    return (
        <div className={s.enrollmentContainer}>
            {/* Enroll Form (Only if Open & Not full) */}
            {canEnroll && (
                <form onSubmit={onEnrollSubmit} className={s.enrollForm}>
                    <h3 className={s.enrollFormTitle}>Đăng ký học viên mới</h3>
                    <div className={s.enrollFormFields}>
                        <div className={s.selectWrapper}>
                            <SelectField
                                id="studentSelect"
                                label="Chọn Học viên"
                                value={selectedStudentId}
                                onChange={(e) =>
                                    setSelectedStudentId(e.target.value)
                                }
                                options={studentOptions}
                                disabled={isLoadingStudents}
                            />
                        </div>
                        <div className={s.inputWrapper}>
                            <InputField
                                id="enrollNotes"
                                label="Ghi chú đăng ký (tuỳ chọn)"
                                placeholder="Nhập ghi chú hoặc mã giảm giá..."
                                value={enrollNotes}
                                onChange={(e) => setEnrollNotes(e.target.value)}
                            />
                        </div>
                        <div className={s.buttonWrapper}>
                            <ButtonPrimary
                                type="submit"
                                variant="solid"
                                loading={isSubmittingEnrollment}
                                disabled={
                                    !selectedStudentId || isSubmittingEnrollment
                                }
                            >
                                Đăng ký & Tạo hóa đơn
                            </ButtonPrimary>
                        </div>
                    </div>
                </form>
            )}

            {/* Warning messages if cannot enroll */}
            {!isClassOpen && (
                <div className={s.warningAlert}>
                    Không thể đăng ký học viên mới vì lớp học không ở trạng thái{' '}
                    <strong>Mở đăng ký (OPEN)</strong>.
                </div>
            )}
            {isClassOpen && isClassFull && (
                <div className={s.warningAlert}>
                    Không thể đăng ký học viên mới vì lớp đã đạt sĩ số tối đa (
                    {classItem.currentStudents}/{classItem.maxStudents}).
                </div>
            )}

            {/* Enrolled Students List */}
            <div className={s.studentsListSection}>
                <h3 className={s.sectionTitle}>
                    Danh sách học viên đã đăng ký
                </h3>
                {isLoadingEnrollments ? (
                    <p className={s.loadingText}>
                        Đang tải danh sách học viên...
                    </p>
                ) : enrollments.length === 0 ? (
                    <p className={s.emptyText}>
                        Chưa có học viên nào đăng ký lớp học này.
                    </p>
                ) : (
                    <div className={s.tableContainer}>
                        <table className={s.studentTable}>
                            <thead>
                                <tr>
                                    <th>Họ và Tên</th>
                                    <th>Ngày đăng ký</th>
                                    <th>Thanh toán</th>
                                    <th>Trạng thái học</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((e) => {
                                    let payBadgeVar: StatusBadgeVariant =
                                        'neutral'
                                    let payLabel: string =
                                        e.payment_status || 'Chưa rõ'
                                    if (e.payment_status === 'paid') {
                                        payBadgeVar = 'success'
                                        payLabel = 'Đã thanh toán'
                                    } else if (e.payment_status === 'pending') {
                                        payBadgeVar = 'warning'
                                        payLabel = 'Chờ thanh toán'
                                    } else if (e.payment_status === 'partial') {
                                        payBadgeVar = 'warning'
                                        payLabel = 'Thanh toán một phần'
                                    } else if (
                                        e.payment_status === 'refunded'
                                    ) {
                                        payBadgeVar = 'danger'
                                        payLabel = 'Đã hoàn tiền'
                                    }

                                    let statusBadgeVar: StatusBadgeVariant =
                                        'neutral'
                                    let statusLabel: string =
                                        e.status || 'Chưa rõ'
                                    if (e.status === 'active') {
                                        statusBadgeVar = 'success'
                                        statusLabel = 'Đang học'
                                    } else if (e.status === 'completed') {
                                        statusBadgeVar = 'neutral'
                                        statusLabel = 'Đã hoàn thành'
                                    } else if (e.status === 'dropped') {
                                        statusBadgeVar = 'danger'
                                        statusLabel = 'Bỏ học'
                                    }

                                    return (
                                        <tr key={e.id}>
                                            <td className={s.studentNameCol}>
                                                {e.student_name || 'Học viên'}
                                            </td>
                                            <td>
                                                {e.enrollment_date
                                                    ? new Date(
                                                          e.enrollment_date
                                                      ).toLocaleDateString(
                                                          'vi-VN'
                                                      )
                                                    : '—'}
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    variant={payBadgeVar}
                                                    label={payLabel}
                                                />
                                            </td>
                                            <td>
                                                <StatusBadge
                                                    variant={statusBadgeVar}
                                                    label={statusLabel}
                                                />
                                            </td>
                                            <td className={s.notesCol}>
                                                {e.notes || '—'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClassEnrollmentTab
