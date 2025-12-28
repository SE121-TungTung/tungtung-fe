import { useState, useEffect } from 'react'

export interface EssayQuestionProps {
    questionId: string
    questionNumber: number
    questionText: string
    imageUrl?: string | null
    value: string
    onChange: (value: string) => void
    registerRef: (id: string, element: HTMLElement) => void
    minWords?: number
    maxWords?: number
}

export function EssayQuestion({
    questionId,
    questionNumber,
    questionText,
    imageUrl,
    value,
    onChange,
    registerRef,
    minWords = 0,
    maxWords = 500,
}: EssayQuestionProps) {
    const [wordCount, setWordCount] = useState(0)

    useEffect(() => {
        const words = value.trim().split(/\s+/).filter(Boolean)
        setWordCount(words.length)
    }, [value])

    return (
        <div
            ref={(el) => {
                if (el) registerRef(questionId, el)
            }}
            style={{
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid #eee',
            }}
        >
            <p
                style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: 'var(--text-primary-light)',
                }}
            >
                {questionNumber}. {questionText}
            </p>

            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Question"
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        marginBottom: '16px',
                    }}
                />
            )}

            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write your essay here..."
                style={{
                    width: '100%',
                    minHeight: '300px',
                    padding: '12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--brand-primary-light)'
                    e.target.style.outline = 'none'
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = '#d9d9d9'
                }}
            />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#666',
                }}
            >
                <span>
                    Words: <strong>{wordCount}</strong>
                    {minWords > 0 && ` (min: ${minWords})`}
                </span>
                {maxWords > 0 && wordCount > maxWords && (
                    <span style={{ color: 'var(--status-danger-500-light)' }}>
                        ⚠️ Exceeded maximum ({maxWords} words)
                    </span>
                )}
            </div>
        </div>
    )
}
