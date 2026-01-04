import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

                {/* ✅ Markdown Prompt */}
                <div className={s.promptContent}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => (
                                <p className={s.paragraph}>{children}</p>
                            ),
                            strong: ({ children }) => (
                                <strong className={s.bold}>{children}</strong>
                            ),
                            ul: ({ children }) => (
                                <ul className={s.list}>{children}</ul>
                            ),
                            li: ({ children }) => (
                                <li className={s.listItem}>{children}</li>
                            ),
                        }}
                    >
                        {prompt}
                    </ReactMarkdown>
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
