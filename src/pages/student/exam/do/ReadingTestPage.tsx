import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import s from './ReadingTestPage.module.css'

// --- Libs & Types ---
import { testApi } from '@/lib/test'
import { type Test } from '@/types/test.types'

// --- Hooks ---
import { useTestTimer } from '@/hooks/useTestTimer'
import { useAnswerManager } from '@/hooks/useAnswerManager'
import { useTestSubmit } from '@/hooks/useTestSubmit'

// --- Components ---
import { TestHeader } from '@/components/feature/exams/shared/TextHeader'
import { PassageViewer } from '@/components/feature/exams/MediaViewers/PassageViewer'
import { TestFooter } from '@/components/feature/exams/shared/TextFooter'

// --- Import QuestionGroupRenderer từ file riêng ---
import {
    QuestionGroupRenderer,
    type EnhancedSection,
} from '../QuestionGroupRenderer'

// --- Utils ---
import { enhanceTestWithQuestionNumbers } from '@/utils/examHelpers'

// ============================================
// MAIN COMPONENT
// ============================================
export default function ReadingTestPage() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()

    // --- STATE ---
    const [sections, setSections] = useState<EnhancedSection[]>([])
    const [test, setTest] = useState<Test | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
    const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(
        new Set()
    )
    const [testFinished, setTestFinished] = useState(false)
    const [startTime, setStartTime] = useState('')

    // --- REFS ---
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

    // --- INITIALIZE DATA ---
    useEffect(() => {
        const initData = async () => {
            if (!testId || !attemptId) return

            try {
                const testData = await testApi.getTest(testId)
                setTest(testData)

                const enhanced = enhanceTestWithQuestionNumbers(testData)
                setSections(enhanced.sections)

                // Get start time
                const attemptDataStr = localStorage.getItem(
                    `attempt_${attemptId}`
                )
                const attemptStartTime = attemptDataStr
                    ? JSON.parse(attemptDataStr).startedAt
                    : new Date().toISOString()

                setStartTime(attemptStartTime)
            } catch (err) {
                console.error(err)
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

    const handleFinalSubmit = useCallback(
        async (isTimeout = false) => {
            if (isTimeout) {
                console.log('Time is up! Auto-submitting...')
            }

            if (window.confirm('Are you sure you want to submit?')) {
                await submit(answers)
            }
        },
        [answers, submit]
    )

    const handleNavigateQuestion = useCallback(
        (qNum: number) => {
            setCurrentQuestionNumber(qNum)

            let targetId: string | undefined
            const sectionIdx = sections.findIndex((s) =>
                s.parts.some((p) =>
                    p.questionGroups.some((g) =>
                        g.questions.some((q) => {
                            if (q.globalNumber === qNum) {
                                targetId = q.id
                                return true
                            }
                            return false
                        })
                    )
                )
            )

            if (sectionIdx !== -1) setCurrentSectionIndex(sectionIdx)

            setTimeout(() => {
                const el = targetId
                    ? questionElementRefs.current.get(targetId)
                    : null
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 100)
        },
        [sections]
    )

    // --- RENDER ---
    if (isLoading) {
        return <div className={s.loadingContainer}>Loading...</div>
    }

    if (!sections.length) {
        return <div>No content.</div>
    }

    const currentSection = sections[currentSectionIndex]
    const currentPassage =
        currentSection?.parts.find((p: any) => p.passage)?.passage || null

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <TestHeader
                skillName="IELTS Academic Reading"
                icon="📖"
                timeLeft={timeLeft}
                formattedTime={formattedTime}
                isLowTime={isLowTime}
            />

            <main className={s.mainContent}>
                <PassageViewer
                    passage={currentPassage}
                    sectionId={sections[currentSectionIndex].id}
                    testId={testId!}
                    clearHighlightsRef={clearHighlightsRef}
                />

                {/* Sử dụng QuestionGroupRenderer đã tách */}
                <QuestionGroupRenderer
                    section={sections[currentSectionIndex]}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={(id, el) =>
                        el
                            ? questionElementRefs.current.set(id, el)
                            : questionElementRefs.current.delete(id)
                    }
                    attemptId={attemptId!}
                />
            </main>

            <TestFooter
                sections={sections}
                currentIndex={currentSectionIndex}
                onSectionChange={setCurrentSectionIndex}
                currentQNum={currentQuestionNumber}
                reviewed={reviewedQuestions}
                answers={answers}
                onNav={handleNavigateQuestion}
                onToggleReview={(num: any) =>
                    setReviewedQuestions((prev) => {
                        const next = new Set(prev)
                        if (next.has(num)) {
                            next.delete(num)
                        } else {
                            next.add(num)
                        }
                        return next
                    })
                }
                onSubmit={() => {
                    if (window.confirm('Submit test?')) {
                        handleFinalSubmit()
                    }
                }}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
