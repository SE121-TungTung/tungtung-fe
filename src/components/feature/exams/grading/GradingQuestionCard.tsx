import { useState } from 'react'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { getQuestionTypeLabel } from '@/lib/test'
import s from './GradingQuestionCard.module.css'

interface GradingQuestionCardProps {
    questionNumber: number
    detail: any
    grade: {
        teacher_points_earned: number
        teacher_band_score?: number
        teacher_rubric_scores?: Record<string, number>
        teacher_feedback?: string
    }
    onUpdate: (updates: any) => void
    readOnly?: boolean
}

export default function GradingQuestionCard({
    questionNumber,
    detail,
    grade,
    onUpdate,
    readOnly = false,
}: GradingQuestionCardProps) {
    const [showFeedback, setShowFeedback] = useState(
        !!grade.teacher_feedback || !!detail.ai_feedback
    )

    const isWriting =
        detail.question_type === 'writing_task_1' ||
        detail.question_type === 'writing_task_2'
    const isSpeaking = detail.question_type.startsWith('speaking_part_')

    const hasAIGrade =
        detail.ai_points_earned !== null || detail.ai_band_score !== null

    return (
        <Card className={s.questionCard}>
            {/* Header */}
            <div className={s.header}>
                <div className={s.headerLeft}>
                    <span className={s.questionNumber}>
                        Câu {questionNumber}
                    </span>
                    <span className={s.questionType}>
                        {getQuestionTypeLabel(detail.question_type)}
                    </span>
                </div>
                <div className={s.headerRight}>
                    <span className={s.maxPoints}>
                        {detail.max_points} điểm
                    </span>
                </div>
            </div>

            {/* Question Text */}
            <div className={s.questionText}>{detail.question_text}</div>

            {/* Student Answer */}
            {!isSpeaking && detail.user_answer && (
                <div className={s.answerSection}>
                    <h4 className={s.sectionTitle}>
                        ✍️ Câu trả lời của học sinh:
                    </h4>
                    <div className={s.answerBox}>{detail.user_answer}</div>
                </div>
            )}

            {/* Audio Response (Speaking) */}
            {isSpeaking && detail.audio_response_url && (
                <div className={s.answerSection}>
                    <h4 className={s.sectionTitle}>🎤 Bản ghi âm:</h4>
                    <audio
                        controls
                        src={detail.audio_response_url}
                        className={s.audioPlayer}
                    />
                </div>
            )}

            {/* AI Grading (if available) */}
            {hasAIGrade && (
                <div className={s.aiSection}>
                    <h4 className={s.sectionTitle}>🤖 Gợi ý từ AI:</h4>
                    <div className={s.aiGrid}>
                        {detail.ai_points_earned !== null && (
                            <div className={s.aiItem}>
                                <span className={s.aiLabel}>Điểm AI:</span>
                                <span className={s.aiValue}>
                                    {detail.ai_points_earned.toFixed(1)} /{' '}
                                    {detail.max_points}
                                </span>
                            </div>
                        )}
                        {detail.ai_band_score !== null && (
                            <div className={s.aiItem}>
                                <span className={s.aiLabel}>Band Score:</span>
                                <span className={s.aiValue}>
                                    {detail.ai_band_score.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                    {detail.ai_feedback && (
                        <div className={s.aiFeedback}>
                            <strong>Nhận xét AI:</strong>
                            <p>{detail.ai_feedback}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Teacher Grading */}
            <div className={s.gradingSection}>
                <h4 className={s.sectionTitle}>📝 Chấm điểm của giáo viên:</h4>

                <div className={s.gradingInputs}>
                    <InputField
                        label="Điểm"
                        type="number"
                        value={grade.teacher_points_earned}
                        onChange={(e) =>
                            onUpdate({
                                teacher_points_earned:
                                    parseFloat(e.target.value) || 0,
                            })
                        }
                        min={0}
                        max={detail.max_points}
                        step={0.5}
                        disabled={readOnly}
                        required
                    />

                    {(isWriting || isSpeaking) && (
                        <InputField
                            label="Band Score (0-9)"
                            type="number"
                            value={grade.teacher_band_score || ''}
                            onChange={(e) =>
                                onUpdate({
                                    teacher_band_score: e.target.value
                                        ? parseFloat(e.target.value)
                                        : null,
                                })
                            }
                            min={0}
                            max={9}
                            step={0.5}
                            disabled={readOnly}
                            placeholder="Optional"
                        />
                    )}
                </div>

                {/* Feedback Toggle */}
                <button
                    className={s.feedbackToggle}
                    onClick={() => setShowFeedback(!showFeedback)}
                >
                    {showFeedback ? '▼' : '▶'} Nhận xét chi tiết
                </button>

                {showFeedback && (
                    <InputField
                        label="Nhận xét"
                        multiline
                        value={grade.teacher_feedback || ''}
                        onChange={(e) =>
                            onUpdate({ teacher_feedback: e.target.value })
                        }
                        placeholder="Nhập nhận xét cho học sinh..."
                        rows={4}
                        disabled={readOnly}
                    />
                )}
            </div>

            {/* Auto-graded indicator */}
            {detail.auto_graded && (
                <div className={s.autoGradedBadge}>✓ Tự động chấm điểm</div>
            )}
        </Card>
    )
}
