import s from './MatchingQuestion.module.css'
import type { QuestionGroup, Question } from '@/types/test.types'

type AnswerMap = { [questionId: string]: string }

interface MatchingQuestionProps {
    group: QuestionGroup & {
        questions: (Question & { globalNumber: number })[]
    }
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function MatchingQuestion({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: MatchingQuestionProps) {
    // Matching cần options từ group (options bank)
    // Backend cần cung cấp options trong group hoặc questions

    // Giả sử options lưu trong metadata hoặc cần parse từ instructions
    const optionsBank = (group as any).metadata?.options || []

    if (optionsBank.length === 0) {
        return <div>Missing options bank for matching questions</div>
    }

    return (
        <div className={s.container}>
            {/* Options Bank */}
            <div className={s.optionsBankCard}>
                <h4 className={s.optionsBankTitle}>Options</h4>
                <ul className={s.optionsList}>
                    {optionsBank.map((option: any) => (
                        <li key={option.key} className={s.optionItem}>
                            <span className={s.optionLabel}>{option.key}</span>
                            <span className={s.optionText}>{option.text}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Questions */}
            <div className={s.matchingList}>
                {group.questions.map((question) => (
                    <div
                        key={question.id}
                        className={s.matchItem}
                        ref={(el) => registerRef(question.id, el)}
                    >
                        <label className={s.matchLabel}>
                            <strong>{question.orderNumber}.</strong>{' '}
                            {question.questionText}
                        </label>
                        <select
                            className={s.selectAnswer}
                            value={answers[question.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(question.id, e.target.value)
                            }
                        >
                            <option value="">Choose...</option>
                            {optionsBank.map((option: any) => (
                                <option key={option.key} value={option.key}>
                                    {option.key}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}
