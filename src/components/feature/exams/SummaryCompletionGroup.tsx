import s from './SummaryCompletionGroup.module.css'
import type { QuestionGroup, Question } from '@/types/test.types'

type AnswerMap = { [questionId: string]: string }

interface SummaryCompletionGroupProps {
    group: QuestionGroup & {
        questions: (Question & { globalNumber: number })[]
    }
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function SummaryCompletionGroup({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: SummaryCompletionGroupProps) {
    // Summary: instructions chứa text với (1), (2)... để điền
    // Hoặc render list các câu hỏi với input

    return (
        <div className={s.summaryContainer}>
            {/* Hiển thị instructions như paragraph */}
            {group.instructions && (
                <div
                    className={s.summaryText}
                    dangerouslySetInnerHTML={{ __html: group.instructions }}
                />
            )}

            {/* Hoặc render từng câu hỏi */}
            <div className={s.answerFields}>
                {group.questions.map((q) => (
                    <div
                        key={q.id}
                        className={s.answerItem}
                        ref={(el) => registerRef(q.id, el)}
                    >
                        <label htmlFor={`sum-${q.id}`}>
                            <strong>{q.globalNumber}.</strong>
                        </label>
                        <input
                            id={`sum-${q.id}`}
                            type="text"
                            className={s.inputField}
                            value={answers[q.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(q.id, e.target.value)
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
