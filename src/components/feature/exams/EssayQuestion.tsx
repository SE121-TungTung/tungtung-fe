import { useState, useEffect } from 'react'
import s from './EssayQuestion.module.css'

interface EssayQuestionProps {
    questionId: string
    questionNumber: number
    questionText: string
    value: string
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
    minWords?: number
    maxWords?: number
}

export function EssayQuestion({
    questionId,
    questionNumber,
    questionText,
    value,
    onChange,
    registerRef,
    minWords = 150,
    maxWords = 250,
}: EssayQuestionProps) {
    const [wordCount, setWordCount] = useState(0)

    useEffect(() => {
        const words = value.trim().split(/\s+/).filter(Boolean)
        setWordCount(words.length)
    }, [value])

    const getWordCountColor = () => {
        if (wordCount < minWords) return '#dc2626' // red
        if (wordCount > maxWords) return '#f59e0b' // orange
        return '#10b981' // green
    }

    return (
        <div
            ref={(el) => registerRef(questionId, el)}
            className={s.essayContainer}
        >
            <div className={s.essayHeader}>
                <p className={s.questionText}>
                    <strong>{questionNumber}.</strong> {questionText}
                </p>
                <div
                    className={s.wordCount}
                    style={{ color: getWordCountColor() }}
                >
                    {wordCount} / {minWords}-{maxWords} words
                </div>
            </div>

            <textarea
                className={s.essayTextarea}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write your essay here..."
                rows={15}
            />
        </div>
    )
}
