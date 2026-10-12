import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    LogOutIcon,
    LoaderIcon,
    InfoIcon,
} from '@/components/feature/adaptive-quiz/AdaptiveIcons'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import type { AdaptiveSession, NextQuestion } from '@/types/adaptive-quiz'
import { AbilityGauge } from '@/components/feature/adaptive-quiz/AbilityGauge'
import { CATProgressBar } from '@/components/feature/adaptive-quiz/CATProgressBar'
import { AdaptiveQuestionCard } from '@/components/feature/adaptive-quiz/AdaptiveQuestionCard'
import styles from './AdaptiveQuizRoomPage.module.css'

export const AdaptiveQuizRoomPage: React.FC = () => {
    const { id: sessionId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [session, setSession] = useState<AdaptiveSession | null>(null)
    const [currentQuestion, setCurrentQuestion] = useState<NextQuestion | null>(
        null
    )
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [lastFeedback, setLastFeedback] = useState<{
        isCorrect: boolean
        correctAnswer?: string | null
        explanation?: string | null
    } | null>(null)

    const questionStartTimeRef = useRef<number>(Date.now())

    useEffect(() => {
        if (!sessionId) return

        const initRoom = async () => {
            try {
                const s = await adaptiveQuizApi.getSession(sessionId)
                setSession(s)

                if (s.status === 'completed') {
                    navigate(`/student/adaptive-quiz/${sessionId}/result`, {
                        replace: true,
                    })
                    return
                }

                // Fetch next question
                const q = await adaptiveQuizApi.getNextQuestion(sessionId)
                setCurrentQuestion(q)
                questionStartTimeRef.current = Date.now()
            } catch (err: unknown) {
                console.error('Failed to init adaptive quiz room', err)
                // If already completed or pool exhausted
                const errorObj = err as { message?: string; detail?: string }
                if (
                    errorObj?.message?.includes('đã hoàn thành') ||
                    errorObj?.detail?.includes('đã hoàn thành')
                ) {
                    navigate(`/student/adaptive-quiz/${sessionId}/result`, {
                        replace: true,
                    })
                }
            } finally {
                setIsLoading(false)
            }
        }

        initRoom()
    }, [sessionId, navigate])

    const handleSubmitAnswer = async (answer: string) => {
        if (!sessionId || !currentQuestion || isSubmitting) return

        setIsSubmitting(true)
        const timeSpent = Math.max(
            1,
            Math.round((Date.now() - questionStartTimeRef.current) / 1000)
        )

        try {
            const res = await adaptiveQuizApi.submitResponse(sessionId, {
                question_id: currentQuestion.question_id,
                response_data: answer,
                time_spent_seconds: timeSpent,
            })

            // Update feedback
            setLastFeedback({
                isCorrect: res.is_correct,
                correctAnswer: res.correct_answer,
                explanation: res.explanation,
            })

            // Update live session state
            setSession((prev) => {
                if (!prev) return null
                return {
                    ...prev,
                    theta_current: res.theta_after,
                    se_current: res.se_after,
                    items_administered: res.item_position,
                    estimated_band: res.estimated_band ?? prev.estimated_band,
                    status: res.is_finished ? 'completed' : prev.status,
                }
            })

            if (res.is_finished) {
                // Short delay to show final feedback, then redirect to result
                setTimeout(() => {
                    navigate(`/student/adaptive-quiz/${sessionId}/result`)
                }, 1500)
                return
            }

            // Load next adaptive question
            const nextQ = await adaptiveQuizApi.getNextQuestion(sessionId)
            setCurrentQuestion(nextQ)
            questionStartTimeRef.current = Date.now()
        } catch (err) {
            console.error('Failed to submit answer', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFinishEarly = async () => {
        if (!sessionId) return
        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn nộp bài sớm và xem kết quả hiện tại?'
        )
        if (!confirmed) return

        try {
            await adaptiveQuizApi.finishSession(sessionId)
            navigate(`/student/adaptive-quiz/${sessionId}/result`)
        } catch (err) {
            console.error('Failed to finish session early', err)
        }
    }

    if (isLoading || !session) {
        return (
            <div className={styles.loadingWrapper}>
                <LoaderIcon size={36} />
                <span>Đang tải phòng thi thích ứng...</span>
            </div>
        )
    }

    return (
        <div className={styles.roomContainer}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <div className={styles.roomInfo}>
                    <h2 className={styles.roomTitle}>
                        Phòng Thi Thích Ứng Năng Lực
                    </h2>
                    <span className={styles.skillBadge}>
                        {session.skill_area === 'reading'
                            ? 'IELTS Reading'
                            : 'IELTS Listening'}
                    </span>
                </div>

                <button
                    className={styles.finishEarlyBtn}
                    onClick={handleFinishEarly}
                    type="button"
                >
                    <LogOutIcon size={16} />
                    Nộp bài sớm
                </button>
            </div>

            {/* Progress Convergence Bar */}
            <CATProgressBar
                currentPosition={session.items_administered + 1}
                maxItems={session.max_items}
                seCurrent={session.se_current}
                targetSE={0.3}
            />

            {/* Split Grid */}
            <div className={styles.mainGrid}>
                {/* Left Sidebar: Live Ability Gauge */}
                <div className={styles.gaugeSidebar}>
                    <AbilityGauge
                        theta={session.theta_current}
                        se={session.se_current}
                        estimatedBand={session.estimated_band}
                        showDetails={true}
                    />

                    <div className={styles.hintCard}>
                        <div className={styles.hintTitle}>
                            <InfoIcon size={16} />
                            Cơ Chế Thích Ứng CAT
                        </div>
                        <p className={styles.hintDesc}>
                            Câu hỏi tiếp theo được thuật toán chọn lọc tự động
                            sao pro cung cấp nhiều thông tin nhất về mức năng
                            lực hiện tại của bạn.
                        </p>
                    </div>
                </div>

                {/* Main: Question Card */}
                <div>
                    {currentQuestion ? (
                        <AdaptiveQuestionCard
                            question={currentQuestion}
                            onSubmit={handleSubmitAnswer}
                            isSubmitting={isSubmitting}
                            lastFeedback={lastFeedback}
                        />
                    ) : (
                        <div className={styles.loadingWrapper}>
                            <LoaderIcon size={24} />
                            <span>Đang tối ưu hóa câu hỏi tiếp theo...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdaptiveQuizRoomPage
