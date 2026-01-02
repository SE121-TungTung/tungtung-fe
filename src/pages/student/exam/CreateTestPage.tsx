import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import type { TestCreatePayload } from '@/types/test.types'
import {
    QuestionType,
    SkillArea,
    DifficultyLevel,
    TestType,
} from '@/types/test.types'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'

import s from './CreateTestPage.module.css'
import InputField from '@/components/common/input/InputField'
import TestNavigator from '@/components/feature/exams/TestNavigator'
import CollapsibleCard from '@/components/common/card/CollapsibleCard'
import { SelectField } from '@/components/common/input/SelectField'
import { useCreateTest } from '@/hooks/useCreateTest'

export default function CreateTestPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    // ========================================
    // Test Basic Info
    // ========================================
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [instructions, setInstructions] = useState('')
    const [testType, setTestType] = useState<TestType | null>(null)

    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(60)
    const [passingScore, setPassingScore] = useState<number>(60)
    const [maxAttempts, setMaxAttempts] = useState<number>(1)
    const [randomizeQuestions, setRandomizeQuestions] = useState(false)
    const [showResultsImmediately, setShowResultsImmediately] = useState(true)
    const [aiGradingEnabled, setAiGradingEnabled] = useState(false)

    const [startTime, setStartTime] = useState<string>('')
    const [endTime, setEndTime] = useState<string>('')

    const {
        sections,
        uploadedFiles,
        getFileKey,
        handleAddSection,
        handleRemoveSection,
        handleAddPart,
        handleRemovePart,
        updatePartPassage,
        handleAddQuestionGroup,
        handleRemoveQuestionGroup,
        updateQuestionGroup,
        handleAddQuestion,
        updateQuestion,
        handleFileUpload,
        handleRemoveFile,
        handleRemoveQuestion,
        updateSection,
        updatePart,
    } = useCreateTest()

    // ========================================
    // Helpers
    // ========================================
    const questionTypeGroups = {
        'Reading & Listening': [
            { value: QuestionType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
            {
                value: QuestionType.TRUE_FALSE_NOT_GIVEN,
                label: 'True / False / Not Given',
            },
            {
                value: QuestionType.YES_NO_NOT_GIVEN,
                label: 'Yes / No / Not Given',
            },
            {
                value: QuestionType.MATCHING_HEADINGS,
                label: 'Matching Headings',
            },
            {
                value: QuestionType.MATCHING_INFORMATION,
                label: 'Matching Information',
            },
            {
                value: QuestionType.MATCHING_FEATURES,
                label: 'Matching Features',
            },
            {
                value: QuestionType.SENTENCE_COMPLETION,
                label: 'Sentence Completion',
            },
            {
                value: QuestionType.SUMMARY_COMPLETION,
                label: 'Summary Completion',
            },
            {
                value: QuestionType.NOTE_COMPLETION,
                label: 'Note/Table/Flow-chart Completion',
            },
            { value: QuestionType.SHORT_ANSWER, label: 'Short Answer' },
            { value: QuestionType.DIAGRAM_LABELING, label: 'Diagram Labeling' },
        ],
        Writing: [
            {
                value: QuestionType.WRITING_TASK_1,
                label: 'Writing Task 1 (150 words)',
            },
            {
                value: QuestionType.WRITING_TASK_2,
                label: 'Writing Task 2 (250 words)',
            },
        ],
        Speaking: [
            {
                value: QuestionType.SPEAKING_PART_1,
                label: 'Speaking Part 1 (Interview)',
            },
            {
                value: QuestionType.SPEAKING_PART_2,
                label: 'Speaking Part 2 (Cue Card)',
            },
            {
                value: QuestionType.SPEAKING_PART_3,
                label: 'Speaking Part 3 (Discussion)',
            },
        ],
    }

    const getQuestionTypeLabel = (type: QuestionType): string => {
        for (const group of Object.values(questionTypeGroups)) {
            const found = group.find((opt) => opt.value === type)
            if (found) return found.label
        }
        return type
    }

    // ========================================
    // Handlers
    // ========================================
    const handleNavigate = (sectionIndex: number, partIndex?: number) => {
        console.log('Navigate to:', sectionIndex, partIndex)
    }

    // ========================================
    // Validation & Submit
    // ========================================
    const validateForm = (): boolean => {
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề bài thi')
            return false
        }

        if (sections.length === 0) {
            alert('Vui lòng thêm ít nhất 1 section')
            return false
        }

        for (const section of sections) {
            if (section.parts.length === 0) {
                alert(`Section "${section.name}" chưa có part nào`)
                return false
            }

            for (const part of section.parts) {
                if (!part.passage?.text_content?.trim()) {
                    alert(`Part "${part.name}" chưa có nội dung passage`)
                    return false
                }

                if (
                    section.skill_area === SkillArea.LISTENING &&
                    !part.passage?.audio_url?.trim()
                ) {
                    alert(`Part "${part.name}" (Listening) chưa có audio URL`)
                    return false
                }

                if (part.question_groups.length === 0) {
                    alert(`Part "${part.name}" chưa có question group nào`)
                    return false
                }

                for (const group of part.question_groups) {
                    if (group.questions.length === 0) {
                        alert(
                            `Question group "${group.name}" chưa có câu hỏi nào`
                        )
                        return false
                    }

                    for (const question of group.questions) {
                        if (!question.question_text.trim()) {
                            alert(
                                `Có câu hỏi chưa nhập nội dung trong group "${group.name}"`
                            )
                            return false
                        }
                    }
                }
            }
        }

        return true
    }
    const handleSubmit = async () => {
        if (!validateForm()) return

        setLoading(true)
        try {
            const activeKeys = new Set<string>()
            sections.forEach((s) =>
                s.parts.forEach((p) => {
                    if (p.passage?.audio_url?.startsWith('file:'))
                        activeKeys.add(p.passage.audio_url.replace('file:', ''))
                    if (p.passage?.image_url?.startsWith('file:'))
                        activeKeys.add(p.passage.image_url.replace('file:', ''))
                })
            )

            const finalFiles: Record<string, File> = {}
            Object.entries(uploadedFiles).forEach(([key, file]) => {
                if (activeKeys.has(key)) {
                    finalFiles[key] = file
                }
            })

            const payload: TestCreatePayload = {
                title,
                description: description || undefined,
                instructions: instructions || undefined,
                test_type: testType || undefined,
                time_limit_minutes: timeLimitMinutes || undefined,
                passing_score: passingScore,
                max_attempts: maxAttempts,
                randomize_questions: randomizeQuestions,
                show_results_immediately: showResultsImmediately,
                ai_grading_enabled: aiGradingEnabled,
                start_time: startTime ? startTime : undefined,
                end_time: endTime ? endTime : undefined,
                sections,
            }

            const result = await testApi.createTest(payload, finalFiles)

            alert('Tạo bài thi thành công!')
            navigate(`/teacher/tests/${result.id}/view`)
        } catch (error: any) {
            console.error('Failed to create test:', error)

            if (error.response?.data?.detail) {
                const detail = error.response.data.detail
                if (Array.isArray(detail)) {
                    const messages = detail
                        .map((err) => `${err.loc.join('.')}: ${err.msg}`)
                        .join('\n')
                    alert(`Validation errors:\n${messages}`)
                } else {
                    alert(`Error: ${detail}`)
                }
            } else {
                alert(error.message || 'Tạo bài thi thất bại')
            }
        } finally {
            setLoading(false)
        }
    }

    // ========================================
    // Render
    // ========================================
    return (
        <div className={s.container}>
            <div className={s.layout}>
                <TestNavigator
                    sections={sections}
                    onNavigate={handleNavigate}
                />
                <div className={s.content}>
                    <h1 className={s.pageTitle}>Tạo bài thi mới</h1>

                    {/* ============================================ */}
                    {/* BASIC INFO */}
                    {/* ============================================ */}
                    <Card title="Thông tin cơ bản" variant="outline">
                        <div className={s.formGrid}>
                            <InputField
                                label="Tiêu đề"
                                required={true}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="VD: IELTS Reading Practice Test 1"
                            />

                            <SelectField
                                label="Loại bài thi"
                                value={testType || ''}
                                onChange={(e) =>
                                    setTestType(
                                        (e.target.value as TestType) || null
                                    )
                                }
                                options={Object.values(TestType).map(
                                    (type) => ({
                                        label: type
                                            .toLowerCase()
                                            .replace(/_/g, ' ')
                                            .replace(/\b\w/g, (char) =>
                                                char.toUpperCase()
                                            ),
                                        value: type,
                                    })
                                )}
                            />

                            <InputField
                                label="Thời gian (phút)"
                                type="number"
                                value={timeLimitMinutes}
                                onChange={(e) =>
                                    setTimeLimitMinutes(
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                min="1"
                            />

                            <InputField
                                label="Điểm đạt (%)"
                                type="number"
                                value={passingScore}
                                onChange={(e) =>
                                    setPassingScore(
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                min="0"
                                max="100"
                            />

                            <InputField
                                label="Số lần làm tối đa"
                                type="number"
                                value={maxAttempts}
                                onChange={(e) =>
                                    setMaxAttempts(
                                        parseInt(e.target.value) || 1
                                    )
                                }
                                min="1"
                            />

                            <InputField
                                label="Thời gian mở"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />

                            <InputField
                                label="Thời gian đóng"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />

                            <InputField
                                label="Mô tả"
                                multiline={true}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả về bài thi..."
                            />

                            <InputField
                                label="Hướng dẫn"
                                multiline={true}
                                enableMarkdown={true}
                                value={instructions}
                                onChange={(e) =>
                                    setInstructions(e.target.value)
                                }
                                placeholder="Hướng dẫn làm bài..."
                            />

                            <div className={s.checkboxField}>
                                <label className={s.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={randomizeQuestions}
                                        onChange={(e) =>
                                            setRandomizeQuestions(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>Xáo trộn thứ tự câu hỏi</span>
                                </label>
                            </div>

                            <div className={s.checkboxField}>
                                <label className={s.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={showResultsImmediately}
                                        onChange={(e) =>
                                            setShowResultsImmediately(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>Hiển thị kết quả ngay</span>
                                </label>
                            </div>

                            <div className={s.checkboxField}>
                                <label className={s.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={aiGradingEnabled}
                                        onChange={(e) =>
                                            setAiGradingEnabled(
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <span>
                                        Bật chấm điểm AI (Essay/Speaking)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* ============================================ */}
                    {/* SECTIONS */}
                    {/* ============================================ */}
                    {sections.map((section, sIndex) => (
                        <CollapsibleCard
                            key={sIndex}
                            level="section"
                            title={`Section ${sIndex + 1}: ${section.name}`}
                            actions={
                                <button
                                    onClick={() => handleRemoveSection(sIndex)}
                                    className={s.deleteBtn}
                                >
                                    ✕
                                </button>
                            }
                        >
                            <div
                                id={`section-${sIndex}`}
                                className={s.formGrid}
                            >
                                <InputField
                                    label="Tên section"
                                    type="text"
                                    value={section.name}
                                    onChange={(e) =>
                                        updateSection(sIndex, {
                                            name: e.target.value,
                                        })
                                    }
                                />

                                <SelectField
                                    label="Kỹ năng"
                                    value={section.skill_area}
                                    onChange={(e) =>
                                        updateSection(sIndex, {
                                            skill_area: e.target
                                                .value as SkillArea,
                                        })
                                    }
                                    options={Object.values(SkillArea).map(
                                        (s) => ({
                                            label:
                                                s.charAt(0).toUpperCase() +
                                                s.slice(1),
                                            value: s,
                                        })
                                    )}
                                />

                                <InputField
                                    label="Thời gian giới hạn (phút, tùy chọn)"
                                    type="number"
                                    value={section.time_limit_minutes || ''}
                                    onChange={(e) =>
                                        updateSection(sIndex, {
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
                                        updateSection(sIndex, {
                                            instructions: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* ============================================ */}
                            {/* PARTS */}
                            {/* ============================================ */}
                            {section.parts.map((part, pIndex) => (
                                <CollapsibleCard
                                    key={pIndex}
                                    level="part"
                                    title={`Part ${pIndex + 1}: ${part.name}`}
                                    defaultOpen={pIndex === 0}
                                    actions={
                                        <button
                                            onClick={() =>
                                                handleRemovePart(sIndex, pIndex)
                                            }
                                            className={s.deleteBtn}
                                        >
                                            ✕
                                        </button>
                                    }
                                >
                                    <div
                                        id={`section-${sIndex}-part-${pIndex}`}
                                        className={s.formGrid}
                                    >
                                        <InputField
                                            label="Tên part"
                                            type="text"
                                            value={part.name}
                                            onChange={(e) =>
                                                updatePart(sIndex, pIndex, {
                                                    name: e.target.value,
                                                })
                                            }
                                        />

                                        <InputField
                                            label="Tiêu đề Passage"
                                            type="text"
                                            value={part.passage?.title || ''}
                                            onChange={(e) =>
                                                updatePartPassage(
                                                    sIndex,
                                                    pIndex,
                                                    {
                                                        title: e.target.value,
                                                    }
                                                )
                                            }
                                            placeholder="VD: The History of Coffee"
                                        />

                                        <div
                                            className={`${s.formField} ${s.fullWidth}`}
                                        >
                                            <InputField
                                                label={
                                                    section.skill_area ===
                                                    SkillArea.LISTENING
                                                        ? 'Audio Script (Listening)'
                                                        : section.skill_area ===
                                                            SkillArea.SPEAKING
                                                          ? 'Cue Card Content'
                                                          : 'Đoạn văn Reading'
                                                }
                                                enableMarkdown={true}
                                                required={true}
                                                value={
                                                    part.passage
                                                        ?.text_content || ''
                                                }
                                                onChange={(e) =>
                                                    updatePartPassage(
                                                        sIndex,
                                                        pIndex,
                                                        {
                                                            text_content:
                                                                e.target.value,
                                                        }
                                                    )
                                                }
                                                multiline={true}
                                                style={{
                                                    minHeight: '150px',
                                                }}
                                                placeholder={
                                                    section.skill_area ===
                                                    SkillArea.LISTENING
                                                        ? 'Nhập nội dung audio script...'
                                                        : section.skill_area ===
                                                            SkillArea.SPEAKING
                                                          ? 'Nhập nội dung cue card...'
                                                          : 'Nhập đoạn văn reading...'
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* ============================================ */}
                                    {/* PARTS - AUDIO UPLOAD */}
                                    {/* ============================================ */}
                                    {section.skill_area ===
                                        SkillArea.LISTENING && (
                                        <div className={`${s.formField}`}>
                                            {/* Input chọn File Audio */}
                                            <InputField
                                                label="Audio File (Listening) *"
                                                type="file"
                                                accept="audio/*"
                                                fullWidth
                                                rightIcon={
                                                    uploadedFiles[
                                                        getFileKey(
                                                            part.id ?? '',
                                                            'audio'
                                                        )
                                                    ] && (
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveFile(
                                                                    sIndex,
                                                                    pIndex,
                                                                    'audio'
                                                                )
                                                            }
                                                            style={{
                                                                cursor: 'pointer',
                                                                border: 'none',
                                                                background:
                                                                    'none',
                                                                color: '#ff4d4f',
                                                                fontWeight:
                                                                    'bold',
                                                            }}
                                                            title="Gỡ bỏ file"
                                                        >
                                                            ✕
                                                        </button>
                                                    )
                                                }
                                                onChange={(e) => {
                                                    const file =
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).files?.[0] || null
                                                    handleFileUpload(
                                                        sIndex,
                                                        pIndex,
                                                        'audio',
                                                        file
                                                    )
                                                }}
                                                hint={
                                                    uploadedFiles[
                                                        getFileKey(
                                                            part.id ?? '',
                                                            'audio'
                                                        )
                                                    ]?.name
                                                }
                                            />

                                            {uploadedFiles[
                                                getFileKey(
                                                    part.id ?? '',
                                                    'audio'
                                                )
                                            ] && (
                                                <div
                                                    style={{
                                                        marginTop: '8px',
                                                        padding: '10px',
                                                        background:
                                                            'rgba(0,0,0,0.05)',
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
                                                        src={URL.createObjectURL(
                                                            uploadedFiles[
                                                                getFileKey(
                                                                    part.id ??
                                                                        '',
                                                                    'audio'
                                                                )
                                                            ]
                                                        )}
                                                        style={{
                                                            width: '100%',
                                                            height: '32px',
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Input nhập URL Audio */}
                                            <div
                                                style={{
                                                    marginTop: '12px',
                                                }}
                                            >
                                                <InputField
                                                    label="Hoặc nhập URL:"
                                                    type="text"
                                                    uiSize="sm"
                                                    placeholder="https://example.com/audio.mp3"
                                                    value={
                                                        part.passage
                                                            ?.audio_url || ''
                                                    }
                                                    // Disable nếu đã chọn file upload
                                                    disabled={
                                                        !!uploadedFiles[
                                                            getFileKey(
                                                                part.id ?? '',
                                                                'audio'
                                                            )
                                                        ]
                                                    }
                                                    onChange={(e) => {
                                                        const urlValue =
                                                            e.target.value

                                                        updatePartPassage(
                                                            sIndex,
                                                            pIndex,
                                                            {
                                                                audio_url:
                                                                    urlValue,
                                                            }
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.skill_area ===
                                        SkillArea.READING && (
                                        <div className={s.formField}>
                                            <InputField
                                                label="Hình ảnh (Diagram/Chart - tùy chọn)"
                                                type="file"
                                                accept="image/*"
                                                fullWidth
                                                rightIcon={
                                                    uploadedFiles[
                                                        getFileKey(
                                                            part.id ?? '',
                                                            'image'
                                                        )
                                                    ] && (
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveFile(
                                                                    sIndex,
                                                                    pIndex,
                                                                    'image'
                                                                )
                                                            }
                                                            style={{
                                                                cursor: 'pointer',
                                                                border: 'none',
                                                                background:
                                                                    'none',
                                                                color: '#ff4d4f',
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )
                                                }
                                                onChange={(e) => {
                                                    const file =
                                                        (
                                                            e.target as HTMLInputElement
                                                        ).files?.[0] || null
                                                    handleFileUpload(
                                                        sIndex,
                                                        pIndex,
                                                        'image',
                                                        file
                                                    )
                                                }}
                                            />

                                            {uploadedFiles[
                                                getFileKey(
                                                    part.id ?? '',
                                                    'image'
                                                )
                                            ] && (
                                                <div
                                                    style={{
                                                        marginTop: '10px',
                                                        position: 'relative',
                                                        width: 'fit-content',
                                                    }}
                                                >
                                                    <img
                                                        src={URL.createObjectURL(
                                                            uploadedFiles[
                                                                getFileKey(
                                                                    part.id ??
                                                                        '',
                                                                    'image'
                                                                )
                                                            ]
                                                        )}
                                                        alt="Preview"
                                                        style={{
                                                            maxWidth: '100%',
                                                            maxHeight: '150px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #ddd',
                                                        }}
                                                    />
                                                    <p
                                                        style={{
                                                            fontSize: '11px',
                                                            color: '#666',
                                                        }}
                                                    >
                                                        {
                                                            uploadedFiles[
                                                                getFileKey(
                                                                    part.id ??
                                                                        '',
                                                                    'image'
                                                                )
                                                            ].name
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <InputField
                                        label="Topic"
                                        type="text"
                                        value={part.passage?.topic || ''}
                                        onChange={(e) =>
                                            updatePartPassage(sIndex, pIndex, {
                                                topic: e.target.value,
                                            })
                                        }
                                        placeholder="VD: Environment, Technology"
                                    />

                                    <SelectField
                                        label="Mức độ khó"
                                        value={
                                            part.passage?.difficulty_level ||
                                            DifficultyLevel.MEDIUM
                                        }
                                        onChange={(e) =>
                                            updatePartPassage(sIndex, pIndex, {
                                                difficulty_level: e.target
                                                    .value as DifficultyLevel,
                                            })
                                        }
                                        options={Object.values(
                                            DifficultyLevel
                                        ).map((level) => ({
                                            label:
                                                level.charAt(0).toUpperCase() +
                                                level.slice(1),
                                            value: level,
                                        }))}
                                    />

                                    <InputField
                                        label="Hướng dẫn part"
                                        enableMarkdown={true}
                                        value={part.instructions || ''}
                                        multiline={true}
                                        onChange={(e) =>
                                            updatePart(sIndex, pIndex, {
                                                instructions: e.target.value,
                                            })
                                        }
                                        className={`${s.fullWidth}`}
                                    />

                                    {/* ============================================ */}
                                    {/* QUESTION GROUPS */}
                                    {/* ============================================ */}
                                    {part.question_groups.map(
                                        (group, gIndex) => (
                                            <CollapsibleCard
                                                key={gIndex}
                                                level="group"
                                                title={group.name}
                                                defaultOpen={gIndex === 0}
                                                actions={
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveQuestionGroup(
                                                                sIndex,
                                                                pIndex,
                                                                gIndex
                                                            )
                                                        }
                                                        className={s.deleteBtn}
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
                                                            updateQuestionGroup(
                                                                sIndex,
                                                                pIndex,
                                                                gIndex,
                                                                {
                                                                    name: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        placeholder="e.g., Questions 1-5"
                                                    />

                                                    <SelectField
                                                        label="Loại câu hỏi"
                                                        value={
                                                            group.question_type
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestionGroup(
                                                                sIndex,
                                                                pIndex,
                                                                gIndex,
                                                                {
                                                                    question_type:
                                                                        e.target
                                                                            .value as QuestionType,
                                                                }
                                                            )
                                                        }
                                                        options={Object.values(
                                                            QuestionType
                                                        ).map((type) => ({
                                                            label: type
                                                                .toLowerCase()
                                                                .replace(
                                                                    /_/g,
                                                                    ' '
                                                                )
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (l) =>
                                                                        l.toUpperCase()
                                                                ),
                                                            value: type,
                                                        }))}
                                                    />

                                                    <InputField
                                                        label="Hướng dẫn group"
                                                        enableMarkdown={true}
                                                        multiline={true}
                                                        value={
                                                            group.instructions ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestionGroup(
                                                                sIndex,
                                                                pIndex,
                                                                gIndex,
                                                                {
                                                                    instructions:
                                                                        e.target
                                                                            .value,
                                                                }
                                                            )
                                                        }
                                                        className={`${s.fullWidth}`}
                                                        placeholder="Group instructions..."
                                                    />
                                                </div>

                                                {/* ============================================ */}
                                                {/* QUESTIONS */}
                                                {/* ============================================ */}
                                                {group.questions.map(
                                                    (q, qIndex) => (
                                                        <div
                                                            key={qIndex}
                                                            className={
                                                                s.questionBox
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    s.questionHeader
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        s.questionLabel
                                                                    }
                                                                >
                                                                    Câu hỏi{' '}
                                                                    {qIndex + 1}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveQuestion(
                                                                            sIndex,
                                                                            pIndex,
                                                                            gIndex,
                                                                            qIndex
                                                                        )
                                                                    }
                                                                    className={
                                                                        s.deleteBtn
                                                                    }
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>

                                                            <div
                                                                className={
                                                                    s.formGrid
                                                                }
                                                            >
                                                                <InputField
                                                                    label="Điểm"
                                                                    type="number"
                                                                    value={
                                                                        q.points ||
                                                                        1
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateQuestion(
                                                                            sIndex,
                                                                            pIndex,
                                                                            gIndex,
                                                                            qIndex,
                                                                            {
                                                                                points: parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                ),
                                                                            }
                                                                        )
                                                                    }
                                                                    step="0.5"
                                                                    min="0"
                                                                />

                                                                <InputField
                                                                    label="Nội dung câu hỏi"
                                                                    enableMarkdown={
                                                                        true
                                                                    }
                                                                    className={`${s.fullWidth}`}
                                                                    required={
                                                                        true
                                                                    }
                                                                    multiline={
                                                                        true
                                                                    }
                                                                    value={
                                                                        q.question_text
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateQuestion(
                                                                            sIndex,
                                                                            pIndex,
                                                                            gIndex,
                                                                            qIndex,
                                                                            {
                                                                                question_text:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }
                                                                        )
                                                                    }
                                                                />
                                                                <InputField
                                                                    label="Đáp án đúng"
                                                                    type="text"
                                                                    value={
                                                                        q.correct_answer ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        updateQuestion(
                                                                            sIndex,
                                                                            pIndex,
                                                                            gIndex,
                                                                            qIndex,
                                                                            {
                                                                                correct_answer:
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            }
                                                                        )
                                                                    }
                                                                    placeholder="Nhập đáp án đúng"
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                )}

                                                <ButtonGhost
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAddQuestion(
                                                            sIndex,
                                                            pIndex,
                                                            gIndex
                                                        )
                                                    }
                                                >
                                                    + Thêm câu hỏi vào group này
                                                </ButtonGhost>
                                            </CollapsibleCard>
                                        )
                                    )}

                                    <ButtonGhost
                                        size="sm"
                                        onClick={() =>
                                            handleAddQuestionGroup(
                                                sIndex,
                                                pIndex
                                            )
                                        }
                                        style={{ marginTop: '12px' }}
                                    >
                                        + Thêm Question Group
                                    </ButtonGhost>
                                </CollapsibleCard>
                            ))}

                            <ButtonGhost
                                size="sm"
                                onClick={() => handleAddPart(sIndex)}
                                style={{ marginTop: '16px' }}
                            >
                                + Thêm Part
                            </ButtonGhost>
                        </CollapsibleCard>
                    ))}

                    <ButtonGhost size="md" onClick={handleAddSection}>
                        + Thêm Section
                    </ButtonGhost>

                    {/* ============================================ */}
                    {/* ACTIONS */}
                    {/* ============================================ */}
                    <div className={s.actions}>
                        <ButtonGhost onClick={() => navigate(-1)}>
                            Hủy
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleSubmit}
                            loading={loading}
                            disabled={loading}
                        >
                            Tạo bài thi
                        </ButtonPrimary>
                    </div>
                </div>
            </div>
        </div>
    )
}
