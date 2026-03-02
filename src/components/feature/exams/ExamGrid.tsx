import ExamCard from './ExamCard'
import s from './ExamGrid.module.css'
import type { TestListItem, StudentTestListItem } from '@/types/test.types'

interface ExamGridProps {
    exams: (TestListItem | StudentTestListItem)[]
    onExamClick: (examId: string) => void
    userRole:
        | 'student'
        | 'teacher'
        | 'office_admin'
        | 'center_admin'
        | 'system_admin'
}

export default function ExamGrid({
    exams,
    onExamClick,
    userRole,
}: ExamGridProps) {
    if (exams.length === 0) {
        return (
            <div className={s.emptyState}>
                <p>Không tìm thấy bài thi nào phù hợp.</p>
            </div>
        )
    }

    return (
        <div className={s.gridContainer}>
            {exams.map((exam) => (
                <ExamCard
                    key={exam.id}
                    exam={exam}
                    onClick={() => onExamClick(exam.id)}
                    userRole={userRole}
                />
            ))}
        </div>
    )
}
