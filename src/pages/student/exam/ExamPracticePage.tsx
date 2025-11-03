import { useState, useMemo, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom'
import s from './ExamPracticePage.module.css'

import NavigationMenu, {
    type NavItem,
} from '@/components/common/menu/NavigationMenu'
import TextType from '@/components/common/text/TextType'
import SegmentedControl, {
    type SegItem,
} from '@/components/common/menu/SegmentedControl'
import InputField from '@/components/common/input/InputField'
import SkillCard from '@/components/common/card/SkillCard'
import ExamListCard from './ExamListCard'
import type { ExamInfo } from '@/components/common/list/ExamItem'

import AvatarPlaceholder from '@/assets/avatar-placeholder.png'
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import ListeningIcon from '@/assets/Action Ear Normal.svg'
import ReadingIcon from '@/assets/Book Open.svg'
import WritingIcon from '@/assets/Edit Pen.svg'
import SpeakingIcon from '@/assets/Microphone.svg'
import ClassIcon from '@/assets/Book 2.svg'
import ExamIcon from '@/assets/Card Question.svg'
import RoadmapIcon from '@/assets/Merge.svg'

import type { SideMenuItem } from '@/components/common/menu/SideMenuSet'

const mockExams: ExamInfo[] = [
    {
        id: 'l1',
        title: 'IELTS Listening Practice Test 1',
        skill: 'listening',
        durationMinutes: 30,
        questionCount: 40,
    },
    {
        id: 'l2',
        title: 'TOEIC Listening Part 3 Simulation',
        skill: 'listening',
        durationMinutes: 25,
        questionCount: 39,
    },
    {
        id: 'r1',
        title: 'IELTS Reading Academic Test 1',
        skill: 'reading',
        durationMinutes: 60,
        questionCount: 40,
    },
    {
        id: 'r2',
        title: 'TOEFL Reading Passage Practice',
        skill: 'reading',
        durationMinutes: 20,
        questionCount: 10,
    },
    {
        id: 'w1',
        title: 'IELTS Writing Task 1 (Academic)',
        skill: 'writing',
        durationMinutes: 20,
        questionCount: 1,
    },
    {
        id: 'w2',
        title: 'IELTS Writing Task 2: Opinion Essay',
        skill: 'writing',
        durationMinutes: 40,
        questionCount: 1,
    },
    {
        id: 's1',
        title: 'IELTS Speaking Part 1 Practice',
        skill: 'speaking',
        durationMinutes: 5,
        questionCount: 10,
    },
    {
        id: 'f1',
        title: 'Full IELTS Academic Mock Test 1',
        skill: 'full',
        durationMinutes: 165,
        questionCount: 91,
    },
    {
        id: 'f2',
        title: 'Full Mock Test by British Council',
        skill: 'full',
        durationMinutes: 120,
        questionCount: 200,
    },
]

const viewModeItems: SegItem[] = [
    { label: 'Theo Kỹ năng', value: 'skill' },
    { label: 'Theo Bài thi', value: 'exam' },
]

const skills = [
    {
        name: 'Nghe',
        value: 'listening',
        icon: <img src={ListeningIcon} alt="Listening" />,
    },
    {
        name: 'Đọc',
        value: 'reading',
        icon: <img src={ReadingIcon} alt="Reading" />,
    },
    {
        name: 'Viết',
        value: 'writing',
        icon: <img src={WritingIcon} alt="Writing" />,
    },
    {
        name: 'Nói',
        value: 'speaking',
        icon: <img src={SpeakingIcon} alt="Speaking" />,
    },
]

const userMenuItems: SideMenuItem[] = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'settings', label: 'Cài đặt' },
    { id: 'help', label: 'Trợ giúp' },
    { id: 'logout', label: 'Đăng xuất' },
]

const studyMenuItems: SideMenuItem[] = [
    { id: 'classes', label: 'Lớp học', icon: <img src={ClassIcon} /> },
    { id: 'exams', label: 'Luyện thi', icon: <img src={ExamIcon} /> },
    { id: 'roadmap', label: 'Lộ trình', icon: <img src={RoadmapIcon} /> },
]

export default function ExamPracticePage() {
    // const navigate = useNavigate()
    const [viewMode, setViewMode] = useState<'skill' | 'exam'>('skill')
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showGradientName, setShowGradientName] = useState(false) // For title animation

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const handleSelectSkill = (skillValue: string) => {
        setSelectedSkill(skillValue)
        setSearchTerm('') // Reset search khi chọn kỹ năng mới
    }

    const handleBackFromList = () => {
        setSelectedSkill(null)
        setSearchTerm('') // Reset search khi quay lại
    }

    const handleStartExam = (examId: string) => {
        console.log(`Starting exam: ${examId}`)
        // Điều hướng đến trang làm bài thi
        // Ví dụ: navigate(`/student/exams/${examId}/do`);
        alert(`Bắt đầu bài thi ID: ${examId}`)
    }

    const navItems: NavItem[] = [
        {
            id: '1',
            label: 'Dashboard',
            href: '/student/dashboard',
        },
        {
            id: '2',
            label: 'Học tập',
            href: '/student/schedule',
            active: true,
            dropdownItems: studyMenuItems,
        },
        {
            id: '3',
            label: 'Thông báo',
            href: '#',
        },
        {
            id: '4',
            label: 'Tin nhắn',
            href: '#',
        },
    ]

    // Lọc danh sách bài thi dựa trên searchTerm và selectedSkill/viewMode
    const filteredExams = useMemo(() => {
        let examsToShow = mockExams

        if (viewMode === 'skill' && selectedSkill) {
            examsToShow = mockExams.filter(
                (exam) => exam.skill === selectedSkill
            )
        } else if (viewMode === 'exam') {
            // Lấy các bài full test (skill === 'full')
            // Hoặc tất cả nếu bạn muốn tìm kiếm trên tất cả? Tạm lấy full test.
            examsToShow = mockExams.filter((exam) => exam.skill === 'full')
        } else {
            // Khi ở view chọn kỹ năng, danh sách lọc sẽ áp dụng cho lần xem chi tiết
            // Hoặc nếu search bar ở ngoài, nó sẽ lọc gì? Tạm thời chỉ lọc khi ở list view.
            examsToShow = [] // Không hiển thị list khi đang chọn skill
        }

        if (searchTerm) {
            return examsToShow.filter((exam) =>
                exam.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return examsToShow
    }, [searchTerm, selectedSkill, viewMode])

    // Render nội dung chính dựa trên state
    const renderContent = () => {
        if (viewMode === 'skill') {
            if (selectedSkill) {
                // Hiển thị danh sách bài thi cho kỹ năng đã chọn
                const skillInfo = skills.find((s) => s.value === selectedSkill)
                return (
                    <div className={s.examListContainer}>
                        <ExamListCard
                            title={`Bài thi kỹ năng: ${skillInfo?.name || ''}`}
                            exams={filteredExams}
                            onBackClick={handleBackFromList}
                            onStartExam={handleStartExam}
                        />
                    </div>
                )
            } else {
                // Hiển thị 4 thẻ kỹ năng
                return (
                    <div className={s.skillGrid}>
                        {skills.map((skill) => (
                            <SkillCard
                                key={skill.value}
                                skillName={skill.name}
                                icon={skill.icon}
                                onClick={() => handleSelectSkill(skill.value)}
                            />
                        ))}
                    </div>
                )
            }
        } else {
            return (
                <div className={s.examListContainer}>
                    <ExamListCard
                        title="Danh sách bài thi đầy đủ"
                        exams={filteredExams}
                        onStartExam={handleStartExam}
                    />
                </div>
            )
        }
    }

    return (
        <div className={s.pageWrapper}>
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={AvatarPlaceholder}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    <TextType
                        text="Luyện thi "
                        typingSpeed={50}
                        loop={false}
                        showCursor={!showGradientName}
                        onSentenceComplete={handleGreetingComplete}
                    />
                    {showGradientName && (
                        <TextType
                            as="span"
                            className={s.gradientText}
                            text="IELTS"
                            typingSpeed={70}
                            loop={false}
                        />
                    )}
                </h1>

                <div className={s.controlsBar}>
                    {(selectedSkill !== null || viewMode === 'exam') && (
                        <div className={s.searchWrapper}>
                            <InputField
                                placeholder="Tìm kiếm bài thi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                leftIcon={<img src={SearchIcon} alt="search" />}
                                variant="soft"
                                mode="light"
                                uiSize="sm"
                            />
                        </div>
                    )}
                    <div
                        className={s.viewModeControl}
                        style={{
                            marginLeft:
                                selectedSkill === null && viewMode === 'skill'
                                    ? 'auto'
                                    : '0',
                        }}
                    >
                        <SegmentedControl
                            items={viewModeItems}
                            value={viewMode}
                            onChange={(value) => {
                                setViewMode(value as 'skill' | 'exam')
                                setSelectedSkill(null)
                                setSearchTerm('')
                            }}
                            size="sm"
                        />
                    </div>
                </div>

                <div className={s.contentArea}>{renderContent()}</div>
            </main>
        </div>
    )
}
