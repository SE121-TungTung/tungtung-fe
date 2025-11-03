import s from './SentenceCompletionQuestion.module.css'

interface ShortAnswerProps {
    questionNumber: number
    questionText: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    registerRef: (id: string, element: HTMLElement) => void
}

export default function ShortAnswerQuestion({
    questionNumber,
    questionText,
    value,
    onChange,
    placeholder = 'Your answer...',
    registerRef,
}: ShortAnswerProps) {
    return (
        <div
            className={s.questionBlock}
            ref={(el) => {
                if (el) registerRef(questionNumber.toString(), el)
            }}
        >
            <label htmlFor={`saq-${questionNumber}`} className={s.questionText}>
                <strong>{questionNumber}.</strong> {questionText}
            </label>
            <input
                id={`saq-${questionNumber}`}
                type="text"
                className={s.inputField}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', maxWidth: '400px' }}
            />
        </div>
    )
}
