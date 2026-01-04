import { useState, useMemo, useCallback, useEffect } from 'react'
import s from './ExamPracticePage.module.css'

import TextType from '@/components/common/text/TextType'
import SegmentedControl, {
    type SegItem,
} from '@/components/common/menu/SegmentedControl'
import InputField from '@/components/common/input/InputField'
import SkillCard from '@/components/common/card/SkillCard'
import ExamListCard from './ExamListCard'

import SearchIcon from '@/assets/Action Eye Tracking.svg'
import ListeningIcon from '@/assets/Action Ear Normal.svg'
import ReadingIcon from '@/assets/Book Open.svg'
import WritingIcon from '@/assets/Edit Pen.svg'
import SpeakingIcon from '@/assets/Microphone.svg'
import BackIcon from '@/assets/arrow-left.svg'

import { useSession } from '@/stores/session.store'

// API imports
import {
    testApi,
    // , getSkillAreaLabel
} from '@/lib/test'
import type { StudentTestListItem, TestListItem } from '@/types/test.types'
import { SkillArea } from '@/types/test.types'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ExamGrid from '@/components/feature/exams/ExamGrid'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useNavigate } from 'react-router-dom'
import { useDialog } from '@/hooks/useDialog'

const contentModeItems: SegItem[] = [
    { label: 'Theo Kỹ năng', value: 'skill' },
    { label: 'Tất cả bài thi', value: 'all' },
]

const displayModeItems: SegItem[] = [
    { label: 'Lưới', value: 'grid' },
    { label: 'Danh sách', value: 'list' },
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

export default function ExamPracticePage() {
    const sessionState = useSession()
    const userRole = sessionState?.user?.role || 'student'
    const navigate = useNavigate()
    const { alert } = useDialog()

    const [contentMode, setContentMode] = useState<'skill' | 'all'>('skill')
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid')
    const [selectedSkill, setSelectedSkill] = useState<SkillArea | null>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const [showGradientName, setShowGradientName] = useState(false)

    // API state
    const [tests, setTests] = useState<TestListItem[] | StudentTestListItem[]>(
        []
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadTests = async () => {
        setLoading(true)
        setError(null)
        try {
            let data: any
            if (userRole === 'student') {
                data = await testApi.listStudentTests({
                    limit: 100,
                })
            } else {
                data = await testApi.listTests({
                    limit: 100,
                })
            }
            if (Array.isArray(data)) {
                setTests(data)
            } else if (data && Array.isArray(data.tests)) {
                setTests(data.tests)
            } else if (data && Array.isArray(data.items)) {
                setTests(data.items)
            } else {
                console.warn('Unexpected API response structure:', data)
                setTests([])
            }
        } catch (err: any) {
            console.error('Failed to load tests:', err)
            setError(err.message || 'Không thể tải danh sách bài thi')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTests()
    }, [])

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

    const handleExamClick = async (examId: string) => {
        if (userRole === 'student') {
            try {
                const attempt = await testApi.startAttempt(examId)
                localStorage.setItem(
                    `attempt_${attempt.attemptId}`,
                    JSON.stringify(attempt)
                )
                navigate(`/student/tests/${examId}/take/${attempt.attemptId}`)
            } catch (error: any) {
                console.error('Failed to start exam:', error)
                alert(error.message || 'Không thể bắt đầu bài thi')
            }
        } else {
            navigate(`/teacher/tests/${examId}/view`)
        }
    }

    const filteredExams = useMemo(() => {
        let examsToShow = tests

        // Filter by content mode and skill
        if (contentMode === 'skill' && selectedSkill) {
            examsToShow = tests.filter((test) => {
                if ('skill' in test) {
                    return test.skill === selectedSkill
                }
                return false
            })
        }

        // Filter by search term
        if (searchTerm.trim()) {
            examsToShow = examsToShow.filter((test) =>
                test.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        return examsToShow
    }, [tests, searchTerm, selectedSkill, contentMode])

    const renderContent = () => {
        if (loading) {
            return (
                <div className={s.examListContainer}>
                    <div className={s.loadingState}>Đang tải danh sách...</div>
                </div>
            )
        }

        if (error) {
            return (
                <div className={s.examListContainer}>
                    <div className={s.errorState}>
                        <p>⚠ {error}</p>
                        <ButtonPrimary onClick={loadTests}>
                            Thử lại
                        </ButtonPrimary>
                    </div>
                </div>
            )
        }

        // Mode 1: Theo Kỹ năng
        if (contentMode === 'skill') {
            // Chưa chọn skill → Hiện skill cards
            if (selectedSkill === null) {
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

            // Đã chọn skill → Hiện exams theo displayMode
            const skillInfo = skills.find((s) => s.value === selectedSkill)
            const title = `Bài thi kỹ năng: ${skillInfo?.name || ''}`

            if (displayMode === 'grid') {
                return (
                    <div className={s.examSection}>
                        <div className={s.sectionHeader}>
                            <h2 className={s.sectionTitle}>{title}</h2>
                            <ButtonGhost
                                size="sm"
                                mode="light"
                                leftIcon={<img src={BackIcon} alt="back" />}
                                onClick={handleBackFromList}
                            >
                                Quay lại
                            </ButtonGhost>
                        </div>
                        <ExamGrid
                            exams={filteredExams}
                            onExamClick={handleExamClick}
                            userRole={userRole as any}
                        />
                    </div>
                )
            } else {
                return (
                    <ExamListCard
                        title={title}
                        exams={filteredExams}
                        onBackClick={handleBackFromList}
                        onExamClick={handleExamClick}
                        isLoading={false}
                        viewMode="list"
                        userRole={userRole as any}
                    />
                )
            }
        }

        // Mode 2: Tất cả đề thi
        if (displayMode === 'grid') {
            return (
                <div className={s.examSection}>
                    <h2 className={s.sectionTitle}>Tất cả bài thi</h2>
                    <ExamGrid
                        exams={filteredExams}
                        onExamClick={handleExamClick}
                        userRole={userRole as any}
                    />
                </div>
            )
        } else {
            return (
                <ExamListCard
                    title="Tất cả bài thi"
                    exams={filteredExams}
                    onExamClick={handleExamClick}
                    isLoading={false}
                    viewMode="list"
                    userRole={userRole as any}
                />
            )
        }
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
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
                    {/* Search - chỉ hiện khi đang xem danh sách đề */}
                    {(selectedSkill !== null || contentMode === 'all') && (
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

                    <div className={s.viewControls}>
                        {/* Content Mode: Theo Kỹ năng | Tất cả */}
                        <SegmentedControl
                            items={contentModeItems}
                            value={contentMode}
                            onChange={(value) => {
                                setContentMode(value as 'skill' | 'all')
                                setSelectedSkill(null)
                                setSearchTerm('')
                            }}
                            size="sm"
                        />

                        {/* Display Mode: Lưới | Danh sách - chỉ hiện khi đang xem list đề */}
                        {(selectedSkill !== null || contentMode === 'all') && (
                            <SegmentedControl
                                items={displayModeItems}
                                value={displayMode}
                                onChange={(value) =>
                                    setDisplayMode(value as 'grid' | 'list')
                                }
                                size="sm"
                            />
                        )}
                    </div>
                </div>

                <div className={s.contentArea}>{renderContent()}</div>
            </main>
        </div>
    )
}
