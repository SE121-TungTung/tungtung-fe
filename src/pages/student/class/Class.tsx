import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

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
import type { MyClass, ClassSession, MyClassUser } from '@/types/user.types'
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

    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [memberFilterRole, setMemberFilterRole] = useState<
        'all' | 'student' | 'teacher'
    >('all')

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
            }))
            .sort(
                (a: Lesson, b: Lesson) =>
                    new Date(a.sessionDate).getTime() -
                    new Date(b.sessionDate).getTime()
            ) // Sắp xếp tăng dần theo ngày
    }, [currentClass])

    // Lọc ra buổi học hôm nay (nếu có)
    const todaySessions: Lesson[] = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        return allSessions.filter((s) => s.sessionDate === today)
    }, [allSessions])

    // Render Content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'schedule':
                return (
                    <div className={s.grid}>
                        <ScheduleTodayCard
                            title="Lịch học hôm nay"
                            sessions={todaySessions}
                            onCheckIn={() =>
                                alert('Chức năng điểm danh đang phát triển!')
                            }
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
                            onShowOld={() => {}}
                        />
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
        </div>
    )
}
