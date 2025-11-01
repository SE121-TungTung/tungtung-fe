// src/components/feature/exams/DiagramLabelling.tsx
import React from 'react'
import s from './SummaryCompletionGroup.module.css' // Tái sử dụng CSS
import type {
    QuestionGroup,
    DiagramLabellingQuestion,
} from '@/types/exam.types'

type AnswerMap = { [questionId: string]: string }

interface DiagramGroupProps {
    group: QuestionGroup
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
    diagramUrl: string // URL của ảnh sơ đồ
}

export default function DiagramLabellingGroup({
    group,
    answers,
    onAnswerChange,
    registerRef,
    diagramUrl,
}: DiagramGroupProps) {
    return (
        <div>
            {/* Hiển thị ảnh sơ đồ */}
            <img
                src={diagramUrl}
                alt="Diagram"
                style={{
                    width: '100%',
                    marginBottom: '20px',
                    border: '1px solid #eee',
                }}
            />

            {/* Danh sách các ô điền */}
            <div className={s.summaryText} style={{ lineHeight: 2.5 }}>
                {group.questions.map((q) => {
                    const question = q as DiagramLabellingQuestion
                    return (
                        <div
                            key={question.id}
                            ref={(el) => registerRef(question.id, el)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                            }}
                        >
                            <label
                                htmlFor={`diag-${question.id}`}
                                style={{ fontWeight: 600 }}
                            >
                                {question.number}. {question.label}
                            </label>
                            <input
                                id={`diag-${question.id}`}
                                type="text"
                                className={s.inputField}
                                value={answers[question.id] || ''}
                                onChange={(e) =>
                                    onAnswerChange(question.id, e.target.value)
                                }
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
