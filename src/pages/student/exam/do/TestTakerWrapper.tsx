import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import s from './TestTakerWrapper.module.css'

import { testApi } from '@/lib/test'
import { type Test, SkillArea } from '@/types/test.types'
import { enhanceTestWithQuestionNumbers } from '@/utils/examHelpers'

// Hooks
import { useTestTimer } from '@/hooks/useTestTimer'
import { useAnswerManager } from '@/hooks/useAnswerManager'
import { useTestSubmit } from '@/hooks/useTestSubmit'

// Shared Components
import { TestHeader } from '@/components/feature/exams/shared/TextHeader'
import { TestFooter } from '@/components/feature/exams/shared/TextFooter'

// Section Views
import ListeningSectionView from './views/ListeningSectionView'
import ReadingSectionView from './views/ReadingSectionView'
import WritingSectionView from './views/WritingSectionView'
import SpeakingSectionView from './views/SpeakingSectionView'

// Types
import type { EnhancedSection } from '../QuestionGroupRenderer'
import { useDialog } from '@/hooks/useDialog'

// ============================================
// MAIN WRAPPER COMPONENT
// ============================================
export default function TestTakerWrapper() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()
    const navigate = useNavigate()
    const { confirm: showConfirm } = useDialog()

    // --- STATE MANAGEMENT ---
    const [test, setTest] = useState<Test | null>(null)
    const [sections, setSections] = useState<EnhancedSection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [currentPartIndex, setCurrentPartIndex] = useState(0)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
    const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(
        new Set()
    )
    const [testFinished, setTestFinished] = useState(false)
    const [startTime, setStartTime] = useState('')

    // Refs for question navigation & highlights
    const questionElementRefs = useRef<Map<string, HTMLElement | null>>(
        new Map()
    )
    const clearHighlightsRef = useRef<(() => void) | null>(null)

    // --- HOOKS ---
    const { answers, handleAnswerChange, clearAnswers } = useAnswerManager({
        attemptId: attemptId || '',
        enabled: !!attemptId && !testFinished,
    })

    const { submit, isSubmitting } = useTestSubmit({
        attemptId: attemptId || '',
        onSuccess: () => {
            clearHighlightsRef.current?.()
            clearAnswers()
            setTestFinished(true)
            navigate(`/student/tests/results/${attemptId}`)
        },
    })

    const { timeLeft, formattedTime, isLowTime } = useTestTimer({
        startTime,
        timeLimitMinutes: test?.timeLimitMinutes || null,
        onTimeout: () => {
            setTestFinished(true)
            submit(answers)
        },
        enabled: !!startTime && !testFinished && !isSubmitting,
    })

    // --- DATA INITIALIZATION ---
    useEffect(() => {
        const initData = async () => {
            if (!testId || !attemptId) return

            try {
                const testData = await testApi.getTest(testId)
                setTest(testData)

                const enhanced = enhanceTestWithQuestionNumbers(testData)
                setSections(enhanced.sections)

                const attemptDataStr = localStorage.getItem(
                    `attempt_${attemptId}`
                )
                const attemptStartTime = attemptDataStr
                    ? JSON.parse(attemptDataStr).startedAt
                    : new Date().toISOString()

                if (!attemptDataStr) {
                    localStorage.setItem(
                        `attempt_${attemptId}`,
                        JSON.stringify({
                            attemptId,
                            testId,
                            startedAt: attemptStartTime,
                        })
                    )
                }

                setStartTime(attemptStartTime)
            } catch (err) {
                console.error('Error loading test:', err)
            } finally {
                setIsLoading(false)
            }
        }

        initData()
    }, [testId, attemptId])

    // --- HANDLERS ---
    const onAnswerChange = useCallback(
        (id: string, val: any) => {
            if (testFinished) return
            handleAnswerChange(id, val)
        },
        [testFinished, handleAnswerChange]
    )

    const handleNavigateQuestion = useCallback(
        (qNum: number) => {
            setCurrentQuestionNumber(qNum)

            // Tìm section, part và question ID
            let targetId: string | undefined
            let foundSectionIdx = -1
            let foundPartIdx = -1

            sections.forEach((section, sIdx) => {
                section.parts.forEach((part, pIdx) => {
                    part.questionGroups.forEach((group) => {
                        group.questions.forEach((q) => {
                            if (q.globalNumber === qNum) {
                                targetId = q.id
                                foundSectionIdx = sIdx
                                foundPartIdx = pIdx
                            }
                        })
                    })
                })
            })

            if (foundSectionIdx !== -1) {
                setCurrentSectionIndex(foundSectionIdx)
                setCurrentPartIndex(foundPartIdx)
            }

            // Scroll to question
            setTimeout(() => {
                const el = targetId
                    ? questionElementRefs.current.get(targetId)
                    : null
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
        },
        [sections]
    )

    const handleFinalSubmit = useCallback(async () => {
        if (await showConfirm('Are you sure you want to submit your test?')) {
            await submit(answers)
        }
    }, [answers, submit])

    const handleToggleReview = useCallback((num: number) => {
        setReviewedQuestions((prev) => {
            const next = new Set(prev)
            if (next.has(num)) {
                next.delete(num)
            } else {
                next.add(num)
            }
            return next
        })
    }, [])

    const handleSectionChange = useCallback(
        (index: number) => {
            setCurrentSectionIndex(index)
            setCurrentPartIndex(0) // ✅ Reset về Part đầu tiên khi đổi Section

            // Reset question number về câu đầu tiên của section mới
            const firstQuestion =
                sections[index]?.parts[0]?.questionGroups[0]?.questions[0]
            if (firstQuestion) {
                setCurrentQuestionNumber(firstQuestion.globalNumber)
            }
        },
        [sections]
    )

    // ✅ Handler chuyển Part
    const handlePartChange = useCallback(
        (index: number) => {
            setCurrentPartIndex(index)

            // Reset question number về câu đầu tiên của part mới
            const currentSection = sections[currentSectionIndex]
            const firstQuestion =
                currentSection?.parts[index]?.questionGroups[0]?.questions[0]
            if (firstQuestion) {
                setCurrentQuestionNumber(firstQuestion.globalNumber)
            }
        },
        [sections, currentSectionIndex]
    )

    // --- RENDER SECTION VIEW ---
    const renderSectionView = () => {
        const currentSection = sections[currentSectionIndex]
        if (!currentSection) return null

        // ✅ Truyền currentPart thay vì toàn bộ section
        const currentPart = currentSection.parts[currentPartIndex]
        if (!currentPart) return null

        // Tạo section tạm chỉ chứa part hiện tại
        const sectionWithCurrentPart: EnhancedSection = {
            ...currentSection,
            parts: [currentPart],
        }

        const commonProps = {
            section: sectionWithCurrentPart,
            answers,
            onAnswerChange,
            registerRef: (id: string, el: HTMLElement | null) =>
                el
                    ? questionElementRefs.current.set(id, el)
                    : questionElementRefs.current.delete(id),
            attemptId: attemptId!,
            testId: testId!,
        }

        switch (currentSection.skillArea) {
            case SkillArea.LISTENING:
                return (
                    <ListeningSectionView
                        {...commonProps}
                        clearHighlightsRef={clearHighlightsRef}
                    />
                )

            case SkillArea.READING:
                return (
                    <ReadingSectionView
                        {...commonProps}
                        clearHighlightsRef={clearHighlightsRef}
                    />
                )

            case SkillArea.WRITING:
                return <WritingSectionView {...commonProps} />

            case SkillArea.SPEAKING:
                return (
                    <SpeakingSectionView
                        {...commonProps}
                        partIndex={currentPartIndex}
                    />
                )

            default:
                return (
                    <div className={s.errorContainer}>
                        <p>
                            Unsupported skill area: {currentSection.skillArea}
                        </p>
                    </div>
                )
        }
    }

    // --- LOADING STATE ---
    if (isLoading) {
        return (
            <div className={s.loadingContainer}>
                <div className={s.loadingSpinner}></div>
                <p>Loading test...</p>
            </div>
        )
    }

    // --- ERROR STATE ---
    if (!test || !sections.length) {
        return (
            <div className={s.errorContainer}>
                <p>No test data available</p>
            </div>
        )
    }

    const currentSection = sections[currentSectionIndex]
    const skillName = currentSection?.skillArea || test.title

    // Skill icons
    const skillIcons: Record<SkillArea, string> = {
        [SkillArea.LISTENING]: '🎧',
        [SkillArea.READING]: '📖',
        [SkillArea.WRITING]: '✍️',
        [SkillArea.SPEAKING]: '🎤',
        [SkillArea.GRAMMAR]: '',
        [SkillArea.VOCABULARY]: '',
        [SkillArea.PRONUNCIATION]: '',
    }

    // --- MAIN RENDER ---
    return (
        <div className={`${s.pageWrapper} lightMode`}>
            {/* Header */}
            <TestHeader
                skillName={`IELTS ${skillName}`}
                icon={
                    skillIcons[currentSection?.skillArea as SkillArea] || '📝'
                }
                timeLeft={timeLeft}
                formattedTime={formattedTime}
                isLowTime={isLowTime}
            />

            {/* Main Content */}
            <div className={s.contentWrapper}>{renderSectionView()}</div>

            {/* Footer */}
            <TestFooter
                sections={sections}
                currentIndex={currentSectionIndex}
                onSectionChange={handleSectionChange}
                currentPartIndex={currentPartIndex}
                onPartChange={handlePartChange}
                currentQNum={currentQuestionNumber}
                reviewed={reviewedQuestions}
                answers={answers}
                onNav={handleNavigateQuestion}
                onToggleReview={handleToggleReview}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
                hideReviewButton={
                    currentSection?.skillArea === SkillArea.SPEAKING ||
                    currentSection?.skillArea === SkillArea.WRITING
                }
            />
        </div>
    )
}
