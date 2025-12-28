import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import s from './ReadingTestPage.module.css'

// --- Hooks & Assets ---
import { useTextHighlighter } from '@/hooks/useTextHighlighter'
import ClockIcon from '@/assets/History.svg'
import ReviewIcon from '@/assets/Action Favourite.svg'

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
    type TestAttempt,
    type QuestionSubmitItem,
    type Question,
    QuestionType,
} from '@/types/test.types'

const STORAGE_KEY_PREFIX = 'readingHighlights_'
const ANSWERS_STORAGE_PREFIX = 'testAnswers_'

// ============================================
// INTERNAL TYPES FOR UI RENDER
// ============================================

interface InternalQuestion {
    id: string
    number: number // Số thứ tự hiển thị (1, 2, 3...)
    type: QuestionType
    text?: string // Instruction hoặc tiêu đề phụ
    questionText?: string // Nội dung câu hỏi chính
    parts?: (string | null)[] // Dùng cho câu hỏi điền từ (đoạn text bị cắt)
    options?: Array<{ value: string; text: string }>
    allowMultiple?: boolean
    maxPoints?: number
}

interface InternalPassage {
    id: string
    title: string
    content: string
    questions: InternalQuestion[]
}

// ============================================
// MAPPING UTILITIES
// ============================================

/**
 * Chuyển đổi cấu trúc Test phức tạp (Section -> Part -> Group -> Question)
 * sang cấu trúc phẳng hơn để dễ render UI theo từng Passage (Section).
 */
function mapTestToInternalFormat(test: Test): InternalPassage[] {
    let globalQuestionNumber = 1

    // Trong IELTS Reading: 1 Section thường tương ứng 1 Passage
    return test.sections.map((section) => {
        const sectionQuestions: InternalQuestion[] = []

        // Gộp nội dung bài đọc từ các Part (thường Part chứa text bài đọc)
        // Nếu không có, fallback về instruction của section
        const passageContent =
            section.parts
                .map((p) => p.instructions)
                .filter(Boolean)
                .join('\n\n') ||
            section.instructions ||
            'No content available'

        // Duyệt qua từng Part
        section.parts.forEach((part) => {
            // Duyệt qua từng Question Group
            part.questionGroups.forEach((group) => {
                // Duyệt qua từng Question
                group.questions.forEach((q) => {
                    const baseQuestion: InternalQuestion = {
                        id: q.id,
                        number: globalQuestionNumber++, // Tăng số thứ tự toàn cục
                        type: q.questionType,
                        maxPoints: q.points,
                        questionText: q.questionText || '',
                        text: group.instructions || '', // Lấy hướng dẫn từ Group (VD: "Choose TRUE/FALSE...")
                    }

                    // Map specific fields based on type
                    switch (q.questionType) {
                        case QuestionType.MULTIPLE_CHOICE:
                            sectionQuestions.push({
                                ...baseQuestion,
                                allowMultiple: false, // TODO: Check logic multi-select nếu cần
                                options: q.options?.map((opt) => ({
                                    value: opt.key,
                                    text: opt.text,
                                })),
                            })
                            break

                        case QuestionType.TRUE_FALSE:
                        case QuestionType.ESSAY:
                        case QuestionType.SPEAKING:
                            sectionQuestions.push(baseQuestion)
                            break

                        case QuestionType.SHORT_ANSWER:
                        case QuestionType.FILL_IN_BLANK:
                            // Với dạng điền từ, ta giả định questionText chứa placeholder
                            // Hoặc xử lý tách chuỗi nếu BE trả về format đặc biệt
                            sectionQuestions.push({
                                ...baseQuestion,
                                parts: [q.questionText || '', null], // Simplification for UI component
                            })
                            break

                        default:
                            // Fallback cho các dạng chưa support visual
                            sectionQuestions.push(baseQuestion)
                            break
                    }
                })
            })
        })

        return {
            id: section.id,
            title: section.name,
            content: passageContent,
            questions: sectionQuestions,
        }
    })
}

// ============================================
// SUB-COMPONENTS
// ============================================

const ReadingHeader = React.memo(({ timeLeft }: { timeLeft: number }) => {
    const formattedTime = formatTime(timeLeft)

    // Đổi màu timer khi sắp hết giờ (< 5 phút)
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

interface ReadingPassageProps {
    passage: InternalPassage
    testId: string
    clearHighlightsRef: React.RefObject<(() => void) | null>
}

const ReadingPassage = React.memo(
    ({ passage, testId, clearHighlightsRef }: ReadingPassageProps) => {
        const contentRef = useRef<HTMLDivElement>(null!)

        const {
            toolbarState,
            addHighlight,
            removeHighlight,
            clearAllHighlights,
        } = useTextHighlighter(contentRef, testId, passage.id)

        useEffect(() => {
            clearHighlightsRef.current = clearAllHighlights
        }, [clearAllHighlights, clearHighlightsRef])

        const passageParagraphs = useMemo(() => {
            if (!passage.content) return <p>No content available.</p>
            return passage.content
                .split('\n\n')
                .map((text, index) => <p key={index}>{text}</p>)
        }, [passage.content])

        return (
            <div className={s.passageContainer} id={passage.id}>
                <h3 className={s.passageTitle}>{passage.title}</h3>
                <div className={s.passageContent} ref={contentRef}>
                    {passageParagraphs}
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

interface QuestionAreaProps {
    passage: InternalPassage
    answers: { [key: string]: any }
    onAnswerChange: (questionId: string, value: any) => void
    registerRef: (id: string, element: HTMLElement | null) => void
    attemptId: string
}

const QuestionArea = React.memo(
    ({
        passage,
        answers,
        onAnswerChange,
        registerRef,
        attemptId,
    }: QuestionAreaProps) => {
        const renderQuestion = (q: InternalQuestion) => {
            const commonProps = {
                key: q.id,
                question: q as any, // Cast vì component con dùng type hơi khác 1 chút
                registerRef: registerRef,
            }

            switch (q.type) {
                case QuestionType.TRUE_FALSE:
                    return (
                        <TrueFalseNotGivenQuestion
                            {...commonProps}
                            selectedValue={answers[q.id] || null}
                            onChange={(value) => onAnswerChange(q.id, value)}
                        />
                    )

                case QuestionType.MULTIPLE_CHOICE:
                    return (
                        <MultipleChoiceQuestion
                            {...commonProps}
                            selectedValues={
                                answers[q.id] ? [answers[q.id]] : []
                            } // Adapter: array -> single if needed
                            onChange={(value) => onAnswerChange(q.id, value)}
                        />
                    )

                case QuestionType.SHORT_ANSWER:
                case QuestionType.FILL_IN_BLANK:
                    return (
                        <SentenceCompletionQuestion
                            {...commonProps}
                            value={answers[q.id] || ''}
                            onChange={(value) => onAnswerChange(q.id, value)}
                        />
                    )

                case QuestionType.ESSAY:
                    return (
                        <EssayQuestion
                            key={q.id}
                            questionId={q.id}
                            questionNumber={q.number}
                            questionText={q.questionText || ''}
                            value={answers[q.id] || ''}
                            onChange={(value: any) =>
                                onAnswerChange(q.id, value)
                            }
                            registerRef={registerRef}
                        />
                    )

                case QuestionType.SPEAKING:
                    return (
                        <SpeakingQuestion
                            key={q.id}
                            questionId={q.id}
                            questionNumber={q.number}
                            questionText={q.questionText || ''}
                            attemptId={attemptId}
                            registerRef={registerRef}
                        />
                    )

                default:
                    return (
                        <div
                            key={q.id}
                            className="p-4 border border-gray-200 rounded my-2"
                        >
                            <p className="font-bold text-red-500">
                                Unsupported Question Type: {q.type} (ID: {q.id})
                            </p>
                        </div>
                    )
            }
        }

        return (
            <div className={s.questionContainer}>
                <div className={s.questionScrollArea}>
                    {passage.questions.length > 0 ? (
                        passage.questions.map((q) => renderQuestion(q))
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            No questions in this section.
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

interface ReadingFooterProps {
    passages: InternalPassage[]
    currentPassageIndex: number
    onPassageChange: (index: number) => void
    currentQuestionNumber: number
    reviewedQuestions: Set<number>
    answers: { [key: string]: any }
    onNavClick: (questionNumber: number) => void
    onToggleReview: (questionNumber: number) => void
    onSubmit: () => void
    isSubmitting: boolean
    testFinished: boolean
}

const ReadingFooter = React.memo(
    ({
        passages,
        currentPassageIndex,
        onPassageChange,
        currentQuestionNumber,
        reviewedQuestions,
        answers,
        onNavClick,
        onToggleReview,
        onSubmit,
        isSubmitting,
        testFinished,
    }: ReadingFooterProps) => {
        const subQuestionContainerRef = useRef<HTMLDivElement>(null)

        // Lấy danh sách câu hỏi của Passage hiện tại để hiển thị thanh điều hướng dưới cùng
        const currentPassageQuestions = useMemo(() => {
            return passages[currentPassageIndex]?.questions || []
        }, [passages, currentPassageIndex])

        // Auto-scroll thanh nav câu hỏi khi current question thay đổi
        useEffect(() => {
            const currentButton =
                subQuestionContainerRef.current?.querySelector(
                    `button[data-q-number="${currentQuestionNumber}"]`
                )
            if (currentButton) {
                currentButton.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                })
            }
        }, [currentQuestionNumber])

        const getQuestionButtonClass = (qNumber: number, qId: string) => {
            let classes = s.navButton
            if (qNumber === currentQuestionNumber) classes += ` ${s.current}`
            if (reviewedQuestions.has(qNumber)) classes += ` ${s.reviewed}`

            // Kiểm tra xem đã trả lời chưa
            const hasAnswer =
                answers[qId] !== undefined &&
                answers[qId] !== null &&
                String(answers[qId]).trim() !== ''
            if (hasAnswer) {
                classes += ` ${s.answered}`
            }
            return classes
        }

        return (
            <footer className={s.footer}>
                <div className={s.footerRow}>
                    <div className={s.passageNav}>
                        {passages.map((p, index) => (
                            <button
                                key={p.id}
                                className={`${s.passageButton} ${
                                    index === currentPassageIndex
                                        ? s.active
                                        : ''
                                }`}
                                onClick={() => onPassageChange(index)}
                                disabled={testFinished || isSubmitting}
                            >
                                Passage {index + 1}
                            </button>
                        ))}
                    </div>

                    <div className={s.footerActions}>
                        <ButtonGhost
                            size="sm"
                            mode="light"
                            leftIcon={<img src={ReviewIcon} alt="review" />}
                            onClick={() =>
                                onToggleReview(currentQuestionNumber)
                            }
                            disabled={testFinished || isSubmitting}
                            style={{
                                color: reviewedQuestions.has(
                                    currentQuestionNumber
                                )
                                    ? '#D97706'
                                    : undefined,
                                fontWeight: reviewedQuestions.has(
                                    currentQuestionNumber
                                )
                                    ? '600'
                                    : '500',
                            }}
                        >
                            Review
                        </ButtonGhost>

                        <ButtonPrimary
                            size="md"
                            onClick={onSubmit}
                            loading={isSubmitting}
                            disabled={testFinished || isSubmitting}
                        >
                            Submit Test
                        </ButtonPrimary>
                    </div>
                </div>

                <div className={s.footerRow}>
                    <div
                        className={s.questionNav}
                        ref={subQuestionContainerRef}
                    >
                        {currentPassageQuestions.map((q) => (
                            <button
                                key={q.id}
                                data-q-number={q.number}
                                className={getQuestionButtonClass(
                                    q.number,
                                    q.id
                                )}
                                onClick={() => onNavClick(q.number)}
                                disabled={testFinished}
                                title={`Question ${q.number}`}
                            >
                                {q.number}
                            </button>
                        ))}
                    </div>
                </div>
            </footer>
        )
    }
)

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function ReadingTestPage() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()
    const navigate = useNavigate()

    // State Management
    const [test, setTest] = useState<Test | null>(null)
    const [passages, setPassages] = useState<InternalPassage[]>([])
    const [timeLeft, setTimeLeft] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // UI State
    const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)

    // Data State
    const [answers, setAnswers] = useState<{ [key: string]: any }>({})
    const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(
        new Set()
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [testFinished, setTestFinished] = useState(false)

    // Refs
    const questionElementRefs = useRef<Map<string, HTMLElement | null>>(
        new Map()
    )
    const clearHighlightsRef = useRef<(() => void) | null>(null)

    // 1. Initial Data Loading
    useEffect(() => {
        const fetchTestAndAttempt = async () => {
            if (!testId || !attemptId) {
                setError('Missing URL parameters (Test ID or Attempt ID)')
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)
            try {
                // Fetch Test Detail
                const testData = await testApi.getTest(testId)
                setTest(testData)

                // Transform to Internal Format
                const passagesData = mapTestToInternalFormat(testData)
                setPassages(passagesData)

                // Verify Attempt Info (get start time)
                // Trong thực tế, nên gọi API getAttemptDetail để check xem user có đang resume không
                // Ở đây ta dùng localStorage như yêu cầu tạm thời, nhưng tốt nhất là gọi API.
                const attemptDataStr = localStorage.getItem(
                    `attempt_${attemptId}`
                )
                let startTime = new Date().toISOString()

                if (attemptDataStr) {
                    const attemptData = JSON.parse(
                        attemptDataStr
                    ) as TestAttempt
                    startTime = attemptData.startedAt
                } else {
                    // Fallback: Nếu không thấy trong local (đổi máy), lẽ ra nên fetch API
                    // Giả lập call API startAttempt nếu cần, hoặc lấy từ getAttemptDetail
                    console.warn(
                        'Attempt info not found in localStorage, using default time logic'
                    )
                }

                // Calculate Time
                if (testData.timeLimitMinutes) {
                    const remaining = calculateRemainingTime(
                        startTime,
                        testData.timeLimitMinutes
                    )
                    setTimeLeft(remaining)

                    if (remaining === 0) {
                        setTestFinished(true)
                        alert('Bài thi này đã hết giờ.')
                    }
                }

                // Load Saved Answers (Resume work)
                const savedAnswers = localStorage.getItem(
                    `${ANSWERS_STORAGE_PREFIX}${attemptId}`
                )
                if (savedAnswers) {
                    setAnswers(JSON.parse(savedAnswers))
                }
            } catch (err: any) {
                console.error('Failed to load test:', err)
                setError(
                    err.message || 'Failed to load test data. Please try again.'
                )
            } finally {
                setIsLoading(false)
            }
        }
        fetchTestAndAttempt()
    }, [testId, attemptId])

    // 2. Timer Countdown
    useEffect(() => {
        if (isLoading || testFinished || isSubmitting || timeLeft <= 0) return

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId)
                    handleFinalSubmit(true) // Force submit due to timeout
                    return 0
                }
                return prevTime - 1
            })
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft, isLoading, testFinished, isSubmitting])

    // 3. Auto-save Answers
    useEffect(() => {
        if (!attemptId || testFinished) return

        const interval = setInterval(() => {
            if (Object.keys(answers).length > 0) {
                localStorage.setItem(
                    `${ANSWERS_STORAGE_PREFIX}${attemptId}`,
                    JSON.stringify(answers)
                )
            }
        }, 15000) // Save every 15s

        return () => clearInterval(interval)
    }, [answers, attemptId, testFinished])

    // Handlers
    const handleAnswerChange = useCallback(
        (questionId: string, value: any) => {
            if (testFinished) return
            setAnswers((prev) => ({
                ...prev,
                [questionId]: value,
            }))
        },
        [testFinished]
    )

    const toggleReview = useCallback(
        (questionNumber: number) => {
            if (testFinished) return
            setReviewedQuestions((prev) => {
                const newSet = new Set(prev)
                if (newSet.has(questionNumber)) newSet.delete(questionNumber)
                else newSet.add(questionNumber)
                return newSet
            })
        },
        [testFinished]
    )

    const registerQuestionRef = useCallback(
        (id: string, element: HTMLElement | null) => {
            if (element) {
                questionElementRefs.current.set(id, element)
            } else {
                questionElementRefs.current.delete(id)
            }
        },
        []
    )

    const handleNavigateQuestion = useCallback(
        (questionNumber: number) => {
            if (testFinished || !passages.length) return

            setCurrentQuestionNumber(questionNumber)

            // Find passage containing this question
            let targetPassageIdx = currentPassageIndex
            let targetQuestionId: string | undefined

            for (let i = 0; i < passages.length; i++) {
                const q = passages[i].questions.find(
                    (q) => q.number === questionNumber
                )
                if (q) {
                    targetPassageIdx = i
                    targetQuestionId = q.id
                    break
                }
            }

            if (targetPassageIdx !== currentPassageIndex) {
                setCurrentPassageIndex(targetPassageIdx)
            }

            // Scroll to question
            setTimeout(() => {
                const element = targetQuestionId
                    ? questionElementRefs.current.get(targetQuestionId)
                    : undefined

                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })
                }
            }, 100)
        },
        [passages, currentPassageIndex, testFinished]
    )

    const promptSubmit = () => {
        if (testFinished || isSubmitting) return
        if (
            window.confirm(
                'Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.'
            )
        ) {
            handleFinalSubmit(false)
        }
    }

    const handleFinalSubmit = useCallback(
        async (isTimeout = false) => {
            if ((testFinished && !isTimeout) || isSubmitting || !attemptId)
                return

            setIsSubmitting(true)

            try {
                // Transform answers to API Payload
                const responses: QuestionSubmitItem[] = Object.entries(
                    answers
                ).map(([questionId, value]) => {
                    // Logic xác định response_text vs response_data
                    // Với câu hỏi trắc nghiệm, value thường là string key
                    // Với câu hỏi mảng (nhiều lựa chọn), value là array

                    const isComplexData =
                        typeof value === 'object' && value !== null

                    return {
                        question_id: questionId,
                        response_text: !isComplexData
                            ? String(value)
                            : undefined,
                        response_data: isComplexData ? value : undefined,
                    }
                })

                // Submit API Call
                await testApi.submitAttempt(attemptId, { responses })

                // Cleanup Local Storage
                clearHighlightsRef.current?.()
                localStorage.removeItem(`${ANSWERS_STORAGE_PREFIX}${attemptId}`)
                localStorage.removeItem(`attempt_${attemptId}`)

                // Clear highlights cache
                Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith(`${STORAGE_KEY_PREFIX}${testId}_`)) {
                        localStorage.removeItem(key)
                    }
                })

                setTestFinished(true)

                if (isTimeout) {
                    alert(
                        'Hết giờ làm bài! Hệ thống đã tự động nộp bài của bạn.'
                    )
                }

                // Redirect to Results
                navigate(`/student/exams/results/${attemptId}`)
            } catch (err: any) {
                console.error('Submission error:', err)
                alert(
                    err.message ||
                        'Nộp bài thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.'
                )
                setIsSubmitting(false)
            }
        },
        [testFinished, isSubmitting, answers, attemptId, testId, navigate]
    )

    // Render Logic
    if (isLoading) {
        return <div className={s.loadingContainer}>Loading test data...</div>
    }

    if (error) {
        return (
            <div className={s.errorContainer}>
                <p>Error: {error}</p>
                <ButtonGhost onClick={() => window.location.reload()}>
                    Try Again
                </ButtonGhost>
            </div>
        )
    }

    if (!test || !passages.length) {
        return <div className={s.errorContainer}>No test content found.</div>
    }

    const currentPassage = passages[currentPassageIndex]

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <ReadingHeader timeLeft={timeLeft} />

            <main className={s.mainContent}>
                {/* Cột trái: Bài đọc */}
                <ReadingPassage
                    key={`passage-${currentPassage.id}`}
                    passage={currentPassage}
                    testId={test.id}
                    clearHighlightsRef={clearHighlightsRef}
                />

                {/* Cột phải: Câu hỏi */}
                <QuestionArea
                    key={`questions-${currentPassage.id}`}
                    passage={currentPassage}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    registerRef={registerQuestionRef}
                    attemptId={attemptId!}
                />
            </main>

            <ReadingFooter
                passages={passages}
                currentPassageIndex={currentPassageIndex}
                onPassageChange={(idx) => {
                    setCurrentPassageIndex(idx)
                    // Optional: Reset question scroll to top or first question of passage
                }}
                currentQuestionNumber={currentQuestionNumber}
                reviewedQuestions={reviewedQuestions}
                answers={answers}
                onNavClick={handleNavigateQuestion}
                onToggleReview={toggleReview}
                onSubmit={promptSubmit}
                isSubmitting={isSubmitting}
                testFinished={testFinished}
            />

            {isSubmitting && (
                <div className={s.submitOverlay}>
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                        <p>Submitting your answers...</p>
                    </div>
                </div>
            )}
        </div>
    )
}
