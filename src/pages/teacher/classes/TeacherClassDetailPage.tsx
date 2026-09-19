import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Common Components
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import s from './TeacherClassDetail.module.css'

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
    updateClassPost,
    pinClassPost,
    type ClassPost,
    type MaterialCategory,
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
import { ClassMaterialsLibraryTab } from './tabs/ClassMaterialsLibraryTab'

// Modals
import { SubstitutionRequestModal } from './modals/SubstitutionRequestModal'
import { AttendanceModal } from './modals/AttendanceModal'
import { QrCodeModal } from './modals/QrCodeModal'
import PinLimitModal from './modals/PinLimitModal'
import EditPostModal from './modals/EditPostModal'

import { queryKeys } from '@/lib/queryKeys'

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
    const [materialCategory, setMaterialCategory] = useState<
        MaterialCategory | ''
    >('')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isCreatingPost, setIsCreatingPost] = useState(false)

    // Post modals
    const [editingPost, setEditingPost] = useState<ClassPost | null>(null)
    const [pinLimitPost, setPinLimitPost] = useState<ClassPost | null>(null)
    const [pendingPinPostId, setPendingPinPostId] = useState<string | null>(
        null
    )

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
        queryKey: queryKeys.classes.posts(classId!),
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
    const { data: attendanceStats, isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['class-attendance-stats', classId],
        queryFn: () => getClassAttendanceStats(classId!),
        enabled: !!classId && activeTab === 'reports',
    })

    const { data: studentStats, isLoading: isLoadingStudentStats } = useQuery({
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
            if (postType === 'material' && materialCategory) {
                formData.append('material_category', materialCategory)
            }
            selectedFiles.forEach((file) => {
                formData.append('files', file)
            })

            await createClassPost(classId!, formData)
            alert('Đăng tin / tài liệu thành công!', 'Thành công')
            setPostTitle('')
            setPostContent('')
            setMaterialCategory('')
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
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId!),
            })
        } catch (err: any) {
            alert(
                err.message || 'Không thể xóa bài viết. Vui lòng thử lại!',
                'Thất bại'
            )
        }
    }

    // Mutation: Chỉnh sửa bài
    const updatePostMutation = useMutation({
        mutationFn: ({
            postId,
            formData,
        }: {
            postId: string
            formData: FormData
        }) => updateClassPost(classId!, postId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId!),
            })
            setEditingPost(null)
            alert('Cập nhật bài viết thành công!', 'Thành công')
        },
        onError: (err: any) => {
            alert(
                err?.message ||
                    'Không thể cập nhật bài viết. Vui lòng thử lại!',
                'Thất bại'
            )
        },
    })

    // Mutation: Ghim / Bỏ ghim bài
    const pinPostMutation = useMutation({
        mutationFn: ({
            postId,
            pin,
            forceUnpinOldest = false,
        }: {
            postId: string
            pin: boolean
            forceUnpinOldest?: boolean
        }) => pinClassPost(classId!, postId, pin, forceUnpinOldest),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.classes.posts(classId!),
            })
            setPinLimitPost(null)
            setPendingPinPostId(null)
        },
        onError: (err: any) => {
            if (err?.code === 'POST_PIN_LIMIT_EXCEEDED') {
                // Tìm bài ghim cũ nhất từ danh sách hiện tại
                const posts: ClassPost[] = postsData?.data ?? []
                const pinned = posts
                    .filter((p) => p.is_pinned && p.pinned_at)
                    .sort(
                        (a, b) =>
                            new Date(a.pinned_at!).getTime() -
                            new Date(b.pinned_at!).getTime()
                    )
                setPinLimitPost(pinned[0] ?? null)
                // Giữ lại postId đang chờ ghim
            } else {
                alert(
                    err?.message ||
                        'Không thể ghim bài viết. Vui lòng thử lại!',
                    'Thất bại'
                )
            }
        },
    })

    const handlePinPost = (post: ClassPost) => {
        setPendingPinPostId(post.id)
        pinPostMutation.mutate({ postId: post.id, pin: !post.is_pinned })
    }

    const handleConfirmUnpin = () => {
        if (!pendingPinPostId) return
        pinPostMutation.mutate({
            postId: pendingPinPostId,
            pin: true,
            forceUnpinOldest: true,
        })
    }

    const handleEditPost = (post: ClassPost) => {
        setEditingPost(post)
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
            { label: 'Kho học liệu', value: 'materials' },
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
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <div className={s.skeletonPage}>
                    <div className={`${s.skeleton} ${s.skeletonBackBtn}`} />
                    <div className={`${s.skeleton} ${s.skeletonTitle}`} />
                    <div className={`${s.skeleton} ${s.skeletonSubtitle}`} />
                    <div className={`${s.skeleton} ${s.skeletonTabs}`} />
                    <div className={s.skeletonCardRow}>
                        <div className={`${s.skeleton} ${s.skeletonCard}`} />
                        <div className={`${s.skeleton} ${s.skeletonCard}`} />
                        <div className={`${s.skeleton} ${s.skeletonCard}`} />
                    </div>
                    <div className={`${s.skeleton} ${s.skeletonBlock}`} />
                </div>
            </div>
        )
    }

    if (!classDetail) {
        return <div>Không tìm thấy lớp học</div>
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            {/* ═══ Header Zone: Back + Title + Meta ═══ */}
            <div
                className={s.header}
                style={{
                    width: '100%',
                    maxWidth: 1000,
                    alignSelf: 'center',
                    marginTop: 24,
                }}
            >
                <button
                    className={s.headerBack}
                    onClick={() => navigate('/teacher/classes')}
                    type="button"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Quay lại danh sách
                </button>

                <div className={s.headerInfo}>
                    <h1 className={s.headerTitle}>{classDetail.name}</h1>
                    <div className={s.headerMeta}>
                        {classDetail.course?.name && (
                            <span
                                className={`${s.metaBadge} ${s.metaBadgePrimary}`}
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                                {classDetail.course.name}
                            </span>
                        )}
                        {classDetail.room?.name && (
                            <span className={s.metaBadge}>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                {classDetail.room.name}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Tabs Zone ═══ */}
            <div
                className={s.tabs}
                style={{
                    width: '100%',
                    maxWidth: 1000,
                    alignSelf: 'center',
                    padding: '0 24px',
                    marginTop: 24,
                }}
            >
                <TabMenu
                    items={tabItems}
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="flat"
                />
            </div>

            {/* ═══ Tab Content Zone — unified width ═══ */}
            <div
                className={s.tabContent}
                style={{
                    width: '100%',
                    maxWidth: 1000,
                    alignSelf: 'center',
                    padding: '0 24px',
                    marginTop: 24,
                }}
            >
                {activeTab === 'overview' && (
                    <ClassOverviewTab classDetail={classDetail} />
                )}

                {activeTab === 'feed' && (
                    <ClassPostsFeedTab
                        posts={postsData?.data ?? []}
                        postsLoading={postsLoading}
                        postType={postType}
                        setPostType={setPostType}
                        postTitle={postTitle}
                        setPostTitle={setPostTitle}
                        postContent={postContent}
                        setPostContent={setPostContent}
                        materialCategory={materialCategory}
                        setMaterialCategory={setMaterialCategory}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        isCreatingPost={isCreatingPost}
                        handleCreatePost={handleCreatePost}
                        handleDeletePost={handleDeletePost}
                        handlePinPost={handlePinPost}
                        handleEditPost={handleEditPost}
                        currentUserId={String(classDetail?.teacher?.id ?? '')}
                        classId={classId ?? ''}
                        teacherId={String(classDetail?.teacher?.id ?? '')}
                        currentUserRole="teacher"
                    />
                )}

                {activeTab === 'materials' && (
                    <ClassMaterialsLibraryTab classId={classId ?? ''} />
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
                        isLoading={
                            isLoadingAttendance ||
                            isLoadingStudentStats ||
                            isLoadingEligibility
                        }
                    />
                )}
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

            {/* ═══ Pin Limit Modal ══════════════════════════════════════════ */}
            <PinLimitModal
                isOpen={!!pinLimitPost}
                oldestPinnedPost={pinLimitPost}
                isLoading={pinPostMutation.isPending}
                onClose={() => {
                    setPinLimitPost(null)
                    setPendingPinPostId(null)
                }}
                onConfirmUnpin={handleConfirmUnpin}
            />

            {/* ═══ Edit Post Modal ══════════════════════════════════════════ */}
            <EditPostModal
                isOpen={!!editingPost}
                post={editingPost}
                isLoading={updatePostMutation.isPending}
                onClose={() => setEditingPost(null)}
                onSubmit={(formData) => {
                    if (!editingPost) return
                    updatePostMutation.mutate({
                        postId: editingPost.id,
                        formData,
                    })
                }}
            />
        </div>
    )
}
