import type { QuestionGroup, Question } from '@/types/test.types'
import s from './MatchingHeadingsQuestion.module.css'

type AnswerMap = { [questionId: string]: string }

interface MatchingHeadingsQuestionProps {
    group: QuestionGroup & {
        questions: (Question & { globalNumber: number })[]
    }
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function MatchingHeadingsQuestion({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: MatchingHeadingsQuestionProps) {
    // Headings list lấy từ metadata hoặc questions options
    const headings =
        (group as any).metadata?.headings || group.questions[0]?.options || []

    if (headings.length === 0) {
        return <div className={s.emptyNotice}>Missing headings list</div>
    }

    return (
        <div className={s.container}>
            {/* List of Headings */}
            <div className={s.headingsListCard}>
                <h4 className={s.headingsListTitle}>List of Headings</h4>
                <ul className={s.headingsList}>
                    {headings.map((heading: any, idx: number) => {
                        const hKey =
                            heading.key || heading.id || String(idx + 1)
                        return (
                            <li
                                key={hKey || `head-${idx}`}
                                className={s.headingItem}
                            >
                                <span className={s.headingLabel}>{hKey}</span>
                                <span className={s.headingText}>
                                    {heading.text}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {/* Paragraphs to match */}
            <div className={s.paragraphMatching}>
                {group.questions.map((question) => (
                    <div
                        key={question.id}
                        className={s.matchItem}
                        ref={(el) => registerRef(question.id, el)}
                    >
                        <label className={s.paragraphLabel}>
                            <strong>{question.orderNumber}.</strong>{' '}
                            {question.questionText}
                        </label>
                        <select
                            className={s.selectHeading}
                            value={answers[question.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(question.id, e.target.value)
                            }
                        >
                            <option value="">Choose heading...</option>
                            {headings.map((heading: any, idx: number) => {
                                const hKey =
                                    heading.key || heading.id || String(idx + 1)
                                return (
                                    <option
                                        key={hKey || `hopt-${idx}`}
                                        value={hKey}
                                    >
                                        {hKey} - {heading.text}
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
