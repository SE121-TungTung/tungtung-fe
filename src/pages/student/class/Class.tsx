import { useState, useCallback, useEffect, useMemo } from 'react'
import s from './Class.module.css'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import SegmentedControl, {
    type SegItem,
} from '@/components/common/menu/SegmentedControl'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import SessionList from './SessionList'
import TextType from '@/components/common/text/TextType'
import type { Lesson } from '@/components/common/typography/LessonItem'

import AvatarImg from '@/assets/avatar-placeholder.png'
import SearchIcon from '@/assets/Book Search.svg'

import type { Assignment } from '@/components/common/card/AssignmentCard'
import type { Activity } from '@/components/common/card/RecentActivityCard'
import RecentActivityCard from '@/components/common/card/RecentActivityCard'
import AssignmentCard from '@/components/common/card/AssignmentCard'
import MemberList from './MemberList'
import type { ClassMember } from '@/components/common/card/MemberCard'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { useSession } from '@/stores/session.store'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { Role } from '@/types/auth'

const tabItems: TabItem[] = [
    { label: 'Lịch học', value: 'schedule' },
    { label: 'Bảng tin', value: 'news' },
    { label: 'Thành viên', value: 'members' },
]

const viewModeItems: SegItem[] = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
]

const allSessions: Lesson[] = [
    {
        id: '3',
        sessionDate: '2025-10-27',
        startTime: '08:00',
        endTime: '09:30',
        className: 'Buổi 1: Introduction',
        status: 'completed',
    },
    {
        id: '4',
        sessionDate: '2025-10-29',
        startTime: '08:00',
        endTime: '09:30',
        className: 'Buổi 2: Listening Skills',
        status: 'completed',
    },
    {
        id: '5',
        sessionDate: '2025-11-03',
        startTime: '08:00',
        endTime: '09:30',
        className: 'Buổi 3: Reading Comprehension',
        status: 'scheduled',
    },
    {
        id: '6',
        sessionDate: '2025-11-05',
        startTime: '08:00',
        endTime: '09:30',
        className: 'Buổi 4: Writing Task 1',
        status: 'scheduled',
    },
    {
        id: '7',
        sessionDate: '2025-11-10',
        startTime: '08:00',
        endTime: '09:30',
        className: 'Buổi 5: Speaking Part 1',
        status: 'scheduled',
    },
    {
        id: '8',
        sessionDate: '2025-11-12',
        startTime: '08:00',
        endTime: '09:30',
        className: 'Buổi 6: Mid-term Test',
        status: 'scheduled',
    },
]

const recentActivities: Activity[] = [
    {
        id: 'a1',
        title: 'Giáo viên đã đăng tài liệu "Unit 5 Grammar"',
        timestamp: '2 giờ trước',
        type: 'material',
    },
    {
        id: 'a2',
        title: 'Bài tập "Writing Task 1" sắp hết hạn',
        timestamp: 'Hôm qua lúc 18:00',
        type: 'assignment',
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
    {
        id: 'b2',
        title: 'Quiz "Vocabulary Unit 4-5"',
        dueDate: 'Hết hạn: Chủ Nhật, 23:59',
        type: 'quiz',
    },
]

interface MyClass {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
    max_students: number
    current_students: number
    teacher?: {
        id: string
        full_name: string
        email: string
        avatar_url?: string
    }
    students?: Array<{
        id: string
        full_name: string
        email: string
        avatar_url?: string | null
    }>
}

export default function ClassPage() {
    const sessionState = useSession()
    const userRole = (sessionState?.user?.role as Role) || 'student'

    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = location.pathname

    const [activeTab, setActiveTab] = useState('schedule')
    const [viewMode, setViewMode] = useState('week')
    const [showGradientName, setShowGradientName] = useState(false)

    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [memberFilterRole, setMemberFilterRole] = useState<
        'all' | 'student' | 'teacher'
    >('all')

    // Fetch my classes
    const {
        data: myClasses,
        isLoading: classesLoading,
        // error: classesError,
    } = useQuery({
        queryKey: ['my-classes'],
        queryFn: async () => {
            const { getMyClasses } = await import('@/lib/users')
            return getMyClasses()
        },
    })

    // Get first class or default
    const currentClass = myClasses?.[0] as MyClass | undefined

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [userRole, currentPath, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [userRole, navigate]
    )

    // Convert API data to ClassMember[]
    const classMembers: ClassMember[] = useMemo(() => {
        if (!currentClass) return []

        const members: ClassMember[] = []

        // Add teacher
        if (currentClass.teacher) {
            members.push({
                id: currentClass.teacher.id,
                firstName: currentClass.teacher.full_name.split(' ')[0],
                lastName:
                    currentClass.teacher.full_name
                        .split(' ')
                        .slice(1)
                        .join(' ') || '',
                role: 'teacher',
                isOnline: true,
                avatarUrl: currentClass.teacher.avatar_url || null,
            })
        }

        // Add students
        if (currentClass.students && Array.isArray(currentClass.students)) {
            currentClass.students.forEach((student) => {
                members.push({
                    id: student.id,
                    firstName: student.full_name.split(' ')[0],
                    lastName:
                        student.full_name.split(' ').slice(1).join(' ') || '',
                    role: 'student',
                    isOnline: Math.random() > 0.5, // Mock online status
                    avatarUrl: student.avatar_url || null,
                })
            })
        }

        return members
    }, [currentClass])

    // Today's sessions - will be replaced with actual data from sessions endpoint
    const todaySessions: Lesson[] = useMemo(() => {
        if (!currentClass) return []

        const today = new Date().toISOString().split('T')[0]
        return [
            {
                id: '1',
                sessionDate: today,
                startTime: '08:00',
                endTime: '09:30',
                className: currentClass.name,
                courseName: currentClass.name,
                teacherName: currentClass.teacher?.full_name || 'N/A',
                roomName: 'TBA',
                status: 'scheduled',
                attendanceTaken: false,
            },
        ]
    }, [currentClass])

    useEffect(() => {
        // Reset to first page when search/filter changes
    }, [memberSearchTerm, memberFilterRole])

    const renderTabContent = () => {
        switch (activeTab) {
            case 'schedule':
                return (
                    <div className={s.grid}>
                        <ScheduleTodayCard
                            title="Lịch học"
                            sessions={todaySessions}
                            onCheckIn={() => alert('Check-in!')}
                            controls={
                                <SegmentedControl
                                    items={viewModeItems}
                                    value={viewMode}
                                    onChange={setViewMode}
                                    size="sm"
                                />
                            }
                        />
                        <SessionList sessions={allSessions} />
                    </div>
                )
            case 'news':
                return (
                    <div className={s.grid}>
                        <RecentActivityCard
                            activities={recentActivities}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            viewModeItems={viewModeItems}
                        />
                        <AssignmentCard
                            assignments={upcomingAssignments}
                            onShowOld={() => alert('Xem bài tập cũ')}
                        />
                    </div>
                )
            case 'members':
                return (
                    <div className={s.card}>
                        <Card
                            title="Thành viên lớp"
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
                                        <option value="all">
                                            Tất cả vai trò
                                        </option>
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
                                itemsPerPage={6}
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

    const className = currentClass?.name || 'Lớp học'

    return (
        <div className={s.pageWrapper}>
            {/* Navigation */}
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={sessionState?.user?.avatarUrl || AvatarImg}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            {/* Main Content */}
            <main className={s.mainContent}>
                {/* Title */}
                <h1 className={s.pageTitle}>
                    {!classesLoading && currentClass ? (
                        <>
                            <TextType
                                text="Đây là lớp "
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
                        <span>Đang tải...</span>
                    ) : (
                        <span>Không có lớp học</span>
                    )}
                </h1>

                {/* Tabs */}
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

                {/* Content */}
                {classesLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Đang tải dữ liệu lớp học...</p>
                    </div>
                ) : currentClass ? (
                    renderTabContent()
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <p>Bạn chưa được thêm vào lớp học nào</p>
                    </div>
                )}
            </main>
        </div>
    )
}
