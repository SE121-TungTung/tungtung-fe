import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import s from './Class.module.css'

// Components
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import SegmentedControl, {
    type SegItem,
} from '@/components/common/menu/SegmentedControl'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import SessionList from './SessionList'
import TextType from '@/components/common/text/TextType'
import RecentActivityCard, {
    type Activity,
} from '@/components/common/card/RecentActivityCard'
import AssignmentCard, {
    type Assignment,
} from '@/components/common/card/AssignmentCard'
import MemberList from './MemberList'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'

// Assets
import SearchIcon from '@/assets/Book Search.svg'

// API & Types
import { getMyClasses } from '@/lib/users' // Đảm bảo hàm này đã được export từ file users.ts
import { selfCheckIn } from '@/lib/attendance'
import type { MyClass, ClassSession, MyClassUser } from '@/types/user.types'
import { getClassPosts } from '@/lib/classes'
import type { ClassMember } from '@/components/common/card/MemberCard'
import type { Lesson } from '@/components/common/typography/LessonItem'
import { useDialog } from '@/hooks/useDialog'

const tabItems: TabItem[] = [
    { label: 'Lịch học', value: 'schedule' },
    { label: 'Bảng tin', value: 'news' },
    { label: 'Thành viên', value: 'members' },
]

const viewModeItems: SegItem[] = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
]

// Mock data cho News và Assignments (Vì API classes thường chưa bao gồm cái này)
const recentActivities: Activity[] = [
    {
        id: 'a1',
        title: 'Giáo viên đã đăng tài liệu "Unit 5 Grammar"',
        timestamp: '2 giờ trước',
        type: 'material',
    },
    {
        id: 'a3',
        title: 'Thông báo: Lớp học tuần sau nghỉ lễ',
        timestamp: '2 ngày trước',
        type: 'announcement',
    },
]

const upcomingAssignments: Assignment[] = [
    {
        id: 'b1',
        title: 'Bài tập "Writing Task 1"',
        dueDate: 'Hết hạn: Thứ Sáu, 23:59',
        type: 'essay',
    },
]

export default function ClassPage() {
    const [activeTab, setActiveTab] = useState('schedule')
    const [viewMode, setViewMode] = useState('week')
    const [showGradientName, setShowGradientName] = useState(false)
    const { alert } = useDialog()
    const queryClient = useQueryClient()

    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [memberFilterRole, setMemberFilterRole] = useState<
        'all' | 'student' | 'teacher'
    >('all')

    const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
    const [manualQrToken, setManualQrToken] = useState('')

    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [jsQrLoaded, setJsQrLoaded] = useState(false)

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // 1. Fetch data từ API
    const { data: myClasses, isLoading: classesLoading } = useQuery({
        queryKey: ['my-classes'],
        queryFn: getMyClasses,
    })

    // Hiện tại lấy lớp đầu tiên (Logic có thể mở rộng để chọn lớp nếu học viên học nhiều lớp)
    const currentClass = useMemo(() => {
        if (Array.isArray(myClasses)) return myClasses[0] as MyClass
        // @ts-expect-error to ignore
        if (myClasses?.classes) return myClasses.classes[0] as MyClass
        return undefined
    }, [myClasses])

    const { data: postsData, isLoading: postsLoading } = useQuery({
        queryKey: ['class-posts', currentClass?.id],
        queryFn: () => getClassPosts(currentClass!.id, 1, 100),
        enabled: !!currentClass?.id,
    })

    const checkInMutation = useMutation({
        mutationFn: ({
            sessionId,
            qrToken,
        }: {
            sessionId: string
            qrToken?: string
        }) => selfCheckIn(sessionId, qrToken),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['my-classes'] })
            alert(res.message || 'Điểm danh thành công!', 'Thành công')
            setIsQRScannerOpen(false)
            setManualQrToken('')
        },
        onError: (err: any) => {
            alert(
                err?.message ||
                    'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại!',
                'Thất bại'
            )
        },
    })

    // 3. Map dữ liệu Sessions (Lịch học) từ API sang UI
    const allSessions: Lesson[] = useMemo(() => {
        if (!currentClass || !currentClass.sessions) return []

        return currentClass.sessions
            .map((session: ClassSession) => ({
                id: session.id,
                sessionDate: session.session_date,
                startTime: session.start_time.slice(0, 5), // Cắt giây (08:00:00 -> 08:00)
                endTime: session.end_time.slice(0, 5),
                className:
                    session.title || `Buổi học ngày ${session.session_date}`,
                courseName: currentClass.course_name || currentClass.name,
                roomName: currentClass.room_name || 'Đang cập nhật',
                teacherName: currentClass.teacher?.full_name || 'Giáo viên',
                status: session.status as
                    | 'scheduled'
                    | 'completed'
                    | 'cancelled',
                attendanceTaken:
                    session.student_checked_in ?? session.attendance_taken,
            }))
            .sort(
                (a: Lesson, b: Lesson) =>
                    new Date(a.sessionDate).getTime() -
                    new Date(b.sessionDate).getTime()
            ) // Sắp xếp tăng dần theo ngày
    }, [currentClass])

    // Lọc ra buổi học hôm nay (nếu có)
    const todaySessions: Lesson[] = useMemo(() => {
        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        return allSessions.filter((s) => s.sessionDate === today)
    }, [allSessions])

    // Load jsQR library from CDN when scanner modal is opened
    useEffect(() => {
        if (!isQRScannerOpen) return

        if ((window as any).jsQR) {
            setJsQrLoaded(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
        script.async = true
        script.onload = () => setJsQrLoaded(true)
        script.onerror = () =>
            setCameraError('Không thể tải thư viện quét mã QR.')
        document.body.appendChild(script)
    }, [isQRScannerOpen])

    // Manage camera stream and scanning loop
    useEffect(() => {
        if (!isQRScannerOpen || !jsQrLoaded) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }
            setCameraActive(false)
            setCameraError(null)
            return
        }

        let active = true
        let animationFrameId: number

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                })
                if (!active) {
                    stream.getTracks().forEach((track) => track.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.setAttribute('playsinline', 'true')
                    videoRef.current.play()
                    setCameraActive(true)
                }
            } catch (err: any) {
                console.error('Error accessing camera:', err)
                setCameraError(
                    'Không thể truy cập camera. Vui lòng nhập mã thủ công.'
                )
            }
        }

        startCamera()

        const scan = () => {
            if (!active) return
            const video = videoRef.current
            const canvas = canvasRef.current
            const jsQR = (window as any).jsQR

            if (
                video &&
                canvas &&
                jsQR &&
                video.readyState === video.HAVE_ENOUGH_DATA
            ) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    const imageData = ctx.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )
                    const code = jsQR(
                        imageData.data,
                        imageData.width,
                        imageData.height,
                        {
                            inversionAttempts: 'dontInvert',
                        }
                    )

                    if (code && code.data) {
                        const scannedToken = code.data.trim()

                        try {
                            const audioCtx = new (window.AudioContext ||
                                (window as any).webkitAudioContext)()
                            const oscillator = audioCtx.createOscillator()
                            oscillator.type = 'sine'
                            oscillator.frequency.setValueAtTime(
                                800,
                                audioCtx.currentTime
                            )
                            oscillator.connect(audioCtx.destination)
                            oscillator.start()
                            oscillator.stop(audioCtx.currentTime + 0.1)
                        } catch {
                            // ignore audio context failures
                        }

                        if (streamRef.current) {
                            streamRef.current
                                .getTracks()
                                .forEach((track) => track.stop())
                            streamRef.current = null
                        }
                        setCameraActive(false)
                        setManualQrToken(scannedToken)

                        const sessionToUse =
                            todaySessions[0]?.id ||
                            currentClass?.sessions?.[0]?.id
                        if (sessionToUse) {
                            checkInMutation.mutate({
                                sessionId: sessionToUse,
                                qrToken: scannedToken,
                            })
                        }
                        return
                    }
                }
            }
            animationFrameId = requestAnimationFrame(scan)
        }

        const timer = setTimeout(() => {
            if (active) scan()
        }, 500)

        return () => {
            active = false
            clearTimeout(timer)
            cancelAnimationFrame(animationFrameId)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }
        }
    }, [
        isQRScannerOpen,
        jsQrLoaded,
        todaySessions,
        currentClass,
        checkInMutation,
    ])

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    // 2. Map dữ liệu Members từ API sang UI
    const classMembers: ClassMember[] = useMemo(() => {
        if (!currentClass) return []
        const members: ClassMember[] = []

        // Teacher
        if (currentClass.teacher) {
            members.push({
                id: currentClass.teacher.id,
                firstName: currentClass.teacher.full_name
                    .split(' ')
                    .slice(-1)
                    .join(' '),
                lastName: currentClass.teacher.full_name
                    .split(' ')
                    .slice(0, -1)
                    .join(' '),
                role: 'teacher',
                isOnline: true,
                avatarUrl: currentClass.teacher.avatar_url || null,
                email: currentClass.teacher.email,
            })
        }

        // Students
        if (currentClass.students && Array.isArray(currentClass.students)) {
            currentClass.students.forEach((student: MyClassUser) => {
                members.push({
                    id: student.id,
                    firstName: student.full_name.split(' ').slice(-1).join(' '),
                    lastName: student.full_name
                        .split(' ')
                        .slice(0, -1)
                        .join(' '),
                    role: 'student',
                    isOnline: false,
                    avatarUrl: student.avatar_url || null,
                    email: student.email,
                })
            })
        }
        return members
    }, [currentClass])

    const handleCheckIn = useCallback(() => {
        const checkInTarget = todaySessions.find((s) => !s.attendanceTaken)
        if (!checkInTarget) {
            if (todaySessions.length === 0) {
                alert(
                    'Hôm nay bạn không có lịch học để điểm danh.',
                    'Thông báo'
                )
            } else {
                alert(
                    'Bạn đã điểm danh cho tất cả các buổi học hôm nay rồi!',
                    'Thông báo'
                )
            }
            return
        }
        checkInMutation.mutate({ sessionId: checkInTarget.id })
    }, [todaySessions, checkInMutation, alert])

    // Render Content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'schedule':
                return (
                    <div className={s.grid}>
                        <ScheduleTodayCard
                            title="Lịch học hôm nay"
                            sessions={todaySessions}
                            onCheckIn={handleCheckIn}
                            controls={
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        alignItems: 'center',
                                    }}
                                >
                                    <button
                                        onClick={() => setIsQRScannerOpen(true)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background:
                                                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: '#fff',
                                            border: 'none',
                                            fontWeight: '600',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            boxShadow:
                                                '0 4px 10px rgba(16, 185, 129, 0.3)',
                                        }}
                                    >
                                        Quét QR tự điểm danh
                                    </button>
                                    <SegmentedControl
                                        items={viewModeItems}
                                        value={viewMode}
                                        onChange={setViewMode}
                                        size="sm"
                                    />
                                </div>
                            }
                        />
                        <SessionList sessions={allSessions} />
                    </div>
                )
            case 'news':
                return (
                    <div
                        className={s.grid}
                        style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}
                    >
                        <div>
                            <Card
                                title="Bảng tin & Tài liệu lớp học"
                                variant="outline"
                                mode="light"
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px',
                                        padding: '16px',
                                    }}
                                >
                                    {postsLoading ? (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                padding: '20px',
                                                color: '#666',
                                            }}
                                        >
                                            Đang tải...
                                        </div>
                                    ) : !postsData?.data ||
                                      postsData.data.length === 0 ? (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                padding: '40px 20px',
                                                color: '#888',
                                            }}
                                        >
                                            Lớp học chưa có thông báo hoặc tài
                                            liệu nào.
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
                                                    transition:
                                                        'all 0.2s ease-in-out',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        alignItems:
                                                            'flex-start',
                                                        marginBottom: '12px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            gap: '12px',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius:
                                                                    '50%',
                                                                background:
                                                                    'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                                                                color: '#fff',
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                                fontWeight:
                                                                    'bold',
                                                                fontSize:
                                                                    '16px',
                                                            }}
                                                        >
                                                            {post.author?.full_name
                                                                ?.charAt(0)
                                                                .toUpperCase() ||
                                                                'G'}
                                                        </div>
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontWeight:
                                                                        '600',
                                                                    color: '#1e293b',
                                                                }}
                                                            >
                                                                {post.author
                                                                    ?.full_name ||
                                                                    'Giảng viên'}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
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
                                                    <span
                                                        style={{
                                                            padding: '4px 10px',
                                                            borderRadius:
                                                                '20px',
                                                            fontSize: '11px',
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
                                                </div>

                                                <h4
                                                    style={{
                                                        fontSize: '16px',
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
                                                            fontSize: '14px',
                                                            lineHeight: '1.6',
                                                            whiteSpace:
                                                                'pre-wrap',
                                                            marginBottom:
                                                                '16px',
                                                        }}
                                                    >
                                                        {post.content}
                                                    </p>
                                                )}

                                                {post.attachments &&
                                                    post.attachments.length >
                                                        0 && (
                                                        <div
                                                            style={{
                                                                borderTop:
                                                                    '1px dashed #e2e8f0',
                                                                paddingTop:
                                                                    '12px',
                                                                marginTop:
                                                                    '12px',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '12px',
                                                                    fontWeight:
                                                                        '600',
                                                                    color: '#64748b',
                                                                    marginBottom:
                                                                        '8px',
                                                                }}
                                                            >
                                                                Tệp đính kèm (
                                                                {
                                                                    post
                                                                        .attachments
                                                                        .length
                                                                }
                                                                ):
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        'flex',
                                                                    flexDirection:
                                                                        'column',
                                                                    gap: '8px',
                                                                }}
                                                            >
                                                                {post.attachments.map(
                                                                    (
                                                                        file,
                                                                        idx
                                                                    ) => (
                                                                        <a
                                                                            key={
                                                                                idx
                                                                            }
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
                                                                                gap: '8px',
                                                                                padding:
                                                                                    '8px 12px',
                                                                                borderRadius:
                                                                                    '8px',
                                                                                background:
                                                                                    '#f8fafc',
                                                                                border: '1px solid #e2e8f0',
                                                                                color: '#2563eb',
                                                                                textDecoration:
                                                                                    'none',
                                                                                fontSize:
                                                                                    '13px',
                                                                                fontWeight:
                                                                                    '500',
                                                                                width: 'fit-content',
                                                                                transition:
                                                                                    'background 0.2s',
                                                                            }}
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
                                                                                        '11px',
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
                            </Card>
                        </div>
                        <div>
                            <AssignmentCard
                                assignments={upcomingAssignments}
                                onShowOld={() => {}}
                            />
                        </div>
                    </div>
                )
            case 'members':
                return (
                    <div className={s.card}>
                        <Card
                            title={`Thành viên lớp (${classMembers.length})`}
                            variant="outline"
                            mode="light"
                            controls={
                                <div className={s.memberControls}>
                                    <InputField
                                        placeholder="Tìm kiếm thành viên..."
                                        value={memberSearchTerm}
                                        onChange={(e) =>
                                            setMemberSearchTerm(e.target.value)
                                        }
                                        leftIcon={
                                            <img
                                                src={SearchIcon}
                                                alt="search"
                                            />
                                        }
                                        variant="glass"
                                        mode="light"
                                        uiSize="sm"
                                    />
                                    <select
                                        className={s.memberFilterSelect}
                                        value={memberFilterRole}
                                        onChange={(e) =>
                                            setMemberFilterRole(
                                                e.target.value as
                                                    | 'all'
                                                    | 'student'
                                                    | 'teacher'
                                            )
                                        }
                                    >
                                        <option value="all">Tất cả</option>
                                        <option value="student">
                                            Học viên
                                        </option>
                                        <option value="teacher">
                                            Giáo viên
                                        </option>
                                    </select>
                                </div>
                            }
                        >
                            <MemberList
                                key={`${memberSearchTerm}-${memberFilterRole}`}
                                members={classMembers}
                                itemsPerPage={8}
                                searchTerm={memberSearchTerm}
                                filterRole={memberFilterRole}
                            />
                        </Card>
                    </div>
                )
            default:
                return null
        }
    }

    const className = currentClass?.name || 'Lớp học của tôi'

    return (
        <div className={s.pageWrapperWithoutHeader}>
            {/* Main Content */}
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    {!classesLoading && currentClass ? (
                        <>
                            <TextType
                                text="Xin chào, đây là "
                                typingSpeed={50}
                                loop={false}
                                showCursor={!showGradientName}
                                onSentenceComplete={handleGreetingComplete}
                            />
                            {showGradientName && (
                                <TextType
                                    as="span"
                                    className={s.gradientText}
                                    text={className}
                                    typingSpeed={70}
                                    loop={false}
                                />
                            )}
                        </>
                    ) : classesLoading ? (
                        <span>Đang tải dữ liệu...</span>
                    ) : (
                        <span>Bạn chưa tham gia lớp học nào</span>
                    )}
                </h1>

                {/* Tabs */}
                {currentClass && (
                    <div className={s.tabs}>
                        <TabMenu
                            items={tabItems}
                            value={activeTab}
                            onChange={(val) => setActiveTab(val)}
                            variant="flat"
                            activeStyle="underline"
                            fullWidth
                        />
                    </div>
                )}

                {/* Tab Content */}
                {classesLoading ? (
                    <div className={s.placeholderContent}>
                        <div className={s.placeholderBox}>
                            <div className="spinner"></div>
                            <p>Đang tải thông tin lớp học...</p>
                        </div>
                    </div>
                ) : currentClass ? (
                    renderTabContent()
                ) : (
                    <div className={s.placeholderContent}>
                        <div className={s.placeholderBox}>
                            <h2>Chưa có lớp học</h2>
                            <p>
                                Hiện tại bạn chưa được thêm vào lớp học nào
                                trong hệ thống.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {isQRScannerOpen && (
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
                            textAlign: 'center',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                        }}
                    >
                        <h2
                            style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                marginBottom: '8px',
                                color: '#1e293b',
                            }}
                        >
                            Quét mã QR tự điểm danh
                        </h2>
                        <p
                            style={{
                                fontSize: '14px',
                                color: '#64748b',
                                marginBottom: '24px',
                            }}
                        >
                            Vui lòng đưa camera của bạn tới mã QR do giáo viên
                            cung cấp hoặc nhập mã token vào ô bên dưới.
                        </p>

                        <div
                            style={{
                                position: 'relative',
                                width: '260px',
                                height: '260px',
                                margin: '0 auto 24px',
                                border: '2px solid #cbd5e1',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                background: '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow:
                                    '0 10px 15px -3px rgba(0, 0, 0, 0.3), inset 0 2px 4px 0 rgba(0,0,0,0.2)',
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{ display: 'none' }}
                            />
                            <video
                                ref={videoRef}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: cameraActive ? 'block' : 'none',
                                }}
                            />
                            {!cameraActive && (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '24px',
                                        textAlign: 'center',
                                        zIndex: 1,
                                    }}
                                >
                                    {cameraError ? (
                                        <span
                                            style={{
                                                fontSize: '13px',
                                                color: '#f87171',
                                                fontWeight: '500',
                                            }}
                                        >
                                            ⚠️ {cameraError}
                                        </span>
                                    ) : (
                                        <>
                                            <div
                                                className="spinner"
                                                style={{
                                                    borderLeftColor: '#4f46e5',
                                                    width: '28px',
                                                    height: '28px',
                                                }}
                                            ></div>
                                            <span
                                                style={{
                                                    fontSize: '13px',
                                                    color: '#94a3b8',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                Đang khởi động camera...
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                            {cameraActive && (
                                <>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '2px',
                                            background: '#10b981',
                                            boxShadow: '0 0 10px #10b981',
                                            top: '0%',
                                            left: 0,
                                            animation:
                                                'scan 2s linear infinite',
                                            zIndex: 2,
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 16,
                                            left: 16,
                                            width: 24,
                                            height: 24,
                                            borderTop: '4px solid #10b981',
                                            borderLeft: '4px solid #10b981',
                                            zIndex: 2,
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 16,
                                            right: 16,
                                            width: 24,
                                            height: 24,
                                            borderTop: '4px solid #10b981',
                                            borderRight: '4px solid #10b981',
                                            zIndex: 2,
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 16,
                                            left: 16,
                                            width: 24,
                                            height: 24,
                                            borderBottom: '4px solid #10b981',
                                            borderLeft: '4px solid #10b981',
                                            zIndex: 2,
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 16,
                                            right: 16,
                                            width: 24,
                                            height: 24,
                                            borderBottom: '4px solid #10b981',
                                            borderRight: '4px solid #10b981',
                                            zIndex: 2,
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <style>{`
                            @keyframes scan {
                                0% { top: 0%; }
                                50% { top: 100%; }
                                100% { top: 0%; }
                            }
                        `}</style>

                        <div
                            style={{ textAlign: 'left', marginBottom: '24px' }}
                        >
                            <label
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#475569',
                                    marginBottom: '6px',
                                    display: 'block',
                                }}
                            >
                                Nhập mã QR token:
                            </label>
                            <input
                                type="text"
                                placeholder="Dán mã QR token từ giáo viên..."
                                value={manualQrToken}
                                onChange={(e) =>
                                    setManualQrToken(e.target.value)
                                }
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxShadow:
                                        'inset 0 1px 2px rgba(0,0,0,0.05)',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setIsQRScannerOpen(false)
                                    setManualQrToken('')
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: '#fff',
                                    color: '#475569',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    if (!manualQrToken.trim()) {
                                        alert(
                                            'Vui lòng nhập mã QR token.',
                                            'Lỗi'
                                        )
                                        return
                                    }
                                    const sessionToUse =
                                        todaySessions[0]?.id ||
                                        currentClass?.sessions?.[0]?.id
                                    if (!sessionToUse) {
                                        alert(
                                            'Không tìm thấy buổi học nào để điểm danh.',
                                            'Lỗi'
                                        )
                                        return
                                    }
                                    checkInMutation.mutate({
                                        sessionId: sessionToUse,
                                        qrToken: manualQrToken.trim(),
                                    })
                                }}
                                disabled={checkInMutation.isPending}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    backgroundColor: '#4f46e5',
                                    color: '#fff',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    opacity: checkInMutation.isPending
                                        ? 0.7
                                        : 1,
                                }}
                            >
                                {checkInMutation.isPending
                                    ? 'Đang gửi...'
                                    : 'Gửi mã'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
