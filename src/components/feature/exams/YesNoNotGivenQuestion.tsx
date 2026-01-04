import type { Question } from '@/types/test.types'
import s from './TrueFalseNotGivenQuestion.module.css'

type YnngValue = 'YES' | 'NO' | 'NOT GIVEN' | null

interface YesNoNotGivenQuestionProps {
    question: Question & { globalNumber: number }
    selectedValue: YnngValue
    onChange: (value: YnngValue) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

const options: Exclude<YnngValue, null>[] = ['YES', 'NO', 'NOT GIVEN']

export default function YesNoNotGivenQuestion({
    question,
    selectedValue,
    onChange,
    registerRef,
}: YesNoNotGivenQuestionProps) {
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
