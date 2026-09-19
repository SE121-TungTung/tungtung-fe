import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { type Class } from '@/lib/classes'
import { getEnrollments } from '@/lib/enrollments'
import { listUsers } from '@/lib/users'
import { useCreateEnrollment } from '@/hooks/domain/useEnrollments'
import { Modal } from '@/components/core/Modal'
import {
    getClassCertificateEligibility,
    issueCertificate,
} from '@/lib/certificates'
import { useDialog } from '@/hooks/useDialog'
import { type StatusBadgeVariant } from '@/components/common/typography/StatusBadge'
import { ClassInfoTab } from './tabs/ClassInfoTab'
import { ClassEnrollmentTab } from './tabs/ClassEnrollmentTab'
import { ClassCertificatesTab } from './tabs/ClassCertificatesTab'
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

    if (!classItem) return null

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

    const statusInfo = classStatusMap[classItem.status] || {
        label: classItem.status,
        variant: 'neutral' as StatusBadgeVariant,
    }

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
                        <ClassInfoTab
                            classItem={classItem}
                            statusInfo={statusInfo}
                            formattedFee={formattedFee}
                        />
                    )}

                    {activeTab === 'enrollment' && (
                        <ClassEnrollmentTab
                            classItem={classItem}
                            canEnroll={canEnroll}
                            isClassOpen={isClassOpen}
                            isClassFull={isClassFull}
                            selectedStudentId={selectedStudentId}
                            setSelectedStudentId={setSelectedStudentId}
                            enrollNotes={enrollNotes}
                            setEnrollNotes={setEnrollNotes}
                            studentOptions={studentOptions}
                            isLoadingStudents={isLoadingStudents}
                            isLoadingEnrollments={isLoadingEnrollments}
                            isSubmittingEnrollment={
                                createEnrollmentMutation.isPending
                            }
                            enrollments={enrollments}
                            onEnrollSubmit={handleEnrollSubmit}
                        />
                    )}

                    {activeTab === 'certificates' && (
                        <ClassCertificatesTab
                            isLoadingEligibility={isLoadingEligibility}
                            eligibilityList={eligibilityList}
                            issuingIds={issuingIds}
                            onIssueCertificate={handleIssueCertificate}
                        />
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default ClassDetailModal
