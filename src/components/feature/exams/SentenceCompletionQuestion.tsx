import s from './SentenceCompletionQuestion.module.css'
import type { Question } from '@/types/test.types'

interface SentenceCompletionQuestionProps {
    question: Question & { globalNumber: number }
    value: string
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function SentenceCompletionQuestion({
    question,
    value,
    onChange,
    registerRef,
}: SentenceCompletionQuestionProps) {
    // Sentence completion: questionText chứa câu với placeholder (có thể)
    // Hoặc render đơn giản với input box

    return (
        <div
            className={s.questionBlock}
            ref={(el) => registerRef(question.id, el)}
        >
            <label className={s.questionText}>
                <strong>{question.globalNumber}.</strong>{' '}
                {question.questionText}
            </label>
            <input
                type="text"
                className={s.inputField}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Your answer..."
            />
        </div>
    )
}
