import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import s from './ReadingTestPage.module.css'

// --- Components ---
import SentenceCompletionQuestion from '@/components/feature/exams/SentenceCompletionQuestion'
import TrueFalseNotGivenQuestion from '@/components/feature/exams/TrueFalseNotGivenQuestion'
import MultipleChoiceQuestion from '@/components/feature/exams/MultipleChoiceQuestion'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import { EssayQuestion } from '@/components/feature/exams/EssayQuestion'

// --- Libs & Types ---
import { testApi } from '@/lib/test'
import {
    type Test,
    type TestSection,
    type TestSectionPart,
    type QuestionGroup,
    type Question,
    QuestionType,
} from '@/types/test.types'

import { useTestTimer } from '@/hooks/useTestTimer'
import { useAnswerManager } from '@/hooks/useAnswerManager'
import { useTestSubmit } from '@/hooks/useTestSubmit'
import { TestHeader } from '@/components/feature/exams/shared/TextHeader'
import { PassageViewer } from '@/components/feature/exams/MediaViewers/PassageViewer'
import { TestFooter } from '@/components/feature/exams/shared/TextFooter'
import { enhanceTestWithQuestionNumbers } from '@/utils/examHelpers'

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

const UniversalQuestionRenderer = React.memo(
    ({
        group,
        answers,
        onAnswerChange,
        registerRef,
        attemptId,
    }: {
        group: EnhancedQuestionGroup
        answers: { [key: string]: any }
        onAnswerChange: (id: string, val: any) => void
        registerRef: (id: string, el: HTMLElement | null) => void
        attemptId: string
    }) => {
        return (
            <>
                {group.questions.map((q) => {
                    const commonProps = {
                        key: q.id,
                        question: { ...q, number: q.globalNumber } as any,
                        registerRef: registerRef,
                    }

                    switch (q.questionType) {
                        case QuestionType.TRUE_FALSE_NOT_GIVEN:
                            return (
                                <TrueFalseNotGivenQuestion
                                    {...commonProps}
                                    selectedValue={answers[q.id] || null}
                                    onChange={(v) => onAnswerChange(q.id, v)}
                                />
                            )
                        case QuestionType.MULTIPLE_CHOICE:
                            return (
                                <MultipleChoiceQuestion
                                    {...commonProps}
                                    selectedValue={
                                        answers[q.id]
                                            ? String(answers[q.id])
                                            : null
                                    }
                                    onChange={(v) => onAnswerChange(q.id, v)}
                                />
                            )
                        case QuestionType.SHORT_ANSWER:
                        case QuestionType.SENTENCE_COMPLETION:
                            return (
                                <SentenceCompletionQuestion
                                    {...commonProps}
                                    value={answers[q.id] || ''}
                                    onChange={(v) => onAnswerChange(q.id, v)}
                                />
                            )
                        case QuestionType.WRITING_TASK_1:
                        case QuestionType.WRITING_TASK_2:
                            return (
                                <EssayQuestion
                                    key={q.id}
                                    questionId={q.id}
                                    questionNumber={q.globalNumber}
                                    questionText={q.questionText || ''}
                                    value={answers[q.id] || ''}
                                    onChange={(v: any) =>
                                        onAnswerChange(q.id, v)
                                    }
                                    registerRef={registerRef}
                                />
                            )
                        case QuestionType.SPEAKING_PART_1:
                        case QuestionType.SPEAKING_PART_2:
                        case QuestionType.SPEAKING_PART_3:
                            return (
                                <SpeakingQuestion
                                    key={q.id}
                                    questionId={q.id}
                                    globalNumber={q.globalNumber}
                                    questionText={q.questionText || ''}
                                    attemptId={attemptId}
                                    registerRef={registerRef}
                                />
                            )
                        default:
                            return (
                                <div
                                    key={q.id}
                                    className="p-2 text-sm text-gray-400"
                                >
                                    Type {q.questionType} not supported
                                </div>
                            )
                    }
                })}
            </>
        )
    }
)

const QuestionGroupRenderer = React.memo(
    ({
        section,
        answers,
        onAnswerChange,
        registerRef,
        attemptId,
    }: {
        section: EnhancedSection
        answers: { [key: string]: any }
        onAnswerChange: (id: string, val: any) => void
        registerRef: (id: string, el: HTMLElement | null) => void
        attemptId: string
    }) => (
        <div className={s.questionContainer}>
            <div className={s.questionScrollArea}>
                {section.parts.map((part) => (
                    <React.Fragment key={part.id}>
                        {part.instructions && (
                            <div className={s.partInstructions}>
                                {part.instructions}
                            </div>
                        )}
                        {part.audioUrl && (
                            <audio
                                src={part.audioUrl}
                                controls
                                className={s.partAudio}
                            />
                        )}
                        {part.imageUrl && (
                            <img
                                src={part.imageUrl}
                                alt="Visual"
                                className={s.partImage}
                            />
                        )}

                        {part.questionGroups.map((group) => (
                            <div
                                key={group.id}
                                className={s.questionGroupBlock}
                            >
                                {group.instructions && (
                                    <div className={s.questionInstruction}>
                                        {group.instructions}
                                    </div>
                                )}
                                {group.imageUrl && (
                                    <img
                                        src={group.imageUrl}
                                        alt="Group visual"
                                        className={s.groupImage}
                                    />
                                )}
                                <UniversalQuestionRenderer
                                    group={group}
                                    answers={answers}
                                    onAnswerChange={onAnswerChange}
                                    registerRef={registerRef}
                                    attemptId={attemptId}
                                />
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
)

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReadingTestPage() {
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
    const clearHighlightsRef = useRef<(() => void) | null>(null)

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

    if (isLoading) return <div className={s.loadingContainer}>Loading...</div>
    if (!sections.length) return <div>No content.</div>

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

export { UniversalQuestionRenderer, QuestionGroupRenderer }
