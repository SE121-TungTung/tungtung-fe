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

import { testApi } from '@/lib/test'
import type { StudentTestListItem, TestListItem } from '@/types/test.types'
import { SkillArea } from '@/types/test.types'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ExamGrid from '@/components/feature/exams/ExamGrid'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useNavigate } from 'react-router-dom'
import { useDialog } from '@/hooks/useDialog'
import { Modal } from '@/components/core/Modal'

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

    // History Modal state
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [historyTest, setHistoryTest] = useState<
        TestListItem | StudentTestListItem | null
    >(null)
    const [historyAttempts, setHistoryAttempts] = useState<any[]>([])
    const [loadingAttempts, setLoadingAttempts] = useState(false)

    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A'
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return 'N/A'
            return d.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return 'N/A'
        }
    }

    const handleHistoryClick = async (examId: string) => {
        const testItem = tests.find((t) => t.id === examId)
        if (!testItem) return

        setHistoryTest(testItem)
        setHistoryModalOpen(true)
        setLoadingAttempts(true)
        setHistoryAttempts([])
        try {
            const data = await testApi.listMyAttempts(examId)
            const sortedData = [...(data || [])].sort(
                (a, b) =>
                    new Date(b.started_at || 0).getTime() -
                    new Date(a.started_at || 0).getTime()
            )
            setHistoryAttempts(sortedData)
        } catch (error: any) {
            console.error('Failed to load my attempts:', error)
            alert('Không thể tải lịch sử làm bài: ' + (error.message || ''))
        } finally {
            setLoadingAttempts(false)
        }
    }

    const loadTests = useCallback(async () => {
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
            console.debug('[ExamPracticePage] loadTests raw data:', data)
            if (Array.isArray(data)) {
                console.debug(
                    '[ExamPracticePage] branch: array, count:',
                    data.length
                )
                setTests(data)
            } else if (data && Array.isArray(data.data)) {
                console.debug(
                    '[ExamPracticePage] branch: data.data, count:',
                    data.data.length
                )
                setTests(data.data)
            } else if (data && Array.isArray(data.tests)) {
                console.debug(
                    '[ExamPracticePage] branch: data.tests, count:',
                    data.tests.length
                )
                setTests(data.tests)
            } else if (data && Array.isArray(data.items)) {
                console.debug(
                    '[ExamPracticePage] branch: data.items, count:',
                    data.items.length
                )
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
    }, [userRole])

    useEffect(() => {
        loadTests()
    }, [loadTests])

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

    const handleGradingClick = (examId: string) => {
        navigate(`/teacher/grading/${examId}`)
    }
    const filteredExams = useMemo(() => {
        let examsToShow = tests

        console.debug('[ExamPracticePage] filteredExams recompute:', {
            testsCount: tests.length,
            contentMode,
            selectedSkill,
            firstItem: tests[0],
        })

        if (contentMode === 'skill' && selectedSkill) {
            examsToShow = tests.filter(
                (test) => (test as any).skill === selectedSkill
            )
            console.debug(
                '[ExamPracticePage] after skill filter:',
                examsToShow.length,
                'selectedSkill:',
                selectedSkill
            )
        }

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
                        <p>⚠️ {error}</p>
                        <ButtonPrimary onClick={loadTests}>
                            Thử lại
                        </ButtonPrimary>
                    </div>
                </div>
            )
        }

        if (contentMode === 'skill') {
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
                            onHistoryClick={handleHistoryClick}
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
                        onHistoryClick={handleHistoryClick}
                        onGradingClick={
                            userRole === 'teacher'
                                ? handleGradingClick
                                : undefined
                        }
                        isLoading={false}
                        viewMode="list"
                        userRole={userRole as any}
                    />
                )
            }
        }

        if (displayMode === 'grid') {
            return (
                <div className={s.examSection}>
                    <h2 className={s.sectionTitle}>Tất cả bài thi</h2>
                    <ExamGrid
                        exams={filteredExams}
                        onExamClick={handleExamClick}
                        onHistoryClick={handleHistoryClick}
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
                    onHistoryClick={handleHistoryClick}
                    onGradingClick={
                        userRole === 'teacher' ? handleGradingClick : undefined
                    }
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

            <Modal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title={`Lịch sử làm bài: ${historyTest?.title || ''}`}
            >
                {loadingAttempts ? (
                    <div className={s.modalLoading}>
                        Đang tải lịch sử làm bài...
                    </div>
                ) : historyAttempts.length === 0 ? (
                    <div className={s.modalEmpty}>
                        Bạn chưa thực hiện lượt làm bài nào cho bài thi này.
                    </div>
                ) : (
                    <div className={s.attemptsList}>
                        {historyAttempts.map((attempt, index) => {
                            const isGraded = attempt.status === 'GRADED'
                            const isInProgress =
                                attempt.status === 'IN_PROGRESS'
                            const isSubmitted = attempt.status === 'SUBMITTED'

                            return (
                                <div key={attempt.id} className={s.attemptItem}>
                                    <div className={s.attemptInfo}>
                                        <span className={s.attemptIndex}>
                                            Lần {historyAttempts.length - index}
                                        </span>
                                        <span className={s.attemptTime}>
                                            Bắt đầu:{' '}
                                            {formatDateTime(attempt.started_at)}
                                        </span>
                                    </div>
                                    <div className={s.attemptStatus}>
                                        {isGraded && (
                                            <span
                                                className={`${s.badge} ${s.badgeGraded}`}
                                            >
                                                Đã chấm
                                            </span>
                                        )}
                                        {isInProgress && (
                                            <span
                                                className={`${s.badge} ${s.badgeInProgress}`}
                                            >
                                                Đang làm
                                            </span>
                                        )}
                                        {isSubmitted && (
                                            <span
                                                className={`${s.badge} ${s.badgeSubmitted}`}
                                            >
                                                Đã nộp
                                            </span>
                                        )}
                                    </div>
                                    <div className={s.attemptScore}>
                                        {isGraded ? (
                                            <span className={s.scoreVal}>
                                                {attempt.score !== null &&
                                                attempt.score !== undefined
                                                    ? attempt.score.toFixed(1)
                                                    : '0.0'}
                                            </span>
                                        ) : (
                                            <span className={s.scorePending}>
                                                --
                                            </span>
                                        )}
                                    </div>
                                    <div className={s.attemptAction}>
                                        {isInProgress ? (
                                            <ButtonPrimary
                                                size="sm"
                                                onClick={() => {
                                                    setHistoryModalOpen(false)
                                                    navigate(
                                                        `/student/tests/${historyTest?.id}/take/${attempt.id}`
                                                    )
                                                }}
                                            >
                                                Làm tiếp
                                            </ButtonPrimary>
                                        ) : (
                                            <ButtonGhost
                                                size="sm"
                                                mode="light"
                                                onClick={() => {
                                                    setHistoryModalOpen(false)
                                                    navigate(
                                                        `/student/tests/results/${attempt.id}`
                                                    )
                                                }}
                                            >
                                                Xem kết quả
                                            </ButtonGhost>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </Modal>
        </div>
    )
}
