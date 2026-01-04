import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import { AttemptStatus } from '@/types/test.types'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'
import { useDialog } from '@/hooks/useDialog'
import GradingQuestionCard from '@/components/feature/exams/grading/GradingQuestionCard'
import GradingSummaryPanel from '@/components/feature/exams/grading/GradingSummaryPanel'
import s from './GradeAttemptPage.module.css'
import InputField from '@/components/common/input/InputField'

interface GradeData {
    [questionId: string]: {
        teacher_points_earned: number
        teacher_band_score?: number
        teacher_rubric_scores?: Record<string, number>
        teacher_feedback?: string
    }
}

export default function GradeAttemptPage() {
    const { testId, attemptId } = useParams<{
        testId: string
        attemptId: string
    }>()
    const navigate = useNavigate()
    const { alert, confirm } = useDialog()

    const [attempt, setAttempt] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [gradeData, setGradeData] = useState<GradeData>({})
    const [overallFeedback, setOverallFeedback] = useState('')

    useEffect(() => {
        loadAttempt()
    }, [attemptId])

    const loadAttempt = async () => {
        if (!attemptId) return

        setLoading(true)
        try {
            const data = await testApi.getAttemptDetailForTeacher(attemptId)
            setAttempt(data)

            // Initialize grade data from existing scores
            const initialGrades: GradeData = {}
            data.details.forEach((detail: any) => {
                initialGrades[detail.question_id] = {
                    teacher_points_earned:
                        detail.teacher_points_earned ||
                        detail.ai_points_earned ||
                        0,
                    teacher_band_score:
                        detail.teacher_band_score || detail.ai_band_score,
                    teacher_rubric_scores:
                        detail.teacher_rubric_scores || detail.ai_rubric_scores,
                    teacher_feedback: detail.teacher_feedback || '',
                }
            })
            setGradeData(initialGrades)
            setOverallFeedback(data.teacher_feedback || '')
        } catch (err: any) {
            await alert(err.message || 'Không thể tải bài làm')
            navigate(-1)
        } finally {
            setLoading(false)
        }
    }

    const updateQuestionGrade = (
        questionId: string,
        updates: Partial<GradeData[string]>
    ) => {
        setGradeData((prev) => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                ...updates,
            },
        }))
    }

    const handleSubmitGrading = async () => {
        // Validate
        const allGraded = attempt.details.every((d: any) => {
            const grade = gradeData[d.question_id]
            return grade && grade.teacher_points_earned !== undefined
        })

        if (!allGraded) {
            await alert('Vui lòng chấm điểm tất cả các câu hỏi')
            return
        }

        const confirmed = await confirm(
            'Xác nhận hoàn tất chấm điểm? Điểm sẽ được gửi đến học sinh.'
        )
        if (!confirmed) return

        setSubmitting(true)
        try {
            const payload = {
                questions: attempt.details.map((d: any) => ({
                    question_id: d.question_id,
                    ...gradeData[d.question_id],
                })),
                overall_feedback: overallFeedback,
            }

            await testApi.gradeAttempt(attemptId!, payload)
            await alert('Đã chấm điểm thành công!')
            navigate(`/teacher/grading/${testId}`)
        } catch (err: any) {
            await alert(
                'Chấm điểm thất bại: ' + (err.message || 'Vui lòng thử lại')
            )
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className={s.container}>
                <div className={s.loadingBox}>
                    <div className={s.spinner} />
                    <p>Đang tải bài làm...</p>
                </div>
            </div>
        )
    }

    if (!attempt) {
        return (
            <div className={s.container}>
                <Card>
                    <div className={s.errorBox}>
                        <h2>Không tìm thấy bài làm</h2>
                        <ButtonPrimary onClick={() => navigate(-1)}>
                            Quay lại
                        </ButtonPrimary>
                    </div>
                </Card>
            </div>
        )
    }

    const isReadOnly = attempt.status === AttemptStatus.GRADED
    const totalPoints = attempt.details.reduce(
        (sum: number, d: any) => sum + d.max_points,
        0
    )
    const currentTotal = Object.values(gradeData).reduce(
        (sum, g) => sum + g.teacher_points_earned,
        0
    )

    return (
        <div className={s.container}>
            <div className={s.layout}>
                {/* Main Content */}
                <div className={s.mainContent}>
                    {/* Header */}
                    <Card>
                        <div className={s.header}>
                            <div>
                                <h1 className={s.title}>
                                    {isReadOnly
                                        ? 'Xem kết quả chấm điểm'
                                        : 'Chấm điểm bài thi'}
                                </h1>
                                <p className={s.subtitle}>
                                    Học sinh:{' '}
                                    <strong>
                                        {attempt.student_name || 'N/A'}
                                    </strong>
                                </p>
                                <p className={s.meta}>
                                    Nộp bài:{' '}
                                    {new Date(
                                        attempt.submitted_at
                                    ).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <ButtonGhost onClick={() => navigate(-1)}>
                                ← Quay lại
                            </ButtonGhost>
                        </div>
                    </Card>

                    {/* Questions */}
                    <div className={s.questionsList}>
                        {attempt.details.map((detail: any, index: number) => (
                            <GradingQuestionCard
                                key={detail.question_id}
                                questionNumber={index + 1}
                                detail={detail}
                                grade={gradeData[detail.question_id]}
                                onUpdate={(updates: any) =>
                                    updateQuestionGrade(
                                        detail.question_id,
                                        updates
                                    )
                                }
                                readOnly={isReadOnly}
                            />
                        ))}
                    </div>

                    {/* Overall Feedback */}
                    <Card title="Nhận xét chung">
                        <InputField
                            multiline
                            className={s.feedbackTextarea}
                            value={overallFeedback}
                            onChange={(e) => setOverallFeedback(e.target.value)}
                            placeholder="Nhập nhận xét chung về bài làm của học sinh..."
                            rows={6}
                            disabled={isReadOnly}
                        />
                    </Card>

                    {/* Actions */}
                    {!isReadOnly && (
                        <div className={s.actions}>
                            <ButtonGhost onClick={() => navigate(-1)}>
                                Hủy
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={handleSubmitGrading}
                                loading={submitting}
                                size="lg"
                                variant="glass"
                            >
                                Hoàn tất chấm điểm
                            </ButtonPrimary>
                        </div>
                    )}
                </div>

                {/* Sidebar Summary */}
                <GradingSummaryPanel
                    currentTotal={currentTotal}
                    maxTotal={totalPoints}
                    questionsCount={attempt.details.length}
                    gradedCount={Object.keys(gradeData).length}
                />
            </div>
        </div>
    )
}
