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
    return (
        <div className={s.summaryContainer}>
            <div className={s.summaryContainer}>
                {/* Answer box */}
                <div className={s.answerFields}>
                    {group.questions.map((q, idx) => (
                        <div
                            key={q.id}
                            className={s.answerItem}
                            ref={(el) => registerRef(q.id, el)}
                        >
                            <label className={s.answerLabel}>{idx + 1}.</label>
                            <input
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
        </div>
    )
}
