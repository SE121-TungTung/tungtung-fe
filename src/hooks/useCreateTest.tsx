import { useState, useCallback } from 'react'
import type {
    TestSectionCreatePayload,
    TestSectionPartCreatePayload,
    QuestionGroupCreatePayload,
    QuestionCreatePayload,
    PassageCreatePayload,
} from '@/types/test.types'
import { SkillArea, QuestionType, DifficultyLevel } from '@/types/test.types'

export const useCreateTest = () => {
    const generateId = useCallback(
        () => Math.random().toString(36).substring(2, 9),
        []
    )

    const [sections, setSections] = useState<TestSectionCreatePayload[]>([
        {
            id: generateId(),
            name: 'Section 1',
            order_number: 1,
            skill_area: SkillArea.READING,
            parts: [
                {
                    id: generateId(),
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

    const getFileKey = useCallback(
        (partId: string, type: 'audio' | 'image') => `part_${partId}_${type}`,
        []
    )

    // --- SECTION HANDLERS ---
    const handleAddSection = () => {
        setSections((prev) => [
            ...prev,
            {
                id: generateId(),
                name: `Section ${prev.length + 1}`,
                order_number: prev.length + 1,
                skill_area: SkillArea.READING,
                parts: [
                    {
                        id: generateId(),
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
            return prev
                .filter((_, i) => i !== sIdx)
                .map((s, i) => ({ ...s, order_number: i + 1 }))
        })
    }

    const updateSection = (
        sIdx: number,
        data: Partial<TestSectionCreatePayload>
    ) => {
        setSections((prev) =>
            prev.map((section, i) =>
                i === sIdx ? { ...section, ...data } : section
            )
        )
    }

    // --- PART HANDLERS ---
    const handleAddPart = (sIdx: number) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                const contentType =
                    section.skill_area === SkillArea.LISTENING
                        ? 'listening_audio'
                        : section.skill_area === SkillArea.SPEAKING
                          ? 'speaking_cue_card'
                          : 'reading_passage'

                return {
                    ...section,
                    parts: [
                        ...section.parts,
                        {
                            id: generateId(),
                            name: `Part ${section.parts.length + 1}`,
                            order_number: section.parts.length + 1,
                            passage: {
                                title: `Part ${section.parts.length + 1} Passage`,
                                content_type: contentType,
                                text_content: '',
                            },
                            question_groups: [],
                        },
                    ],
                }
            })
        )
    }

    const handleRemovePart = (sIdx: number, pIdx: number) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                const newParts = section.parts
                    .filter((_, pi) => pi !== pIdx)
                    .map((p, i) => ({ ...p, order_number: i + 1 }))
                return { ...section, parts: newParts }
            })
        )
    }

    const updatePart = (
        sIdx: number,
        pIdx: number,
        data: Partial<TestSectionPartCreatePayload>
    ) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) =>
                        pi === pIdx ? { ...part, ...data } : part
                    ),
                }
            })
        )
    }

    const updatePartPassage = (
        sIdx: number,
        pIdx: number,
        data: Partial<PassageCreatePayload>
    ) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) =>
                        pi === pIdx
                            ? {
                                  ...part,
                                  passage: { ...part.passage!, ...data },
                              }
                            : part
                    ),
                }
            })
        )
    }

    // --- QUESTION GROUP HANDLERS ---
    const handleAddQuestionGroup = (sIdx: number, pIdx: number) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) => {
                        if (pi !== pIdx) return part
                        return {
                            ...part,
                            question_groups: [
                                ...part.question_groups,
                                {
                                    id: generateId(),
                                    name: `Questions ${part.question_groups.length * 5 + 1}-${(part.question_groups.length + 1) * 5}`,
                                    order_number:
                                        part.question_groups.length + 1,
                                    question_type: QuestionType.SHORT_ANSWER,
                                    questions: [],
                                },
                            ],
                        }
                    }),
                }
            })
        )
    }

    const handleRemoveQuestionGroup = (
        sIdx: number,
        pIdx: number,
        gIdx: number
    ) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) => {
                        if (pi !== pIdx) return part
                        const newGroups = part.question_groups
                            .filter((_, gi) => gi !== gIdx)
                            .map((g, i) => ({ ...g, order_number: i + 1 }))
                        return { ...part, question_groups: newGroups }
                    }),
                }
            })
        )
    }

    const updateQuestionGroup = (
        sIdx: number,
        pIdx: number,
        gIdx: number,
        data: Partial<QuestionGroupCreatePayload>
    ) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) => {
                        if (pi !== pIdx) return part
                        return {
                            ...part,
                            question_groups: part.question_groups.map(
                                (group, gi) =>
                                    gi === gIdx ? { ...group, ...data } : group
                            ),
                        }
                    }),
                }
            })
        )
    }

    // --- QUESTION HANDLERS ---
    const handleAddQuestion = (sIdx: number, pIdx: number, gIdx: number) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) => {
                        if (pi !== pIdx) return part
                        return {
                            ...part,
                            question_groups: part.question_groups.map(
                                (group, gi) => {
                                    if (gi !== gIdx) return group
                                    return {
                                        ...group,
                                        questions: [
                                            ...group.questions,
                                            {
                                                id: generateId(),
                                                title: `Question ${group.questions.length + 1}`,
                                                question_text: '',
                                                question_type:
                                                    group.question_type,
                                                skill_area: section.skill_area,
                                                difficulty_level:
                                                    DifficultyLevel.MEDIUM,
                                                points: 1,
                                            },
                                        ],
                                    }
                                }
                            ),
                        }
                    }),
                }
            })
        )
    }

    const handleRemoveQuestion = (
        sIdx: number,
        pIdx: number,
        gIdx: number,
        qIdx: number
    ) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) => {
                        if (pi !== pIdx) return part
                        return {
                            ...part,
                            question_groups: part.question_groups.map(
                                (group, gi) => {
                                    if (gi !== gIdx) return group
                                    return {
                                        ...group,
                                        questions: group.questions.filter(
                                            (_, qi) => qi !== qIdx
                                        ),
                                    }
                                }
                            ),
                        }
                    }),
                }
            })
        )
    }

    const updateQuestion = (
        sIdx: number,
        pIdx: number,
        gIdx: number,
        qIdx: number,
        data: Partial<QuestionCreatePayload>
    ) => {
        setSections((prev) =>
            prev.map((section, si) => {
                if (si !== sIdx) return section
                return {
                    ...section,
                    parts: section.parts.map((part, pi) => {
                        if (pi !== pIdx) return part
                        return {
                            ...part,
                            question_groups: part.question_groups.map(
                                (group, gi) => {
                                    if (gi !== gIdx) return group
                                    return {
                                        ...group,
                                        questions: group.questions.map(
                                            (q, qi) =>
                                                qi === qIdx
                                                    ? { ...q, ...data }
                                                    : q
                                        ),
                                    }
                                }
                            ),
                        }
                    }),
                }
            })
        )
    }

    // --- FILE HANDLERS ---
    const handleFileUpload = (
        sIdx: number,
        pIdx: number,
        type: 'audio' | 'image',
        file: File | null
    ) => {
        const part = sections[sIdx].parts[pIdx]
        if (!part.id) return
        const key = getFileKey(part.id, type)

        setUploadedFiles((prev) => {
            const next = { ...prev }
            if (file) next[key] = file
            else delete next[key]
            return next
        })

        updatePartPassage(sIdx, pIdx, {
            [type === 'audio' ? 'audio_url' : 'image_url']: file
                ? `file:${key}`
                : '',
        })
    }

    const handleRemoveFile = (
        sIdx: number,
        pIdx: number,
        type: 'audio' | 'image'
    ) => {
        const part = sections[sIdx].parts[pIdx]
        if (!part.id) return

        const key = getFileKey(part.id, type)

        setUploadedFiles((prev) => {
            const next = { ...prev }
            delete next[key]
            return next
        })

        updatePartPassage(sIdx, pIdx, {
            [type === 'audio' ? 'audio_url' : 'image_url']: '',
        })
    }

    const cleanupOrphanFiles = () => {
        const activeKeys = new Set<string>()
        sections.forEach((section) => {
            section.parts.forEach((part) => {
                if (part.passage?.audio_url?.startsWith('file:')) {
                    activeKeys.add(part.passage.audio_url.replace('file:', ''))
                }
                if (part.passage?.image_url?.startsWith('file:')) {
                    activeKeys.add(part.passage.image_url.replace('file:', ''))
                }
            })
        })

        setUploadedFiles((prev) => {
            const cleaned: Record<string, File> = {}
            Object.keys(prev).forEach((key) => {
                if (activeKeys.has(key)) cleaned[key] = prev[key]
            })
            return cleaned
        })
        return activeKeys
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
        cleanupOrphanFiles,
    }
}
