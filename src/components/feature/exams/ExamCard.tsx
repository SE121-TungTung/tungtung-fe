import s from './ExamCard.module.css'
import type { TestListItem, StudentTestListItem } from '@/types/test.types'
import { getSkillAreaLabel, getDifficultyInfo } from '@/lib/test'

// Icons
import ClockIcon from '@/assets/History.svg'
import QuestionIcon from '@/assets/Card Question.svg'
import CheckIcon from '@/assets/Check Circle.svg'

interface ExamCardProps {
    exam: TestListItem | StudentTestListItem
    onClick: () => void
    userRole:
        | 'student'
        | 'teacher'
        | 'office_admin'
        | 'center_admin'
        | 'system_admin'
}

export default function ExamCard({ exam, onClick, userRole }: ExamCardProps) {
    // Check if this is StudentTestListItem
    const isStudentView = 'canAttempt' in exam

    // Get skill info - handle both types
    const skillLabel = 'skill' in exam ? getSkillAreaLabel(exam.skill) : 'N/A'
    const difficultyInfo =
        'difficulty' in exam
            ? getDifficultyInfo(exam.difficulty)
            : { label: 'N/A', color: 'red' }

    // For student view
    const studentExam = isStudentView ? (exam as StudentTestListItem) : null
    const canAttempt = studentExam?.canAttempt ?? true
    const attemptsInfo = studentExam
        ? `${studentExam.attemptsCount}/${studentExam.maxAttempts}`
        : null
    const latestScore = studentExam?.latestAttemptScore

    return (
        <div
            className={`${s.card} ${!canAttempt ? s.disabled : ''}`}
            onClick={canAttempt ? onClick : undefined}
            role="button"
            tabIndex={canAttempt ? 0 : -1}
            aria-disabled={!canAttempt}
        >
            {/* Header */}
            <div className={s.cardHeader}>
                <h3 className={s.title} title={exam.title}>
                    {exam.title}
                </h3>
                <span
                    className={s.difficulty}
                    style={{
                        backgroundColor: `var(--color-${difficultyInfo.color}-100)`,
                        color: `var(--color-${difficultyInfo.color}-700)`,
                    }}
                >
                    {difficultyInfo.label}
                </span>
            </div>

            {/* Description */}
            {exam.description && (
                <p className={s.description}>
                    {exam.description.length > 80
                        ? `${exam.description.substring(0, 80)}...`
                        : exam.description}
                </p>
            )}

            {/* Meta Info */}
            <div className={s.metaInfo}>
                <div className={s.metaItem}>
                    <img src={ClockIcon} alt="duration" />
                    <span>
                        {'timeLimitMinutes' in exam
                            ? `${exam.timeLimitMinutes} phút`
                            : `${'durationMinutes' in exam ? exam.durationMinutes : 'N/A'} phút`}
                    </span>
                </div>
                <div className={s.metaItem}>
                    <img src={QuestionIcon} alt="questions" />
                    <span>{exam.totalQuestions} câu</span>
                </div>
                <div className={s.metaItem}>
                    <span className={s.skillBadge}>{skillLabel}</span>
                </div>
            </div>

            {/* Student-specific info */}
            {isStudentView && studentExam && (
                <div className={s.studentInfo}>
                    {attemptsInfo && (
                        <div className={s.attempts}>
                            Đã làm: <strong>{attemptsInfo}</strong>
                        </div>
                    )}
                    {latestScore !== null && latestScore !== undefined && (
                        <div className={s.score}>
                            <img src={CheckIcon} alt="score" />
                            Điểm: <strong>{latestScore.toFixed(1)}</strong>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className={s.cardFooter}>
                {canAttempt ? (
                    <span className={s.ctaText}>
                        {userRole === 'student'
                            ? 'Bắt đầu làm bài'
                            : 'Xem chi tiết'}
                    </span>
                ) : (
                    <span className={s.disabledText}>Đã hết lượt làm bài</span>
                )}
            </div>
        </div>
    )
}
