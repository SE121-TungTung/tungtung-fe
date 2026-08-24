import type {
    QuestionType,
    TestType,
    TestSectionCreatePayload,
    TestSectionPartCreatePayload,
    QuestionGroupCreatePayload,
    QuestionCreatePayload,
    PassageCreatePayload,
} from '@/types/test.types'
import { QuestionType as QT } from '@/types/test.types'

export interface TestBasicInfo {
    title: string
    description: string
    instructions: string
    testType: TestType | null
    timeLimitMinutes: number
    passingScore: number
    maxAttempts: number
    randomizeQuestions: boolean
    showResultsImmediately: boolean
    aiGradingEnabled: boolean
    startTime: string
    endTime: string
}

export interface TestBuilderActions {
    getFileKey: (partId: string, type: 'audio' | 'image') => string
    handleAddSection: () => void
    handleRemoveSection: (sIndex: number) => void
    updateSection: (
        sIndex: number,
        data: Partial<TestSectionCreatePayload>
    ) => void
    handleAddPart: (sIndex: number) => void
    handleRemovePart: (sIndex: number, pIndex: number) => void
    updatePart: (
        sIndex: number,
        pIndex: number,
        data: Partial<TestSectionPartCreatePayload>
    ) => void
    updatePartPassage: (
        sIndex: number,
        pIndex: number,
        data: Partial<PassageCreatePayload>
    ) => void
    handleFileUpload: (
        sIndex: number,
        pIndex: number,
        type: 'audio' | 'image',
        file: File | null
    ) => void
    handleRemoveFile: (
        sIndex: number,
        pIndex: number,
        type: 'audio' | 'image'
    ) => void
    handleAddQuestionGroup: (sIndex: number, pIndex: number) => void
    handleRemoveQuestionGroup: (
        sIndex: number,
        pIndex: number,
        gIndex: number
    ) => void
    updateQuestionGroup: (
        sIndex: number,
        pIndex: number,
        gIndex: number,
        data: Partial<QuestionGroupCreatePayload>
    ) => void
    handleAddQuestion: (sIndex: number, pIndex: number, gIndex: number) => void
    handleRemoveQuestion: (
        sIndex: number,
        pIndex: number,
        gIndex: number,
        qIndex: number
    ) => void
    updateQuestion: (
        sIndex: number,
        pIndex: number,
        gIndex: number,
        qIndex: number,
        data: Partial<QuestionCreatePayload>
    ) => void
}

export const QUESTION_TYPE_GROUPS = {
    'Reading & Listening': [
        { value: QT.MULTIPLE_CHOICE, label: 'Multiple Choice' },
        { value: QT.TRUE_FALSE_NOT_GIVEN, label: 'True / False / Not Given' },
        { value: QT.YES_NO_NOT_GIVEN, label: 'Yes / No / Not Given' },
        { value: QT.MATCHING_HEADINGS, label: 'Matching Headings' },
        { value: QT.MATCHING_INFORMATION, label: 'Matching Information' },
        { value: QT.MATCHING_FEATURES, label: 'Matching Features' },
        { value: QT.SENTENCE_COMPLETION, label: 'Sentence Completion' },
        { value: QT.SUMMARY_COMPLETION, label: 'Summary Completion' },
        {
            value: QT.NOTE_COMPLETION,
            label: 'Note/Table/Flow-chart Completion',
        },
        { value: QT.SHORT_ANSWER, label: 'Short Answer' },
        { value: QT.DIAGRAM_LABELING, label: 'Diagram Labeling' },
    ],
    Writing: [
        {
            value: QT.WRITING_TASK_1,
            label: 'Writing Task 1 (150 words)',
        },
        {
            value: QT.WRITING_TASK_2,
            label: 'Writing Task 2 (250 words)',
        },
    ],
    Speaking: [
        {
            value: QT.SPEAKING_PART_1,
            label: 'Speaking Part 1 (Interview)',
        },
        {
            value: QT.SPEAKING_PART_2,
            label: 'Speaking Part 2 (Cue Card)',
        },
        {
            value: QT.SPEAKING_PART_3,
            label: 'Speaking Part 3 (Discussion)',
        },
    ],
}

export function getQuestionTypeLabel(type: QuestionType): string {
    for (const group of Object.values(QUESTION_TYPE_GROUPS)) {
        const found = group.find((opt) => opt.value === type)
        if (found) return found.label
    }
    return type
}
