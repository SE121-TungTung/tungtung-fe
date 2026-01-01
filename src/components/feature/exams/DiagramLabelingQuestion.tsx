import type { QuestionGroup, Question } from '@/types/test.types'
import s from './SummaryCompletionGroup.module.css'

type AnswerMap = { [questionId: string]: string }

interface DiagramLabelingQuestionProps {
    group: QuestionGroup & {
        questions: (Question & { globalNumber: number })[]
    }
    answers: AnswerMap
    onAnswerChange: (questionId: string, value: string) => void
    registerRef: (id: string, element: HTMLElement | null) => void
}

export default function DiagramLabelingQuestion({
    group,
    answers,
    onAnswerChange,
    registerRef,
}: DiagramLabelingQuestionProps) {
    // Diagram image từ group
    const diagramUrl = group.imageUrl

    if (!diagramUrl) {
        return <div>Missing diagram image</div>
    }

    return (
        <div>
            {/* Diagram Image */}
            <img
                src={diagramUrl}
                alt="Diagram"
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    marginBottom: '20px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                }}
            />

            {/* Labels to fill */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                }}
            >
                {group.questions.map((q) => (
                    <div
                        key={q.id}
                        ref={(el) => registerRef(q.id, el)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <label
                            htmlFor={`diag-${q.id}`}
                            style={{
                                fontWeight: 600,
                                minWidth: '40px',
                                fontSize: '15px',
                            }}
                        >
                            {q.globalNumber}.
                        </label>
                        <input
                            id={`diag-${q.id}`}
                            type="text"
                            className={s.inputField}
                            value={answers[q.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(q.id, e.target.value)
                            }
                            placeholder={q.questionText || 'Label...'}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
