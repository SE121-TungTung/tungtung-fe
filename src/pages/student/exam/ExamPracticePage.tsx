import { useState, useMemo, useCallback, useEffect } from 'react'
import s from './ExamPracticePage.module.css'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
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

import { useLocation, useNavigate } from 'react-router-dom'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import { useSession } from '@/stores/session.store'

// API imports
import {
    testApi,
    // , getSkillAreaLabel
} from '@/lib/test'
import type { TestListItem } from '@/types/test.types'
import { SkillArea } from '@/types/test.types'

const viewModeItems: SegItem[] = [
    { label: 'Theo Kỹ năng', value: 'skill' },
    { label: 'Tất cả bài thi', value: 'exam' },
]

const skills = [
    {
        name: 'Nghe',
        value: SkillArea.LISTENING,
        icon: <img src={ListeningIcon} alt="Listening" />,
    },
    {
        name: 'Đọc',
        value: SkillArea.READING,
        icon: <img src={ReadingIcon} alt="Reading" />,
    },
    {
        name: 'Viết',
        value: SkillArea.WRITING,
        icon: <img src={WritingIcon} alt="Writing" />,
    },
    {
        name: 'Nói',
        value: SkillArea.SPEAKING,
        icon: <img src={SpeakingIcon} alt="Speaking" />,
    },
]

// Map TestListItem to ExamInfo
function mapTestToExamInfo(test: TestListItem): ExamInfo {
    return {
        id: test.id,
        title: test.title,
        skill: test.skill.toLowerCase() as any,
        durationMinutes: test.durationMinutes,
        questionCount: test.totalQuestions,
    }
}

export default function ExamPracticePage() {
    const sessionState = useSession()
    const userRole = sessionState?.user?.role || 'student'
    const navigate = useNavigate()
    const location = useLocation()
    const currentPath = location.pathname

    const [viewMode, setViewMode] = useState<'skill' | 'exam'>('skill')
    const [selectedSkill, setSelectedSkill] = useState<SkillArea | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [showGradientName, setShowGradientName] = useState(false)

    // API state
    const [tests, setTests] = useState<TestListItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const navItems = useMemo(
        () => getNavItems(userRole as any, currentPath, navigate),
        [userRole, currentPath, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole as any, navigate),
        [userRole, navigate]
    )

    // Load tests on mount or when filters change
    useEffect(() => {
        loadTests()
    }, [])

    const loadTests = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await testApi.listTests({
                limit: 100,
                // status: 'active' // Uncomment nếu chỉ muốn lấy active tests
            })
            setTests(data)
        } catch (err: any) {
            console.error('Failed to load tests:', err)
            setError(err.message || 'Không thể tải danh sách bài thi')
        } finally {
            setLoading(false)
        }
    }

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const handleSelectSkill = (skillValue: SkillArea) => {
        setSelectedSkill(skillValue)
        setSearchTerm('')
    }

    const handleBackFromList = () => {
        setSelectedSkill(null)
        setSearchTerm('')
    }

    const handleStartExam = async (examId: string) => {
        try {
            // Start attempt
            const attempt = await testApi.startAttempt(examId)

            // Save attempt info to localStorage
            localStorage.setItem(
                `attempt_${attempt.attemptId}`,
                JSON.stringify(attempt)
            )

            // Navigate to test taking page
            navigate(`/student/exams/${examId}/take/${attempt.attemptId}`)
        } catch (error: any) {
            console.error('Failed to start exam:', error)
            alert(error.message || 'Không thể bắt đầu bài thi')
        }
    }

    const filteredExams = useMemo(() => {
        let examsToShow = tests

        // Filter by view mode and skill
        if (viewMode === 'skill' && selectedSkill) {
            examsToShow = tests.filter((test) => test.skill === selectedSkill)
        }

        // Filter by search term
        if (searchTerm.trim()) {
            examsToShow = examsToShow.filter((test) =>
                test.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return examsToShow.map(mapTestToExamInfo)
    }, [tests, searchTerm, selectedSkill, viewMode])

    const renderContent = () => {
        if (loading) {
            return (
                <div className={s.examListContainer}>
                    <ExamListCard
                        title="Đang tải..."
                        exams={[]}
                        onStartExam={handleStartExam}
                        isLoading={true}
                    />
                </div>
            )
        }

        if (error) {
            return (
                <div className={s.examListContainer}>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: 'var(--status-danger-500-light)',
                        }}
                    >
                        <p>❌ {error}</p>
                        <button
                            onClick={loadTests}
                            style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                background: 'var(--brand-primary-light)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                            }}
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            )
        }

        if (viewMode === 'skill') {
            if (selectedSkill) {
                const skillInfo = skills.find((s) => s.value === selectedSkill)
                return (
                    <div className={s.examListContainer}>
                        <ExamListCard
                            title={`Bài thi kỹ năng: ${skillInfo?.name || ''}`}
                            exams={filteredExams}
                            onBackClick={handleBackFromList}
                            onStartExam={handleStartExam}
                            isLoading={false}
                        />
                    </div>
                )
            } else {
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
                        title="Tất cả bài thi"
                        exams={filteredExams}
                        onStartExam={handleStartExam}
                        isLoading={false}
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
