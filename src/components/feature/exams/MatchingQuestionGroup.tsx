import s from './MatchingQuestionGroup.module.css'
import type { QuestionGroup, Question } from '@/types/exam.types'

// Kiểu cho câu trả lời: { "q1": "A", "q2": "B" }
type AnswerMap = { [questionId: string]: string }

interface MatchingGroupProps {
    group: QuestionGroup
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement) => void
}

export default function MatchingQuestionGroup({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: MatchingGroupProps) {
    // optionsBank là bắt buộc cho dạng này
    if (!group.optionsBank) {
        return <div>Lỗi: Không tìm thấy danh sách lựa chọn (options bank).</div>
    }

    return (
        <div className={s.container}>
            {/* 1. Hiển thị Options Bank (A, B, C...) */}
            <div className={s.optionsBankCard}>
                <h4 className={s.optionsBankTitle}>Options</h4>
                <ul className={s.optionsList}>
                    {group.optionsBank.map((option) => (
                        <li key={option.value} className={s.optionItem}>
                            <span className={s.optionLabel}>
                                {option.value}
                            </span>
                            <span className={s.optionText}>{option.text}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 2. Hiển thị danh sách câu hỏi để chọn */}
            <div className={s.matchingList}>
                {group.questions.map((question) => (
                    <div
                        key={question.id}
                        className={s.matchItem}
                        // Đăng ký ref với ID câu hỏi
                        ref={(el) => {
                            if (el) registerRef(question.id, el)
                        }}
                    >
                        <label
                            htmlFor={`select-${question.id}`}
                            className={s.matchLabel}
                        >
                            <strong>{question.number}.</strong>{' '}
                            {(question as any).itemText ||
                                (question as any).text}
                        </label>
                        <select
                            id={`select-${question.id}`}
                            className={s.selectAnswer}
                            value={answers[question.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(question.id, e.target.value)
                            }
                        >
                            <option value="">Choose...</option>
                            {group.optionsBank!.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.text} ( {option.value} )
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}
