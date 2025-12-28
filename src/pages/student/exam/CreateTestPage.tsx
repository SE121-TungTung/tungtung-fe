import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import type {
    TestCreatePayload,
    TestSectionCreatePayload,
    TestSectionPartCreatePayload,
    QuestionGroupCreatePayload,
    QuestionCreatePayload,
} from '@/types/test.types'
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

    // ✅ Config fields (from BE schema)
    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(60)
    const [passingScore, setPassingScore] = useState<number>(60)
    const [maxAttempts, setMaxAttempts] = useState<number>(1)
    const [randomizeQuestions, setRandomizeQuestions] = useState(false)
    const [showResultsImmediately, setShowResultsImmediately] = useState(true)
    const [aiGradingEnabled, setAiGradingEnabled] = useState(false)

    // Optional fields
    const [startTime, setStartTime] = useState<string>('')
    const [endTime, setEndTime] = useState<string>('')

    // ========================================
    // Sections State
    // ========================================
    const [sections, setSections] = useState<TestSectionCreatePayload[]>([
        {
            name: 'Section 1',
            order_number: 1,
            skill_area: SkillArea.READING,
            parts: [
                {
                    name: 'Part 1',
                    order_number: 1,
                    content: '', // ✅ Critical field for reading/listening content
                    question_groups: [],
                },
            ],
        },
    ])

    // ========================================
    // Section Handlers
    // ========================================
    const handleAddSection = () => {
        setSections([
            ...sections,
            {
                name: `Section ${sections.length + 1}`,
                order_number: sections.length + 1,
                skill_area: SkillArea.READING,
                parts: [
                    {
                        name: 'Part 1',
                        order_number: 1,
                        content: '',
                        question_groups: [],
                    },
                ],
            },
        ])
    }

    const handleRemoveSection = (sectionIndex: number) => {
        if (sections.length === 1) {
            alert('Phải có ít nhất 1 section')
            return
        }
        const newSections = sections.filter((_, i) => i !== sectionIndex)
        // Re-number sections
        newSections.forEach((s, i) => {
            s.order_number = i + 1
        })
        setSections(newSections)
    }

    // ========================================
    // Part Handlers
    // ========================================
    const handleAddPart = (sectionIndex: number) => {
        const newSections = [...sections]
        const section = newSections[sectionIndex]
        section.parts.push({
            name: `Part ${section.parts.length + 1}`,
            order_number: section.parts.length + 1,
            content: '',
            question_groups: [],
        })
        setSections(newSections)
    }

    const handleRemovePart = (sectionIndex: number, partIndex: number) => {
        const newSections = [...sections]
        const section = newSections[sectionIndex]

        if (section.parts.length === 1) {
            alert('Phải có ít nhất 1 part trong section')
            return
        }

        section.parts.splice(partIndex, 1)
        // Re-number parts
        section.parts.forEach((p, i) => {
            p.order_number = i + 1
        })
        setSections(newSections)
    }

    const updatePart = (
        sectionIndex: number,
        partIndex: number,
        updates: Partial<TestSectionPartCreatePayload>
    ) => {
        const newSections = [...sections]
        newSections[sectionIndex].parts[partIndex] = {
            ...newSections[sectionIndex].parts[partIndex],
            ...updates,
        }
        setSections(newSections)
    }

    // ========================================
    // Question Group Handlers
    // ========================================
    const handleAddQuestionGroup = (
        sectionIndex: number,
        partIndex: number
    ) => {
        const newSections = [...sections]
        const part = newSections[sectionIndex].parts[partIndex]
        part.question_groups.push({
            name: `Questions ${part.question_groups.length * 5 + 1}-${(part.question_groups.length + 1) * 5}`,
            order_number: part.question_groups.length + 1,
            question_type: QuestionType.SHORT_ANSWER,
            questions: [],
        })
        setSections(newSections)
    }

    const handleRemoveQuestionGroup = (
        sectionIndex: number,
        partIndex: number,
        groupIndex: number
    ) => {
        const newSections = [...sections]
        const part = newSections[sectionIndex].parts[partIndex]
        part.question_groups.splice(groupIndex, 1)
        // Re-number groups
        part.question_groups.forEach((g, i) => {
            g.order_number = i + 1
        })
        setSections(newSections)
    }

    const updateQuestionGroup = (
        sectionIndex: number,
        partIndex: number,
        groupIndex: number,
        updates: Partial<QuestionGroupCreatePayload>
    ) => {
        const newSections = [...sections]
        newSections[sectionIndex].parts[partIndex].question_groups[groupIndex] =
            {
                ...newSections[sectionIndex].parts[partIndex].question_groups[
                    groupIndex
                ],
                ...updates,
            }
        setSections(newSections)
    }

    // ========================================
    // Question Handlers
    // ========================================
    const handleAddQuestion = (
        sectionIndex: number,
        partIndex: number,
        groupIndex: number
    ) => {
        const newSections = [...sections]
        const group =
            newSections[sectionIndex].parts[partIndex].question_groups[
                groupIndex
            ]

        group.questions.push({
            title: `Question ${group.questions.length + 1}`,
            question_text: '',
            question_type: group.question_type,
            skill_area: newSections[sectionIndex].skill_area,
            difficulty_level: DifficultyLevel.MEDIUM,
            points: 1,
        })
        setSections(newSections)
    }

    const handleRemoveQuestion = (
        sectionIndex: number,
        partIndex: number,
        groupIndex: number,
        questionIndex: number
    ) => {
        const newSections = [...sections]
        newSections[sectionIndex].parts[partIndex].question_groups[
            groupIndex
        ].questions.splice(questionIndex, 1)
        setSections(newSections)
    }

    const updateQuestion = (
        sectionIndex: number,
        partIndex: number,
        groupIndex: number,
        questionIndex: number,
        updates: Partial<QuestionCreatePayload>
    ) => {
        const newSections = [...sections]
        newSections[sectionIndex].parts[partIndex].question_groups[
            groupIndex
        ].questions[questionIndex] = {
            ...newSections[sectionIndex].parts[partIndex].question_groups[
                groupIndex
            ].questions[questionIndex],
            ...updates,
        }
        setSections(newSections)
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

                    // Validate each question
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

            const result = await testApi.createTest(payload)
            console.log('Test created:', result)
            alert('Tạo bài thi thành công!')
            navigate(`/teacher/tests/${result.id}`)
        } catch (error: any) {
            console.error('Failed to create test:', error)
            alert(error.message || 'Tạo bài thi thất bại')
        } finally {
            setLoading(false)
        }
    }

    // ========================================
    // Render
    // ========================================
    return (
        <div className={s.container}>
            <div className={s.content}>
                <h1 className={s.pageTitle}>Tạo bài thi mới</h1>

                {/* ============================================ */}
                {/* BASIC INFO */}
                {/* ============================================ */}
                <Card title="Thông tin cơ bản" variant="outline">
                    <div className={s.formGrid}>
                        <div className={s.formField}>
                            <label className={s.label}>
                                Tiêu đề <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={s.input}
                                placeholder="VD: IELTS Reading Practice Test 1"
                            />
                        </div>

                        <div className={s.formField}>
                            <label className={s.label}>Loại bài thi</label>
                            <select
                                value={testType || ''}
                                onChange={(e) =>
                                    setTestType(
                                        (e.target.value as TestType) || null
                                    )
                                }
                                className={s.input}
                            >
                                <option value="">-- Chọn loại --</option>
                                {Object.values(TestType).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={s.formField}>
                            <label className={s.label}>Thời gian (phút)</label>
                            <input
                                type="number"
                                value={timeLimitMinutes}
                                onChange={(e) =>
                                    setTimeLimitMinutes(
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                className={s.input}
                                min="1"
                            />
                        </div>

                        <div className={s.formField}>
                            <label className={s.label}>Điểm đạt (%)</label>
                            <input
                                type="number"
                                value={passingScore}
                                onChange={(e) =>
                                    setPassingScore(
                                        parseInt(e.target.value) || 0
                                    )
                                }
                                className={s.input}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className={s.formField}>
                            <label className={s.label}>Số lần làm tối đa</label>
                            <input
                                type="number"
                                value={maxAttempts}
                                onChange={(e) =>
                                    setMaxAttempts(
                                        parseInt(e.target.value) || 1
                                    )
                                }
                                className={s.input}
                                min="1"
                            />
                        </div>

                        <div className={s.formField}>
                            <label className={s.label}>
                                Thời gian mở (tùy chọn)
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className={s.input}
                            />
                        </div>

                        <div className={s.formField}>
                            <label className={s.label}>
                                Thời gian đóng (tùy chọn)
                            </label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className={s.input}
                            />
                        </div>

                        <div className={`${s.formField} ${s.fullWidth}`}>
                            <label className={s.label}>Mô tả</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={s.textarea}
                                placeholder="Mô tả về bài thi..."
                            />
                        </div>

                        <div className={`${s.formField} ${s.fullWidth}`}>
                            <label className={s.label}>Hướng dẫn</label>
                            <textarea
                                value={instructions}
                                onChange={(e) =>
                                    setInstructions(e.target.value)
                                }
                                className={s.textarea}
                                placeholder="Hướng dẫn làm bài..."
                            />
                        </div>

                        <div className={s.checkboxField}>
                            <label className={s.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={randomizeQuestions}
                                    onChange={(e) =>
                                        setRandomizeQuestions(e.target.checked)
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
                                        setAiGradingEnabled(e.target.checked)
                                    }
                                />
                                <span>Bật chấm điểm AI (Essay/Speaking)</span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* ============================================ */}
                {/* SECTIONS */}
                {/* ============================================ */}
                {sections.map((section, sIndex) => (
                    <Card
                        key={sIndex}
                        title={
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span>
                                    Section {sIndex + 1}: {section.name}
                                </span>
                                <button
                                    onClick={() => handleRemoveSection(sIndex)}
                                    className={s.deleteBtn}
                                    style={{ fontSize: '20px' }}
                                >
                                    ✕
                                </button>
                            </div>
                        }
                        variant="outline"
                    >
                        <div className={s.formGrid}>
                            <div className={s.formField}>
                                <label className={s.label}>Tên section</label>
                                <input
                                    type="text"
                                    value={section.name}
                                    onChange={(e) => {
                                        const newSections = [...sections]
                                        newSections[sIndex].name =
                                            e.target.value
                                        setSections(newSections)
                                    }}
                                    className={s.input}
                                />
                            </div>

                            <div className={s.formField}>
                                <label className={s.label}>Kỹ năng</label>
                                <select
                                    value={section.skill_area}
                                    onChange={(e) => {
                                        const newSections = [...sections]
                                        newSections[sIndex].skill_area = e
                                            .target.value as SkillArea
                                        setSections(newSections)
                                    }}
                                    className={s.input}
                                >
                                    {Object.values(SkillArea).map((skill) => (
                                        <option key={skill} value={skill}>
                                            {skill}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={s.formField}>
                                <label className={s.label}>
                                    Thời gian giới hạn (phút, tùy chọn)
                                </label>
                                <input
                                    type="number"
                                    value={section.time_limit_minutes || ''}
                                    onChange={(e) => {
                                        const newSections = [...sections]
                                        newSections[sIndex].time_limit_minutes =
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : undefined
                                        setSections(newSections)
                                    }}
                                    className={s.input}
                                    placeholder="Để trống nếu không giới hạn"
                                />
                            </div>

                            <div className={`${s.formField} ${s.fullWidth}`}>
                                <label className={s.label}>
                                    Hướng dẫn section (tùy chọn)
                                </label>
                                <textarea
                                    value={section.instructions || ''}
                                    onChange={(e) => {
                                        const newSections = [...sections]
                                        newSections[sIndex].instructions =
                                            e.target.value
                                        setSections(newSections)
                                    }}
                                    className={s.textarea}
                                />
                            </div>
                        </div>

                        {/* ============================================ */}
                        {/* PARTS */}
                        {/* ============================================ */}
                        {section.parts.map((part, pIndex) => (
                            <div key={pIndex} className={s.partContainer}>
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <h4 className={s.partTitle}>
                                        Part {pIndex + 1}: {part.name}
                                    </h4>
                                    <button
                                        onClick={() =>
                                            handleRemovePart(sIndex, pIndex)
                                        }
                                        className={s.deleteBtn}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className={s.formGrid}>
                                    <div className={s.formField}>
                                        <label className={s.label}>
                                            Tên part
                                        </label>
                                        <input
                                            type="text"
                                            value={part.name}
                                            onChange={(e) =>
                                                updatePart(sIndex, pIndex, {
                                                    name: e.target.value,
                                                })
                                            }
                                            className={s.input}
                                        />
                                    </div>

                                    <div
                                        className={`${s.formField} ${s.fullWidth}`}
                                    >
                                        <label className={s.label}>
                                            Nội dung (Đoạn văn Reading / Audio
                                            script Listening)
                                        </label>
                                        <textarea
                                            value={part.content || ''}
                                            onChange={(e) =>
                                                updatePart(sIndex, pIndex, {
                                                    content: e.target.value,
                                                })
                                            }
                                            className={s.textarea}
                                            style={{ minHeight: '120px' }}
                                            placeholder="Nhập đoạn văn reading hoặc audio script listening..."
                                        />
                                    </div>

                                    <div className={s.formField}>
                                        <label className={s.label}>
                                            Audio URL (tùy chọn)
                                        </label>
                                        <input
                                            type="text"
                                            value={part.audio_url || ''}
                                            onChange={(e) =>
                                                updatePart(sIndex, pIndex, {
                                                    audio_url: e.target.value,
                                                })
                                            }
                                            className={s.input}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div
                                        className={`${s.formField} ${s.fullWidth}`}
                                    >
                                        <label className={s.label}>
                                            Hướng dẫn part (tùy chọn)
                                        </label>
                                        <textarea
                                            value={part.instructions || ''}
                                            onChange={(e) =>
                                                updatePart(sIndex, pIndex, {
                                                    instructions:
                                                        e.target.value,
                                                })
                                            }
                                            className={s.textarea}
                                        />
                                    </div>
                                </div>

                                {/* ============================================ */}
                                {/* QUESTION GROUPS */}
                                {/* ============================================ */}
                                {part.question_groups.map((group, gIndex) => (
                                    <div
                                        key={gIndex}
                                        style={{
                                            background: '#e9ecef',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            marginTop: '12px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            <strong
                                                style={{ color: '#495057' }}
                                            >
                                                {group.name}
                                            </strong>
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
                                        </div>

                                        <div className={s.formGrid}>
                                            <div className={s.formField}>
                                                <label className={s.label}>
                                                    Group Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={group.name}
                                                    onChange={(e) =>
                                                        updateQuestionGroup(
                                                            sIndex,
                                                            pIndex,
                                                            gIndex,
                                                            {
                                                                name: e.target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                    className={s.input}
                                                    placeholder="e.g., Questions 1-5"
                                                />
                                            </div>

                                            <div className={s.formField}>
                                                <label className={s.label}>
                                                    Question Type
                                                </label>
                                                <select
                                                    value={group.question_type}
                                                    onChange={(e) =>
                                                        updateQuestionGroup(
                                                            sIndex,
                                                            pIndex,
                                                            gIndex,
                                                            {
                                                                question_type: e
                                                                    .target
                                                                    .value as QuestionType,
                                                            }
                                                        )
                                                    }
                                                    className={s.input}
                                                >
                                                    {Object.values(
                                                        QuestionType
                                                    ).map((type) => (
                                                        <option
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div
                                                className={`${s.formField} ${s.fullWidth}`}
                                            >
                                                <label className={s.label}>
                                                    Instructions (tùy chọn)
                                                </label>
                                                <textarea
                                                    value={
                                                        group.instructions || ''
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
                                                    className={s.textarea}
                                                    placeholder="Group instructions..."
                                                />
                                            </div>
                                        </div>

                                        {/* ============================================ */}
                                        {/* QUESTIONS */}
                                        {/* ============================================ */}
                                        {group.questions.map((q, qIndex) => (
                                            <div
                                                key={qIndex}
                                                className={s.questionBox}
                                            >
                                                <div
                                                    className={s.questionHeader}
                                                >
                                                    <span
                                                        className={
                                                            s.questionLabel
                                                        }
                                                    >
                                                        Câu hỏi {qIndex + 1}
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
                                                        className={s.deleteBtn}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                <div className={s.formGrid}>
                                                    <div
                                                        className={s.formField}
                                                    >
                                                        <label
                                                            className={s.label}
                                                        >
                                                            Điểm
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={
                                                                q.points || 1
                                                            }
                                                            onChange={(e) =>
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
                                                            className={s.input}
                                                            step="0.5"
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div
                                                        className={`${s.formField} ${s.fullWidth}`}
                                                    >
                                                        <label
                                                            className={s.label}
                                                        >
                                                            Nội dung câu hỏi{' '}
                                                            <span
                                                                style={{
                                                                    color: 'red',
                                                                }}
                                                            >
                                                                *
                                                            </span>
                                                        </label>
                                                        <textarea
                                                            value={
                                                                q.question_text
                                                            }
                                                            onChange={(e) =>
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
                                                            className={
                                                                s.textarea
                                                            }
                                                            style={{
                                                                minHeight:
                                                                    '60px',
                                                            }}
                                                        />
                                                    </div>

                                                    <div
                                                        className={`${s.formField} ${s.fullWidth}`}
                                                    >
                                                        <label
                                                            className={s.label}
                                                        >
                                                            Đáp án đúng
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                q.correct_answer ||
                                                                ''
                                                            }
                                                            onChange={(e) =>
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
                                                            className={s.input}
                                                            placeholder="Nhập đáp án đúng"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

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
                                    </div>
                                ))}

                                <ButtonGhost
                                    size="sm"
                                    onClick={() =>
                                        handleAddQuestionGroup(sIndex, pIndex)
                                    }
                                    style={{ marginTop: '12px' }}
                                >
                                    + Thêm Question Group
                                </ButtonGhost>
                            </div>
                        ))}

                        <ButtonGhost
                            size="sm"
                            onClick={() => handleAddPart(sIndex)}
                            style={{ marginTop: '16px' }}
                        >
                            + Thêm Part
                        </ButtonGhost>
                    </Card>
                ))}

                <ButtonGhost size="md" onClick={handleAddSection}>
                    + Thêm Section
                </ButtonGhost>

                {/* ============================================ */}
                {/* ACTIONS */}
                {/* ============================================ */}
                <div className={s.actions}>
                    <ButtonGhost onClick={() => navigate(-1)}>Hủy</ButtonGhost>
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
    )
}
