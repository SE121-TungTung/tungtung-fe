import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import s from './WritingTestPage.module.css'

import { testApi } from '@/lib/test'
import { type Test, QuestionType } from '@/types/test.types'
import { useTestTimer } from '@/hooks/useTestTimer'
import { useAnswerManager } from '@/hooks/useAnswerManager'
import { useTestSubmit } from '@/hooks/useTestSubmit'

import { TestHeader } from '@/components/feature/exams/shared/TextHeader'
import { TestFooter } from '@/components/feature/exams/shared/TextFooter'
import { PromptViewer } from '@/components/feature/exams/MediaViewers/PromptViewer'
import { EssayQuestion } from '@/components/feature/exams/EssayQuestion'
import { enhanceTestWithQuestionNumbers } from '@/utils/examHelpers'

export default function WritingTestPage() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()

    const [sections, setSections] = useState<any[]>([])
    const [test, setTest] = useState<Test | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
    const [testFinished, setTestFinished] = useState(false)
    const [startTime, setStartTime] = useState('')

    const { answers, handleAnswerChange, clearAnswers } = useAnswerManager({
        attemptId: attemptId || '',
        enabled: !!attemptId && !testFinished,
    })

    const { submit, isSubmitting } = useTestSubmit({
        attemptId: attemptId || '',
        onSuccess: () => clearAnswers(),
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

    const handleFinalSubmit = useCallback(async () => {
        if (window.confirm('Are you sure you want to submit?')) {
            await submit(answers)
        }
    }, [answers, submit])

    if (isLoading) return <div className={s.loadingContainer}>Loading...</div>
    if (!sections.length) return <div>No content.</div>

    const currentSection = sections[currentTaskIndex]
    const currentTask =
        currentSection?.parts[0]?.questionGroups[0]?.questions[0]
    const taskNumber =
        currentTask?.questionType === QuestionType.WRITING_TASK_1 ? 1 : 2

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <TestHeader
                skillName="IELTS Academic Writing"
                icon="✍️"
                timeLeft={timeLeft}
                formattedTime={formattedTime}
                isLowTime={isLowTime}
            />

            <main className={s.mainContent}>
                {/* Left: Task Prompt */}
                <PromptViewer
                    taskNumber={taskNumber}
                    title={currentTask?.title || `Task ${taskNumber}`}
                    prompt={currentTask?.questionText || ''}
                    imageUrl={currentTask?.imageUrl}
                />

                {/* Right: Essay Editor */}
                <div className={s.editorContainer}>
                    <EssayQuestion
                        questionId={currentTask?.id}
                        questionNumber={currentTask?.globalNumber}
                        questionText=""
                        value={answers[currentTask?.id] || ''}
                        onChange={(v) => handleAnswerChange(currentTask?.id, v)}
                        registerRef={() => {}}
                        minWords={taskNumber === 1 ? 150 : 250}
                        maxWords={taskNumber === 1 ? 250 : 350}
                        hideHeader={true}
                    />
                </div>
            </main>

            <TestFooter
                sections={sections}
                currentIndex={currentTaskIndex}
                onSectionChange={setCurrentTaskIndex}
                currentQNum={currentTask?.globalNumber || 1}
                reviewed={new Set()}
                answers={answers}
                onNav={() => {}}
                onToggleReview={() => {}}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
                hideReviewButton={true}
            />
        </div>
    )
}
