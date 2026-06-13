import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import s from '@/pages/student/class/Class.module.css'

// Components
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import MemberList from '@/pages/student/class/MemberList'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import BackIcon from '@/assets/arrow-left.svg'
import InputField from '@/components/common/input/InputField' // [FIX] Import InputField để làm search
import SearchIcon from '@/assets/Book Search.svg' // [FIX] Icon search
import { SlotSelectionMatrix } from '@/components/feature/schedule/SlotSelectionMatrix'
import Pagination from '@/components/common/menu/Pagination'

import {
    getClassCertificateEligibility,
    issueCertificate,
} from '@/lib/certificates'
import { StatusBadge } from '@/components/common/typography/StatusBadge'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import modalS from '@/pages/admin/classes/ClassDetailModal.module.css'

// API & Types
import {
    getClass,
    getClassPosts,
    createClassPost,
    deleteClassPost,
} from '@/lib/classes'
import Card from '@/components/common/card/Card'
import { getMyClasses, listUsers } from '@/lib/users'
import { createSubstitutionRequest } from '@/lib/substitutions'
import { type ClassMember } from '@/components/common/card/MemberCard'
import { useDialog } from '@/hooks/useDialog'
import {
    getSessionAttendance,
    markAttendance,
    generateQrToken,
    type AttendanceStatus,
    getClassAttendanceStats,
    getStudentAttendanceStats,
} from '@/lib/attendance'

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
    const [activeTab, setActiveTab] = useState('overview')
    const [searchTerm, setSearchTerm] = useState('') // [FIX] Sẽ được dùng ở InputField bên dưới
    const [attendanceFilter, setAttendanceFilter] = useState('all')
    const [timeFilter, setTimeFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(0)

    const [issuingIds, setIssuingIds] = useState<Record<string, boolean>>({})

    // States for feed / posting
    const [postTitle, setPostTitle] = useState('')
    const [postContent, setPostContent] = useState('')
    const [postType, setPostType] = useState<'announcement' | 'material'>(
        'announcement'
    )
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isCreatingPost, setIsCreatingPost] = useState(false)

    const {
        data: postsData,
        isLoading: postsLoading,
        refetch: refetchPosts,
    } = useQuery({
        queryKey: ['class-posts', classId],
        queryFn: () => getClassPosts(classId!, 1, 100),
        enabled: !!classId,
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
        if (!confirm('Bạn có chắc chắn muốn xóa bài viết/tài liệu này không?'))
            return
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

    useEffect(() => {
        setCurrentPage(0)
    }, [attendanceFilter, timeFilter])

    const { alert } = useDialog()
    const queryClient = useQueryClient()
    const [selectedSessionForAttendance, setSelectedSessionForAttendance] =
        useState<string | null>(null)
    const [selectedSessionForQr, setSelectedSessionForQr] = useState<
        any | null
    >(null)
    const [selectedSessionForSub, setSelectedSessionForSub] = useState<
        any | null
    >(null)

    // Fetch teachers list
    const { data: teachersData } = useQuery({
        queryKey: ['users', 'teachers', 'list'],
        queryFn: () => listUsers({ role: 'teacher', limit: 100 }),
        staleTime: 5 * 60 * 1000,
    })

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

            // Optimistically update 'my-classes' cache to reflect the QR token immediately in the UI
            queryClient.setQueryData<any[]>(['my-classes'], (oldClasses) => {
                if (!oldClasses) return oldClasses
                return oldClasses.map((c: any) => {
                    if (c.id !== classId) return c
                    return {
                        ...c,
                        sessions: c.sessions?.map((s: any) => {
                            if (s.id !== sessionId) return s
                            return {
                                ...s,
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

    // 1. Fetch Class Detail
    const { data: classDetail, isLoading } = useQuery({
        queryKey: ['class', classId],
        queryFn: () => getClass(classId!),
        enabled: !!classId,
    })

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

    // Fetch classes for current user to extract members list (accessible for teachers)
    const { data: myClasses } = useQuery({
        queryKey: ['my-classes'],
        queryFn: getMyClasses,
    })

    const classMembers = useMemo(() => {
        const list: ClassMember[] = []
        if (!classDetail) return list

        // Teacher
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

        // Students from the matched class in getMyClasses
        const matchedClass = myClasses?.find((c: any) => c.id === classId)
        if (matchedClass && Array.isArray(matchedClass.students)) {
            matchedClass.students.forEach((student: any) => {
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

    // Map original index to keep track of absolute session numbers (e.g. Buổi 1, Buổi 2...)
    const sessionsWithIndex = useMemo(() => {
        return sessions.map((session: any, idx: number) => ({
            ...session,
            originalIndex: idx + 1,
        }))
    }, [sessions])

    // Filter sessions based on both criteria
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

            // Filter 1: Attendance
            if (attendanceFilter === 'taken' && !isCompleted) return false
            if (attendanceFilter === 'not_taken' && isCompleted) return false

            // Filter 2: Time/Status
            if (timeFilter === 'ongoing' && !isOngoing) return false
            if (timeFilter === 'ended_unattended' && !isEndedUnattended)
                return false
            if (timeFilter === 'not_started' && !isNotStarted) return false

            return true
        })
    }, [sessionsWithIndex, attendanceFilter, timeFilter])

    // Pagination logic
    const itemsPerPage = 8
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage)
    const paginatedSessions = useMemo(() => {
        const startIdx = currentPage * itemsPerPage
        return filteredSessions.slice(startIdx, startIdx + itemsPerPage)
    }, [filteredSessions, currentPage, itemsPerPage])

    const renderTabContent = () => {
        switch (activeTab) {
            case 'feed':
                return (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            width: '100%',
                            maxWidth: '1200px',
                            textAlign: 'left',
                        }}
                    >
                        {/* Cột 1: Form Đăng bài */}
                        <div
                            style={{
                                background: '#fff',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                height: 'fit-content',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                    marginBottom: '20px',
                                }}
                            >
                                Tạo thông báo / tài liệu mới
                            </h3>
                            <form
                                onSubmit={handleCreatePost}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            display: 'block',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Loại bài đăng
                                    </label>
                                    <select
                                        value={postType}
                                        onChange={(e) =>
                                            setPostType(
                                                e.target.value as
                                                    | 'announcement'
                                                    | 'material'
                                            )
                                        }
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="announcement">
                                            Thông báo
                                        </option>
                                        <option value="material">
                                            Tài liệu học tập
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            display: 'block',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Tiêu đề
                                    </label>
                                    <input
                                        type="text"
                                        value={postTitle}
                                        onChange={(e) =>
                                            setPostTitle(e.target.value)
                                        }
                                        placeholder="Ví dụ: Tài liệu Unit 5, Thông báo nghỉ học..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '14px',
                                            outline: 'none',
                                        }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            display: 'block',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Nội dung chi tiết
                                    </label>
                                    <textarea
                                        value={postContent}
                                        onChange={(e) =>
                                            setPostContent(e.target.value)
                                        }
                                        placeholder="Nhập nội dung thông báo hoặc hướng dẫn làm bài..."
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '14px',
                                            outline: 'none',
                                            resize: 'vertical',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#475569',
                                            display: 'block',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Tệp đính kèm
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                setSelectedFiles(
                                                    Array.from(e.target.files)
                                                )
                                            }
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            fontSize: '14px',
                                            color: '#64748b',
                                        }}
                                    />
                                    {selectedFiles.length > 0 && (
                                        <div
                                            style={{
                                                marginTop: '8px',
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '6px',
                                            }}
                                        >
                                            {selectedFiles.map((file, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        background: '#f1f5f9',
                                                        border: '1px solid #e2e8f0',
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                    }}
                                                >
                                                    {file.name} (
                                                    {(file.size / 1024).toFixed(
                                                        1
                                                    )}{' '}
                                                    KB)
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreatingPost}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        background:
                                            'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: isCreatingPost
                                            ? 'not-allowed'
                                            : 'pointer',
                                        opacity: isCreatingPost ? 0.7 : 1,
                                        boxShadow:
                                            '0 4px 12px rgba(79, 70, 229, 0.2)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {isCreatingPost
                                        ? 'Đang đăng bài...'
                                        : 'Đăng bài viết'}
                                </button>
                            </form>
                        </div>

                        {/* Cột 2: Danh sách bài đã đăng */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#0f172a',
                                }}
                            >
                                Lịch sử bảng tin
                            </h3>
                            {postsLoading ? (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        color: '#666',
                                    }}
                                >
                                    Đang tải danh sách...
                                </div>
                            ) : !postsData?.data ||
                              postsData.data.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '40px 20px',
                                        color: '#888',
                                        background: '#fff',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                    }}
                                >
                                    Lớp học chưa có thông báo hoặc tài liệu nào.
                                </div>
                            ) : (
                                postsData.data.map((post) => (
                                    <div
                                        key={post.id}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '1px solid #eef2f6',
                                            background: '#fff',
                                            boxShadow:
                                                '0 2px 8px rgba(0, 0, 0, 0.02)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background:
                                                            'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                                        color: '#fff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {post.author?.full_name
                                                        ?.charAt(0)
                                                        .toUpperCase() || 'G'}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: '600',
                                                            color: '#1e293b',
                                                            fontSize: '14px',
                                                        }}
                                                    >
                                                        {post.author
                                                            ?.full_name ||
                                                            'Giảng viên'}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: '11px',
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        {new Date(
                                                            post.created_at
                                                        ).toLocaleString(
                                                            'vi-VN'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: '600',
                                                        textTransform:
                                                            'uppercase',
                                                        background:
                                                            post.post_type ===
                                                            'material'
                                                                ? '#e0f2fe'
                                                                : '#fef3c7',
                                                        color:
                                                            post.post_type ===
                                                            'material'
                                                                ? '#0369a1'
                                                                : '#b45309',
                                                    }}
                                                >
                                                    {post.post_type ===
                                                    'material'
                                                        ? 'Tài liệu'
                                                        : 'Thông báo'}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleDeletePost(
                                                            post.id
                                                        )
                                                    }
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                    title="Xóa bài viết"
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
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line
                                                            x1="10"
                                                            y1="11"
                                                            x2="10"
                                                            y2="17"
                                                        ></line>
                                                        <line
                                                            x1="14"
                                                            y1="11"
                                                            x2="14"
                                                            y2="17"
                                                        ></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <h4
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '700',
                                                color: '#0f172a',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            {post.title}
                                        </h4>

                                        {post.content && (
                                            <p
                                                style={{
                                                    color: '#334155',
                                                    fontSize: '13px',
                                                    lineHeight: '1.6',
                                                    whiteSpace: 'pre-wrap',
                                                    marginBottom: '12px',
                                                }}
                                            >
                                                {post.content}
                                            </p>
                                        )}

                                        {post.attachments &&
                                            post.attachments.length > 0 && (
                                                <div
                                                    style={{
                                                        borderTop:
                                                            '1px dashed #e2e8f0',
                                                        paddingTop: '10px',
                                                        marginTop: '10px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: '#64748b',
                                                            marginBottom: '6px',
                                                        }}
                                                    >
                                                        Tệp đính kèm (
                                                        {
                                                            post.attachments
                                                                .length
                                                        }
                                                        ):
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            gap: '6px',
                                                        }}
                                                    >
                                                        {post.attachments.map(
                                                            (file, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={
                                                                        file.file_url
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        gap: '6px',
                                                                        padding:
                                                                            '6px 10px',
                                                                        borderRadius:
                                                                            '6px',
                                                                        background:
                                                                            '#f8fafc',
                                                                        border: '1px solid #e2e8f0',
                                                                        color: '#2563eb',
                                                                        textDecoration:
                                                                            'none',
                                                                        fontSize:
                                                                            '12px',
                                                                        fontWeight:
                                                                            '500',
                                                                        width: 'fit-content',
                                                                    }}
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
                                                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                                    </svg>
                                                                    <span>
                                                                        {
                                                                            file.file_name
                                                                        }
                                                                    </span>
                                                                    <span
                                                                        style={{
                                                                            color: '#64748b',
                                                                            fontSize:
                                                                                '10px',
                                                                        }}
                                                                    >
                                                                        (
                                                                        {(
                                                                            file.file_size /
                                                                            1024
                                                                        ).toFixed(
                                                                            1
                                                                        )}{' '}
                                                                        KB)
                                                                    </span>
                                                                </a>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )

            case 'overview':
                return (
                    <div className={s.placeholderContent}>
                        <div
                            style={{
                                maxWidth: 600,
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            <div
                                style={{
                                    background: 'white',
                                    padding: 24,
                                    borderRadius: 12,
                                    border: '1px solid #eee',
                                }}
                            >
                                <h3 style={{ marginBottom: 16 }}>
                                    Thông tin lớp học
                                </h3>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 16,
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Khóa học
                                        </label>
                                        <p style={{ fontWeight: 600 }}>
                                            {classDetail?.course?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Phòng học
                                        </label>
                                        <p style={{ fontWeight: 600 }}>
                                            {classDetail?.room?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Thời gian
                                        </label>
                                        <p>
                                            {new Date(
                                                classDetail?.startDate || ''
                                            ).toLocaleDateString('vi-VN')}{' '}
                                            -{' '}
                                            {new Date(
                                                classDetail?.endDate || ''
                                            ).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                            }}
                                        >
                                            Sĩ số
                                        </label>
                                        <p>
                                            {classDetail?.currentStudents} /{' '}
                                            {classDetail?.maxStudents}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <label
                                        style={{ fontSize: 12, color: '#666' }}
                                    >
                                        Ghi chú
                                    </label>
                                    <p>
                                        {classDetail?.notes ||
                                            'Không có ghi chú'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'members':
                return (
                    <div style={{ width: '100%', maxWidth: 800 }}>
                        {/* [FIX] Thêm thanh tìm kiếm để setSearchTerm được sử dụng */}
                        <div style={{ marginBottom: 16 }}>
                            <InputField
                                placeholder="Tìm kiếm học viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                leftIcon={<img src={SearchIcon} alt="" />}
                            />
                        </div>

                        <MemberList
                            members={classMembers}
                            searchTerm={searchTerm}
                            filterRole="student"
                            // [FIX] Bỏ props onChat vì MemberList chưa hỗ trợ.
                            // Nếu muốn dùng, bạn cần vào MemberList.tsx thêm prop `onChat?: (id: string) => void` vào interface Props
                            // onChat={(memberId) => navigate(`/messages?chatWith=${memberId}`)}
                        />
                    </div>
                )

            case 'schedule':
                return (
                    <div
                        className={s.placeholderContent}
                        style={{
                            display: 'block',
                            textAlign: 'left',
                            width: '100%',
                            maxWidth: 800,
                        }}
                    >
                        <div
                            style={{
                                background: 'white',
                                padding: 24,
                                borderRadius: 12,
                                border: '1px solid #eee',
                            }}
                        >
                            <p style={{ fontWeight: 600, marginBottom: 12 }}>
                                Lịch học mong muốn:
                            </p>
                            <div style={{ marginBottom: 24 }}>
                                <SlotSelectionMatrix
                                    value={classDetail?.preferredSlots || []}
                                    readOnly
                                />
                            </div>
                            <p style={{ fontWeight: 600, marginBottom: 12 }}>
                                Lịch bận cố định:
                            </p>
                            <div>
                                <SlotSelectionMatrix
                                    value={classDetail?.unavailableSlots || []}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                )

            case 'sessions': {
                return (
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 800,
                            textAlign: 'left',
                        }}
                    >
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            {/* Header & Filter Row */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        margin: 0,
                                    }}
                                >
                                    Danh sách buổi học (
                                    {filteredSessions.length}/{sessions.length})
                                </h3>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {/* Select filter 1: Attendance */}
                                    <select
                                        value={attendanceFilter}
                                        onChange={(e) =>
                                            setAttendanceFilter(e.target.value)
                                        }
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: '#fff',
                                            color: '#1e293b',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="all">
                                            Tất cả điểm danh
                                        </option>
                                        <option value="taken">
                                            Đã điểm danh
                                        </option>
                                        <option value="not_taken">
                                            Chưa điểm danh
                                        </option>
                                    </select>

                                    {/* Select filter 2: Time / Status */}
                                    <select
                                        value={timeFilter}
                                        onChange={(e) =>
                                            setTimeFilter(e.target.value)
                                        }
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: '#fff',
                                            color: '#1e293b',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            outline: 'none',
                                        }}
                                    >
                                        <option value="all">
                                            Tất cả trạng thái
                                        </option>
                                        <option value="ongoing">
                                            Đang diễn ra
                                        </option>
                                        <option value="ended_unattended">
                                            Đã kết thúc & Chưa điểm danh
                                        </option>
                                        <option value="not_started">
                                            Chưa bắt đầu
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {sessions.length === 0 ? (
                                <p
                                    style={{
                                        color: '#64748b',
                                        textAlign: 'center',
                                        padding: '24px',
                                    }}
                                >
                                    Không có thông tin buổi học nào cho lớp học
                                    này.
                                </p>
                            ) : filteredSessions.length === 0 ? (
                                <p
                                    style={{
                                        color: '#64748b',
                                        textAlign: 'center',
                                        padding: '24px',
                                    }}
                                >
                                    Không tìm thấy buổi học nào phù hợp với bộ
                                    lọc đã chọn.
                                </p>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                    }}
                                >
                                    {paginatedSessions.map((session: any) => {
                                        const sessionDate = new Date(
                                            session.session_date
                                        )
                                        const now = new Date()

                                        const isCompleted =
                                            session.status === 'completed' ||
                                            session.attendance_taken
                                        const isQrActive =
                                            session.qr_token &&
                                            session.qr_expires_at &&
                                            new Date(
                                                session.qr_expires_at
                                            ).getTime() > now.getTime()

                                        return (
                                            <div
                                                key={session.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent:
                                                        'space-between',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    backgroundColor: '#f8fafc',
                                                    flexWrap: 'wrap',
                                                    gap: '12px',
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '8px',
                                                            marginBottom: '4px',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    '14px',
                                                                fontWeight:
                                                                    '700',
                                                                color: '#4f46e5',
                                                            }}
                                                        >
                                                            Buổi{' '}
                                                            {
                                                                session.originalIndex
                                                            }
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    '11px',
                                                                fontWeight:
                                                                    '600',
                                                                padding:
                                                                    '2px 8px',
                                                                borderRadius:
                                                                    '12px',
                                                                backgroundColor:
                                                                    isCompleted
                                                                        ? '#d1fae5'
                                                                        : '#fee2e2',
                                                                color: isCompleted
                                                                    ? '#065f46'
                                                                    : '#991b1b',
                                                            }}
                                                        >
                                                            {isCompleted
                                                                ? 'Đã điểm danh'
                                                                : 'Chưa điểm danh'}
                                                        </span>

                                                        {isQrActive && (
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        '11px',
                                                                    fontWeight:
                                                                        '600',
                                                                    padding:
                                                                        '2px 8px',
                                                                    borderRadius:
                                                                        '12px',
                                                                    backgroundColor:
                                                                        '#dbeafe',
                                                                    color: '#1e40af',
                                                                }}
                                                            >
                                                                QR đang hoạt
                                                                động
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4
                                                        style={{
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            color: '#1e293b',
                                                            margin: '0 0 6px 0',
                                                        }}
                                                    >
                                                        {session.topic ||
                                                            session.title ||
                                                            `Buổi học ngày ${sessionDate.toLocaleDateString('vi-VN')}`}
                                                    </h4>
                                                    <div
                                                        style={{
                                                            fontSize: '13px',
                                                            color: '#64748b',
                                                        }}
                                                    >
                                                        <span>
                                                            📅{' '}
                                                            {sessionDate.toLocaleDateString(
                                                                'vi-VN'
                                                            )}
                                                        </span>
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    '12px',
                                                            }}
                                                        >
                                                            ⏰{' '}
                                                            {session.start_time.slice(
                                                                0,
                                                                5
                                                            )}{' '}
                                                            -{' '}
                                                            {session.end_time.slice(
                                                                0,
                                                                5
                                                            )}
                                                        </span>
                                                        <span
                                                            style={{
                                                                marginLeft:
                                                                    '12px',
                                                            }}
                                                        >
                                                            🏫{' '}
                                                            {matchedClass?.room_name ||
                                                                classDetail
                                                                    ?.room
                                                                    ?.name ||
                                                                'Đang cập nhật'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    {isQrActive ? (
                                                        <button
                                                            onClick={() =>
                                                                setSelectedSessionForQr(
                                                                    session
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '8px 14px',
                                                                borderRadius:
                                                                    '8px',
                                                                border: '1px solid #10b981',
                                                                backgroundColor:
                                                                    '#fff',
                                                                color: '#10b981',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Xem QR
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                generateQrMutation.mutate(
                                                                    session.id
                                                                )
                                                            }
                                                            disabled={
                                                                generateQrMutation.isPending
                                                            }
                                                            style={{
                                                                padding:
                                                                    '8px 14px',
                                                                borderRadius:
                                                                    '8px',
                                                                border: '1px solid #cbd5e1',
                                                                backgroundColor:
                                                                    '#fff',
                                                                color: '#475569',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            {generateQrMutation.isPending
                                                                ? 'Đang tạo...'
                                                                : 'Tạo QR'}
                                                        </button>
                                                    )}

                                                    {!isCompleted && (
                                                        <button
                                                            onClick={() =>
                                                                setSelectedSessionForSub(
                                                                    session
                                                                )
                                                            }
                                                            style={{
                                                                padding:
                                                                    '8px 14px',
                                                                borderRadius:
                                                                    '8px',
                                                                border: '1px solid #cbd5e1',
                                                                backgroundColor:
                                                                    '#fff',
                                                                color: '#475569',
                                                                fontSize:
                                                                    '13px',
                                                                fontWeight:
                                                                    '600',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Dạy thế
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() =>
                                                            setSelectedSessionForAttendance(
                                                                session.id
                                                            )
                                                        }
                                                        style={{
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            backgroundColor:
                                                                '#4f46e5',
                                                            color: '#fff',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Điểm danh
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div style={{ marginTop: '24px' }}>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            case 'certificates':
                return (
                    <div
                        className={modalS.enrollmentContainer}
                        style={{
                            width: '100%',
                            maxWidth: 1000,
                            margin: '0 auto',
                            textAlign: 'left',
                        }}
                    >
                        <div className={modalS.studentsListSection}>
                            <h3 className={modalS.sectionTitle}>
                                Danh sách điều kiện cấp chứng chỉ & Quản lý cấp
                            </h3>
                            {isLoadingEligibility ? (
                                <p className={modalS.loadingText}>
                                    Đang kiểm tra điều kiện nhận chứng chỉ của
                                    học viên...
                                </p>
                            ) : !eligibilityList ||
                              eligibilityList.length === 0 ? (
                                <p className={modalS.emptyText}>
                                    Không tìm thấy học viên nào trong lớp này.
                                </p>
                            ) : (
                                <div className={modalS.tableContainer}>
                                    <table className={modalS.studentTable}>
                                        <thead>
                                            <tr>
                                                <th>Họ và Tên</th>
                                                <th>Tỷ lệ chuyên cần</th>
                                                <th>Điểm cuối kỳ</th>
                                                <th>
                                                    Điều kiện (Chuyên cần ≥ 80%,
                                                    Điểm ≥ 7.0)
                                                </th>
                                                <th>Trạng thái chứng chỉ</th>
                                                <th style={{ width: '150px' }}>
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {eligibilityList.map((e) => {
                                                const ratePercent =
                                                    Math.round(
                                                        e.attendance_rate * 100
                                                    ) / 100
                                                const isRateOk =
                                                    ratePercent >=
                                                    (e.min_rate_required || 80)
                                                const finalScore =
                                                    e.final_grade !== null
                                                        ? Number(e.final_grade)
                                                        : null
                                                const isScoreOk =
                                                    finalScore !== null &&
                                                    finalScore >=
                                                        (e.min_grade_required ||
                                                            7.0)
                                                const isEligible =
                                                    isRateOk && isScoreOk

                                                return (
                                                    <tr key={e.enrollment_id}>
                                                        <td
                                                            className={
                                                                modalS.studentNameCol
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
                                                                {ratePercent}%
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
                                                                    Chưa có điểm
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
                                                                        Cấp CC
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
                                                                        Xem PDF
                                                                    </ButtonPrimary>
                                                                ) : (
                                                                    <span
                                                                        style={{
                                                                            color: '#64748b',
                                                                            fontSize:
                                                                                '13px',
                                                                        }}
                                                                    >
                                                                        Đã cấp
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
                )

            case 'reports': {
                const totalStudents =
                    studentStats?.length || classDetail?.currentStudents || 0

                // 1. Phân loại học lực
                let excellentCount = 0
                let goodCount = 0
                let averageCount = 0
                let weakCount = 0

                // Map student stats by id for easy lookup of detailed attendance counts
                const attendanceLookup = (studentStats || []).reduce(
                    (acc: any, s: any) => {
                        acc[s.student_id] = s
                        return acc
                    },
                    {}
                )

                const studentReports = (eligibilityList || []).map((e: any) => {
                    const att = attendanceLookup[e.student_id] || {}
                    const finalScore =
                        e.final_grade !== null ? Number(e.final_grade) : null

                    let academicStatus = 'Chưa có điểm'
                    if (finalScore !== null) {
                        if (finalScore >= 8.5) {
                            excellentCount++
                            academicStatus = 'Xuất sắc'
                        } else if (finalScore >= 7.0) {
                            goodCount++
                            academicStatus = 'Khá'
                        } else if (finalScore >= 5.0) {
                            averageCount++
                            academicStatus = 'Trung bình'
                        } else {
                            weakCount++
                            academicStatus = 'Yếu'
                        }
                    }

                    // Define if student is at-risk
                    const isLowAttendance = e.attendance_rate < 80
                    const isLowGrade = finalScore !== null && finalScore < 7.0
                    const isAtRisk = isLowAttendance || isLowGrade

                    return {
                        ...e,
                        present: att.present_count ?? 0,
                        absent: att.absent_count ?? 0,
                        late: att.late_count ?? 0,
                        excused: att.excused_count ?? 0,
                        total_sessions: att.total_sessions ?? 0,
                        finalScore,
                        academicStatus,
                        isAtRisk,
                        isLowAttendance,
                        isLowGrade,
                    }
                })

                const atRiskStudents = studentReports.filter((s) => s.isAtRisk)
                const scoredStudentsCount = studentReports.filter(
                    (s) => s.finalScore !== null
                ).length

                // Percentages for chart
                const getPercent = (count: number) => {
                    if (scoredStudentsCount === 0) return 0
                    return Math.round((count / scoredStudentsCount) * 100)
                }

                return (
                    <div
                        style={{
                            width: '100%',
                            maxWidth: 1000,
                            margin: '0 auto',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                        }}
                    >
                        {/* Summary Widgets Row */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '20px',
                            }}
                        >
                            {/* Avg Attendance Widget */}
                            <div
                                style={{
                                    background: '#fff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow:
                                        '0 4px 6px -1px rgba(0,0,0,0.05)',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#64748b',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Chuyên cần trung bình
                                </div>
                                <div
                                    style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#4f46e5',
                                    }}
                                >
                                    {attendanceStats?.average_attendance_rate
                                        ? `${attendanceStats.average_attendance_rate.toFixed(1)}%`
                                        : '---'}
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        marginTop: '6px',
                                    }}
                                >
                                    Trên tổng số{' '}
                                    {attendanceStats?.total_sessions_held || 0}{' '}
                                    buổi học đã diễn ra
                                </div>
                            </div>

                            {/* Scored Students Widget */}
                            <div
                                style={{
                                    background: '#fff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow:
                                        '0 4px 6px -1px rgba(0,0,0,0.05)',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#64748b',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Điểm trung bình lớp
                                </div>
                                <div
                                    style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#10b981',
                                    }}
                                >
                                    {scoredStudentsCount > 0
                                        ? `${(studentReports.reduce((sum, s) => sum + (s.finalScore || 0), 0) / scoredStudentsCount).toFixed(1)} / 10`
                                        : '---'}
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#94a3b8',
                                        marginTop: '6px',
                                    }}
                                >
                                    {scoredStudentsCount} / {totalStudents} học
                                    viên đã có điểm
                                </div>
                            </div>

                            {/* At-Risk Widget */}
                            <div
                                style={{
                                    background: '#fff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #fee2e2',
                                    boxShadow:
                                        '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#991b1b',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Học viên cần lưu ý (At-Risk)
                                </div>
                                <div
                                    style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#ef4444',
                                    }}
                                >
                                    {atRiskStudents.length} / {totalStudents}
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#ef4444',
                                        marginTop: '6px',
                                        fontWeight: '500',
                                    }}
                                >
                                    Tỷ lệ chuyên cần dưới 80% hoặc điểm dưới 7.0
                                </div>
                            </div>
                        </div>

                        {/* Grade Distribution & Risk Explanation */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr',
                                gap: '24px',
                                flexWrap: 'wrap',
                            }}
                        >
                            {/* Grade Chart */}
                            <div
                                style={{
                                    background: '#fff',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow:
                                        '0 4px 6px -1px rgba(0,0,0,0.05)',
                                }}
                            >
                                <h4
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        marginBottom: '20px',
                                        margin: 0,
                                    }}
                                >
                                    Phân phối điểm số cuối kỳ của lớp
                                </h4>
                                {scoredStudentsCount === 0 ? (
                                    <div
                                        style={{
                                            height: '200px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#64748b',
                                            fontSize: '14px',
                                            fontStyle: 'italic',
                                        }}
                                    >
                                        Chưa có học viên nào được nhập điểm cuối
                                        kỳ.
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px',
                                            marginTop: '16px',
                                        }}
                                    >
                                        {/* Bar 1: Excellent */}
                                        <div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    fontSize: '13px',
                                                    marginBottom: '6px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: '500',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    🏆 Xuất sắc (≥ 8.5)
                                                </span>
                                                <span
                                                    style={{ color: '#64748b' }}
                                                >
                                                    {excellentCount} học viên (
                                                    {getPercent(excellentCount)}
                                                    %)
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${getPercent(excellentCount)}%`,
                                                        height: '100%',
                                                        background: '#10b981',
                                                        borderRadius: '4px',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Bar 2: Good */}
                                        <div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    fontSize: '13px',
                                                    marginBottom: '6px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: '500',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    📈 Khá (7.0 - 8.4)
                                                </span>
                                                <span
                                                    style={{ color: '#64748b' }}
                                                >
                                                    {goodCount} học viên (
                                                    {getPercent(goodCount)}%)
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${getPercent(goodCount)}%`,
                                                        height: '100%',
                                                        background: '#3b82f6',
                                                        borderRadius: '4px',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Bar 3: Average */}
                                        <div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    fontSize: '13px',
                                                    marginBottom: '6px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: '500',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    ⚖️ Trung bình (5.0 - 6.9)
                                                </span>
                                                <span
                                                    style={{ color: '#64748b' }}
                                                >
                                                    {averageCount} học viên (
                                                    {getPercent(averageCount)}%)
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${getPercent(averageCount)}%`,
                                                        height: '100%',
                                                        background: '#f59e0b',
                                                        borderRadius: '4px',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Bar 4: Weak */}
                                        <div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    fontSize: '13px',
                                                    marginBottom: '6px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: '500',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    ⚠️ Yếu (&lt; 5.0)
                                                </span>
                                                <span
                                                    style={{ color: '#64748b' }}
                                                >
                                                    {weakCount} học viên (
                                                    {getPercent(weakCount)}%)
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '8px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${getPercent(weakCount)}%`,
                                                        height: '100%',
                                                        background: '#ef4444',
                                                        borderRadius: '4px',
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Risk Alert Side Panel */}
                            <div
                                style={{
                                    background: '#fffefc',
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: '1px solid #fef3c7',
                                    boxShadow:
                                        '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <h4
                                    style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#b45309',
                                        marginBottom: '16px',
                                        margin: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    ⚠️ Học viên có nguy cơ (At-Risk)
                                </h4>
                                {atRiskStudents.length === 0 ? (
                                    <p
                                        style={{
                                            fontSize: '13px',
                                            color: '#15803d',
                                            fontStyle: 'italic',
                                            margin: 0,
                                        }}
                                    >
                                        Tuyệt vời! Không có học viên nào thuộc
                                        diện cảnh báo học tập hoặc chuyên cần
                                        thấp.
                                    </p>
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            maxHeight: '220px',
                                            overflowY: 'auto',
                                        }}
                                    >
                                        {atRiskStudents.map((student) => (
                                            <div
                                                key={student.student_id}
                                                style={{
                                                    padding: '10px 12px',
                                                    background: '#fff',
                                                    border: '1px solid #fee2e2',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: '600',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    {student.student_name}
                                                </div>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                        marginTop: '4px',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    {student.isLowAttendance && (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    '2px 6px',
                                                                background:
                                                                    '#fee2e2',
                                                                color: '#991b1b',
                                                                borderRadius:
                                                                    '4px',
                                                                fontSize:
                                                                    '11px',
                                                                fontWeight:
                                                                    '500',
                                                            }}
                                                        >
                                                            Chuyên cần thấp (
                                                            {student.attendance_rate.toFixed(
                                                                1
                                                            )}
                                                            %)
                                                        </span>
                                                    )}
                                                    {student.isLowGrade && (
                                                        <span
                                                            style={{
                                                                padding:
                                                                    '2px 6px',
                                                                background:
                                                                    '#ffedd5',
                                                                color: '#c2410c',
                                                                borderRadius:
                                                                    '4px',
                                                                fontSize:
                                                                    '11px',
                                                                fontWeight:
                                                                    '500',
                                                            }}
                                                        >
                                                            Điểm thấp (
                                                            {student.finalScore?.toFixed(
                                                                1
                                                            )}
                                                            )
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Full Table Report */}
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    marginBottom: '16px',
                                    margin: 0,
                                }}
                            >
                                Thống kê chi tiết toàn bộ học viên lớp học
                            </h4>
                            <div
                                style={{ overflowX: 'auto', marginTop: '16px' }}
                            >
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '14px',
                                    }}
                                >
                                    <thead>
                                        <tr
                                            style={{
                                                borderBottom:
                                                    '2px solid #e2e8f0',
                                                textAlign: 'left',
                                                color: '#64748b',
                                                fontWeight: '600',
                                            }}
                                        >
                                            <th style={{ padding: '12px 8px' }}>
                                                Học viên
                                            </th>
                                            <th style={{ padding: '12px 8px' }}>
                                                Tỉ lệ chuyên cần
                                            </th>
                                            <th style={{ padding: '12px 8px' }}>
                                                Chi tiết đi học
                                            </th>
                                            <th style={{ padding: '12px 8px' }}>
                                                Điểm số
                                            </th>
                                            <th style={{ padding: '12px 8px' }}>
                                                Xếp loại
                                            </th>
                                            <th style={{ padding: '12px 8px' }}>
                                                Trạng thái
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentReports.map((student) => (
                                            <tr
                                                key={student.student_id}
                                                style={{
                                                    borderBottom:
                                                        '1px solid #f1f5f9',
                                                    verticalAlign: 'middle',
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '14px 8px',
                                                        fontWeight: '500',
                                                        color: '#1e293b',
                                                    }}
                                                >
                                                    {student.student_name}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '14px 8px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color:
                                                                student.attendance_rate >=
                                                                80
                                                                    ? '#16a34a'
                                                                    : '#dc2626',
                                                        }}
                                                    >
                                                        {student.attendance_rate.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '14px 8px',
                                                        fontSize: '12px',
                                                        color: '#64748b',
                                                    }}
                                                >
                                                    🟢 {student.present} đi học
                                                    | 🟡 {student.late} muộn |
                                                    🔴 {student.absent} vắng |
                                                    🔵 {student.excused} có phép
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '14px 8px',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {student.finalScore !==
                                                    null ? (
                                                        <span
                                                            style={{
                                                                color:
                                                                    student.finalScore >=
                                                                    7.0
                                                                        ? '#16a34a'
                                                                        : '#c2410c',
                                                            }}
                                                        >
                                                            {student.finalScore.toFixed(
                                                                1
                                                            )}{' '}
                                                            / 10
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: '#94a3b8',
                                                                fontStyle:
                                                                    'italic',
                                                                fontSize:
                                                                    '13px',
                                                            }}
                                                        >
                                                            Chưa có
                                                        </span>
                                                    )}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '14px 8px',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            backgroundColor:
                                                                student.academicStatus ===
                                                                'Xuất sắc'
                                                                    ? '#d1fae5'
                                                                    : student.academicStatus ===
                                                                        'Khá'
                                                                      ? '#dbeafe'
                                                                      : student.academicStatus ===
                                                                          'Trung bình'
                                                                        ? '#fef3c7'
                                                                        : student.academicStatus ===
                                                                            'Yêu'
                                                                          ? '#fee2e2'
                                                                          : '#f1f5f9',
                                                            color:
                                                                student.academicStatus ===
                                                                'Xuất sắc'
                                                                    ? '#065f46'
                                                                    : student.academicStatus ===
                                                                        'Khá'
                                                                      ? '#1e40af'
                                                                      : student.academicStatus ===
                                                                          'Trung bình'
                                                                        ? '#92400e'
                                                                        : student.academicStatus ===
                                                                            'Yêu'
                                                                          ? '#991b1b'
                                                                          : '#475569',
                                                        }}
                                                    >
                                                        {student.academicStatus}
                                                    </span>
                                                </td>
                                                <td
                                                    style={{
                                                        padding: '14px 8px',
                                                    }}
                                                >
                                                    {student.isAtRisk ? (
                                                        <span
                                                            style={{
                                                                color: '#dc2626',
                                                                fontWeight:
                                                                    '600',
                                                                fontSize:
                                                                    '13px',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: '4px',
                                                            }}
                                                        >
                                                            Cảnh báo
                                                        </span>
                                                    ) : (
                                                        <span
                                                            style={{
                                                                color: '#16a34a',
                                                                fontWeight:
                                                                    '500',
                                                                fontSize:
                                                                    '13px',
                                                            }}
                                                        >
                                                            Bình thường
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            }

            default:
                return null
        }
    }

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

                <div
                    className={s.tabs}
                    style={{
                        marginTop: 24,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}
                >
                    <TabMenu
                        items={tabItems}
                        value={activeTab}
                        onChange={setActiveTab}
                        variant="flat"
                        activeStyle="underline"
                        fullWidth
                    />
                </div>

                <div style={{ marginTop: 24 }}>{renderTabContent()}</div>
            </div>

            {/* Attendance Modal Overlay */}
            {selectedSessionForAttendance && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '650px',
                            boxShadow:
                                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
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
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '450px',
                            boxShadow:
                                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
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
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: '24px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow:
                                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
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

function SubstitutionRequestModal({
    session,
    teachers,
    onClose,
}: {
    session: any
    teachers: any[]
    onClose: () => void
}) {
    const [subId, setSubId] = useState<string>('')
    const [reason, setReason] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim()) {
            alert('Vui lòng nhập lý do vắng mặt/dạy thế', 'Yêu cầu nhập lý do')
            return
        }

        setIsSubmitting(true)
        try {
            await createSubstitutionRequest({
                class_session_id: session.id,
                target_substitute_id: subId || null,
                reason: reason,
            })
            alert(
                'Gửi yêu cầu dạy thế thành công! Đang chờ phê duyệt/xác nhận.',
                'Thành công'
            )
            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            onClose()
        } catch (err: any) {
            alert(err.message || 'Không thể tạo yêu cầu dạy thế')
        } finally {
            setIsSubmitting(false)
        }
    }

    const sessionDate = new Date(session.session_date)

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                textAlign: 'left',
            }}
        >
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: 0,
                }}
            >
                Yêu cầu dạy thế
            </h2>

            <div
                style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#475569',
                }}
            >
                <div style={{ marginBottom: '8px' }}>
                    <strong>Buổi học:</strong>{' '}
                    {session.topic || session.title || 'Tổng quan'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                    <strong>Ngày học:</strong>{' '}
                    {sessionDate.toLocaleDateString('vi-VN')}
                </div>
                <div>
                    <strong>Thời gian:</strong> {session.start_time.slice(0, 5)}{' '}
                    - {session.end_time.slice(0, 5)}
                </div>
            </div>

            <div>
                <label
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#334155',
                        marginBottom: '8px',
                    }}
                >
                    Đề xuất giáo viên dạy thế (Tùy chọn)
                </label>
                <select
                    value={subId}
                    onChange={(e) => setSubId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        color: '#1e293b',
                        outline: 'none',
                    }}
                >
                    <option value="">-- Để trống (Admin tự chỉ định) --</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.fullName} ({t.email})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#334155',
                        marginBottom: '8px',
                    }}
                >
                    Lý do vắng mặt / dạy thế{' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Nhập lý do chi tiết..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                    marginTop: '8px',
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        color: '#475569',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
            </div>
        </form>
    )
}

function AttendanceModal({
    sessionId,
    students,
    onClose,
}: {
    sessionId: string
    students: ClassMember[]
    onClose: () => void
}) {
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    const { data: attendanceRecords, isLoading } = useQuery({
        queryKey: ['session-attendance', sessionId],
        queryFn: () => getSessionAttendance(sessionId),
        enabled: !!sessionId,
    })

    const [records, setRecords] = useState<
        Record<string, { status: AttendanceStatus; notes: string }>
    >({})

    useEffect(() => {
        if (!students) return
        const initialRecords: Record<
            string,
            { status: AttendanceStatus; notes: string }
        > = {}
        students.forEach((student) => {
            const matchedRecord = attendanceRecords?.find(
                (r: any) => r.student_id === student.id
            )
            initialRecords[student.id] = {
                status: matchedRecord
                    ? (matchedRecord.status as AttendanceStatus)
                    : 'present',
                notes: matchedRecord?.remarks || '',
            }
        })
        setRecords(initialRecords)
    }, [attendanceRecords, students])

    const submitMutation = useMutation({
        mutationFn: (items: any[]) => markAttendance(sessionId, items),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            alert(res.message || 'Lưu điểm danh thành công!', 'Thành công')
            onClose()
        },
        onError: (err: any) => {
            alert(
                err?.message || 'Có lỗi xảy ra khi lưu điểm danh.',
                'Thất bại'
            )
        },
    })

    const handleStatusChange = (
        studentId: string,
        status: AttendanceStatus
    ) => {
        setRecords((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }))
    }

    const handleNotesChange = (studentId: string, notes: string) => {
        setRecords((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                notes,
            },
        }))
    }

    const handleSave = () => {
        const payload = Object.entries(records).map(([studentId, data]) => ({
            student_id: studentId,
            status: data.status,
            notes: data.notes,
        }))
        submitMutation.mutate(payload)
    }

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '12px' }}>
                    Đang tải danh sách điểm danh...
                </p>
            </div>
        )
    }

    return (
        <div style={{ textAlign: 'left' }}>
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '20px',
                    color: '#1e293b',
                }}
            >
                Chi tiết điểm danh buổi học
            </h2>

            <div
                style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    marginBottom: '24px',
                    paddingRight: '8px',
                }}
            >
                {students.map((student) => {
                    const rec = records[student.id] || {
                        status: 'present',
                        notes: '',
                    }
                    return (
                        <div
                            key={student.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                padding: '16px',
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: '#fff',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '600',
                                            color: '#475569',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {student.avatarUrl ? (
                                            <img
                                                src={student.avatarUrl}
                                                alt=""
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        ) : (
                                            `${student.lastName[0] || ''}${student.firstName[0] || ''}`
                                        )}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: '600',
                                                color: '#1e293b',
                                            }}
                                        >
                                            {student.lastName}{' '}
                                            {student.firstName}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#64748b',
                                            }}
                                        >
                                            {student.email}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {(
                                        [
                                            'present',
                                            'late',
                                            'absent',
                                            'excused',
                                        ] as AttendanceStatus[]
                                    ).map((status) => {
                                        const isSelected = rec.status === status
                                        let label = 'Có mặt'
                                        let activeBg = '#d1fae5'
                                        let activeColor = '#065f46'
                                        if (status === 'late') {
                                            label = 'Muộn'
                                            activeBg = '#fef3c7'
                                            activeColor = '#92400e'
                                        } else if (status === 'absent') {
                                            label = 'Vắng'
                                            activeBg = '#fee2e2'
                                            activeColor = '#991b1b'
                                        } else if (status === 'excused') {
                                            label = 'Phép'
                                            activeBg = '#dbeafe'
                                            activeColor = '#1e40af'
                                        }

                                        return (
                                            <button
                                                key={status}
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        status
                                                    )
                                                }
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: isSelected
                                                        ? 'none'
                                                        : '1px solid #cbd5e1',
                                                    backgroundColor: isSelected
                                                        ? activeBg
                                                        : '#fff',
                                                    color: isSelected
                                                        ? activeColor
                                                        : '#64748b',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: '#64748b',
                                        minWidth: '60px',
                                    }}
                                >
                                    Ghi chú:
                                </span>
                                <input
                                    type="text"
                                    placeholder="Lý do vắng, đi muộn..."
                                    value={rec.notes}
                                    onChange={(e) =>
                                        handleNotesChange(
                                            student.id,
                                            e.target.value
                                        )
                                    }
                                    style={{
                                        flex: 1,
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '13px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end',
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fff',
                        color: '#475569',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    Hủy
                </button>
                <button
                    onClick={handleSave}
                    disabled={submitMutation.isPending}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#4f46e5',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: submitMutation.isPending ? 0.7 : 1,
                    }}
                >
                    {submitMutation.isPending ? 'Đang lưu...' : 'Lưu điểm danh'}
                </button>
            </div>
        </div>
    )
}

function QrCodeModal({
    session,
    onClose,
}: {
    session: any
    onClose: () => void
}) {
    const [copied, setCopied] = useState(false)

    const qrToken = session.qr_token || ''
    const qrExpiresAtString = session.qr_expires_at || ''
    const qrExpiresAt = useMemo(() => {
        return qrExpiresAtString ? new Date(qrExpiresAtString) : null
    }, [qrExpiresAtString])

    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!qrExpiresAt) return
        const updateTimer = () => {
            const now = new Date()
            const diff = qrExpiresAt.getTime() - now.getTime()
            if (diff <= 0) {
                setTimeLeft('Đã hết hạn')
            } else {
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            }
        }
        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [qrExpiresAt])

    const handleCopy = () => {
        navigator.clipboard.writeText(qrToken)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrToken)}&size=250x250`

    return (
        <div style={{ textAlign: 'center', padding: '8px' }}>
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#1e293b',
                }}
            >
                Mã QR Điểm Danh Tự Động
            </h2>
            <p
                style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '24px',
                }}
            >
                Học viên quét mã bên dưới hoặc dùng mã token để tự điểm danh.
            </p>

            <div
                style={{
                    width: '240px',
                    height: '240px',
                    margin: '0 auto 20px',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
            >
                {qrToken ? (
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <div style={{ color: '#94a3b8' }}>Mã QR không hợp lệ</div>
                )}
            </div>

            {qrExpiresAt && (
                <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Thời gian còn lại:{' '}
                    </span>
                    <span
                        style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color:
                                timeLeft === 'Đã hết hạn'
                                    ? '#ef4444'
                                    : '#10b981',
                            backgroundColor:
                                timeLeft === 'Đã hết hạn'
                                    ? '#fef2f2'
                                    : '#ecfdf5',
                            padding: '4px 12px',
                            borderRadius: '20px',
                        }}
                    >
                        {timeLeft}
                    </span>
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '28px',
                }}
            >
                <span
                    style={{
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        textAlign: 'left',
                    }}
                >
                    {qrToken}
                </span>
                <button
                    onClick={handleCopy}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: copied ? '#10b981' : '#4f46e5',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minWidth: '80px',
                    }}
                >
                    {copied ? 'Đã copy' : 'Copy'}
                </button>
            </div>

            <button
                onClick={onClose}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                }}
            >
                Đóng
            </button>
        </div>
    )
}
