import CollapsibleCard from '@/components/common/card/CollapsibleCard'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { ButtonGhost } from '@/components/common/button/ButtonGhost'
import { SkillArea, type TestSectionCreatePayload } from '@/types/test.types'
import type { TestBuilderActions } from './types'
import TestPartCard from './TestPartCard'
import s from '../CreateTestPage.module.css'

interface TestSectionCardProps {
    sIndex: number
    section: TestSectionCreatePayload
    uploadedFiles: Record<string, File>
    actions: TestBuilderActions
}

export default function TestSectionCard({
    sIndex,
    section,
    uploadedFiles,
    actions,
}: TestSectionCardProps) {
    return (
        <CollapsibleCard
            level="section"
            title={`Section ${sIndex + 1}: ${section.name}`}
            actions={
                <button
                    onClick={() => actions.handleRemoveSection(sIndex)}
                    className={s.deleteBtn}
                    title="Xóa section"
                >
                    ✕
                </button>
            }
        >
            <div id={`section-${sIndex}`} className={s.formGrid}>
                <InputField
                    label="Tên section"
                    type="text"
                    value={section.name}
                    onChange={(e) =>
                        actions.updateSection(sIndex, {
                            name: e.target.value,
                        })
                    }
                />

                <SelectField
                    label="Kỹ năng"
                    value={section.skill_area}
                    onChange={(e) =>
                        actions.updateSection(sIndex, {
                            skill_area: e.target.value as SkillArea,
                        })
                    }
                    options={Object.values(SkillArea).map((area) => ({
                        label: area.charAt(0).toUpperCase() + area.slice(1),
                        value: area,
                    }))}
                />

                <InputField
                    label="Thời gian giới hạn (phút, tùy chọn)"
                    type="number"
                    value={section.time_limit_minutes || ''}
                    onChange={(e) =>
                        actions.updateSection(sIndex, {
                            time_limit_minutes: e.target.value
                                ? parseInt(e.target.value)
                                : undefined,
                        })
                    }
                    placeholder="Để trống nếu không giới hạn"
                />

                <InputField
                    label="Hướng dẫn section (tùy chọn)"
                    enableMarkdown={true}
                    className={`${s.fullWidth}`}
                    multiline={true}
                    value={section.instructions || ''}
                    onChange={(e) =>
                        actions.updateSection(sIndex, {
                            instructions: e.target.value,
                        })
                    }
                />
            </div>

            {/* Parts list */}
            {section.parts.map((part, pIndex) => (
                <TestPartCard
                    key={pIndex}
                    sIndex={sIndex}
                    pIndex={pIndex}
                    part={part}
                    skillArea={section.skill_area}
                    uploadedFiles={uploadedFiles}
                    actions={actions}
                    defaultOpen={pIndex === 0}
                />
            ))}

            <ButtonGhost
                size="sm"
                onClick={() => actions.handleAddPart(sIndex)}
                style={{ marginTop: '16px' }}
            >
                + Thêm Part
            </ButtonGhost>
        </CollapsibleCard>
    )
}
