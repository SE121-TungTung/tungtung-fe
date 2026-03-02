import React from 'react'
import s from './CueCardViewer.module.css'

interface CueCardViewerProps {
    partNumber: 1 | 2 | 3
    title: string
    instructions: string
    questions: string[]
    imageUrl?: string | null
    prepTime?: number // seconds for Part 2
    speakTime?: number // seconds
}

export const CueCardViewer = React.memo(
    ({
        partNumber,
        title,
        instructions,
        questions,
        imageUrl,
        prepTime,
        speakTime,
    }: CueCardViewerProps) => {
        return (
            <div className={s.container}>
                <div className={s.header}>
                    <span className={s.partLabel}>
                        Speaking Part {partNumber}
                    </span>
                    <h3 className={s.title}>{title}</h3>
                </div>

                {imageUrl && (
                    <div className={s.imageWrapper}>
                        <img
                            src={imageUrl}
                            alt="Cue card visual"
                            className={s.image}
                        />
                    </div>
                )}

                <div className={s.instructions}>{instructions}</div>

                <div className={s.questionsBox}>
                    {questions.map((q, idx) => (
                        <div key={idx} className={s.questionItem}>
                            <span className={s.bullet}>•</span>
                            <span>{q}</span>
                        </div>
                    ))}
                </div>

                {(prepTime || speakTime) && (
                    <div className={s.timeInfo}>
                        {prepTime && (
                            <p className={s.timeItem}>
                                <strong>Preparation time:</strong> {prepTime}{' '}
                                seconds
                            </p>
                        )}
                        {speakTime && (
                            <p className={s.timeItem}>
                                <strong>Speaking time:</strong> {speakTime}{' '}
                                seconds
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }
)
