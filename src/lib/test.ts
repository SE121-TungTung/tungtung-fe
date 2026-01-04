import { api } from '@/lib/api'
import {
    // Backend types
    type BackendTestResponse,
    type BackendTestTeacherResponse,
    type BackendTestListResponse,
    type BackendStudentTestListItem,
    type BackendQuestionResponse,
    type BackendQuestionTeacherResponse,
    type BackendQuestionGroupResponse,
    type BackendQuestionGroupTeacherResponse,
    type BackendPartResponse,
    type BackendPartTeacherResponse,
    type BackendSectionResponse,
    type BackendSectionTeacherResponse,
    type BackendStartAttemptResponse,
    type BackendSubmitAttemptResponse,
    type BackendQuestionResult,
    type BackendSpeakingSubmissionResponse,
    type BackendAttemptDetailResponse,
    type BackendQuestionResultDetail,
    type BackendTestSummary,
    type BackendQuestionOption,

    // Frontend types
    type Test,
    type TestTeacher,
    type TestListItem,
    type StudentTestListItem,
    type Question,
    type QuestionTeacher,
    type QuestionGroup,
    type QuestionGroupTeacher,
    type TestSectionPart,
    type TestSectionPartTeacher,
    type TestSection,
    type TestSectionTeacher,
    type TestAttempt,
    type SubmitResult,
    type QuestionResult,
    type SpeakingSubmissionResult,
    type AttemptDetail,
    type QuestionResultDetail,
    type TestSummary,
    type QuestionOption,

    // Request types
    type SubmitAttemptRequest,
    type TestCreatePayload,
    type ListTestsParams,
    type ListStudentTestsParams,

    // Enums
    QuestionType,
    SkillArea,
    DifficultyLevel,
    TestStatus,
    TestType,
    AttemptStatus,
    ContentStatus,
    type BackendPassageResponse,
    type Passage,
} from '@/types/test.types'

const BASE_URL = '/api/v1/tests'

// ============================================
// MAPPING UTILITIES
// ============================================

/**
 * Map backend question option to frontend
 */
function mapQuestionOption(option: BackendQuestionOption): QuestionOption {
    return {
        key: option.key,
        text: option.text,
        isCorrect: option.is_correct,
    }
}

/**
 * Map frontend question option to backend
 */
export function mapQuestionOptionToBackend(
    option: QuestionOption
): BackendQuestionOption {
    return {
        key: option.key,
        text: option.text,
        is_correct: option.isCorrect,
    }
}

/**
 * Parse enum value safely
 */
function parseEnum<T extends Record<string, string>>(
    enumObj: T,
    value: string | null | undefined
): T[keyof T] | null {
    if (!value) return null
    const enumValue = Object.values(enumObj).find((v) => v === value)
    return (enumValue as T[keyof T]) || null
}

/**
 * Map backend question response to frontend Question
 */
function mapQuestion(dto: BackendQuestionResponse): Question {
    return {
        id: dto.id,
        title: dto.title,
        questionText: dto.question_text,
        questionType:
            parseEnum(QuestionType, dto.question_type) ||
            QuestionType.MULTIPLE_CHOICE,
        difficultyLevel: parseEnum(DifficultyLevel, dto.difficulty_level),
        skillArea: parseEnum(SkillArea, dto.skill_area),
        options: dto.options?.map(mapQuestionOption) || null,
        imageUrl: dto.image_url,
        audioUrl: dto.audio_url,
        points: dto.points,
        tags: dto.tags,
        metadata: dto.visible_metadata,

        orderNumber: dto.order_number,
        status: parseEnum(ContentStatus, dto.status),
    }
}

/**
 * Map backend question (teacher view) to frontend QuestionTeacher
 */
function mapQuestionTeacher(
    dto: BackendQuestionTeacherResponse
): QuestionTeacher {
    return {
        ...mapQuestion(dto),
        correctAnswer: dto.correct_answer,
        rubric: dto.rubric,
        explanation: dto.explanation,
        usageCount: dto.usage_count,
        successRate: dto.success_rate,
    }
}

/**
 * Map backend question group to frontend
 */
function mapQuestionGroup(dto: BackendQuestionGroupResponse): QuestionGroup {
    return {
        id: dto.id,
        name: dto.name,
        orderNumber: dto.order_number,
        questionType:
            parseEnum(QuestionType, dto.question_type) ||
            QuestionType.MULTIPLE_CHOICE,
        instructions: dto.instructions,
        imageUrl: dto.image_url,
        questions: dto.questions.map(mapQuestion),
    }
}

/**
 * Map backend question group (teacher view) to frontend
 */
function mapQuestionGroupTeacher(
    dto: BackendQuestionGroupTeacherResponse
): QuestionGroupTeacher {
    return {
        id: dto.id,
        name: dto.name,
        orderNumber: dto.order_number,
        questionType:
            parseEnum(QuestionType, dto.question_type) ||
            QuestionType.MULTIPLE_CHOICE,
        instructions: dto.instructions,
        imageUrl: dto.image_url,
        questions: dto.questions.map(mapQuestionTeacher),
    }
}

/**
 * Map backend part response to frontend TestSectionPart
 */
function mapPart(dto: BackendPartResponse): TestSectionPart {
    return {
        id: dto.id,
        name: dto.name,
        orderNumber: dto.order_number,
        passage: dto.passage ? mapPassage(dto.passage) : null,
        minQuestions: dto.min_questions,
        maxQuestions: dto.max_questions,
        imageUrl: dto.image_url,
        audioUrl: dto.audio_url,
        instructions: dto.instructions,
        questionGroups: dto.question_groups.map(mapQuestionGroup),
    }
}

function mapPassage(dto: BackendPassageResponse): Passage {
    return {
        id: dto.id,
        title: dto.title,
        textContent: dto.text_content,
        audioUrl: dto.audio_url,
        imageUrl: dto.image_url,
        durationSeconds: dto.duration_seconds,
    }
}

/**
 * Map backend part (teacher view) to frontend TestSectionPartTeacher
 */
function mapPartTeacher(
    dto: BackendPartTeacherResponse
): TestSectionPartTeacher {
    return {
        id: dto.id,
        name: dto.name,
        orderNumber: dto.order_number,
        passage: dto.passage ? mapPassage(dto.passage) : null,
        minQuestions: dto.min_questions,
        maxQuestions: dto.max_questions,
        imageUrl: dto.image_url,
        audioUrl: dto.audio_url,
        instructions: dto.instructions,
        structurePartId: dto.structure_part_id,
        questionGroups: dto.question_groups.map(mapQuestionGroupTeacher),
    }
}

/**
 * Map backend section response to frontend TestSection
 */
function mapSection(dto: BackendSectionResponse): TestSection {
    return {
        id: dto.id,
        name: dto.name,
        orderNumber: dto.order_number,
        skillArea: parseEnum(SkillArea, dto.skill_area),
        timeLimitMinutes: dto.time_limit_minutes,
        instructions: dto.instructions,
        parts: dto.parts.map(mapPart),
    }
}

/**
 * Map backend section (teacher view) to frontend TestSectionTeacher
 */
function mapSectionTeacher(
    dto: BackendSectionTeacherResponse
): TestSectionTeacher {
    return {
        id: dto.id,
        name: dto.name,
        orderNumber: dto.order_number,
        skillArea: parseEnum(SkillArea, dto.skill_area),
        timeLimitMinutes: dto.time_limit_minutes,
        instructions: dto.instructions,
        structureSectionId: dto.structure_section_id,
        parts: dto.parts.map(mapPartTeacher),
    }
}

/**
 * Map backend test response to frontend Test
 */
function mapTest(dto: BackendTestResponse): Test {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        testType: parseEnum(TestType, dto.test_type),
        timeLimitMinutes: dto.time_limit_minutes,
        // ✅ New config fields
        totalPoints: dto.total_points,
        passingScore: dto.passing_score,
        maxAttempts: dto.max_attempts,
        randomizeQuestions: dto.randomize_questions,
        showResultsImmediately: dto.show_results_immediately,
        startTime: dto.start_time,
        endTime: dto.end_time,
        status: parseEnum(TestStatus, dto.status) || TestStatus.DRAFT,
        aiGradingEnabled: dto.ai_grading_enabled,
        sections: dto.sections.map(mapSection),
    }
}

/**
 * Map backend test (teacher view) to frontend TestTeacher
 */
function mapTestTeacher(dto: BackendTestTeacherResponse): TestTeacher {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        testType: parseEnum(TestType, dto.test_type),
        timeLimitMinutes: dto.time_limit_minutes,
        totalPoints: dto.total_points,
        passingScore: dto.passing_score,
        maxAttempts: dto.max_attempts,
        randomizeQuestions: dto.randomize_questions,
        showResultsImmediately: dto.show_results_immediately,
        startTime: dto.start_time,
        endTime: dto.end_time,
        status: parseEnum(TestStatus, dto.status) || TestStatus.DRAFT,
        aiGradingEnabled: dto.ai_grading_enabled,
        // ✅ Teacher-specific fields
        classId: dto.class_id,
        courseId: dto.course_id,
        createdBy: dto.created_by,
        updatedBy: dto.updated_by,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
        examTypeId: dto.exam_type_id,
        structureId: dto.structure_id,
        reviewedBy: dto.reviewed_by,
        reviewedAt: dto.reviewed_at,
        sections: dto.sections.map(mapSectionTeacher),
    }
}

/**
 * Map backend test list item to frontend TestListItem
 */
function mapTestListItem(dto: BackendTestListResponse): TestListItem {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        skill: parseEnum(SkillArea, dto.skill) || SkillArea.READING,
        difficulty:
            parseEnum(DifficultyLevel, dto.difficulty) ||
            DifficultyLevel.MEDIUM,
        testType: parseEnum(TestType, dto.test_type),
        durationMinutes: dto.duration_minutes,
        totalQuestions: dto.total_questions,
        createdAt: dto.created_at,
        status: parseEnum(TestStatus, dto.status),
    }
}

/**
 * Map backend student test list item to frontend
 */
function mapStudentTestListItem(
    dto: BackendStudentTestListItem
): StudentTestListItem {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        testType: parseEnum(TestType, dto.test_type),
        timeLimitMinutes: dto.time_limit_minutes,
        totalQuestions: dto.total_questions,
        totalPoints: dto.total_points,
        passingScore: dto.passing_score,
        startTime: dto.start_time,
        endTime: dto.end_time,
        attemptsCount: dto.attempts_count,
        maxAttempts: dto.max_attempts,
        canAttempt: dto.can_attempt,
        latestAttemptStatus: parseEnum(
            AttemptStatus,
            dto.latest_attempt_status
        ),
        latestAttemptScore: dto.latest_attempt_score,
        status: parseEnum(TestStatus, dto.status) || TestStatus.DRAFT,
        skill: SkillArea.LISTENING,
        difficulty: DifficultyLevel.VERY_EASY,
        durationMinutes: 0,
        createdAt: '',
    }
}

/**
 * Map backend start attempt response to frontend TestAttempt
 */
function mapTestAttempt(dto: BackendStartAttemptResponse): TestAttempt {
    return {
        attemptId: dto.attempt_id,
        testId: dto.test_id,
        attemptNumber: dto.attempt_number,
        startedAt: dto.started_at,
    }
}

/**
 * Map backend question result to frontend QuestionResult
 */
function mapQuestionResult(dto: BackendQuestionResult): QuestionResult {
    return {
        questionId: dto.question_id,
        answered: dto.answered,
        isCorrect: dto.is_correct,
        autoGraded: dto.auto_graded,

        pointsEarned: dto.points_earned,
        maxPoints: dto.max_points,
        bandScore: dto.band_score,
        rubricScores: dto.rubric_scores,

        aiPointsEarned: dto.ai_points_earned,
        aiBandScore: dto.ai_band_score,
        aiRubricScores: dto.ai_rubric_scores,
        aiFeedback: dto.ai_feedback,

        teacherPointsEarned: dto.teacher_points_earned,
        teacherBandScore: dto.teacher_band_score,
        teacherRubricScores: dto.teacher_rubric_scores,
        teacherFeedback: dto.teacher_feedback,
    }
}

/**
 * Map backend submit attempt response to frontend SubmitResult
 */
function mapSubmitResult(dto: BackendSubmitAttemptResponse): SubmitResult {
    return {
        attemptId: dto.attempt_id,
        status: parseEnum(AttemptStatus, dto.status) || AttemptStatus.SUBMITTED,
        submittedAt: dto.submitted_at,
        timeTakenSeconds: dto.time_taken_seconds,
        totalScore: dto.total_score,
        percentageScore: dto.percentage_score,
        bandScore: dto.band_score,
        passed: dto.passed,
        gradedAt: dto.graded_at,
        gradedBy: dto.graded_by,
        aiFeedback: dto.ai_feedback,
        teacherFeedback: dto.teacher_feedback,
        questionResults: dto.question_results.map(mapQuestionResult),
    }
}

/**
 * Map backend speaking submission response to frontend
 */
function mapSpeakingSubmission(
    dto: BackendSpeakingSubmissionResponse
): SpeakingSubmissionResult {
    return {
        questionId: dto.question_id,
        pointsEarned: dto.points_earned,
        maxPoints: dto.max_points,
        audioUrl: dto.audio_url,
        aiScore: dto.ai_score,
        transcript: dto.transcript,
        feedback: dto.feedback,
    }
}

/**
 * Map backend question result detail to frontend
 */
function mapQuestionResultDetail(
    dto: BackendQuestionResultDetail
): QuestionResultDetail {
    return {
        questionId: dto.question_id,
        questionText: dto.question_text,
        questionType:
            parseEnum(QuestionType, dto.question_type) ||
            QuestionType.MULTIPLE_CHOICE,

        userAnswer: dto.user_answer,
        responseData: dto.response_data,
        audioResponseUrl: dto.audio_response_url,

        isCorrect: dto.is_correct,
        autoGraded: dto.auto_graded,

        pointsEarned: dto.points_earned,
        maxPoints: dto.max_points,
        bandScore: dto.band_score,
        rubricScores: dto.rubric_scores,

        aiPointsEarned: dto.ai_points_earned,
        aiBandScore: dto.ai_band_score,
        aiRubricScores: dto.ai_rubric_scores,
        aiFeedback: dto.ai_feedback,

        teacherPointsEarned: dto.teacher_points_earned,
        teacherBandScore: dto.teacher_band_score,
        teacherRubricScores: dto.teacher_rubric_scores,
        teacherFeedback: dto.teacher_feedback,

        timeSpentSeconds: dto.time_spent_seconds,
        flaggedForReview: dto.flagged_for_review,
    }
}

/**
 * Map backend attempt detail to frontend AttemptDetail
 */
function mapAttemptDetail(dto: BackendAttemptDetailResponse): AttemptDetail {
    return {
        id: dto.id,
        testId: dto.test_id,
        testTitle: dto.test_title,
        studentId: dto.student_id,

        attemptNumber: dto.attempt_number,
        startedAt: dto.started_at,
        submittedAt: dto.submitted_at,
        timeTakenSeconds: dto.time_taken_seconds,

        totalScore: dto.total_score,
        percentageScore: dto.percentage_score,
        bandScore: dto.band_score,
        passed: dto.passed,
        status:
            parseEnum(AttemptStatus, dto.status) || AttemptStatus.IN_PROGRESS,

        gradedBy: dto.graded_by,
        gradedAt: dto.graded_at,

        aiFeedback: dto.ai_feedback,
        teacherFeedback: dto.teacher_feedback,

        details: dto.details.map(mapQuestionResultDetail),
    }
}

/**
 * Map backend test summary to frontend
 */
function mapTestSummary(dto: BackendTestSummary): TestSummary {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        testType: parseEnum(TestType, dto.test_type),
        status: parseEnum(TestStatus, dto.status) || TestStatus.DRAFT,
        totalQuestions: dto.total_questions,
        totalPoints: dto.total_points,
        timeLimitMinutes: dto.time_limit_minutes,
        totalAttempts: dto.total_attempts,
        completedAttempts: dto.completed_attempts,
        averageScore: dto.average_score,
        passRate: dto.pass_rate,
        createdAt: dto.created_at,
        startTime: dto.start_time,
        endTime: dto.end_time,
    }
}

// ============================================
// API METHODS
// ============================================

export const testApi = {
    // ========================================
    // TEST MANAGEMENT (Teacher/Admin)
    // ========================================

    /**
     * List all tests with filters (Teacher/Admin view)
     * Endpoint: GET /tests/
     *
     * ⚠️ Requires: TEACHER, OFFICE_ADMIN, CENTER_ADMIN, or SYSTEM_ADMIN role
     *
     * @param params - Query parameters for filtering
     * @returns Paginated list of tests
     */
    listTests: async (
        params?: ListTestsParams
    ): Promise<{
        total: number
        skip: number
        limit: number
        tests: TestListItem[]
    }> => {
        try {
            const query = new URLSearchParams()
            if (params?.skip !== undefined)
                query.append('skip', String(params.skip))
            if (params?.limit !== undefined)
                query.append('limit', String(params.limit))
            if (params?.class_id) query.append('class_id', params.class_id)
            if (params?.status) query.append('status', params.status)
            if (params?.skill) query.append('skill', params.skill)

            const queryString = query.toString()
            const url = queryString
                ? `${BASE_URL}/?${queryString}`
                : `${BASE_URL}/`

            const response = await api<{
                total: number
                skip: number
                limit: number
                tests: BackendTestListResponse[]
            }>(url, { method: 'GET' })

            return {
                total: response.total,
                skip: response.skip,
                limit: response.limit,
                tests: response.tests.map(mapTestListItem),
            }
        } catch (error) {
            console.error('Error fetching tests:', error)
            throw error
        }
    },

    /**
     * List published tests for students
     * Endpoint: GET /tests/student
     *
     * Only returns PUBLISHED tests that are currently available
     *
     * @param params - Query parameters
     * @returns Paginated list of available tests with attempt info
     */
    listStudentTests: async (
        params?: ListStudentTestsParams
    ): Promise<{
        total: number
        skip: number
        limit: number
        tests: StudentTestListItem[]
    }> => {
        try {
            const query = new URLSearchParams()
            if (params?.skip !== undefined)
                query.append('skip', String(params.skip))
            if (params?.limit !== undefined)
                query.append('limit', String(params.limit))
            if (params?.class_id) query.append('class_id', params.class_id)
            if (params?.skill) query.append('skill', params.skill)

            const queryString = query.toString()
            const url = queryString
                ? `${BASE_URL}/student?${queryString}`
                : `${BASE_URL}/student`

            const response = await api<any>(url, { method: 'GET' })

            if (Array.isArray(response)) {
                return {
                    total: response.length,
                    skip: params?.skip || 0,
                    limit: params?.limit || response.length,
                    tests: response.map(mapStudentTestListItem),
                }
            }

            return {
                total: response.total || 0,
                skip: response.skip || 0,
                limit: response.limit || 0,
                tests: (response.tests || response.items || []).map(
                    mapStudentTestListItem
                ),
            }
        } catch (error) {
            console.error('Error fetching student tests:', error)
            throw error
        }
    },

    /**
     * Get test detail (Student view - no correct answers)
     * Endpoint: GET /tests/{test_id}
     *
     * @param testId - ID of the test
     * @returns Test detail for student
     */
    getTest: async (testId: string): Promise<Test> => {
        const response = await api<BackendTestResponse>(
            `${BASE_URL}/${testId}`,
            { method: 'GET' }
        )
        return mapTest(response)
    },

    /**
     * Get test detail (Teacher/Admin view - with correct answers)
     * Endpoint: GET /tests/admin/{test_id}
     *
     * ⚠️ Requires: TEACHER, OFFICE_ADMIN, CENTER_ADMIN, or SYSTEM_ADMIN role
     *
     * @param testId - ID of the test
     * @returns Test detail for teacher with answers
     */
    getTestTeacher: async (testId: string): Promise<TestTeacher> => {
        const response = await api<BackendTestTeacherResponse>(
            `${BASE_URL}/admin/${testId}`,
            { method: 'GET' }
        )
        return mapTestTeacher(response)
    },

    /**
     * Get test summary with statistics (Teacher/Admin)
     * Endpoint: GET /tests/{test_id}/summary
     *
     * @param testId - ID of the test
     * @returns Test summary with attempt statistics
     */
    getTestSummary: async (testId: string): Promise<TestSummary> => {
        const response = await api<BackendTestSummary>(
            `${BASE_URL}/${testId}/summary`,
            { method: 'GET' }
        )
        return mapTestSummary(response)
    },

    createTest: async (
        payload: TestCreatePayload,
        files?: { [key: string]: File }
    ): Promise<{ id: string; title: string }> => {
        const formData = new FormData()

        const cleanedPayload = cleanCreatePayload(payload)
        formData.append('test_data_str', JSON.stringify(cleanedPayload))

        if (files) {
            Object.entries(files).forEach(([key, file]) => {
                const blob = file.slice(0, file.size, file.type)
                const renamedFile = new File([blob], key, { type: file.type })
                formData.append('files', renamedFile)
            })
        }

        return api<{ id: string; title: string }>(`${BASE_URL}/create`, {
            method: 'POST',
            body: formData,
        })
    },

    // ========================================
    // TEST ATTEMPT (Student)
    // ========================================

    /**
     * Start a new test attempt
     * Endpoint: POST /tests/{test_id}/start
     *
     * If user already has an IN_PROGRESS attempt, returns that attempt instead
     *
     * @param testId - ID of the test
     * @returns Test attempt info
     */
    startAttempt: async (testId: string): Promise<TestAttempt> => {
        const response = await api<BackendStartAttemptResponse>(
            `${BASE_URL}/${testId}/start`,
            { method: 'POST' }
        )
        return mapTestAttempt(response)
    },

    /**
     * Submit test attempt with all answers (except Speaking)
     * Endpoint: POST /tests/{attempt_id}/submit
     *
     * ⚠️ NOTE: Current route is /tests/{attempt_id}/submit
     * Backend will change to /tests/attempts/{attempt_id}/submit later
     *
     * Speaking questions should be submitted separately via submitSpeaking()
     *
     * @param attemptId - ID of the attempt
     * @param payload - All question responses
     * @returns Submit result with scores
     */
    submitAttempt: async (
        attemptId: string,
        payload: SubmitAttemptRequest
    ): Promise<SubmitResult> => {
        const response = await api<BackendSubmitAttemptResponse>(
            `${BASE_URL}/attempts/${attemptId}/submit`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        )
        return mapSubmitResult(response)
    },

    /**
     * Submit speaking answer with audio file
     * Endpoint: POST /tests/attempts/{attempt_id}/speaking
     *
     * @param attemptId - ID of the attempt
     * @param questionId - ID of the speaking question
     * @param audioFile - Audio file (Blob or File)
     * @returns Speaking submission result with AI grading
     */
    submitSpeaking: async (
        attemptId: string,
        questionId: string,
        audioFile: Blob | File
    ): Promise<SpeakingSubmissionResult> => {
        const formData = new FormData()
        formData.append('question_id', questionId)
        formData.append('audio', audioFile, 'recording.mp3')

        const response = await api<BackendSpeakingSubmissionResponse>(
            `${BASE_URL}/attempts/${attemptId}/speaking`,
            {
                method: 'POST',
                body: formData,
            }
        )
        return mapSpeakingSubmission(response)
    },

    /**
     * Get detailed attempt result
     * Endpoint: GET /tests/attempts/{attempt_id}
     *
     * ⚠️ Authorization: Only the student who owns the attempt or Teacher/Admin can view
     *
     * @param attemptId - ID of the attempt
     * @returns Detailed attempt result with all question results
     */
    getAttemptDetail: async (attemptId: string): Promise<AttemptDetail> => {
        const response = await api<BackendAttemptDetailResponse>(
            `${BASE_URL}/attempts/${attemptId}`,
            { method: 'GET' }
        )
        return mapAttemptDetail(response)
    },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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
    const now = new Date()

    if (startTime && new Date(startTime) > now) {
        return false // Not started yet
    }

    if (endTime && new Date(endTime) < now) {
        return false // Already ended
    }

    return true
}

/**
 * Get test availability status message
 */
export function getTestAvailabilityMessage(
    startTime: string | null,
    endTime: string | null
): string | null {
    const now = new Date()

    if (startTime && new Date(startTime) > now) {
        return `Test opens on ${new Date(startTime).toLocaleString()}`
    }

    if (endTime && new Date(endTime) < now) {
        return 'Test has ended'
    }

    if (endTime) {
        return `Available until ${new Date(endTime).toLocaleString()}`
    }

    return null
}

/**
 * Remove temporary IDs from create payload before sending to backend
 * Backend will generate proper UUIDs
 */
function cleanCreatePayload(payload: TestCreatePayload): TestCreatePayload {
    return {
        ...payload,
        sections: payload.sections.map((section) => {
            const { id: _sId, ...sectionRest } = section as any
            return {
                ...sectionRest,
                parts: section.parts.map((part) => {
                    const { id: _pId, ...partRest } = part as any
                    return {
                        ...partRest,
                        question_groups: part.question_groups.map((group) => {
                            const { id: _gId, ...groupRest } = group as any
                            return {
                                ...groupRest,
                                questions: group.questions.map((question) => {
                                    const { id: _qId, ...questionRest } =
                                        question as any
                                    return questionRest
                                }),
                            }
                        }),
                    }
                }),
            }
        }),
    }
}
