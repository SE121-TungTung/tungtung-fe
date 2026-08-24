import CollapsibleCard from '@/components/common/card/CollapsibleCard'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { ButtonGhost } from '@/components/common/button/ButtonGhost'
import {
    QuestionType,
    type QuestionGroupCreatePayload,
} from '@/types/test.types'
import { getQuestionTypeLabel, type TestBuilderActions } from './types'
import TestQuestionCard from './TestQuestionCard'
import s from '../CreateTestPage.module.css'

interface TestQuestionGroupCardProps {
    sIndex: number
    pIndex: number
    gIndex: number
    group: QuestionGroupCreatePayload
    actions: TestBuilderActions
    defaultOpen?: boolean
}

export default function TestQuestionGroupCard({
    sIndex,
    pIndex,
    gIndex,
    group,
    actions,
    defaultOpen = false,
}: TestQuestionGroupCardProps) {
    return (
        <CollapsibleCard
            level="group"
            title={group.name || `Question Group ${gIndex + 1}`}
            defaultOpen={defaultOpen}
            actions={
                <button
                    onClick={() =>
                        actions.handleRemoveQuestionGroup(
                            sIndex,
                            pIndex,
                            gIndex
                        )
                    }
                    className={s.deleteBtn}
                    title="Xóa question group"
                >
                    ✕
                </button>
            }
        >
            <div className={s.formGrid}>
                <InputField
                    label="Group Name"
                    type="text"
                    value={group.name}
                    onChange={(e) =>
                        actions.updateQuestionGroup(sIndex, pIndex, gIndex, {
                            name: e.target.value,
                        })
                    }
                    placeholder="e.g., Questions 1-5"
                />

                <SelectField
                    label="Loại câu hỏi"
                    value={group.question_type}
                    onChange={(e) =>
                        actions.updateQuestionGroup(sIndex, pIndex, gIndex, {
                            question_type: e.target.value as QuestionType,
                        })
                    }
                    options={Object.values(QuestionType).map((type) => ({
                        label: getQuestionTypeLabel(type),
                        value: type,
                    }))}
                />

                <InputField
                    label="Hướng dẫn group"
                    enableMarkdown={true}
                    multiline={true}
                    value={group.instructions || ''}
                    onChange={(e) =>
                        actions.updateQuestionGroup(sIndex, pIndex, gIndex, {
                            instructions: e.target.value,
                        })
                    }
                    className={`${s.fullWidth}`}
                    placeholder="Group instructions..."
                />
            </div>

            {/* Questions list */}
            {group.questions.map((q, qIndex) => (
                <TestQuestionCard
                    key={qIndex}
                    sIndex={sIndex}
                    pIndex={pIndex}
                    gIndex={gIndex}
                    qIndex={qIndex}
                    question={q}
                    actions={actions}
                />
            ))}

            <ButtonGhost
                size="sm"
                onClick={() =>
                    actions.handleAddQuestion(sIndex, pIndex, gIndex)
                }
            >
                + Thêm câu hỏi vào group này
            </ButtonGhost>
        </CollapsibleCard>
    )
}
