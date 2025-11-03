import s from './MatchingHeadingsQuestion.module.css'

interface HeadingOption {
    value: string
    text: string
}

interface Paragraph {
    id: string
    label: string
}

interface MatchingHeadingsProps {
    questionNumbers: string
    headings: HeadingOption[]
    paragraphs: Paragraph[]
    answers: { [paragraphId: string]: string } // { paragraph_a: 'iii', paragraph_b: 'i' }
    onChange: (paragraphId: string, headingValue: string) => void
    registerRef: (id: string, element: HTMLElement) => void
}

export default function MatchingHeadingsQuestion({
    questionNumbers,
    headings,
    paragraphs,
    answers,
    onChange,
    registerRef,
}: MatchingHeadingsProps) {
    return (
        <div
            className={s.container}
            ref={(el) => {
                if (el) registerRef(questionNumbers.toString(), el)
            }}
        >
            <div className={s.headingsListCard}>
                <h4 className={s.headingsListTitle}>List of Headings</h4>
                <ul className={s.headingsList}>
                    {headings.map((heading) => (
                        <li key={heading.value} className={s.headingItem}>
                            <span className={s.headingLabel}>
                                {heading.value}
                            </span>
                            <span className={s.headingText}>
                                {heading.text}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={s.paragraphMatching}>
                {paragraphs.map((para) => (
                    <div key={para.id} className={s.matchItem}>
                        <label
                            htmlFor={`select-${para.id}`}
                            className={s.paragraphLabel}
                        >
                            <strong>{questionNumbers.split('-')[0]}.</strong>{' '}
                            {para.label}
                        </label>
                        <select
                            id={`select-${para.id}`}
                            className={s.selectHeading}
                            value={answers[para.id] || ''}
                            onChange={(e) => onChange(para.id, e.target.value)}
                        >
                            <option value="">Choose heading...</option>
                            {headings.map((heading) => (
                                <option
                                    key={heading.value}
                                    value={heading.value}
                                >
                                    {heading.value}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}
