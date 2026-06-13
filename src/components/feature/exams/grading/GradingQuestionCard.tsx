import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Card from '@/components/common/card/Card'
import InputField from '@/components/common/input/InputField'
import { getQuestionTypeLabel } from '@/lib/test'
import s from './GradingQuestionCard.module.css'

interface RubricBarProps {
    label: string
    score: number
    max?: number
}

function RubricBar({ label, score, max = 9 }: RubricBarProps) {
    const percentage = (score / max) * 100
    return (
        <div className={s.rubricBarContainer}>
            <div className={s.rubricBarHeader}>
                <span className={s.rubricBarLabel}>{label}</span>
                <span className={s.rubricBarScore}>
                    {score.toFixed(1)} / {max.toFixed(1)}
                </span>
            </div>
            <div className={s.rubricBarOuter}>
                <div
                    className={s.rubricBarInner}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function PronunciationWordComponent({ word }: { word: any }) {
    const [active, setActive] = useState(false)
    const isCorrect = word.is_correct
    const hasError = word.error_type

    return (
        <span
            className={`${s.pronWord} ${isCorrect ? s.pronWordCorrect : s.pronWordIncorrect}`}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            onClick={() => setActive(!active)}
        >
            {word.word}
            {active && (
                <span className={s.pronTooltip}>
                    <div className={s.tooltipRow}>
                        <strong>Word:</strong> {word.word}
                    </div>
                    <div className={s.tooltipRow}>
                        <strong>Score:</strong> {word.score}%
                    </div>
                    <div className={s.tooltipRow}>
                        <strong>Expected:</strong> /{word.phonemes_expected}/
                    </div>
                    <div className={s.tooltipRow}>
                        <strong>Spoken:</strong> /{word.phonemes_actual}/
                    </div>
                    {hasError && (
                        <div className={s.tooltipRow}>
                            <strong>Error:</strong>{' '}
                            <span className={s.errorBadge}>
                                {word.error_type}
                            </span>
                        </div>
                    )}
                </span>
            )}
        </span>
    )
}

function PronunciationBreakdown({ breakdown }: { breakdown: any[] }) {
    if (!breakdown || breakdown.length === 0) return null
    return (
        <div className={s.pronContainer}>
            <h5 className={s.pronTitle}>
                🔊 Phát âm chi tiết (IPA word-by-word):
            </h5>
            <div className={s.pronList}>
                {breakdown.map((w, idx) => (
                    <PronunciationWordComponent key={idx} word={w} />
                ))}
            </div>
        </div>
    )
}

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

    const getWritingRubricBars = (scores: any) => {
        if (!scores) return null
        const tr = scores.task_response ?? scores.taskResponse ?? 0
        const cc = scores.coherence_cohesion ?? scores.coherenceCohesion ?? 0
        const lr = scores.lexical_resource ?? scores.lexicalResource ?? 0
        const gr = scores.grammatical_range ?? scores.grammaticalRange ?? 0

        return (
            <div className={s.rubricGrid}>
                <RubricBar label="Task Achievement" score={tr} />
                <RubricBar label="Coherence & Cohesion" score={cc} />
                <RubricBar label="Lexical Resource" score={lr} />
                <RubricBar label="Grammatical Range" score={gr} />
            </div>
        )
    }

    const getSpeakingRubricBars = (scores: any) => {
        if (!scores) return null
        const fc = scores.fluency_coherence ?? scores.fluencyCoherence ?? 0
        const lr = scores.lexical_resource ?? scores.lexicalResource ?? 0
        const gr = scores.grammatical_range ?? scores.grammaticalRange ?? 0
        const pr = scores.pronunciation ?? 0

        return (
            <div className={s.rubricGrid}>
                <RubricBar label="Fluency & Coherence" score={fc} />
                <RubricBar label="Lexical Resource" score={lr} />
                <RubricBar label="Grammatical Range" score={gr} />
                <RubricBar label="Pronunciation" score={pr} />
            </div>
        )
    }

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

            {/* Transcription (Speaking) */}
            {isSpeaking && detail.user_answer && (
                <div className={s.answerSection}>
                    <h4 className={s.sectionTitle}>
                        📝 Transcription (Bản dịch âm thanh):
                    </h4>
                    <div className={s.answerBox}>{detail.user_answer}</div>
                </div>
            )}

            {/* Pronunciation breakdown */}
            {isSpeaking && detail.response_data?.pronunciation_breakdown && (
                <PronunciationBreakdown
                    breakdown={detail.response_data.pronunciation_breakdown}
                />
            )}

            {/* AI Refined & Upgraded Suggestions */}
            {(detail.response_data?.refined_transcript ||
                detail.response_data?.better_version) && (
                <div className={s.suggestionsBox}>
                    {detail.response_data.refined_transcript && (
                        <div className={s.suggestionItem}>
                            <h5 className={s.suggestionTitle}>
                                ✨ Refined Transcript (Bản sửa lỗi đề xuất):
                            </h5>
                            <div className={s.suggestionText}>
                                {detail.response_data.refined_transcript}
                            </div>
                        </div>
                    )}
                    {detail.response_data.better_version && (
                        <div className={s.suggestionItem}>
                            <h5 className={s.suggestionTitle}>
                                🚀 Upgraded Version (Đề xuất Band 8+):
                            </h5>
                            <div className={s.suggestionText}>
                                {detail.response_data.better_version}
                            </div>
                        </div>
                    )}
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

                    {/* Rubric scores breakdown */}
                    {isWriting &&
                        detail.ai_rubric_scores &&
                        getWritingRubricBars(detail.ai_rubric_scores)}
                    {isSpeaking &&
                        detail.ai_rubric_scores &&
                        getSpeakingRubricBars(detail.ai_rubric_scores)}

                    {detail.ai_feedback && (
                        <div className={s.aiFeedback}>
                            <strong>Nhận xét AI:</strong>
                            <div className={s.markdownBody}>
                                <ReactMarkdown>
                                    {detail.ai_feedback}
                                </ReactMarkdown>
                            </div>
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
