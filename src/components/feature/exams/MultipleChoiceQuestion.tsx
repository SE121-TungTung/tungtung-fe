import s from './MultipleChoiceQuestion.module.css'
import type { Question, QuestionOption } from '@/types/test.types'

interface MultipleChoiceQuestionProps {
    question: Question & { globalNumber: number }
    selectedValue?: string | null
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function MultipleChoiceQuestion({
    question,
    selectedValue,
    onChange,
    registerRef,
}: MultipleChoiceQuestionProps) {
    const { id, globalNumber, questionText, options } = question

    if (!options || options.length === 0) {
        return <div>No options available</div>
    }

    return (
        <div className={s.questionBlock} ref={(el) => registerRef(id, el)}>
            <p className={s.questionText}>
                <strong>{globalNumber}.</strong> {questionText}
            </p>
            <ul className={s.optionsList}>
                {options.map((option) => (
                    <li
                        key={option.key}
                        className={`${s.optionItem} ${
                            selectedValue === option.key ? s.selected : ''
                        }`}
                        onClick={() => onChange(option.key)}
                    >
                        <input
                            type="radio"
                            name={`q-${id}`}
                            value={option.key}
                            checked={selectedValue === option.key}
                            onChange={() => onChange(option.key)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className={s.optionLabel}>{option.key}.</span>
                        <span className={s.optionText}>{option.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
