import { useState } from 'react'
import type {
    TestSectionCreatePayload,
    TestSectionPartCreatePayload,
    QuestionGroupCreatePayload,
    QuestionCreatePayload,
    PassageCreatePayload,
} from '@/types/test.types'
import { SkillArea, QuestionType, DifficultyLevel } from '@/types/test.types'

export const useCreateTest = () => {
    const [sections, setSections] = useState<TestSectionCreatePayload[]>([
        {
            name: 'Section 1',
            order_number: 1,
            skill_area: SkillArea.READING,
            parts: [
                {
                    name: 'Part 1',
                    order_number: 1,
                    passage: {
                        title: '',
                        content_type: 'reading_passage',
                        text_content: '',
                        topic: '',
                        difficulty_level: 'medium',
                    },
                    question_groups: [],
                },
            ],
        },
    ])

    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

    const getFileKey = (sIdx: number, pIdx: number, type: 'audio' | 'image') =>
        `section_${sIdx}_part_${pIdx}_${type}`

    // --- SECTION HANDLERS ---
    const handleAddSection = () => {
        setSections((prev) => [
            ...prev,
            {
                name: `Section ${prev.length + 1}`,
                order_number: prev.length + 1,
                skill_area: SkillArea.READING,
                parts: [
                    {
                        name: 'Part 1',
                        order_number: 1,
                        passage: {
                            title: '',
                            content_type: 'reading_passage',
                            text_content: '',
                        },
                        question_groups: [],
                    },
                ],
            },
        ])
    }

    const handleRemoveSection = (sIdx: number) => {
        setSections((prev) => {
            if (prev.length <= 1) return prev
            const next = prev.filter((_, i) => i !== sIdx)
            return next.map((s, i) => ({ ...s, order_number: i + 1 }))
        })
    }

    const updateSection = (
        sIdx: number,
        data: Partial<TestSectionCreatePayload>
    ) => {
        setSections((prev) => {
            const next = [...prev]
            next[sIdx] = { ...next[sIdx], ...data }
            return next
        })
    }

    // --- PART HANDLERS ---
    const updatePart = (
        sIdx: number,
        pIdx: number,
        data: Partial<TestSectionPartCreatePayload>
    ) => {
        setSections((prev) => {
            const next = [...prev]
            next[sIdx].parts[pIdx] = { ...next[sIdx].parts[pIdx], ...data }
            return next
        })
    }

    const handleAddPart = (sIdx: number) => {
        setSections((prev) => {
            const next = [...prev]
            const section = next[sIdx]
            const contentType =
                section.skill_area === SkillArea.LISTENING
                    ? 'listening_audio'
                    : section.skill_area === SkillArea.SPEAKING
                      ? 'speaking_cue_card'
                      : 'reading_passage'

            section.parts.push({
                name: `Part ${section.parts.length + 1}`,
                order_number: section.parts.length + 1,
                passage: {
                    title: `Part ${section.parts.length + 1} Passage`,
                    content_type: contentType,
                    text_content: '',
                },
                question_groups: [],
            })
            return next
        })
    }

    const handleRemovePart = (sIdx: number, pIdx: number) => {
        setSections((prev) => {
            const next = [...prev]
            if (next[sIdx].parts.length <= 1) return prev
            next[sIdx].parts.splice(pIdx, 1)
            next[sIdx].parts = next[sIdx].parts.map((p, i) => ({
                ...p,
                order_number: i + 1,
            }))
            return next
        })
    }

    const updatePartPassage = (
        sIdx: number,
        pIdx: number,
        data: Partial<PassageCreatePayload>
    ) => {
        setSections((prev) => {
            const next = [...prev]
            const part = next[sIdx].parts[pIdx]
            if (part.passage) {
                part.passage = { ...part.passage, ...data }
            }
            return next
        })
    }

    // --- QUESTION GROUP HANDLERS ---
    const handleRemoveQuestion = (
        sIdx: number,
        pIdx: number,
        gIdx: number,
        qIdx: number
    ) => {
        setSections((prev) => {
            const next = [...prev]
            next[sIdx].parts[pIdx].question_groups[gIdx].questions.splice(
                qIdx,
                1
            )
            return next
        })
    }

    const handleAddQuestionGroup = (sIdx: number, pIdx: number) => {
        setSections((prev) => {
            const next = [...prev]
            const part = next[sIdx].parts[pIdx]
            part.question_groups.push({
                name: `Questions ${part.question_groups.length * 5 + 1}-${(part.question_groups.length + 1) * 5}`,
                order_number: part.question_groups.length + 1,
                question_type: QuestionType.SHORT_ANSWER,
                questions: [],
            })
            return next
        })
    }

    const handleRemoveQuestionGroup = (
        sIdx: number,
        pIdx: number,
        gIdx: number
    ) => {
        setSections((prev) => {
            const next = [...prev]
            next[sIdx].parts[pIdx].question_groups.splice(gIdx, 1)
            next[sIdx].parts[pIdx].question_groups = next[sIdx].parts[
                pIdx
            ].question_groups.map((g, i) => ({ ...g, order_number: i + 1 }))
            return next
        })
    }

    const updateQuestionGroup = (
        sIdx: number,
        pIdx: number,
        gIdx: number,
        data: Partial<QuestionGroupCreatePayload>
    ) => {
        setSections((prev) => {
            const next = [...prev]
            const group = next[sIdx].parts[pIdx].question_groups[gIdx]
            next[sIdx].parts[pIdx].question_groups[gIdx] = { ...group, ...data }
            return next
        })
    }

    // --- QUESTION HANDLERS ---
    const handleAddQuestion = (sIdx: number, pIdx: number, gIdx: number) => {
        setSections((prev) => {
            const next = [...prev]
            const group = next[sIdx].parts[pIdx].question_groups[gIdx]
            group.questions.push({
                title: `Question ${group.questions.length + 1}`,
                question_text: '',
                question_type: group.question_type,
                skill_area: next[sIdx].skill_area,
                difficulty_level: DifficultyLevel.MEDIUM,
                points: 1,
            })
            return next
        })
    }

    const updateQuestion = (
        sIdx: number,
        pIdx: number,
        gIdx: number,
        qIdx: number,
        data: Partial<QuestionCreatePayload>
    ) => {
        setSections((prev) => {
            const next = [...prev]
            const questions =
                next[sIdx].parts[pIdx].question_groups[gIdx].questions
            questions[qIdx] = { ...questions[qIdx], ...data }
            return next
        })
    }

    // --- FILE HANDLERS ---
    const handleFileUpload = (
        sIdx: number,
        pIdx: number,
        type: 'audio' | 'image',
        file: File | null
    ) => {
        const key = getFileKey(sIdx, pIdx, type)

        setUploadedFiles((prev: Record<string, File>) => {
            const next = { ...prev }
            if (file) next[key] = file
            else delete next[key]
            return next
        })

        // ✅ FIX: Add "file:" prefix to match backend expectations
        updatePartPassage(sIdx, pIdx, {
            [type === 'audio' ? 'audio_url' : 'image_url']: file
                ? `file:${key}` // ✅ Backend expects "file:filename" format
                : '',
        })
    }

    const handleRemoveFile = (
        sIndex: number,
        pIndex: number,
        type: 'audio' | 'image'
    ) => {
        const key = getFileKey(sIndex, pIndex, type)
        setUploadedFiles((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
        })
        if (type === 'audio') {
            updatePartPassage(sIndex, pIndex, { audio_url: '' })
        } else {
            updatePartPassage(sIndex, pIndex, { image_url: '' })
        }
    }

    return {
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
    }
}
