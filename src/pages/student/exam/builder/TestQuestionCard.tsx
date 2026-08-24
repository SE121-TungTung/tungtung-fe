import InputField from '@/components/common/input/InputField'
import type { QuestionCreatePayload } from '@/types/test.types'
import type { TestBuilderActions } from './types'
import s from '../CreateTestPage.module.css'

interface TestQuestionCardProps {
    sIndex: number
    pIndex: number
    gIndex: number
    qIndex: number
    question: QuestionCreatePayload
    actions: TestBuilderActions
}

export default function TestQuestionCard({
    sIndex,
    pIndex,
    gIndex,
    qIndex,
    question,
    actions,
}: TestQuestionCardProps) {
    return (
        <div className={s.questionBox}>
            <div className={s.questionHeader}>
                <span className={s.questionLabel}>Câu hỏi {qIndex + 1}</span>
                <button
                    onClick={() =>
                        actions.handleRemoveQuestion(
                            sIndex,
                            pIndex,
                            gIndex,
                            qIndex
                        )
                    }
                    className={s.deleteBtn}
                    title="Xóa câu hỏi"
                >
                    ✕
                </button>
            </div>

            <div className={s.formGrid}>
                <InputField
                    label="Điểm"
                    type="number"
                    value={question.points || 1}
                    onChange={(e) =>
                        actions.updateQuestion(sIndex, pIndex, gIndex, qIndex, {
                            points: parseFloat(e.target.value) || 0,
                        })
                    }
                    step="0.5"
                    min="0"
                />

                <InputField
                    label="Nội dung câu hỏi"
                    enableMarkdown={true}
                    className={`${s.fullWidth}`}
                    required={true}
                    multiline={true}
                    value={question.question_text}
                    onChange={(e) =>
                        actions.updateQuestion(sIndex, pIndex, gIndex, qIndex, {
                            question_text: e.target.value,
                        })
                    }
                />

                <InputField
                    label="Đáp án đúng"
                    type="text"
                    value={question.correct_answer || ''}
                    onChange={(e) =>
                        actions.updateQuestion(sIndex, pIndex, gIndex, qIndex, {
                            correct_answer: e.target.value,
                        })
                    }
                    placeholder="Nhập đáp án đúng"
                />
            </div>
        </div>
    )
}
