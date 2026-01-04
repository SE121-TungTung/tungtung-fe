import { useState, useCallback, useEffect } from 'react'
import { testApi } from '@/lib/test'
import type {
    TestSectionCreatePayload,
    TestSectionPartCreatePayload,
    QuestionGroupCreatePayload,
    QuestionCreatePayload,
    PassageCreatePayload,
    TestTeacher,
} from '@/types/test.types'
import { SkillArea, QuestionType, DifficultyLevel } from '@/types/test.types'

export const useEditTest = (testId: string) => {
    const generateId = useCallback(
        () => Math.random().toString(36).substring(2, 9),
        []
    )

    const [sections, setSections] = useState<TestSectionCreatePayload[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [originalTest, setOriginalTest] = useState<TestTeacher | null>(null)

    // ============================================
    // LOAD TEST DATA
    // ============================================
    const loadTest = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await testApi.getTestTeacher(testId)
            setOriginalTest(data)

            // Convert TestTeacher to TestSectionCreatePayload format
            const convertedSections: TestSectionCreatePayload[] =
                data.sections.map((section) => ({
                    id: section.id,
                    structure_section_id: section.structureSectionId,
                    name: section.name,
                    order_number: section.orderNumber,
                    skill_area: section.skillArea as SkillArea,
                    time_limit_minutes: section.timeLimitMinutes,
                    instructions: section.instructions,
                    parts: section.parts.map((part) => ({
                        id: part.id,
                        structure_part_id: part.structurePartId,
                        name: part.name,
                        order_number: part.orderNumber,
                        passage: part.passage
                            ? {
                                  title: part.passage.title,
                                  content_type:
                                      section.skillArea === SkillArea.LISTENING
                                          ? 'listening_audio'
                                          : section.skillArea ===
                                              SkillArea.SPEAKING
                                            ? 'speaking_cue_card'
                                            : 'reading_passage',
                                  text_content: part.passage.textContent,
                                  audio_url: part.passage.audioUrl,
                                  image_url: part.passage.imageUrl,
                                  topic: undefined,
                                  difficulty_level: undefined,
                                  word_count: undefined,
                                  duration_seconds:
                                      part.passage.durationSeconds,
                              }
                            : {
                                  title: '',
                                  content_type: 'reading_passage',
                                  text_content: '',
                              },
                        min_questions: part.minQuestions,
                        max_questions: part.maxQuestions,
                        audio_url: part.audioUrl,
                        image_url: part.imageUrl,
                        instructions: part.instructions,
                        question_groups: part.questionGroups.map((group) => ({
                            id: group.id,
                            name: group.name,
                            order_number: group.orderNumber,
                            question_type: group.questionType,
                            instructions: group.instructions,
                            image_url: group.imageUrl,
                            questions: group.questions.map((q) => ({
                                id: q.id,
                                title: q.title || '',
                                question_text: q.questionText || '',
                                question_type: q.questionType,
                                difficulty_level: q.difficultyLevel,
                                skill_area: q.skillArea as SkillArea,
                                options: q.options?.map((opt) => ({
                                    key: opt.key,
                                    text: opt.text,
                                    is_correct: opt.isCorrect,
                                })),
                                correct_answer: q.correctAnswer,
                                rubric: q.rubric,
                                audio_url: q.audioUrl,
                                image_url: q.imageUrl,
                                points: q.points,
                                tags: q.tags,
                                extra_metadata: q.metadata,
                            })),
                        })),
                    })),
                }))

            setSections(convertedSections)
        } catch (err: any) {
            console.error('Failed to load test:', err)
            setError(err.message || 'Không thể tải bài thi')
        } finally {
            setLoading(false)
        }
    }, [testId])

    useEffect(() => {
        if (testId) {
            loadTest()
        }
    }, [testId, loadTest])

    const getFileKey = useCallback(
        (partId: string, type: 'audio' | 'image') => `part_${partId}_${type}`,
        []
    )

    // ============================================
    // SECTION HANDLERS (same as useCreateTest)
    // ============================================
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

    // ============================================
    // PART HANDLERS
    // ============================================
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

    // ============================================
    // QUESTION GROUP HANDLERS
    // ============================================
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

    // ============================================
    // QUESTION HANDLERS
    // ============================================
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

    // ============================================
    // FILE HANDLERS
    // ============================================
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
        loading,
        error,
        originalTest,
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
        reload: loadTest,
    }
}
