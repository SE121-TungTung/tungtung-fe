import type { QuestionGroup, Question } from '@/types/test.types'
import s from './SummaryCompletionGroup.module.css' // Dùng chung CSS

type AnswerMap = { [questionId: string]: string }

interface NoteCompletionGroupProps {
    group: QuestionGroup & {
        questions: (Question & { globalNumber: number })[]
    }
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function NoteCompletionGroup({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: NoteCompletionGroupProps) {
    return (
        <div className={s.summaryContainer}>
            {/* Instructions/Notes template */}
            {group.instructions && (
                <div className={s.summaryText}>{group.instructions}</div>
            )}

            {/* Answer fields */}
            <div className={s.answerFields}>
                {group.questions.map((q) => (
                    <div
                        key={q.id}
                        className={s.answerItem}
                        ref={(el) => registerRef(q.id, el)}
                    >
                        <label htmlFor={`note-${q.id}`}>
                            <strong>{q.orderNumber}.</strong> {q.questionText}
                        </label>
                        <input
                            id={`note-${q.id}`}
                            type="text"
                            className={s.inputField}
                            value={answers[q.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(q.id, e.target.value)
                            }
                            placeholder="Your answer..."
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
