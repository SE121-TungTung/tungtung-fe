import {
    QuestionType,
    SkillArea,
    DifficultyLevel,
    AttemptStatus,
} from '@/types/test.types'

/**
 * Calculate remaining time in seconds
 */
export function calculateRemainingTime(
    startedAt: string,
    timeLimitMinutes: number
): number {
    const start = new Date(startedAt).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - start) / 1000)
    const limit = timeLimitMinutes * 60
    const remaining = limit - elapsed
    return Math.max(0, remaining)
}

/**
 * Format time in MM:SS
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Check if answer is required
 */
export function isAnswerRequired(questionType: QuestionType): boolean {
    const speakingTypes = [
        QuestionType.SPEAKING_PART_1,
        QuestionType.SPEAKING_PART_2,
        QuestionType.SPEAKING_PART_3,
    ]
    return !speakingTypes.includes(questionType)
}

/**
 * Get question type label
 */
export function getQuestionTypeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
        // Reading & Listening
        [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
        [QuestionType.TRUE_FALSE_NOT_GIVEN]: 'True / False / Not Given',
        [QuestionType.YES_NO_NOT_GIVEN]: 'Yes / No / Not Given',
        [QuestionType.MATCHING_HEADINGS]: 'Matching Headings',
        [QuestionType.MATCHING_INFORMATION]: 'Matching Information',
        [QuestionType.MATCHING_FEATURES]: 'Matching Features',
        [QuestionType.SENTENCE_COMPLETION]: 'Sentence Completion',
        [QuestionType.SUMMARY_COMPLETION]: 'Summary Completion',
        [QuestionType.NOTE_COMPLETION]: 'Note/Table/Flow-chart Completion',
        [QuestionType.SHORT_ANSWER]: 'Short Answer',
        [QuestionType.DIAGRAM_LABELING]: 'Diagram Labeling',

        // Writing
        [QuestionType.WRITING_TASK_1]: 'Writing Task 1',
        [QuestionType.WRITING_TASK_2]: 'Writing Task 2',

        // Speaking
        [QuestionType.SPEAKING_PART_1]: 'Speaking Part 1',
        [QuestionType.SPEAKING_PART_2]: 'Speaking Part 2',
        [QuestionType.SPEAKING_PART_3]: 'Speaking Part 3',
    }
    return labels[type] || type
}

/**
 * Get skill area label
 */
export function getSkillAreaLabel(skill: SkillArea): string {
    const labels: Record<SkillArea, string> = {
        [SkillArea.LISTENING]: 'Listening',
        [SkillArea.READING]: 'Reading',
        [SkillArea.WRITING]: 'Writing',
        [SkillArea.SPEAKING]: 'Speaking',
        [SkillArea.GRAMMAR]: 'Grammar',
        [SkillArea.VOCABULARY]: 'Vocabulary',
        [SkillArea.PRONUNCIATION]: 'Pronunciation',
    }
    return labels[skill] || skill
}

/**
 * Get difficulty level label with color
 */
export function getDifficultyInfo(difficulty: DifficultyLevel): {
    label: string
    color: string
} {
    const info: Record<DifficultyLevel, { label: string; color: string }> = {
        [DifficultyLevel.VERY_EASY]: { label: 'Very Easy', color: 'green' },
        [DifficultyLevel.EASY]: { label: 'Easy', color: 'blue' },
        [DifficultyLevel.MEDIUM]: { label: 'Medium', color: 'yellow' },
        [DifficultyLevel.HARD]: { label: 'Hard', color: 'orange' },
        [DifficultyLevel.VERY_HARD]: { label: 'Very Hard', color: 'red' },
    }
    return info[difficulty] || { label: difficulty, color: 'gray' }
}

/**
 * Get attempt status label with color
 */
export function getAttemptStatusInfo(status: AttemptStatus): {
    label: string
    color: string
} {
    const info: Record<AttemptStatus, { label: string; color: string }> = {
        [AttemptStatus.IN_PROGRESS]: { label: 'In Progress', color: 'blue' },
        [AttemptStatus.SUBMITTED]: { label: 'Submitted', color: 'yellow' },
        [AttemptStatus.GRADED]: { label: 'Graded', color: 'green' },
        [AttemptStatus.CANCELLED]: { label: 'Cancelled', color: 'gray' },
        [AttemptStatus.EXPIRED]: { label: 'Expired', color: 'red' },
    }
    return info[status] || { label: status, color: 'gray' }
}

/**
 * Calculate percentage score
 */
export function calculatePercentage(earned: number, total: number): number {
    if (total === 0) return 0
    return Math.round((earned / total) * 100 * 100) / 100 // Round to 2 decimals
}

/**
 * Check if test is available now
 */
export function isTestAvailable(
    startTime: string | null,
    endTime: string | null
): boolean {
    const now = new Date().getTime()

    if (startTime) {
        const start = new Date(startTime).getTime()
        if (now < start) return false
    }

    if (endTime) {
        const end = new Date(endTime).getTime()
        if (now > end) return false
    }

    return true
}

/**
 * Get test availability message
 */
export function getTestAvailabilityMessage(
    startTime: string | null,
    endTime: string | null
): string | null {
    const now = new Date().getTime()

    if (startTime) {
        const start = new Date(startTime).getTime()
        if (now < start) {
            return `Bài thi sẽ mở vào ${new Date(startTime).toLocaleString('vi-VN')}`
        }
    }

    if (endTime) {
        const end = new Date(endTime).getTime()
        if (now > end) {
            return `Bài thi đã kết thúc vào ${new Date(endTime).toLocaleString('vi-VN')}`
        }
    }

    return null
}
