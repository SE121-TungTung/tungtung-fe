import s from './TrueFalseNotGivenQuestion.module.css'

import type { Question } from '@/types/test.types'

type TfngValue = 'TRUE' | 'FALSE' | 'NOT GIVEN' | null

interface TrueFalseNotGivenQuestionProps {
    question: Question & { globalNumber: number }
    selectedValue: TfngValue
    onChange: (value: TfngValue) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

const options: Exclude<TfngValue, null>[] = ['TRUE', 'FALSE', 'NOT GIVEN']

export default function TrueFalseNotGivenQuestion({
    question,
    selectedValue,
    onChange,
    registerRef,
}: TrueFalseNotGivenQuestionProps) {
    return (
        <div
            className={s.questionBlock}
            ref={(el) => registerRef(question.id, el)}
        >
            <p className={s.questionText}>
                <strong>{question.globalNumber}.</strong>{' '}
                {question.questionText}
            </p>
            <div className={s.options}>
                {options.map((option) => (
                    <button
                        key={option}
                        className={`${s.optionButton} ${
                            selectedValue === option ? s.selected : ''
                        }`}
                        onClick={() => onChange(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}
