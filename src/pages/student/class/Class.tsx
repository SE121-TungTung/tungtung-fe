import { useState, useCallback, useEffect } from 'react'
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

const tabItems: TabItem[] = [
    { label: 'Lịch học', value: 'schedule' },
    { label: 'Bảng tin', value: 'news' },
    { label: 'Thành viên', value: 'members' },
]

const viewModeItems: SegItem[] = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
]

const todaySessions: Lesson[] = [
    {
        id: '1',
        sessionDate: '2025-10-27',
        startTime: '08:00',
        endTime: '09:30',
        className: 'IELTS Intermediate A',
        courseName: 'IELTS Intermediate A',
        teacherName: 'Mr. John',
        roomName: 'A1',
        status: 'in_progress',
        attendanceTaken: false,
    },
    {
        id: '2',
        sessionDate: '2025-10-27',
        startTime: '10:00',
        endTime: '11:30',
        className: 'TOEIC Advanced B',
        courseName: 'TOEIC Advanced B',
        teacherName: 'Ms. Jane',
        roomName: 'B2',
        status: 'scheduled',
        attendanceTaken: false,
    },
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

const mockClassMembers: ClassMember[] = [
    {
        id: 'uuid-teacher-1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'teacher',
        isOnline: true,
        avatarUrl: null,
    },
    {
        id: 'uuid-student-1',
        firstName: 'Alice',
        lastName: 'Smith',
        role: 'student',
        isOnline: true,
        avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
    {
        id: 'uuid-student-2',
        firstName: 'Bob',
        lastName: 'Johnson',
        role: 'student',
        isOnline: false,
        avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
        id: 'uuid-student-3',
        firstName: 'Charlie',
        lastName: 'Brown',
        role: 'student',
        isOnline: true,
        avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
    {
        id: 'uuid-student-4',
        firstName: 'Diana',
        lastName: 'Davis',
        role: 'student',
        isOnline: false,
        avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    {
        id: 'uuid-student-5',
        firstName: 'Ethan',
        lastName: 'Garcia',
        role: 'student',
        isOnline: true,
        avatarUrl: null,
    },
    {
        id: 'uuid-student-6',
        firstName: 'Fiona',
        lastName: 'Miller',
        role: 'student',
        isOnline: false,
        avatarUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
    },
    {
        id: 'uuid-student-7',
        firstName: 'George',
        lastName: 'Rodriguez',
        role: 'student',
        isOnline: true,
        avatarUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
    },
    {
        id: 'uuid-student-8',
        firstName: 'Hannah',
        lastName: 'Wilson',
        role: 'student',
        isOnline: true,
        avatarUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
    },
    {
        id: 'uuid-student-9',
        firstName: 'Ian',
        lastName: 'Martinez',
        role: 'student',
        isOnline: false,
        avatarUrl: null,
    },
    {
        id: 'uuid-student-10',
        firstName: 'Julia',
        lastName: 'Anderson',
        role: 'student',
        isOnline: true,
        avatarUrl: 'https://randomuser.me/api/portraits/women/10.jpg',
    },
    {
        id: 'uuid-student-11',
        firstName: 'Kevin',
        lastName: 'Taylor',
        role: 'student',
        isOnline: false,
        avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
    },
]

export default function ClassPage() {
    const sessionState = useSession()
    const userRole = sessionState?.user?.role || 'student'

    const [activeTab, setActiveTab] = useState('schedule')
    const [viewMode, setViewMode] = useState('week')
    const [showGradientName, setShowGradientName] = useState(false)

    // State cho search và filter của MemberList
    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [memberFilterRole, setMemberFilterRole] = useState<
        'all' | 'student' | 'teacher'
    >('all')
    // State để reset trang của MemberList khi filter/search thay đổi
    const [, setMemberListPage] = useState(0)

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const navItems = getNavItems(userRole as any, '/student/classes')
    const userMenuItems = getUserMenuItems(userRole as any)

    useEffect(() => {
        setMemberListPage(0)
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
                            // Đưa search và filter vào controls của Card
                            controls={
                                <div className={s.memberControls}>
                                    {' '}
                                    {/* Thêm class để style nếu cần */}
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
                                        uiSize="sm" // Chỉnh size nhỏ hơn
                                    />
                                    <select
                                        className={s.memberFilterSelect} // Thêm class để style nếu cần
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
                                key={`${memberSearchTerm}-${memberFilterRole}`} // Thêm key để reset state nội bộ của MemberList khi filter/search
                                members={mockClassMembers}
                                itemsPerPage={6}
                                searchTerm={memberSearchTerm} // Truyền state xuống
                                filterRole={memberFilterRole} // Truyền state xuống
                                // Nếu muốn kiểm soát page từ Class.tsx:
                                // currentPage={memberListPage}
                                // onPageChange={setMemberListPage}
                            />
                        </Card>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className={s.pageWrapper}>
            {/* Navigation với integrated menus */}
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={AvatarImg}
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
                {/* Tiêu đề trang */}
                <h1 className={s.pageTitle}>
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
                            text="IELTS 6.5"
                            typingSpeed={70}
                            loop={false}
                        />
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

                {/* Nội dung thay đổi theo Tab */}
                {renderTabContent()}
            </main>
        </div>
    )
}
