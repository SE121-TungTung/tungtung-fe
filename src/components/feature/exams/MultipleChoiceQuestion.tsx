import s from './MultipleChoiceQuestion.module.css'
import type { McqQuestion } from '@/types/exam.types'

// props: cho phép optional để fallback được
interface McqProps {
    question: McqQuestion
    selectedValues?: string[]
    onChange: (selected: string[]) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function MultipleChoiceQuestion({
    question,
    selectedValues,
    onChange,
    registerRef,
}: McqProps) {
    const { id, number, text, options, allowMultiple } = question

    const values = Array.isArray(selectedValues) ? selectedValues : []

    const handleOptionChange = (optionValue: string) => {
        if (allowMultiple) {
            const newSelection = values.includes(optionValue)
                ? values.filter((v) => v !== optionValue)
                : [...values, optionValue]
            onChange(newSelection.sort())
        } else {
            onChange([optionValue])
        }
    }

    const inputType = allowMultiple ? 'checkbox' : 'radio'

    return (
        <div
            className={s.questionBlock}
            ref={(el) => registerRef(id, el)}
            id={`q-${id}`}
        >
            <p className={s.questionText}>
                <strong>{number}.</strong> {text}
            </p>
            <ul className={s.optionsList}>
                {options.map((option) => (
                    <li
                        key={option.value}
                        className={`${s.optionItem} ${values.includes(option.value) ? s.selected : ''}`}
                        onClick={() => handleOptionChange(option.value)}
                        role={inputType === 'radio' ? 'radio' : 'checkbox'}
                        aria-checked={values.includes(option.value)}
                        tabIndex={0}
                    >
                        <input
                            className={s.optionInput}
                            type={inputType}
                            name={`q-${id}-group`}
                            value={option.value}
                            checked={values.includes(option.value)}
                            onChange={() => handleOptionChange(option.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className={s.optionLabel}>{option.value}.</span>
                        <span className={s.optionText}>{option.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
