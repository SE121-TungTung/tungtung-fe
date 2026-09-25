import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    CheckCircleIcon,
    AlertTriangleIcon,
    SparklesIcon,
} from './PronunciationIcons'
import s from './AIFeedbackMarkdown.module.css'

interface AIFeedbackMarkdownProps {
    content: string
}

export const AIFeedbackMarkdown: React.FC<AIFeedbackMarkdownProps> = ({
    content,
}) => {
    if (!content) return null

    // Thay thế ký tự emoji ✅ hoặc ❌ bằng nhãn văn bản trước khi parse Markdown
    const sanitizedContent = content
        .replace(/✅/g, '[Đạt]')
        .replace(/❌/g, '[Chưa đạt]')

    return (
        <div className={s.aiFeedbackCard}>
            <div className={s.feedbackHeader}>
                <SparklesIcon size={18} className={s.sparkleIcon} />
                <span>Nhận xét từ AI Chuyên gia:</span>
            </div>

            <div className={s.markdownContainer}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        p: ({ children }) => {
                            // Xử lý từng dòng feedback để thêm icon badge thích hợp
                            return (
                                <p className={s.feedbackParagraph}>
                                    {children}
                                </p>
                            )
                        },
                        strong: ({ children }) => {
                            return (
                                <strong className={s.componentTitle}>
                                    {children}
                                </strong>
                            )
                        },
                        ul: ({ children }) => (
                            <ul className={s.feedbackList}>{children}</ul>
                        ),
                        li: ({ children }) => (
                            <li className={s.feedbackListItem}>{children}</li>
                        ),
                        code: ({ children }) => (
                            <code className={s.phonemeCode}>{children}</code>
                        ),
                    }}
                >
                    {sanitizedContent}
                </ReactMarkdown>
            </div>
        </div>
    )
}
