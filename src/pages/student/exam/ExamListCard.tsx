import Card from '@/components/common/card/Card'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import s from './ExamListCard.module.css'
import type { TestListItem, StudentTestListItem } from '@/types/test.types'
import { getSkillAreaLabel, getDifficultyInfo } from '@/lib/test'

import BackIcon from '@/assets/arrow-left.svg'
import ClockIcon from '@/assets/History.svg'
import QuestionIcon from '@/assets/Card Question.svg'
import CheckIcon from '@/assets/Check Circle.svg'
import Skeleton from '@/components/effect/Skeleton'

interface ExamListCardProps {
    title: string
    exams: (TestListItem | StudentTestListItem)[]
    onBackClick?: () => void
    onExamClick: (examId: string) => void
    onGradingClick?: (examId: string) => void // ✅ NEW: Handler cho nút chấm điểm
    isLoading?: boolean
    viewMode?: 'list' | 'compact'
    userRole:
        | 'student'
        | 'teacher'
        | 'office_admin'
        | 'center_admin'
        | 'system_admin'
}

export default function ExamListCard({
    title,
    exams,
    onBackClick,
    onExamClick,
    onGradingClick,
    isLoading = false,
    viewMode = 'list',
    userRole,
}: ExamListCardProps) {
    const backButton = onBackClick ? (
        <ButtonGhost
            size="sm"
            mode="light"
            leftIcon={<img src={BackIcon} alt="back" />}
            onClick={onBackClick}
        >
            Quay lại
        </ButtonGhost>
    ) : null

    const ExamItemSkeleton = () => (
        <li className={s.examItem} style={{ pointerEvents: 'none' }}>
            <div className={s.examMain}>
                <div className={s.examHeader}>
                    <Skeleton
                        width="40%"
                        height={24}
                        style={{ marginBottom: 8 }}
                    />
                    <Skeleton width={60} height={20} />
                </div>
                <Skeleton variant="text" count={2} />
                <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
                <div
                    className={s.examMeta}
                    style={{ marginTop: 12, display: 'flex', gap: 12 }}
                >
                    <Skeleton width={80} height={16} />
                    <Skeleton width={80} height={16} />
                    <Skeleton width={60} height={20} />
                </div>
            </div>
        </li>
    )

    const renderExamItem = (exam: TestListItem | StudentTestListItem) => {
        const isStudentView = 'canAttempt' in exam
        const studentExam = isStudentView ? (exam as StudentTestListItem) : null
        const canAttempt = studentExam?.canAttempt ?? true

        const isTeacherView = userRole === 'teacher'
        const testExam = !isStudentView ? (exam as TestListItem) : null
        const hasPendingAttempts =
            testExam?.pendingAttemptsCount && testExam.pendingAttemptsCount > 0

        const skillLabel =
            'skill' in exam ? getSkillAreaLabel(exam.skill) : 'N/A'
        const difficultyInfo =
            'difficulty' in exam
                ? getDifficultyInfo(exam.difficulty)
                : { label: 'N/A', color: 'gray' }

        const duration =
            'timeLimitMinutes' in exam
                ? exam.timeLimitMinutes
                : 'durationMinutes' in exam
                  ? exam.durationMinutes
                  : 0

        return (
            <li
                key={exam.id}
                className={`${s.examItem} ${!canAttempt && isStudentView ? s.disabled : ''}`}
                role="button"
                tabIndex={0}
            >
                <div
                    className={s.examMain}
                    onClick={() => onExamClick(exam.id)}
                >
                    <div className={s.examHeader}>
                        <h4 className={s.examTitle}>{exam.title}</h4>
                        <span
                            className={s.difficulty}
                            style={{
                                backgroundColor: `var(--color-${difficultyInfo.color}-100)`,
                                color: `var(--color-${difficultyInfo.color}-700)`,
                            }}
                        >
                            {difficultyInfo.label}
                        </span>

                        {isTeacherView && hasPendingAttempts && (
                            <span className={s.pendingBadge}>
                                🔔 {testExam.pendingAttemptsCount} bài chờ chấm
                            </span>
                        )}
                    </div>

                    {exam.description && viewMode === 'list' && (
                        <p className={s.examDesc}>{exam.description}</p>
                    )}

                    <div className={s.examMeta}>
                        <div className={s.metaItem}>
                            <img src={ClockIcon} alt="duration" />
                            <span>{duration} phút</span>
                        </div>
                        <div className={s.metaItem}>
                            <img src={QuestionIcon} alt="questions" />
                            <span>{exam.totalQuestions} câu</span>
                        </div>
                        <span className={s.skillBadge}>{skillLabel}</span>
                    </div>

                    {isStudentView && studentExam && (
                        <div className={s.studentMeta}>
                            <span className={s.attempts}>
                                Đã làm:{' '}
                                <strong>
                                    {studentExam.attemptsCount}/
                                    {studentExam.maxAttempts}
                                </strong>
                            </span>
                            {studentExam.latestAttemptScore !== null && (
                                <span className={s.score}>
                                    <img src={CheckIcon} alt="score" />
                                    Điểm:{' '}
                                    <strong>
                                        {studentExam.latestAttemptScore.toFixed(
                                            1
                                        )}
                                    </strong>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className={s.examAction}>
                    {isTeacherView && onGradingClick ? (
                        <div className={s.teacherActions}>
                            <ButtonGhost
                                size="sm"
                                mode="light"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onExamClick(exam.id)
                                }}
                            >
                                Xem chi tiết
                            </ButtonGhost>
                            {testExam?.totalAttemptsCount &&
                                testExam.totalAttemptsCount > 0 && (
                                    <ButtonPrimary
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onGradingClick(exam.id)
                                        }}
                                    >
                                        Chấm điểm
                                        {hasPendingAttempts &&
                                            ` (${testExam.pendingAttemptsCount})`}
                                    </ButtonPrimary>
                                )}
                        </div>
                    ) : isStudentView ? (
                        /* Student view */
                        canAttempt ? (
                            <span className={s.ctaText}>
                                Làm bài
                                <span className={s.arrow}>→</span>
                            </span>
                        ) : (
                            <span className={s.disabledText}>Hết lượt</span>
                        )
                    ) : null}
                </div>
            </li>
        )
    }

    return (
        <Card
            title={title}
            variant="outline"
            mode="light"
            controls={backButton}
        >
            <div className={s.cardBody}>
                {isLoading ? (
                    <ul className={s.examList}>
                        {[1, 2, 3].map((i) => (
                            <ExamItemSkeleton key={i} />
                        ))}
                    </ul>
                ) : exams.length > 0 ? (
                    <ul className={s.examList}>{exams.map(renderExamItem)}</ul>
                ) : (
                    <div className={s.emptyState}>
                        Không tìm thấy bài thi nào phù hợp.
                    </div>
                )}
            </div>
        </Card>
    )
}
