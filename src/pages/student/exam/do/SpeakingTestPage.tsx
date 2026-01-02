import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import s from './SpeakingTestPage.module.css'

import { testApi } from '@/lib/test'
import { type Test } from '@/types/test.types'
import { useTestTimer } from '@/hooks/useTestTimer'
import { useAnswerManager } from '@/hooks/useAnswerManager'
import { useTestSubmit } from '@/hooks/useTestSubmit'

import { TestHeader } from '@/components/feature/exams/shared/TextHeader'
import { TestFooter } from '@/components/feature/exams/shared/TextFooter'
import { CueCardViewer } from '@/components/feature/exams/MediaViewers/CueCardViewer'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import { enhanceTestWithQuestionNumbers } from '@/utils/examHelpers'

export default function SpeakingTestPage() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()

    const [sections, setSections] = useState<any[]>([])
    const [test, setTest] = useState<Test | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPartIndex, setCurrentPartIndex] = useState(0)
    const [testFinished, setTestFinished] = useState(false)
    const [startTime, setStartTime] = useState('')

    const { answers, clearAnswers } = useAnswerManager({
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

    const currentSection = sections[currentPartIndex]
    const currentPart = currentSection?.parts[0]
    const currentQuestions = currentPart?.questionGroups[0]?.questions || []
    const partNumber = (currentPartIndex + 1) as 1 | 2 | 3

    return (
        <div className={`${s.pageWrapper} lightMode`}>
            <TestHeader
                skillName="IELTS Speaking"
                icon="🎤"
                timeLeft={timeLeft}
                formattedTime={formattedTime}
                isLowTime={isLowTime}
            />

            <main className={s.mainContent}>
                {/* Left: Cue Card */}
                <CueCardViewer
                    partNumber={partNumber}
                    title={currentSection?.name || `Part ${partNumber}`}
                    instructions={currentPart?.instructions || ''}
                    questions={currentQuestions.map(
                        (q: any) => q.questionText || ''
                    )}
                    imageUrl={currentPart?.imageUrl}
                    prepTime={partNumber === 2 ? 60 : undefined}
                    speakTime={partNumber === 2 ? 120 : 180}
                />

                {/* Right: Recording Controls */}
                <div className={s.recordingContainer}>
                    {currentQuestions.map((q: any) => (
                        <SpeakingQuestion
                            key={q.id}
                            questionId={q.id}
                            globalNumber={q.globalNumber}
                            questionText={q.questionText || ''}
                            audioUrl={q.audioUrl}
                            attemptId={attemptId!}
                            registerRef={() => {}}
                        />
                    ))}
                </div>
            </main>

            <TestFooter
                sections={sections}
                currentIndex={currentPartIndex}
                onSectionChange={setCurrentPartIndex}
                currentQNum={currentQuestions[0]?.globalNumber || 1}
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
