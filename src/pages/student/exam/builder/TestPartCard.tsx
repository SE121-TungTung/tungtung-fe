import CollapsibleCard from '@/components/common/card/CollapsibleCard'
import InputField from '@/components/common/input/InputField'
import { SelectField } from '@/components/common/input/SelectField'
import { ButtonGhost } from '@/components/common/button/ButtonGhost'
import {
    SkillArea,
    DifficultyLevel,
    type TestSectionPartCreatePayload,
} from '@/types/test.types'
import type { TestBuilderActions } from './types'
import TestQuestionGroupCard from './TestQuestionGroupCard'
import s from '../CreateTestPage.module.css'

interface TestPartCardProps {
    sIndex: number
    pIndex: number
    part: TestSectionPartCreatePayload
    skillArea: SkillArea
    uploadedFiles: Record<string, File>
    actions: TestBuilderActions
    defaultOpen?: boolean
}

export default function TestPartCard({
    sIndex,
    pIndex,
    part,
    skillArea,
    uploadedFiles,
    actions,
    defaultOpen = false,
}: TestPartCardProps) {
    const audioKey = actions.getFileKey(part.id ?? '', 'audio')
    const imageKey = actions.getFileKey(part.id ?? '', 'image')
    const audioFile = uploadedFiles[audioKey]
    const imageFile = uploadedFiles[imageKey]

    return (
        <CollapsibleCard
            level="part"
            title={`Part ${pIndex + 1}: ${part.name}`}
            defaultOpen={defaultOpen}
            actions={
                <button
                    onClick={() => actions.handleRemovePart(sIndex, pIndex)}
                    className={s.deleteBtn}
                    title="Xóa part"
                >
                    ✕
                </button>
            }
        >
            <div id={`section-${sIndex}-part-${pIndex}`} className={s.formGrid}>
                <InputField
                    label="Tên part"
                    type="text"
                    value={part.name}
                    onChange={(e) =>
                        actions.updatePart(sIndex, pIndex, {
                            name: e.target.value,
                        })
                    }
                />

                <InputField
                    label="Tiêu đề"
                    type="text"
                    value={part.passage?.title || ''}
                    onChange={(e) =>
                        actions.updatePartPassage(sIndex, pIndex, {
                            title: e.target.value,
                        })
                    }
                    placeholder="VD: The History of Coffee"
                />

                <InputField
                    label="Topic"
                    type="text"
                    value={part.passage?.topic || ''}
                    onChange={(e) =>
                        actions.updatePartPassage(sIndex, pIndex, {
                            topic: e.target.value,
                        })
                    }
                    placeholder="VD: Environment, Technology"
                />

                <SelectField
                    label="Mức độ khó"
                    value={
                        part.passage?.difficulty_level || DifficultyLevel.MEDIUM
                    }
                    onChange={(e) =>
                        actions.updatePartPassage(sIndex, pIndex, {
                            difficulty_level: e.target.value as DifficultyLevel,
                        })
                    }
                    options={Object.values(DifficultyLevel).map((level) => ({
                        label: level.charAt(0).toUpperCase() + level.slice(1),
                        value: level,
                    }))}
                />

                <InputField
                    className={`${s.fullWidth}`}
                    label={
                        skillArea === SkillArea.LISTENING
                            ? 'Audio Script (Listening)'
                            : skillArea === SkillArea.SPEAKING
                              ? 'Cue Card Content'
                              : skillArea === SkillArea.WRITING
                                ? 'Writing Prompt'
                                : 'Đoạn văn Reading'
                    }
                    enableMarkdown={true}
                    required={true}
                    value={part.passage?.text_content || ''}
                    onChange={(e) =>
                        actions.updatePartPassage(sIndex, pIndex, {
                            text_content: e.target.value,
                        })
                    }
                    multiline={true}
                    style={{ minHeight: '150px' }}
                    placeholder={
                        skillArea === SkillArea.LISTENING
                            ? 'Nhập nội dung audio script...'
                            : skillArea === SkillArea.SPEAKING
                              ? 'Nhập nội dung cue card...'
                              : 'Nhập đoạn văn reading...'
                    }
                />

                {/* Audio Upload for Listening */}
                {skillArea === SkillArea.LISTENING && (
                    <div className={`${s.formField}`}>
                        <InputField
                            label="Audio File (Listening) *"
                            type="file"
                            accept="audio/*"
                            fullWidth
                            rightIcon={
                                audioFile && (
                                    <button
                                        onClick={() =>
                                            actions.handleRemoveFile(
                                                sIndex,
                                                pIndex,
                                                'audio'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: 'none',
                                            color: '#ff4d4f',
                                            fontWeight: 'bold',
                                        }}
                                        title="Gỡ bỏ file"
                                    >
                                        ✕
                                    </button>
                                )
                            }
                            onChange={(e) => {
                                const file =
                                    (e.target as HTMLInputElement).files?.[0] ||
                                    null
                                actions.handleFileUpload(
                                    sIndex,
                                    pIndex,
                                    'audio',
                                    file
                                )
                            }}
                            hint={audioFile?.name}
                        />

                        {audioFile && (
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '10px',
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: '8px',
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: '12px',
                                        marginBottom: '4px',
                                        color: 'var(--text-primary-light)',
                                    }}
                                >
                                    Xem trước âm thanh:
                                </p>
                                <audio
                                    controls
                                    src={URL.createObjectURL(audioFile)}
                                    style={{ width: '100%', height: '32px' }}
                                />
                            </div>
                        )}

                        <div style={{ marginTop: '12px' }}>
                            <InputField
                                label="Hoặc nhập URL:"
                                type="text"
                                uiSize="sm"
                                placeholder="https://example.com/audio.mp3"
                                value={part.passage?.audio_url || ''}
                                disabled={!!audioFile}
                                onChange={(e) =>
                                    actions.updatePartPassage(sIndex, pIndex, {
                                        audio_url: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                )}

                {/* Image Upload for other skill areas */}
                {skillArea !== SkillArea.LISTENING && (
                    <div className={s.formField}>
                        <InputField
                            label="Hình ảnh (Diagram/Chart - tùy chọn)"
                            type="file"
                            accept="image/*"
                            fullWidth
                            rightIcon={
                                imageFile && (
                                    <button
                                        onClick={() =>
                                            actions.handleRemoveFile(
                                                sIndex,
                                                pIndex,
                                                'image'
                                            )
                                        }
                                        style={{
                                            cursor: 'pointer',
                                            border: 'none',
                                            background: 'none',
                                            color: '#ff4d4f',
                                        }}
                                        title="Gỡ bỏ file"
                                    >
                                        ✕
                                    </button>
                                )
                            }
                            onChange={(e) => {
                                const file =
                                    (e.target as HTMLInputElement).files?.[0] ||
                                    null
                                actions.handleFileUpload(
                                    sIndex,
                                    pIndex,
                                    'image',
                                    file
                                )
                            }}
                        />

                        {imageFile && (
                            <div
                                style={{
                                    marginTop: '10px',
                                    position: 'relative',
                                    width: 'fit-content',
                                }}
                            >
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '150px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                    }}
                                />
                                <p style={{ fontSize: '11px', color: '#666' }}>
                                    {imageFile.name}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <InputField
                    label="Hướng dẫn part"
                    enableMarkdown={true}
                    value={part.instructions || ''}
                    multiline={true}
                    onChange={(e) =>
                        actions.updatePart(sIndex, pIndex, {
                            instructions: e.target.value,
                        })
                    }
                    className={`${s.fullWidth}`}
                />
            </div>

            {/* Question groups */}
            {part.question_groups.map((group, gIndex) => (
                <TestQuestionGroupCard
                    key={gIndex}
                    sIndex={sIndex}
                    pIndex={pIndex}
                    gIndex={gIndex}
                    group={group}
                    actions={actions}
                    defaultOpen={gIndex === 0}
                />
            ))}

            <ButtonGhost
                size="sm"
                onClick={() => actions.handleAddQuestionGroup(sIndex, pIndex)}
                style={{ marginTop: '12px' }}
            >
                + Thêm Question Group
            </ButtonGhost>
        </CollapsibleCard>
    )
}
