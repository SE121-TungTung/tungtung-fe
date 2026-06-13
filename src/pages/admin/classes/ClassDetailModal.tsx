import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type Class } from '@/lib/classes'
import { getEnrollments } from '@/lib/enrollments'
import { listUsers } from '@/lib/users'
import { useCreateEnrollment } from '@/hooks/domain/useEnrollments'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { SelectField } from '@/components/common/input/SelectField'
import InputField from '@/components/common/input/InputField'
import {
    getClassCertificateEligibility,
    issueCertificate,
} from '@/lib/certificates'
import { useDialog } from '@/hooks/useDialog'
import {
    StatusBadge,
    type StatusBadgeVariant,
} from '@/components/common/typography/StatusBadge'
import s from './ClassDetailModal.module.css'

interface Props {
    isOpen: boolean
    onClose: () => void
    classItem: Class | null
}

const classStatusMap: Record<
    string,
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

export const ClassDetailModal: React.FC<Props> = ({
    isOpen,
    onClose,
    classItem,
}) => {
    const { alert } = useDialog()
    const [activeTab, setActiveTab] = useState<
        'info' | 'enrollment' | 'certificates'
    >('info')
    const [issuingIds, setIssuingIds] = useState<Record<string, boolean>>({})

    // Enrollment form state
    const [selectedStudentId, setSelectedStudentId] = useState('')
    const [enrollNotes, setEnrollNotes] = useState('')

    const createEnrollmentMutation = useCreateEnrollment()

    // 1. Fetch class enrollments
    const {
        data: enrollmentsData,
        isLoading: isLoadingEnrollments,
        refetch: refetchEnrollments,
    } = useQuery({
        queryKey: ['class-enrollments', classItem?.id],
        queryFn: () => getEnrollments({ class_id: classItem?.id, limit: 100 }),
        enabled: !!classItem?.id && isOpen,
    })
    const enrollments = enrollmentsData?.data ?? []

    // 2. Fetch students for dropdown selection
    const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['users', { role: 'student', limit: 200 }],
        queryFn: () => listUsers({ role: 'student', limit: 200 }),
        enabled: isOpen && classItem?.status === 'open',
    })
    const students = studentsData?.users ?? []

    // 3. Fetch certificate eligibility (only if class is completed)
    const {
        data: eligibilityList,
        isLoading: isLoadingEligibility,
        refetch: refetchEligibility,
    } = useQuery({
        queryKey: ['class-certificate-eligibility', classItem?.id],
        queryFn: () => getClassCertificateEligibility(classItem!.id),
        enabled:
            !!classItem?.id &&
            isOpen &&
            classItem.status === 'completed' &&
            activeTab === 'certificates',
    })

    const handleIssueCertificate = async (
        studentId: string,
        finalGrade: number,
        attendanceRate: number
    ) => {
        if (!classItem) return
        setIssuingIds((prev) => ({ ...prev, [studentId]: true }))
        try {
            await issueCertificate({
                student_id: studentId,
                course_id: classItem.course.id,
                class_id: classItem.id,
                final_score: finalGrade,
                attendance_rate: attendanceRate,
            })
            alert(
                'Cấp chứng chỉ thành công! File PDF chứng chỉ đã được tạo.',
                'Thành công'
            )
            refetchEligibility()
        } catch (err: any) {
            alert(err.message || 'Không thể cấp chứng chỉ')
        } finally {
            setIssuingIds((prev) => ({ ...prev, [studentId]: false }))
        }
    }

    if (!classItem) return null

    const statusInfo = classStatusMap[classItem.status] || {
        label: classItem.status,
        variant: 'neutral',
    }

    const isClassOpen = classItem.status === 'open'
    const isClassFull = classItem.currentStudents >= classItem.maxStudents
    const canEnroll = isClassOpen && !isClassFull

    const handleEnrollSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudentId) {
            alert('Vui lòng chọn học viên.')
            return
        }

        try {
            await createEnrollmentMutation.mutateAsync({
                class_id: classItem.id,
                student_id: selectedStudentId,
                notes: enrollNotes.trim() || undefined,
            })
            alert(
                'Đăng ký lớp học thành công! Hóa đơn chờ thanh toán đã được tạo.',
                'Thành công'
            )
            setSelectedStudentId('')
            setEnrollNotes('')
            refetchEnrollments()
        } catch (err: any) {
            alert(err.message || 'Không thể đăng ký học viên vào lớp')
        }
    }

    const formattedFee = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(classItem.feeAmount || 0)

    // Filter students to only show those not already enrolled
    const enrolledStudentIds = new Set(enrollments.map((e) => e.student_id))
    const availableStudents = students.filter(
        (s) => !enrolledStudentIds.has(s.id)
    )

    const studentOptions = [
        { label: 'Chọn học viên...', value: '' },
        ...availableStudents.map((s) => ({
            label: `${s.lastName} ${s.firstName} (${s.email})`,
            value: s.id,
        })),
    ]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Chi tiết Lớp học: ${classItem.name}`}
        >
            <div className={s.modalContainer}>
                {/* Tabs Header */}
                <div className={s.tabsHeader}>
                    <button
                        className={`${s.tabButton} ${activeTab === 'info' ? s.tabActive : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Thông tin chung
                    </button>
                    <button
                        className={`${s.tabButton} ${activeTab === 'enrollment' ? s.tabActive : ''}`}
                        onClick={() => setActiveTab('enrollment')}
                    >
                        Danh sách học viên & Đăng ký (
                        {classItem.currentStudents}/{classItem.maxStudents})
                    </button>
                    {classItem.status === 'completed' && (
                        <button
                            className={`${s.tabButton} ${activeTab === 'certificates' ? s.tabActive : ''}`}
                            onClick={() => setActiveTab('certificates')}
                        >
                            Chứng chỉ
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className={s.tabContent}>
                    {activeTab === 'info' && (
                        <div className={s.infoGrid}>
                            <div className={s.infoSection}>
                                <h3 className={s.sectionTitle}>
                                    Thông tin cơ bản
                                </h3>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Tên lớp học:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.name}
                                    </span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Khóa học:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.course.name}
                                    </span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Giáo viên:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.teacher.name}
                                    </span>
                                </div>
                                {classItem.substituteTeacher && (
                                    <div className={s.infoRow}>
                                        <span className={s.infoLabel}>
                                            Giáo viên dạy thay:
                                        </span>
                                        <span className={s.infoValue}>
                                            {classItem.substituteTeacher.name}
                                        </span>
                                    </div>
                                )}
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Phòng học:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.room.name}
                                    </span>
                                </div>
                            </div>

                            <div className={s.infoSection}>
                                <h3 className={s.sectionTitle}>
                                    Học vụ & Lịch học
                                </h3>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Trạng thái lớp:
                                    </span>
                                    <span>
                                        <StatusBadge
                                            variant={statusInfo.variant}
                                            label={statusInfo.label}
                                        />
                                    </span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Sĩ số lớp:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.currentStudents} /{' '}
                                        {classItem.maxStudents} học viên
                                    </span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Học phí:
                                    </span>
                                    <span className={s.infoValue}>
                                        {formattedFee}
                                    </span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Thời gian học:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.startDate} đến{' '}
                                        {classItem.endDate}
                                    </span>
                                </div>
                                <div className={s.infoRow}>
                                    <span className={s.infoLabel}>
                                        Số buổi / tuần:
                                    </span>
                                    <span className={s.infoValue}>
                                        {classItem.sessionsPerWeek ||
                                            'Đang cập nhật'}
                                    </span>
                                </div>
                            </div>

                            {classItem.notes && (
                                <div className={s.notesSection}>
                                    <h3 className={s.sectionTitle}>Ghi chú</h3>
                                    <p className={s.notesText}>
                                        {classItem.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'enrollment' && (
                        <div className={s.enrollmentContainer}>
                            {/* Enroll Form (Only if Open & Not full) */}
                            {canEnroll && (
                                <form
                                    onSubmit={handleEnrollSubmit}
                                    className={s.enrollForm}
                                >
                                    <h3 className={s.enrollFormTitle}>
                                        Đăng ký học viên mới
                                    </h3>
                                    <div className={s.enrollFormFields}>
                                        <div className={s.selectWrapper}>
                                            <SelectField
                                                id="studentSelect"
                                                label="Chọn Học viên"
                                                value={selectedStudentId}
                                                onChange={(e) =>
                                                    setSelectedStudentId(
                                                        e.target.value
                                                    )
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
                                                onChange={(e) =>
                                                    setEnrollNotes(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className={s.buttonWrapper}>
                                            <ButtonPrimary
                                                type="submit"
                                                variant="solid"
                                                loading={
                                                    createEnrollmentMutation.isPending
                                                }
                                                disabled={
                                                    !selectedStudentId ||
                                                    createEnrollmentMutation.isPending
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
                                    Không thể đăng ký học viên mới vì lớp học
                                    không ở trạng thái{' '}
                                    <strong>Mở đăng ký (OPEN)</strong>.
                                </div>
                            )}
                            {isClassOpen && isClassFull && (
                                <div className={s.warningAlert}>
                                    Không thể đăng ký học viên mới vì lớp đã đạt
                                    sĩ số tối đa ({classItem.currentStudents}/
                                    {classItem.maxStudents}).
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
                                        Chưa có học viên nào đăng ký lớp học
                                        này.
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
                                                        e.payment_status ||
                                                        'Chưa rõ'
                                                    if (
                                                        e.payment_status ===
                                                        'paid'
                                                    ) {
                                                        payBadgeVar = 'success'
                                                        payLabel =
                                                            'Đã thanh toán'
                                                    } else if (
                                                        e.payment_status ===
                                                        'pending'
                                                    ) {
                                                        payBadgeVar = 'warning'
                                                        payLabel =
                                                            'Chờ thanh toán'
                                                    } else if (
                                                        e.payment_status ===
                                                        'partial'
                                                    ) {
                                                        payBadgeVar = 'warning'
                                                        payLabel =
                                                            'Thanh toán một phần'
                                                    } else if (
                                                        e.payment_status ===
                                                        'refunded'
                                                    ) {
                                                        payBadgeVar = 'danger'
                                                        payLabel =
                                                            'Đã hoàn tiền'
                                                    }

                                                    let statusBadgeVar: StatusBadgeVariant =
                                                        'neutral'
                                                    let statusLabel: string =
                                                        e.status || 'Chưa rõ'
                                                    if (e.status === 'active') {
                                                        statusBadgeVar =
                                                            'success'
                                                        statusLabel = 'Đang học'
                                                    } else if (
                                                        e.status === 'completed'
                                                    ) {
                                                        statusBadgeVar =
                                                            'neutral'
                                                        statusLabel =
                                                            'Đã hoàn thành'
                                                    } else if (
                                                        e.status === 'dropped'
                                                    ) {
                                                        statusBadgeVar =
                                                            'danger'
                                                        statusLabel = 'Bỏ học'
                                                    }

                                                    return (
                                                        <tr key={e.id}>
                                                            <td
                                                                className={
                                                                    s.studentNameCol
                                                                }
                                                            >
                                                                {e.student_name ||
                                                                    'Học viên'}
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
                                                                    variant={
                                                                        payBadgeVar
                                                                    }
                                                                    label={
                                                                        payLabel
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <StatusBadge
                                                                    variant={
                                                                        statusBadgeVar
                                                                    }
                                                                    label={
                                                                        statusLabel
                                                                    }
                                                                />
                                                            </td>
                                                            <td
                                                                className={
                                                                    s.notesCol
                                                                }
                                                            >
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
                    )}

                    {activeTab === 'certificates' && (
                        <div className={s.enrollmentContainer}>
                            <div className={s.studentsListSection}>
                                <h3 className={s.sectionTitle}>
                                    Danh sách điều kiện cấp chứng chỉ & Quản lý
                                    cấp
                                </h3>
                                {isLoadingEligibility ? (
                                    <p className={s.loadingText}>
                                        Đang kiểm tra điều kiện nhận chứng chỉ
                                        của học viên...
                                    </p>
                                ) : !eligibilityList ||
                                  eligibilityList.length === 0 ? (
                                    <p className={s.emptyText}>
                                        Không tìm thấy học viên nào trong lớp
                                        này.
                                    </p>
                                ) : (
                                    <div className={s.tableContainer}>
                                        <table className={s.studentTable}>
                                            <thead>
                                                <tr>
                                                    <th>Họ và Tên</th>
                                                    <th>Tỷ lệ chuyên cần</th>
                                                    <th>Điểm cuối kỳ</th>
                                                    <th>
                                                        Điều kiện (Chuyên cần ≥
                                                        80%, Điểm ≥ 7.0)
                                                    </th>
                                                    <th>
                                                        Trạng thái chứng chỉ
                                                    </th>
                                                    <th
                                                        style={{
                                                            width: '150px',
                                                        }}
                                                    >
                                                        Hành động
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {eligibilityList.map((e) => {
                                                    const ratePercent =
                                                        Math.round(
                                                            e.attendance_rate *
                                                                100
                                                        ) / 100
                                                    const isRateOk =
                                                        ratePercent >=
                                                        (e.min_rate_required ||
                                                            80)
                                                    const finalScore =
                                                        e.final_grade !== null
                                                            ? Number(
                                                                  e.final_grade
                                                              )
                                                            : null
                                                    const isScoreOk =
                                                        finalScore !== null &&
                                                        finalScore >=
                                                            (e.min_grade_required ||
                                                                7.0)
                                                    const isEligible =
                                                        isRateOk && isScoreOk

                                                    return (
                                                        <tr
                                                            key={
                                                                e.enrollment_id
                                                            }
                                                        >
                                                            <td
                                                                className={
                                                                    s.studentNameCol
                                                                }
                                                            >
                                                                {e.student_name}
                                                            </td>
                                                            <td>
                                                                <span
                                                                    style={{
                                                                        fontWeight: 600,
                                                                        color: isRateOk
                                                                            ? '#16a34a'
                                                                            : '#dc2626',
                                                                    }}
                                                                >
                                                                    {
                                                                        ratePercent
                                                                    }
                                                                    %
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        fontSize:
                                                                            '12px',
                                                                        color: '#64748b',
                                                                        marginLeft:
                                                                            '4px',
                                                                    }}
                                                                >
                                                                    (Yêu cầu ≥{' '}
                                                                    {e.min_rate_required ||
                                                                        80}
                                                                    %)
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {finalScore !==
                                                                null ? (
                                                                    <span
                                                                        style={{
                                                                            fontWeight: 600,
                                                                            color: isScoreOk
                                                                                ? '#16a34a'
                                                                                : '#dc2626',
                                                                        }}
                                                                    >
                                                                        {finalScore.toFixed(
                                                                            1
                                                                        )}{' '}
                                                                        / 10
                                                                    </span>
                                                                ) : (
                                                                    <span
                                                                        style={{
                                                                            color: '#64748b',
                                                                            fontStyle:
                                                                                'italic',
                                                                        }}
                                                                    >
                                                                        Chưa có
                                                                        điểm
                                                                    </span>
                                                                )}
                                                                <span
                                                                    style={{
                                                                        fontSize:
                                                                            '12px',
                                                                        color: '#64748b',
                                                                        marginLeft:
                                                                            '4px',
                                                                    }}
                                                                >
                                                                    (Yêu cầu ≥{' '}
                                                                    {e.min_grade_required ||
                                                                        7.0}
                                                                    )
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {isEligible ? (
                                                                    <StatusBadge
                                                                        variant="success"
                                                                        label="Đạt điều kiện"
                                                                    />
                                                                ) : (
                                                                    <StatusBadge
                                                                        variant="danger"
                                                                        label="Không đạt điều kiện"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td>
                                                                {e.is_issued ? (
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                'flex',
                                                                            flexDirection:
                                                                                'column',
                                                                            gap: '4px',
                                                                        }}
                                                                    >
                                                                        <StatusBadge
                                                                            variant="neutral"
                                                                            label="ĐÃ CẤP"
                                                                        />
                                                                        {e.certificate_code && (
                                                                            <code
                                                                                style={{
                                                                                    fontSize:
                                                                                        '11px',
                                                                                    color: '#475569',
                                                                                }}
                                                                            >
                                                                                Mã
                                                                                số:{' '}
                                                                                {
                                                                                    e.certificate_code
                                                                                }
                                                                            </code>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <StatusBadge
                                                                        variant="warning"
                                                                        label="CHƯA CẤP"
                                                                    />
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        gap: '8px',
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    {!e.is_issued ? (
                                                                        <ButtonPrimary
                                                                            size="sm"
                                                                            tone="brand"
                                                                            disabled={
                                                                                !isEligible ||
                                                                                !!issuingIds[
                                                                                    e
                                                                                        .student_id
                                                                                ]
                                                                            }
                                                                            loading={
                                                                                !!issuingIds[
                                                                                    e
                                                                                        .student_id
                                                                                ]
                                                                            }
                                                                            onClick={() =>
                                                                                handleIssueCertificate(
                                                                                    e.student_id,
                                                                                    finalScore ||
                                                                                        0,
                                                                                    ratePercent
                                                                                )
                                                                            }
                                                                        >
                                                                            Cấp
                                                                            CC
                                                                        </ButtonPrimary>
                                                                    ) : e.certificate_url ? (
                                                                        <ButtonPrimary
                                                                            size="sm"
                                                                            variant="outline"
                                                                            tone="success"
                                                                            onClick={() => {
                                                                                const fullUrl =
                                                                                    e.certificate_url?.startsWith(
                                                                                        'http'
                                                                                    )
                                                                                        ? e.certificate_url
                                                                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${e.certificate_url}`
                                                                                window.open(
                                                                                    fullUrl,
                                                                                    '_blank'
                                                                                )
                                                                            }}
                                                                        >
                                                                            Xem
                                                                            PDF
                                                                        </ButtonPrimary>
                                                                    ) : (
                                                                        <span
                                                                            style={{
                                                                                color: '#64748b',
                                                                                fontSize:
                                                                                    '13px',
                                                                            }}
                                                                        >
                                                                            Đã
                                                                            cấp
                                                                        </span>
                                                                    )}
                                                                </div>
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
                    )}
                </div>
            </div>
        </Modal>
    )
}
