import s from './SentenceCompletionQuestion.module.css'
import type { Question } from '@/types/test.types'

interface ShortAnswerQuestionProps {
    question: Question & { globalNumber: number }
    value: string
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function ShortAnswerQuestion({
    question,
    value,
    onChange,
    registerRef,
}: ShortAnswerQuestionProps) {
    return (
        <div
            className={s.questionBlock}
            ref={(el) => registerRef(question.id, el)}
        >
            <label htmlFor={`saq-${question.id}`} className={s.questionText}>
                <strong>{question.globalNumber}.</strong>{' '}
                {question.questionText}
            </label>
            <input
                id={`saq-${question.id}`}
                type="text"
                className={s.inputField}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Your answer..."
                style={{ width: '100%', maxWidth: '400px' }}
            />
        </div>
    )
}
