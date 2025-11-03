import type { CompletionQuestion } from '@/types/exam.types'
import s from './SentenceCompletionQuestion.module.css'

interface SentenceCompletionProps {
    question: CompletionQuestion
    value: string
    onChange: (value: string) => void
    placeholder?: string
    registerRef: (id: string, element: HTMLElement) => void
}

export default function SentenceCompletionQuestion({
    question,
    value,
    onChange,
    placeholder = 'Your answer...',
    registerRef,
}: SentenceCompletionProps) {
    return (
        <div
            className={s.questionBlock}
            ref={(el) => {
                if (el) registerRef(question.id.toString(), el)
            }}
        >
            <label className={s.questionText}>
                <strong>{question.number}.</strong>
                {question.parts.map((part, index) =>
                    part !== null ? (
                        <span key={index}>{part}</span>
                    ) : (
                        <input
                            key={index}
                            type="text"
                            className={s.inputField}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                        />
                    )
                )}
            </label>
        </div>
    )
}
