import React from 'react'
import s from './PromptViewer.module.css'

interface PromptViewerProps {
    taskNumber: 1 | 2
    title: string
    prompt: string
    imageUrl?: string | null
}

export const PromptViewer = React.memo(
    ({ taskNumber, title, prompt, imageUrl }: PromptViewerProps) => {
        return (
            <div className={s.container}>
                <div className={s.header}>
                    <span className={s.taskLabel}>
                        Writing Task {taskNumber}
                    </span>
                    <h3 className={s.title}>{title}</h3>
                </div>

                {imageUrl && (
                    <div className={s.imageWrapper}>
                        <img
                            src={imageUrl}
                            alt="Task visual"
                            className={s.image}
                        />
                    </div>
                )}

                <div className={s.promptContent}>
                    {prompt.split('\n\n').map((para, idx) => (
                        <p key={idx}>{para}</p>
                    ))}
                </div>

                <div className={s.requirements}>
                    <p className={s.requirementItem}>
                        <strong>Required words:</strong>{' '}
                        {taskNumber === 1 ? '150+' : '250+'} words
                    </p>
                    <p className={s.requirementItem}>
                        <strong>Suggested time:</strong>{' '}
                        {taskNumber === 1 ? '20' : '40'} minutes
                    </p>
                </div>
            </div>
        )
    }
)
