import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import s from './ReadingTestPage.module.css'

import { useTextHighlighter } from '@/hooks/useTextHighlighter'

import ClockIcon from '@/assets/History.svg'
import ReviewIcon from '@/assets/Action Favourite.svg'
import HelpIcon from '@/assets/Help.svg'

import SentenceCompletionQuestion from '@/components/feature/exams/SentenceCompletionQuestion'
import TrueFalseNotGivenQuestion from '@/components/feature/exams/TrueFalseNotGivenQuestion'
import HighlightToolbar from '@/components/feature/exams/HighlightToolbar'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'

import type {
    ReadingTest,
    Passage,
    QuestionGroup,
    Question,
} from '@/types/exam.types'
import React from 'react'
import MatchingQuestionGroup from '@/components/feature/exams/MatchingQuestionGroup'
import SummaryCompletionGroup from '@/components/feature/exams/SummaryCompletionGroup'
import MultipleChoiceQuestion from '@/components/feature/exams/MultipleChoiceQuestion'
import { useParams } from 'react-router-dom'

const STORAGE_KEY_PREFIX = 'readingHighlights_'

const mockTestData: ReadingTest = {
    id: 'ielts-reading-test-1',
    title: 'IELTS Academic Reading Practice 1',
    totalTimeSeconds: 60 * 60,
    passages: [
        {
            id: 'p1',
            title: 'The History of Glass',
            content: `Glass, in one form or another, has long been in subordinate relation to the human race. Records of its use date back as far as 4000 B.C.\n\nIt was not until 1500 B.C., however, that the first glass vessel was produced. The glass industry suddenly declined after 1200 B.C.\n\n(Nội dung bài đọc 1 dài...)\n\nModern glass manufacturing techniques are highly sophisticated.`,
            questionGroups: [
                {
                    id: 'g1',
                    instruction:
                        'Questions 1-3: Do the following statements agree with the information given? Write TRUE, FALSE, or NOT GIVEN.',
                    questionType: 'TFNF',
                    questions: [
                        {
                            id: 'q1',
                            number: 1,
                            type: 'TFNF',
                            text: 'The earliest known use of glass dates back to 4000 B.C.',
                        },
                        {
                            id: 'q2',
                            number: 2,
                            type: 'TFNF',
                            text: 'The glass industry declined after 1500 B.C.',
                        },
                        {
                            id: 'q3',
                            number: 3,
                            type: 'TFNF',
                            text: 'Glass was only used for decoration in ancient times.',
                        },
                    ] as Question[],
                },
                {
                    id: 'g2',
                    instruction:
                        'Questions 4-5: Complete the sentences below. Choose NO MORE THAN TWO WORDS.',
                    questionType: 'SentenceCompletion',
                    questions: [
                        {
                            id: 'q4',
                            number: 4,
                            type: 'SentenceCompletion',
                            parts: [
                                'The first glass vessel was produced in ',
                                null,
                                '.',
                            ],
                        },
                        {
                            id: 'q5',
                            number: 5,
                            type: 'SentenceCompletion',
                            parts: ['Modern techniques are very ', null, '.'],
                        },
                    ] as Question[],
                },
            ],
        },
        {
            id: 'p2',
            title: 'Advantages of Public Transport',
            content: `A. A developed public transport system is a sign of a civilized society.\n\nB. However, the reliance on private cars is still dominant in many regions...\n\n(Nội dung bài đọc 2 dài...)`,
            questionGroups: [
                {
                    id: 'g3',
                    instruction:
                        'Questions 6-8: The reading passage has paragraphs A and B. Which paragraph contains the following information? (NB You may use any letter more than once)',
                    questionType: 'MatchingFeatures',
                    optionsBank: [
                        { value: 'A', text: 'Paragraph A' },
                        { value: 'B', text: 'Paragraph B' },
                    ],
                    questions: [
                        {
                            id: 'q6',
                            number: 6,
                            type: 'MatchingFeatures',
                            itemText:
                                'A reference to the dominance of private cars.',
                        },
                        {
                            id: 'q7',
                            number: 7,
                            type: 'MatchingFeatures',
                            itemText: 'A definition of a civilized society.',
                        },
                        {
                            id: 'q8',
                            number: 8,
                            type: 'MatchingFeatures',
                            itemText: 'A solution to traffic congestion.',
                        },
                    ] as Question[],
                },
            ],
        },
        {
            id: 'p3',
            title: 'Understanding Circadian Rhythms',
            content: `(Nội dung bài đọc 3 dài...)`,
            questionGroups: [
                {
                    id: 'g4',
                    instruction:
                        'Questions 9-10: Choose the correct letter, A, B, C or D.',
                    questionType: 'MCQ',
                    questions: [
                        {
                            id: 'q9',
                            number: 9,
                            type: 'MCQ',
                            allowMultiple: false,
                            text: 'What is the main topic of this passage?',
                            options: [
                                { value: 'A', text: '...' },
                                { value: 'B', text: '...' },
                            ],
                        },
                        {
                            id: 'q10',
                            number: 10,
                            type: 'MCQ',
                            allowMultiple: false,
                            text: 'The "master clock" is located in the...?',
                            options: [
                                { value: 'A', text: '...' },
                                { value: 'B', text: '...' },
                            ],
                        },
                    ] as Question[],
                },
            ],
        },
    ],
}

const ReadingHeader = ({ timeLeft }: { timeLeft: number }) => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

    return (
        <header className={s.header}>
            <span className={s.headerInfo}>IELTS Academic Reading</span>
            <div className={s.timer} title="Time remaining">
                <img src={ClockIcon} alt="time left" />
                {formattedTime}
            </div>
        </header>
    )
}

interface ReadingPassageProps {
    passage: Passage
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
    passage: Passage
    answers: { [key: string]: any }
    onAnswerChange: (questionId: string, value: any) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}
const QuestionArea = ({
    passage,
    answers,
    onAnswerChange,
    registerRef,
}: QuestionAreaProps) => {
    const renderGroup = (group: QuestionGroup) => {
        switch (group.questionType) {
            case 'TFNF':
                return group.questions.map((q) => (
                    <TrueFalseNotGivenQuestion
                        key={q.id}
                        question={q as any}
                        selectedValue={answers[q.id] || null}
                        onChange={(value) => onAnswerChange(q.id, value)}
                        registerRef={registerRef}
                    />
                ))
            case 'MCQ':
                return group.questions.map((q) => (
                    <MultipleChoiceQuestion
                        key={q.id}
                        question={q as any}
                        selectedValues={answers[q.id] || []}
                        onChange={(value) => onAnswerChange(q.id, value)}
                        registerRef={registerRef}
                    />
                ))
            case 'SentenceCompletion':
            case 'ShortAnswer':
                return group.questions.map((q) => (
                    <SentenceCompletionQuestion
                        key={q.id}
                        question={q as any}
                        value={answers[q.id] || ''}
                        onChange={(value) => onAnswerChange(q.id, value)}
                        registerRef={registerRef}
                    />
                ))
            case 'MatchingFeatures':
            case 'MatchingHeadings':
                return (
                    <MatchingQuestionGroup
                        group={group}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                        registerRef={registerRef}
                    />
                )
            case 'SummaryCompletion':
                if (!group.optionsBank) {
                    return (
                        <SummaryCompletionGroup
                            group={group}
                            answers={answers}
                            onAnswerChange={onAnswerChange}
                            registerRef={registerRef}
                        />
                    )
                }
                return (
                    <MatchingQuestionGroup
                        group={group}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                        registerRef={registerRef}
                    />
                )
            default:
                return (
                    <p>Dạng câu hỏi "{group.questionType}" chưa được hỗ trợ.</p>
                )
        }
    }

    return (
        <div className={s.questionContainer}>
            <div className={s.questionScrollArea}>
                {passage.questionGroups.map((group) => (
                    <div key={group.id} className={s.questionGroupBlock}>
                        <h4 className={s.questionInstruction}>
                            {group.instruction}
                        </h4>
                        {renderGroup(group)}
                    </div>
                ))}
            </div>
        </div>
    )
}

interface ReadingFooterProps {
    testData: ReadingTest
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
const ReadingFooter = ({
    testData,
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

    // Lấy danh sách questions của passage hiện tại
    const currentPassageQuestions = useMemo(() => {
        return testData.passages[currentPassageIndex].questionGroups.flatMap(
            (g) => g.questions
        )
    }, [testData, currentPassageIndex])

    // Tự động cuộn thanh questions của part hiện tại
    useEffect(() => {
        const currentButton = subQuestionContainerRef.current?.querySelector(
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

    // Lấy class cho nút 1-40 (theo style IDP)
    const getQuestionButtonClass = (qNumber: number, qId: string) => {
        let classes = s.navButton
        if (qNumber === currentQuestionNumber) classes += ` ${s.current}`
        if (reviewedQuestions.has(qNumber)) classes += ` ${s.reviewed}`
        if (
            answers[qId] !== undefined &&
            answers[qId] !== null &&
            String(answers[qId]).trim() !== ''
        ) {
            classes += ` ${s.answered}`
        }
        return classes
    }

    return (
        <footer className={s.footer}>
            <div className={s.footerRow}>
                <div className={s.passageNav}>
                    {testData.passages.map((p, index) => (
                        <button
                            key={p.id}
                            className={`${s.passageButton} ${
                                index === currentPassageIndex ? s.active : ''
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
                        onClick={() => onToggleReview(currentQuestionNumber)}
                        disabled={testFinished || isSubmitting}
                        style={{
                            color: reviewedQuestions.has(currentQuestionNumber)
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
                    <ButtonGhost
                        size="sm"
                        mode="light"
                        leftIcon={<img src={HelpIcon} alt="help" />}
                        disabled={testFinished || isSubmitting}
                    >
                        Help
                    </ButtonGhost>
                    <ButtonPrimary
                        size="md"
                        onClick={onSubmit}
                        loading={isSubmitting}
                        disabled={testFinished || isSubmitting}
                    >
                        Submit
                    </ButtonPrimary>
                </div>
            </div>

            <div className={s.footerRow}>
                <div className={s.questionNav} ref={subQuestionContainerRef}>
                    {currentPassageQuestions.map((q) => (
                        <button
                            key={q.id}
                            data-q-number={q.number}
                            className={getQuestionButtonClass(q.number, q.id)}
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

export default function ReadingTestPage() {
    const { testId } = useParams<{ testId: string }>()

    const [testData, setTestData] = useState<ReadingTest | null>(null)
    const [timeLeft, setTimeLeft] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1)
    const [answers, setAnswers] = useState<{ [key: string]: any }>({})
    const [reviewedQuestions, setReviewedQuestions] = useState<Set<number>>(
        new Set()
    )
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [, setShowSubmitConfirm] = useState(false)
    const [testFinished, setTestFinished] = useState(false)

    const questionElementRefs = useRef<Map<string, HTMLElement | null>>(
        new Map()
    )
    const clearHighlightsRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        const fetchTest = async () => {
            setIsLoading(true)
            setError(null)
            try {
                await new Promise((resolve) => setTimeout(resolve, 500))
                const data = mockTestData

                setTestData(data)
                setTimeLeft(data.totalTimeSeconds)
                setIsLoading(false)
            } catch (err) {
                console.error(err)
                setError('Failed to load test data.')
                setIsLoading(false)
            }
        }
        fetchTest()
    }, [testId])

    useEffect(() => {
        if (isLoading || testFinished || isSubmitting) {
            return
        }

        if (timeLeft <= 0) {
            handleFinalSubmit()
            return
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1)
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft, isLoading, testFinished, isSubmitting])

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

    const handlePassageChange = (index: number) => {
        setCurrentPassageIndex(index)

        const firstQuestion =
            testData?.passages[index]?.questionGroups[0]?.questions[0]
        if (firstQuestion) {
            setCurrentQuestionNumber(firstQuestion.number)
        }
    }

    const handleNavigateQuestion = useCallback(
        (questionNumber: number, targetPassageIndex?: number) => {
            if (testFinished || !testData) return

            setCurrentQuestionNumber(questionNumber)

            let passageIdx = targetPassageIndex ?? currentPassageIndex
            let questionId: string | undefined

            if (targetPassageIndex === undefined) {
                for (let i = 0; i < testData.passages.length; i++) {
                    const q = testData.passages[i].questionGroups
                        .flatMap((g) => g.questions)
                        .find((q) => q.number === questionNumber)
                    if (q) {
                        passageIdx = i
                        questionId = q.id
                        break
                    }
                }
            } else {
                questionId = testData.passages[passageIdx].questionGroups
                    .flatMap((g) => g.questions)
                    .find((q) => q.number === questionNumber)?.id
            }

            if (passageIdx !== -1 && passageIdx !== currentPassageIndex) {
                setCurrentPassageIndex(passageIdx)
            }

            setTimeout(() => {
                if (!questionId) {
                    questionId = testData.passages[passageIdx].questionGroups
                        .flatMap((g) => g.questions)
                        .find((q) => q.number === questionNumber)?.id
                }

                const element = questionId
                    ? questionElementRefs.current.get(questionId)
                    : undefined

                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    })
                }
            }, 150)
        },
        [testData, currentPassageIndex, testFinished]
    )

    const promptSubmit = () => {
        if (testFinished || isSubmitting) return
        setShowSubmitConfirm(true)
    }

    const handleFinalSubmit = useCallback(async () => {
        setShowSubmitConfirm(false)
        if (testFinished || isSubmitting) return

        setIsSubmitting(true)
        setTestFinished(true)
        console.log('Submitting answers:', answers)

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500))

            clearHighlightsRef.current?.()

            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith(`${STORAGE_KEY_PREFIX}${testId}_`)) {
                    localStorage.removeItem(key)
                }
            })

            console.log('Test submitted and highlights cleared.')
            alert('Nộp bài thành công!')
        } catch (err) {
            console.error('Submission error:', err)
            setError('Nộp bài thất bại. Vui lòng thử lại.')
            setTestFinished(false)
        } finally {
            setIsSubmitting(false)
        }
    }, [testFinished, isSubmitting, answers, testId, clearHighlightsRef])

    if (isLoading) {
        return <div className={s.loadingContainer}>Đang tải bài thi...</div>
    }
    if (error) {
        return <div className={s.errorContainer}>Lỗi: {error}</div>
    }
    if (!testData) {
        return (
            <div className={s.errorContainer}>
                Không tìm thấy dữ liệu bài thi.
            </div>
        )
    }

    const currentPassage = testData.passages[currentPassageIndex]

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <ReadingHeader timeLeft={timeLeft} />

            <main className={s.mainContent}>
                <ReadingPassage
                    key={currentPassage.id}
                    passage={currentPassage}
                    testId={testData.id}
                    clearHighlightsRef={clearHighlightsRef}
                />
                <QuestionArea
                    key={`${currentPassage.id}-questions`}
                    passage={currentPassage}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    registerRef={registerQuestionRef}
                />
            </main>

            <ReadingFooter
                testData={testData}
                currentPassageIndex={currentPassageIndex}
                onPassageChange={handlePassageChange}
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
                <div className={s.submitOverlay}>Đang nộp bài...</div>
            )}
        </div>
    )
}
