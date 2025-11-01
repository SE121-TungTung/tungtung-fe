import type { TfnfQuestion } from '@/types/exam.types'
import s from './TrueFalseNotGivenQuestion.module.css'

type TfnfValue = 'TRUE' | 'FALSE' | 'NOT GIVEN' | null

interface TfnfQuestionProps {
    question: TfnfQuestion
    selectedValue: TfnfValue
    onChange: (value: TfnfValue) => void
    registerRef: (id: string, element: HTMLElement) => void
}

const options: TfnfValue[] = ['TRUE', 'FALSE', 'NOT GIVEN']

export default function TrueFalseNotGivenQuestion({
    question,
    selectedValue,
    onChange,
    registerRef,
}: TfnfQuestionProps) {
    return (
        <div
            className={s.questionBlock}
            ref={(el) => {
                if (el) registerRef(question.id, el)
            }}
            id={`q-${question.id}`}
        >
            <p className={s.questionText}>
                <strong>{question.number}.</strong> {question.text}
            </p>
            <div className={s.options}>
                {options.map((option) => (
                    <button
                        key={option}
                        className={`${s.optionButton} ${selectedValue === option ? s.selected : ''}`}
                        onClick={() => onChange(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}
