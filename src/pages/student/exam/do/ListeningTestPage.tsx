import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import s from './ReadingTestPage.module.css'

// Hooks
import { useTestTimer } from '@/hooks/useTestTimer'
import { useAnswerManager } from '@/hooks/useAnswerManager'
import { useTestSubmit } from '@/hooks/useTestSubmit'

// Components
import { AudioPlayer } from '@/components/feature/exams/AudioPlayer'

// Types & API
import { testApi } from '@/lib/test'
import {
    type Test,
    type TestSection,
    type TestSectionPart,
    type QuestionGroup,
    type Question,
} from '@/types/test.types'

// Reuse components from Reading
import { TestHeader } from '@/components/feature/exams/shared/TextHeader'
import { TestFooter } from '@/components/feature/exams/shared/TextFooter'
import { enhanceTestWithQuestionNumbers } from '@/utils/examHelpers'
import { QuestionGroupRenderer } from '../QuestionGroupRenderer'

// Or define types locally if not exported
interface EnhancedQuestion extends Question {
    globalNumber: number
}

interface EnhancedQuestionGroup extends Omit<QuestionGroup, 'questions'> {
    questions: EnhancedQuestion[]
}

interface EnhancedPart extends Omit<TestSectionPart, 'questionGroups'> {
    questionGroups: EnhancedQuestionGroup[]
}

interface EnhancedSection extends Omit<TestSection, 'parts'> {
    parts: EnhancedPart[]
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ListeningTestPage() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()

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

    const questionElementRefs = useRef<Map<string, HTMLElement | null>>(
        new Map()
    )

    // Custom Hooks
    const { answers, handleAnswerChange, clearAnswers } = useAnswerManager({
        attemptId: attemptId || '',
        enabled: !!attemptId && !testFinished,
    })

    const { submit, isSubmitting } = useTestSubmit({
        attemptId: attemptId || '',
        onSuccess: () => {
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

    // Initialize data
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

                setStartTime(attemptStartTime)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        initData()
    }, [testId, attemptId])

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

    const handleFinalSubmit = useCallback(async () => {
        if (window.confirm('Are you sure you want to submit?')) {
            await submit(answers)
        }
    }, [answers, submit])

    if (isLoading) return <div className={s.loadingContainer}>Loading...</div>
    if (!sections.length) return <div>No content.</div>

    const currentSection = sections[currentSectionIndex]
    const audioUrl =
        currentSection.parts.find((p) => p.audioUrl)?.audioUrl || null

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <TestHeader
                skillName="IELTS Listening"
                icon="🎧"
                timeLeft={timeLeft}
                formattedTime={formattedTime}
                isLowTime={isLowTime}
            />

            <main className={s.mainContent}>
                <AudioPlayer audioUrl={audioUrl} showTranscript={false} />

                {/* Reuse QuestionGroupRenderer */}
                <QuestionGroupRenderer
                    section={currentSection}
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
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
