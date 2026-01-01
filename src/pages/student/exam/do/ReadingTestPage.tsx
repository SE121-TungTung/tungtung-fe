import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import s from './ReadingTestPage.module.css'

// --- Hooks & Assets ---
import { useTextHighlighter } from '@/hooks/useTextHighlighter'
import ClockIcon from '@/assets/History.svg'

// --- Components ---
import SentenceCompletionQuestion from '@/components/feature/exams/SentenceCompletionQuestion'
import TrueFalseNotGivenQuestion from '@/components/feature/exams/TrueFalseNotGivenQuestion'
import HighlightToolbar from '@/components/feature/exams/HighlightToolbar'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import MultipleChoiceQuestion from '@/components/feature/exams/MultipleChoiceQuestion'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import { EssayQuestion } from '@/components/feature/exams/EssayQuestion'

// --- Libs & Types ---
import { testApi, calculateRemainingTime, formatTime } from '@/lib/test'
import {
    type Test,
    type TestSection,
    type TestSectionPart,
    type QuestionGroup,
    type Question,
    type QuestionSubmitItem,
    QuestionType,
} from '@/types/test.types'

const STORAGE_KEY_PREFIX = 'readingHighlights_'
const ANSWERS_STORAGE_PREFIX = 'testAnswers_'

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

function enhanceTestWithQuestionNumbers(test: Test): EnhancedSection[] {
    let globalQuestionNumber = 1

    return test.sections.map((section) => ({
        ...section,
        parts: section.parts.map((part) => ({
            ...part,
            questionGroups: part.questionGroups.map((group) => ({
                ...group,
                questions: group.questions.map((question) => ({
                    ...question,
                    globalNumber: globalQuestionNumber++,
                })),
            })),
        })),
    }))
}

// ============================================
// SUB-COMPONENTS
// ============================================

const ReadingHeader = React.memo(({ timeLeft }: { timeLeft: number }) => {
    const formattedTime = formatTime(timeLeft)
    const timerStyle =
        timeLeft < 300
            ? { color: '#ef4444', animation: 'pulse 1s infinite' }
            : {}

    return (
        <header className={s.header}>
            <span className={s.headerInfo}>IELTS Academic Reading</span>
            <div className={s.timer} title="Time remaining" style={timerStyle}>
                <img src={ClockIcon} alt="time left" />
                {formattedTime}
            </div>
        </header>
    )
})

const ReadingPassage = React.memo(
    ({
        section,
        testId,
        clearHighlightsRef,
    }: {
        section: EnhancedSection
        testId: string
        clearHighlightsRef: React.RefObject<(() => void) | null>
    }) => {
        const contentRef = useRef<HTMLDivElement>(null!)
        // Lấy passage từ part đầu tiên có chứa passage content
        const passage = section.parts.find((p) => p.passage)?.passage

        const {
            toolbarState,
            addHighlight,
            removeHighlight,
            clearAllHighlights,
        } = useTextHighlighter(contentRef, testId, section.id)

        useEffect(() => {
            clearHighlightsRef.current = clearAllHighlights
        }, [clearAllHighlights, clearHighlightsRef])

        if (!passage)
            return (
                <div className={s.passageContainer}>
                    No content available for this section.
                </div>
            )

        return (
            <div className={s.passageContainer} id={section.id}>
                <h3 className={s.passageTitle}>{passage.title}</h3>
                <div className={s.passageContent} ref={contentRef}>
                    {passage.textContent?.split('\n\n').map((text, idx) => (
                        <p key={idx}>{text}</p>
                    ))}
                </div>
                {toolbarState && (
                    <HighlightToolbar
                        state={toolbarState}
                        onAdd={addHighlight}
                        onRemove={removeHighlight}
                    />
                )}
            </div>
        )
    }
)

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
    const navigate = useNavigate()

    const [sections, setSections] = useState<EnhancedSection[]>([])
    const [timeLeft, setTimeLeft] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
    const [answers, setAnswers] = useState<{ [key: string]: any }>({})
    const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(
        new Set()
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [testFinished, setTestFinished] = useState(false)

    const questionElementRefs = useRef<Map<string, HTMLElement | null>>(
        new Map()
    )
    const clearHighlightsRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        const initData = async () => {
            if (!testId || !attemptId) return
            try {
                const testData = await testApi.getTest(testId)
                const enhanced = enhanceTestWithQuestionNumbers(testData)
                setSections(enhanced)

                const attemptDataStr = localStorage.getItem(
                    `attempt_${attemptId}`
                )
                const startTime = attemptDataStr
                    ? JSON.parse(attemptDataStr).startedAt
                    : new Date().toISOString()

                if (testData.timeLimitMinutes) {
                    const remaining = calculateRemainingTime(
                        startTime,
                        testData.timeLimitMinutes
                    )
                    setTimeLeft(remaining)
                    if (remaining === 0) setTestFinished(true)
                }

                const saved = localStorage.getItem(
                    `${ANSWERS_STORAGE_PREFIX}${attemptId}`
                )
                if (saved) setAnswers(JSON.parse(saved))
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        initData()
    }, [testId, attemptId])

    const handleFinalSubmit = useCallback(
        async (isTimeout = false) => {
            if (isSubmitting || !attemptId) return
            setIsSubmitting(true)
            try {
                console.log(
                    isTimeout
                        ? 'Time is up! Submitting...'
                        : 'Submitting test...'
                )
                const responses: QuestionSubmitItem[] = Object.entries(
                    answers
                ).map(([id, val]) => ({
                    question_id: id,
                    response_text:
                        typeof val !== 'object' ? String(val) : undefined,
                    response_data: typeof val === 'object' ? val : undefined,
                }))
                await testApi.submitAttempt(attemptId, { responses })
                localStorage.removeItem(`${ANSWERS_STORAGE_PREFIX}${attemptId}`)
                navigate(`/student/exams/results/${attemptId}`)
            } catch (err) {
                alert('Submission failed: ' + (err as any).message || err)
                setIsSubmitting(false)
            }
        },
        [answers, attemptId, navigate, isSubmitting]
    )

    useEffect(() => {
        if (isLoading || testFinished || isSubmitting || timeLeft <= 0) return
        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleFinalSubmit(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerId)
    }, [timeLeft, isLoading, testFinished, isSubmitting, handleFinalSubmit])

    const handleAnswerChange = useCallback(
        (id: string, val: any) => {
            if (testFinished) return
            setAnswers((prev) => ({ ...prev, [id]: val }))
        },
        [testFinished]
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

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <ReadingHeader timeLeft={timeLeft} />
            <main className={s.mainContent}>
                <ReadingPassage
                    section={sections[currentSectionIndex]}
                    testId={testId!}
                    clearHighlightsRef={clearHighlightsRef}
                />
                <QuestionGroupRenderer
                    section={sections[currentSectionIndex]}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    registerRef={(id, el) =>
                        el
                            ? questionElementRefs.current.set(id, el)
                            : questionElementRefs.current.delete(id)
                    }
                    attemptId={attemptId!}
                />
            </main>
            <ReadingFooter
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

// ============================================
// FOOTER COMPONENT
// ============================================

const ReadingFooter = React.memo(
    ({
        sections,
        currentIndex,
        onSectionChange,
        currentQNum,
        reviewed,
        answers,
        onNav,
        onToggleReview,
        onSubmit,
        isSubmitting,
    }: any) => {
        const currentQuestions = useMemo(() => {
            return (
                sections[currentIndex]?.parts.flatMap((p: any) =>
                    p.questionGroups.flatMap((g: any) => g.questions)
                ) || []
            )
        }, [sections, currentIndex])

        return (
            <footer className={s.footer}>
                <div className={s.footerRow}>
                    <div className={s.passageNav}>
                        {sections.map((s: any, i: number) => (
                            <button
                                key={s.id}
                                className={`${s.passageButton} ${i === currentIndex ? s.active : ''}`}
                                onClick={() => onSectionChange(i)}
                            >
                                {s.name || `Section ${i + 1}`}
                            </button>
                        ))}
                    </div>
                    <div className={s.footerActions}>
                        <ButtonGhost
                            size="sm"
                            onClick={() => onToggleReview(currentQNum)}
                        >
                            Review
                        </ButtonGhost>
                        <ButtonPrimary
                            size="md"
                            onClick={onSubmit}
                            loading={isSubmitting}
                        >
                            Submit
                        </ButtonPrimary>
                    </div>
                </div>
                <div className={s.footerRow}>
                    <div className={s.questionNav}>
                        {currentQuestions.map((q: any) => (
                            <button
                                key={q.id}
                                className={`${s.navButton} ${q.globalNumber === currentQNum ? s.current : ''} ${answers[q.id] ? s.answered : ''} ${reviewed.has(q.globalNumber) ? s.reviewed : ''}`}
                                onClick={() => onNav(q.globalNumber)}
                            >
                                {q.globalNumber}
                            </button>
                        ))}
                    </div>
                </div>
            </footer>
        )
    }
)
