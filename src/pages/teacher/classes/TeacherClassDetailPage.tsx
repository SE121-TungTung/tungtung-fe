import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import s from '@/pages/student/class/Class.module.css'

// Common Components
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import BackIcon from '@/assets/arrow-left.svg'

// API & Helpers
import {
    getClassCertificateEligibility,
    issueCertificate,
} from '@/lib/certificates'
import {
    getClass,
    getClassPosts,
    createClassPost,
    deleteClassPost,
} from '@/lib/classes'
import { getMyClasses, listUsers } from '@/lib/users'
import { type ClassMember } from '@/components/common/card/MemberCard'
import { useDialog } from '@/hooks/useDialog'
import {
    generateQrToken,
    getClassAttendanceStats,
    getStudentAttendanceStats,
} from '@/lib/attendance'

// Subcomponents
import { ClassOverviewTab } from './tabs/ClassOverviewTab'
import { ClassPostsFeedTab } from './tabs/ClassPostsFeedTab'
import { ClassMembersTab } from './tabs/ClassMembersTab'
import { ClassScheduleTab } from './tabs/ClassScheduleTab'
import { ClassCertificatesTab } from './tabs/ClassCertificatesTab'
import { ClassReportsTab } from './tabs/ClassReportsTab'

// Modals
import { SubstitutionRequestModal } from './modals/SubstitutionRequestModal'
import { AttendanceModal } from './modals/AttendanceModal'
import { QrCodeModal } from './modals/QrCodeModal'

const getSessionStartEnd = (session: any) => {
    if (!session.session_date || !session.start_time || !session.end_time) {
        return { start: new Date(), end: new Date() }
    }
    const [year, month, day] = session.session_date.split('-').map(Number)
    const [sHour, sMin] = session.start_time.split(':').map(Number)
    const [eHour, eMin] = session.end_time.split(':').map(Number)
    return {
        start: new Date(year, month - 1, day, sHour || 0, sMin || 0, 0, 0),
        end: new Date(year, month - 1, day, eHour || 0, eMin || 0, 0, 0),
    }
}

export default function TeacherClassDetailPage() {
    const { classId } = useParams<{ classId: string }>()
    const navigate = useNavigate()
    const { alert, confirm } = useDialog()
    const queryClient = useQueryClient()

    const [activeTab, setActiveTab] = useState('overview')
    const [searchTerm, setSearchTerm] = useState('')
    const [attendanceFilter, setAttendanceFilter] = useState('all')
    const [timeFilter, setTimeFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(0)
    const [issuingIds, setIssuingIds] = useState<Record<string, boolean>>({})

    // Feed / posting state
    const [postTitle, setPostTitle] = useState('')
    const [postContent, setPostContent] = useState('')
    const [postType, setPostType] = useState<'announcement' | 'material'>(
        'announcement'
    )
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isCreatingPost, setIsCreatingPost] = useState(false)

    // Modal states
    const [selectedSessionForAttendance, setSelectedSessionForAttendance] =
        useState<string | null>(null)
    const [selectedSessionForQr, setSelectedSessionForQr] = useState<
        any | null
    >(null)
    const [selectedSessionForSub, setSelectedSessionForSub] = useState<
        any | null
    >(null)

    // 1. Fetch Class Detail
    const { data: classDetail, isLoading } = useQuery({
        queryKey: ['class', classId],
        queryFn: () => getClass(classId!),
        enabled: !!classId,
    })

    // 2. Fetch Posts
    const {
        data: postsData,
        isLoading: postsLoading,
        refetch: refetchPosts,
    } = useQuery({
        queryKey: ['class-posts', classId],
        queryFn: () => getClassPosts(classId!, 1, 100),
        enabled: !!classId,
    })

    // 3. Fetch Teachers list
    const { data: teachersData } = useQuery({
        queryKey: ['users', 'teachers', 'list'],
        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),
        staleTime: 5 * 60 * 1000,
    })

    // 4. Fetch Certificate Eligibility
    const {
        data: eligibilityList,
        isLoading: isLoadingEligibility,
        refetch: refetchEligibility,
    } = useQuery({
        queryKey: ['class-certificate-eligibility', classId],
        queryFn: () => getClassCertificateEligibility(classId!),
        enabled:
            !!classId &&
            ((classDetail?.status === 'completed' &&
                activeTab === 'certificates') ||
                activeTab === 'reports'),
    })

    // 5. Fetch Attendance & Student Stats
    const { data: attendanceStats } = useQuery({
        queryKey: ['class-attendance-stats', classId],
        queryFn: () => getClassAttendanceStats(classId!),
        enabled: !!classId && activeTab === 'reports',
    })

    const { data: studentStats } = useQuery({
        queryKey: ['class-student-stats', classId],
        queryFn: () => getStudentAttendanceStats(classId!),
        enabled: !!classId && activeTab === 'reports',
    })

    // 6. Fetch My Classes
    const { data: myClasses } = useQuery({
        queryKey: ['my-classes'],
        queryFn: getMyClasses,
    })

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!postTitle.trim()) {
            alert('Vui lòng nhập tiêu đề', 'Thông báo')
            return
        }
        setIsCreatingPost(true)
        try {
            const formData = new FormData()
            formData.append('title', postTitle)
            formData.append('content', postContent)
            formData.append('post_type', postType)
            selectedFiles.forEach((file) => {
                formData.append('files', file)
            })

            await createClassPost(classId!, formData)
            alert('Đăng tin / tài liệu thành công!', 'Thành công')
            setPostTitle('')
            setPostContent('')
            setSelectedFiles([])
            refetchPosts()
        } catch (err: any) {
            alert(
                err.message || 'Không thể đăng bài viết. Vui lòng thử lại!',
                'Thất bại'
            )
        } finally {
            setIsCreatingPost(false)
        }
    }

    const handleDeletePost = async (postId: string) => {
        const isConfirmed = await confirm({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa bài viết/tài liệu này không?',
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy bỏ',
        })
        if (!isConfirmed) return
        try {
            await deleteClassPost(classId!, postId)
            alert('Xóa bài viết/tài liệu thành công!', 'Thành công')
            refetchPosts()
        } catch (err: any) {
            alert(
                err.message || 'Không thể xóa bài viết. Vui lòng thử lại!',
                'Thất bại'
            )
        }
    }

    const generateQrMutation = useMutation({
        mutationFn: (sessionId: string) => generateQrToken(sessionId),
        onSuccess: (res: any, sessionId) => {
            const rawData = res?.data || res
            const qrToken =
                rawData?.qr_token ||
                rawData?.token ||
                rawData?.qrToken ||
                res?.qr_token ||
                res?.data?.qr_token
            const qrExpires =
                rawData?.expires_at ||
                rawData?.qr_expires_at ||
                rawData?.expiresAt ||
                res?.expires_at ||
                res?.qr_expires_at ||
                res?.data?.expires_at

            queryClient.setQueryData<any[]>(['my-classes'], (oldClasses) => {
                if (!oldClasses) return oldClasses
                return oldClasses.map((c: any) => {
                    if (c.id !== classId) return c
                    return {
                        ...c,
                        sessions: c.sessions?.map((sess: any) => {
                            if (sess.id !== sessionId) return sess
                            return {
                                ...sess,
                                qr_token: qrToken,
                                qr_expires_at: qrExpires,
                            }
                        }),
                    }
                })
            })

            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            alert('Đã tạo mã QR điểm danh thành công!', 'Thành công')

            setSelectedSessionForQr({
                id: sessionId,
                qr_token: qrToken,
                qr_expires_at: qrExpires,
            })
        },
        onError: (err: any) => {
            alert(
                err?.message || 'Không thể tạo mã QR. Vui lòng thử lại!',
                'Thất bại'
            )
        },
    })

    const handleIssueCertificate = async (
        studentId: string,
        finalGrade: number,
        attendanceRate: number
    ) => {
        if (!classDetail) return
        setIssuingIds((prev) => ({ ...prev, [studentId]: true }))
        try {
            await issueCertificate({
                student_id: studentId,
                course_id: classDetail.course.id,
                class_id: classDetail.id,
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

    const tabItems = useMemo<TabItem[]>(() => {
        const items: TabItem[] = [
            { label: 'Tổng quan', value: 'overview' },
            { label: 'Bảng tin & Tài liệu', value: 'feed' },
            { label: 'Thành viên', value: 'members' },
            { label: 'Buổi học & Điểm danh', value: 'sessions' },
            { label: 'Lịch học (Khung)', value: 'schedule' },
            { label: 'Báo cáo & Thống kê', value: 'reports' },
        ]
        if (classDetail?.status === 'completed') {
            items.push({ label: 'Chứng chỉ', value: 'certificates' })
        }
        return items
    }, [classDetail?.status])

    const classMembers = useMemo(() => {
        const list: ClassMember[] = []
        if (!classDetail) return list

        if (classDetail.teacher) {
            const teacherName = classDetail.teacher.name || ''
            const nameParts = teacherName.trim().split(' ')
            const firstName = nameParts.slice(-1).join(' ')
            const lastName = nameParts.slice(0, -1).join(' ')
            list.push({
                id: classDetail.teacher.id,
                firstName: firstName || 'Giáo',
                lastName: lastName || 'Viên',
                role: 'teacher',
                isOnline: true,
                avatarUrl: null,
                email: '',
            })
        }

        const matched = myClasses?.find((c: any) => c.id === classId)
        if (matched && Array.isArray(matched.students)) {
            matched.students.forEach((student: any) => {
                const nameParts = (student.full_name || student.name || '')
                    .trim()
                    .split(' ')
                const firstName = nameParts.slice(-1).join(' ')
                const lastName = nameParts.slice(0, -1).join(' ')
                list.push({
                    id: student.id,
                    firstName: firstName || 'Học',
                    lastName: lastName || 'Viên',
                    role: 'student',
                    isOnline: false,
                    avatarUrl: student.avatar_url || null,
                    email: student.email || '',
                })
            })
        }
        return list
    }, [classDetail, myClasses, classId])

    const matchedClass = useMemo(() => {
        return myClasses?.find((c: any) => c.id === classId)
    }, [myClasses, classId])

    const sessions = useMemo(() => {
        return matchedClass?.sessions || []
    }, [matchedClass])

    const sessionsWithIndex = useMemo(() => {
        return sessions.map((session: any, idx: number) => ({
            ...session,
            originalIndex: idx + 1,
        }))
    }, [sessions])

    useEffect(() => {
        setCurrentPage(0)
    }, [attendanceFilter, timeFilter])

    const filteredSessions = useMemo(() => {
        return sessionsWithIndex.filter((session: any) => {
            const { start, end } = getSessionStartEnd(session)
            const now = new Date()

            const isCompleted =
                session.status === 'completed' || session.attendance_taken
            const isOngoing =
                now.getTime() >= start.getTime() &&
                now.getTime() <= end.getTime()
            const isEnded = now.getTime() > end.getTime()
            const isNotStarted = now.getTime() < start.getTime()
            const isEndedUnattended = isEnded && !isCompleted

            if (attendanceFilter === 'taken' && !isCompleted) return false
            if (attendanceFilter === 'not_taken' && isCompleted) return false

            if (timeFilter === 'ongoing' && !isOngoing) return false
            if (timeFilter === 'ended_unattended' && !isEndedUnattended)
                return false
            if (timeFilter === 'not_started' && !isNotStarted) return false

            return true
        })
    }, [sessionsWithIndex, attendanceFilter, timeFilter])

    const itemsPerPage = 8
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
    const paginatedSessions = useMemo(() => {
        const startIdx = currentPage * itemsPerPage
        return filteredSessions.slice(startIdx, startIdx + itemsPerPage)
    }, [filteredSessions, currentPage, itemsPerPage])

    if (isLoading) {
        return <div className="spinner-center">Đang tải thông tin...</div>
    }

    if (!classDetail) {
        return <div>Không tìm thấy lớp học</div>
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <div
                className={s.header}
                style={{
                    width: '100%',
                    maxWidth: 1000,
                    alignSelf: 'center',
                    padding: '0 24px',
                }}
            >
                <ButtonGhost
                    onClick={() => navigate('/teacher/classes')}
                    style={{ marginBottom: 16, paddingLeft: 0 }}
                    leftIcon={<img src={BackIcon} alt="" />}
                >
                    Quay lại danh sách
                </ButtonGhost>

                <h1
                    className={s.pageTitle}
                    style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        textAlign: 'center',
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.2',
                        margin: '0 0 8px 0',
                        whiteSpace: 'normal',
                    }}
                >
                    {classDetail.name}
                </h1>
                <p
                    style={{
                        color: '#666',
                        margin: '8px 0 0 0',
                        textAlign: 'center',
                    }}
                >
                    {classDetail.course?.name} • {classDetail.room?.name}
                </p>

                <div className={s.tabs} style={{ marginTop: 24 }}>
                    <TabMenu
                        items={tabItems}
                        value={activeTab}
                        onChange={setActiveTab}
                    />
                </div>

                <div style={{ marginTop: 24 }}>
                    {activeTab === 'overview' && (
                        <ClassOverviewTab classDetail={classDetail} />
                    )}

                    {activeTab === 'feed' && (
                        <ClassPostsFeedTab
                            postsLoading={postsLoading}
                            postsData={postsData}
                            postType={postType}
                            setPostType={setPostType}
                            postTitle={postTitle}
                            setPostTitle={setPostTitle}
                            postContent={postContent}
                            setPostContent={setPostContent}
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                            isCreatingPost={isCreatingPost}
                            handleCreatePost={handleCreatePost}
                            handleDeletePost={handleDeletePost}
                        />
                    )}

                    {activeTab === 'members' && (
                        <ClassMembersTab
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            classMembers={classMembers}
                        />
                    )}

                    {(activeTab === 'schedule' || activeTab === 'sessions') && (
                        <ClassScheduleTab
                            subTab={activeTab}
                            classDetail={classDetail}
                            sessions={sessions}
                            filteredSessions={filteredSessions}
                            paginatedSessions={paginatedSessions}
                            attendanceFilter={attendanceFilter}
                            setAttendanceFilter={setAttendanceFilter}
                            timeFilter={timeFilter}
                            setTimeFilter={setTimeFilter}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                            isGeneratingQr={generateQrMutation.isPending}
                            onGenerateQr={(sessionId) =>
                                generateQrMutation.mutate(sessionId)
                            }
                            onOpenQrModal={(session) =>
                                setSelectedSessionForQr(session)
                            }
                            onOpenSubstitutionModal={(session) =>
                                setSelectedSessionForSub(session)
                            }
                            onOpenAttendanceModal={(sessionId) =>
                                setSelectedSessionForAttendance(sessionId)
                            }
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

                    {activeTab === 'reports' && (
                        <ClassReportsTab
                            attendanceStats={attendanceStats}
                            eligibilityList={eligibilityList || []}
                            studentStats={studentStats || []}
                            totalStudents={classDetail.currentStudents || 0}
                        />
                    )}
                </div>
            </div>

            {/* Attendance Modal Overlay */}
            {selectedSessionForAttendance && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '650px',
                            padding: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <AttendanceModal
                            sessionId={selectedSessionForAttendance}
                            students={classMembers.filter(
                                (m) => m.role === 'student'
                            )}
                            onClose={() =>
                                setSelectedSessionForAttendance(null)
                            }
                        />
                    </div>
                </div>
            )}

            {/* QR Code Modal Overlay */}
            {selectedSessionForQr && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '400px',
                            padding: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <QrCodeModal
                            session={selectedSessionForQr}
                            onClose={() => setSelectedSessionForQr(null)}
                        />
                    </div>
                </div>
            )}

            {/* Substitution Request Modal Overlay */}
            {selectedSessionForSub && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '500px',
                            padding: '24px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <SubstitutionRequestModal
                            session={selectedSessionForSub}
                            teachers={teachersData?.users || []}
                            onClose={() => setSelectedSessionForSub(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
