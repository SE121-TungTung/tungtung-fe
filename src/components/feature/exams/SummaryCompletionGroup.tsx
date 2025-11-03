import React from 'react'
import s from './SummaryCompletionGroup.module.css'
import type { QuestionGroup, CompletionQuestion } from '@/types/exam.types'

type AnswerMap = { [questionId: string]: string }

interface SummaryGroupProps {
    group: QuestionGroup
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement) => void
}

export default function SummaryCompletionGroup({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: SummaryGroupProps) {
    // Logic để render tóm tắt với các ô input
    const renderSummary = () => {
        const elements: React.ReactNode[] = []
        let questionIndex = 0

        // Giả sử câu hỏi đầu tiên trong nhóm có cấu trúc "parts"
        const mainQuestion = group.questions[0] as CompletionQuestion
        if (!mainQuestion || !mainQuestion.parts)
            return <p>Lỗi dữ liệu tóm tắt.</p>

        mainQuestion.parts.forEach((part, index) => {
            if (part !== null) {
                // Đây là phần text
                elements.push(<span key={`text-${index}`}>{part}</span>)
            } else {
                // Đây là vị trí điền (null)
                const question = group.questions[questionIndex]
                if (question) {
                    elements.push(
                        <React.Fragment key={question.id}>
                            <strong
                                // Đăng ký ref cho số câu hỏi
                                ref={(el) => {
                                    if (el) registerRef(question.id, el)
                                }}
                            >
                                ({question.number})
                            </strong>
                            <input
                                type="text"
                                className={s.inputField}
                                value={answers[question.id] || ''}
                                onChange={(e) =>
                                    onAnswerChange(question.id, e.target.value)
                                }
                                aria-label={`Answer for question ${question.number}`}
                            />
                        </React.Fragment>
                    )
                    questionIndex++
                }
            }
        })
        return elements
    }

    return <div className={s.summaryText}>{renderSummary()}</div>
}
