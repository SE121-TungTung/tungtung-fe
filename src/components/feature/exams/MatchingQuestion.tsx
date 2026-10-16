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
    // Matching options lấy từ metadata, questions options, hoặc parse từ instructions (A-F, A-G...)
    let optionsBank: { key: string; text: string }[] =
        (group as any).metadata?.options || group.questions[0]?.options || []

    if (!optionsBank || optionsBank.length === 0) {
        const instr = group.instructions || ''
        const match = instr.match(/([A-Z])[\u2013\u2014-]([A-Z])/i)
        if (match) {
            const startChar = match[1].toUpperCase().charCodeAt(0)
            const endChar = match[2].toUpperCase().charCodeAt(0)
            const generated = []
            for (let c = startChar; c <= endChar; c++) {
                const letter = String.fromCharCode(c)
                generated.push({ key: letter, text: `Paragraph ${letter}` })
            }
            optionsBank = generated
        }
    }

    if (!optionsBank || optionsBank.length === 0) {
        return (
            <div className={s.emptyNotice}>
                Missing options bank for matching questions
            </div>
        )
    }

    return (
        <div className={s.container}>
            {/* Options Bank */}
            <div className={s.optionsBankCard}>
                <h4 className={s.optionsBankTitle}>Options</h4>
                <ul className={s.optionsList}>
                    {optionsBank.map((option: any, idx: number) => {
                        const optKey =
                            option.key ||
                            option.id ||
                            String.fromCharCode(65 + idx)
                        return (
                            <li
                                key={optKey || `opt-${idx}`}
                                className={s.optionItem}
                            >
                                <span className={s.optionLabel}>{optKey}</span>
                                <span className={s.optionText}>
                                    {option.text}
                                </span>
                            </li>
                        )
                    })}
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
                            {optionsBank.map((option: any, idx: number) => {
                                const optKey =
                                    option.key ||
                                    option.id ||
                                    String.fromCharCode(65 + idx)
                                return (
                                    <option
                                        key={optKey || `opt-${idx}`}
                                        value={optKey}
                                    >
                                        {optKey}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}
