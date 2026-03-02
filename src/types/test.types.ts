// ============================================
// ENUMS
// ============================================
export enum QuestionType {
    // Reading & Listening
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE_NOT_GIVEN = 'true_false_not_given',
    YES_NO_NOT_GIVEN = 'yes_no_not_given',
    MATCHING_HEADINGS = 'matching_headings',
    MATCHING_INFORMATION = 'matching_information',
    MATCHING_FEATURES = 'matching_features',
    SENTENCE_COMPLETION = 'sentence_completion',
    SUMMARY_COMPLETION = 'summary_completion',
    NOTE_COMPLETION = 'note_completion',
    SHORT_ANSWER = 'short_answer',
    DIAGRAM_LABELING = 'diagram_labeling',

    // Writing
    WRITING_TASK_1 = 'writing_task_1',
    WRITING_TASK_2 = 'writing_task_2',

    // Speaking
    SPEAKING_PART_1 = 'speaking_part_1',
    SPEAKING_PART_2 = 'speaking_part_2',
    SPEAKING_PART_3 = 'speaking_part_3',
}

export enum SkillArea {
    LISTENING = 'listening',
    READING = 'reading',
    WRITING = 'writing',
    SPEAKING = 'speaking',
    GRAMMAR = 'grammar',
    VOCABULARY = 'vocabulary',
    PRONUNCIATION = 'pronunciation',
}

export enum DifficultyLevel {
    VERY_EASY = 'very_easy',
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
    VERY_HARD = 'very_hard',
}

export enum TestStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ACTIVE = 'active',
    CLOSED = 'closed',
    ARCHIVED = 'archived',
}

export enum TestType {
    QUIZ = 'quiz',
    MIDTERM = 'midterm',
    FINAL = 'final',
    PLACEMENT = 'placement',
    HOMEWORK = 'homework',
    ASSESSMENT = 'assessment',
}

export enum AttemptStatus {
    IN_PROGRESS = 'in_progress',
    SUBMITTED = 'submitted',
    GRADED = 'graded',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
}

export enum ContentStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ARCHIVED = 'archived',
    UNDER_REVIEW = 'under_review',
}

// ============================================
// BACKEND RESPONSE TYPES
// ============================================

/**
 * Backend question option structure
 */
export interface BackendQuestionOption {
    key: string
    text: string
    is_correct?: boolean // Only in teacher view
}

/**
 * Backend question response (base - student view)
 */
export interface BackendQuestionResponse {
    id: string
    title: string | null
    question_text: string | null
    question_type: string
    difficulty_level: string | null
    skill_area: string | null
    options: BackendQuestionOption[] | null
    image_url: string | null
    audio_url: string | null
    points: number
    tags: string[] | null
    visible_metadata: any | null

    order_number?: number
    status?: string // ContentStatus
}

/**
 * Backend question response (teacher view with answers)
 */
export interface BackendQuestionTeacherResponse
    extends BackendQuestionResponse {
    correct_answer: any | null
    rubric: any | null
    explanation: string | null
    usage_count: number | null
    success_rate: number | null
    internal_metadata: any | null
}

/**
 * Backend question group response
 */
export interface BackendQuestionGroupResponse {
    id: string
    name: string
    order_number: number
    question_type: string
    instructions: string | null
    image_url: string | null
    questions: BackendQuestionResponse[]
}

/**
 * Backend question group response (teacher view)
 */
export interface BackendQuestionGroupTeacherResponse
    extends Omit<BackendQuestionGroupResponse, 'questions'> {
    questions: BackendQuestionTeacherResponse[]
}

/**
 * Backend part response
 */
export interface BackendPartResponse {
    id: string
    name: string
    order_number: number
    passage: BackendPassageResponse | null
    min_questions: number | null
    max_questions: number | null
    image_url: string | null
    audio_url: string | null
    instructions: string | null
    question_groups: BackendQuestionGroupResponse[]
}

/**
 * Backend part response (teacher view)
 */
export interface BackendPartTeacherResponse
    extends Omit<BackendPartResponse, 'question_groups'> {
    question_groups: BackendQuestionGroupTeacherResponse[]
    structure_part_id: string | null
}

/**
 * Backend section response
 */
export interface BackendSectionResponse {
    id: string
    name: string
    order_number: number
    skill_area: string | null
    time_limit_minutes: number | null
    instructions: string | null
    parts: BackendPartResponse[]
}

/**
 * Backend section response (teacher view)
 */
export interface BackendSectionTeacherResponse
    extends Omit<BackendSectionResponse, 'parts'> {
    parts: BackendPartTeacherResponse[]
    structure_section_id: string | null
}

/**
 * Backend test response (base - student view)
 */
export interface BackendTestResponse {
    id: string
    title: string
    description: string | null
    instructions: string | null
    test_type: string | null
    time_limit_minutes: number | null
    total_points: number
    passing_score: number
    max_attempts: number
    randomize_questions: boolean
    show_results_immediately: boolean
    start_time: string | null
    end_time: string | null
    status: string // TestStatus
    ai_grading_enabled: boolean
    sections: BackendSectionResponse[]
}

/**
 * Backend test response (teacher view)
 */
export interface BackendTestTeacherResponse
    extends Omit<BackendTestResponse, 'sections'> {
    sections: BackendSectionTeacherResponse[]
    class_id: string | null
    course_id: string | null
    created_by: string | null
    updated_by: string | null
    created_at: string | null
    updated_at: string | null
    exam_type_id: string | null
    structure_id: string | null
    reviewed_by: string | null
    reviewed_at: string | null
}

/**
 * Backend test list item
 */
export interface BackendTestListResponse {
    id: string
    title: string
    description: string | null
    skill: string
    difficulty: string
    test_type: string | null
    duration_minutes: number
    total_questions: number
    created_at: string
    status?: string
    pending_attempts_count?: number
    total_attempts_count?: number
}

/**
 * Backend test list for students (from service)
 */
export interface BackendStudentTestListItem {
    id: string
    title: string
    description: string | null
    skill: SkillArea
    difficulty: DifficultyLevel
    test_type: string | null
    time_limit_minutes: number | null
    total_questions: number
    total_points: number
    passing_score: number
    start_time: string | null
    end_time: string | null
    attempts_count: number
    max_attempts: number
    can_attempt: boolean
    latest_attempt_status: string | null
    latest_attempt_score: number | null
    status: string
}

/**
 * Backend start attempt response
 */
export interface BackendStartAttemptResponse {
    attempt_id: string
    test_id: string
    attempt_number: number
    started_at: string
}

/**
 * Backend question result (in submit response)
 */
export interface BackendQuestionResult {
    question_id: string
    answered: boolean
    is_correct: boolean | null
    auto_graded: boolean

    points_earned: number
    max_points: number
    band_score: number | null
    rubric_scores: Record<string, any> | null

    ai_points_earned: number | null
    ai_band_score: number | null
    ai_rubric_scores: Record<string, any> | null
    ai_feedback: string | null

    teacher_points_earned: number | null
    teacher_band_score: number | null
    teacher_rubric_scores: Record<string, any> | null
    teacher_feedback: string | null
}

/**
 * Backend submit attempt response
 */
export interface BackendSubmitAttemptResponse {
    attempt_id: string
    status: string // AttemptStatus
    submitted_at: string
    time_taken_seconds: number
    total_score: number
    percentage_score: number
    band_score: number | null
    passed: boolean | null
    graded_at: string | null
    graded_by: string | null
    question_results: BackendQuestionResult[]
    ai_feedback: Record<string, any> | null
    teacher_feedback: string | null
}

/**
 * Backend speaking submission response (from service)
 */
export interface BackendSpeakingSubmissionResponse {
    question_id: string
    points_earned: number
    max_points: number
    audio_url: string
    ai_score: number
    transcript: string
    feedback: string
}

/**
 * Backend question result detail (in attempt detail)
 */
export interface BackendQuestionResultDetail {
    question_id: string
    question_text: string
    question_type: string

    user_answer: string | null
    response_data: any | null
    audio_response_url: string | null

    is_correct: boolean | null
    auto_graded: boolean

    points_earned: number
    max_points: number
    band_score: number | null
    rubric_scores: Record<string, any> | null

    ai_points_earned: number | null
    ai_band_score: number | null
    ai_rubric_scores: Record<string, any> | null
    ai_feedback: string | null

    teacher_points_earned: number | null
    teacher_band_score: number | null
    teacher_rubric_scores: Record<string, any> | null
    teacher_feedback: string | null

    time_spent_seconds: number | null
    flagged_for_review: boolean
}

/**
 * Backend attempt detail response
 */
export interface BackendAttemptDetailResponse {
    id: string
    test_id: string
    test_title: string
    student_id: string

    attempt_number: number
    started_at: string
    submitted_at: string | null
    time_taken_seconds: number | null

    total_score: number | null
    percentage_score: number | null
    band_score: number | null
    passed: boolean | null
    status: string

    graded_by: string | null
    graded_at: string | null

    ai_feedback: Record<string, any> | null
    teacher_feedback: string | null

    ip_address?: string | null
    user_agent?: string | null

    details: BackendQuestionResultDetail[]
}
/**
 * Backend test summary (from service)
 */
export interface BackendTestSummary {
    id: string
    title: string
    description: string | null
    test_type: string | null
    status: string
    total_questions: number
    total_points: number
    time_limit_minutes: number | null
    total_attempts: number
    completed_attempts: number
    average_score: number
    pass_rate: number
    created_at: string
    start_time: string | null
    end_time: string | null
}

/**
 * Backend passage response (from service)
 */
export interface BackendPassageResponse {
    id: string
    title: string
    text_content: string | null
    audio_url: string | null
    image_url: string | null
    duration_seconds: number | null
}

// ============================================
// FRONTEND TYPES
// ============================================

/**
 * Frontend question option
 */
export interface QuestionOption {
    key: string
    text: string
    isCorrect?: boolean // Only in teacher view
}

/**
 * Frontend question (base)
 */
export interface Question {
    id: string
    title: string | null
    questionText: string | null
    questionType: QuestionType
    difficultyLevel: DifficultyLevel | null
    skillArea: SkillArea | null
    options: QuestionOption[] | null
    imageUrl: string | null
    audioUrl: string | null
    points: number
    tags: string[] | null
    metadata: any | null
    // Optional fields from TestQuestion link table
    orderNumber?: number
    status?: ContentStatus | null
}

/**
 * Frontend question (teacher view with answers)
 */
export interface QuestionTeacher extends Question {
    correctAnswer: any | null
    rubric: any | null
    explanation: string | null
    usageCount: number | null
    successRate: number | null
}

/**
 * Frontend question group
 * ⚠️ Removed minQuestions, maxQuestions (not in BE schema)
 */
export interface QuestionGroup {
    id: string
    name: string
    orderNumber: number
    questionType: QuestionType
    instructions: string | null
    imageUrl: string | null
    questions: Question[]
    metadata?: {
        options?: Array<{ key: string; text: string }>
        headings?: Array<{ key: string; text: string }>
        [key: string]: any
    } | null
}

/**
 * Frontend question group (teacher view)
 */
export interface QuestionGroupTeacher extends Omit<QuestionGroup, 'questions'> {
    questions: QuestionTeacher[]
}

/**
 * Frontend test section part
 */
export interface TestSectionPart {
    id: string
    name: string
    orderNumber: number
    passage: Passage | null
    minQuestions: number | null
    maxQuestions: number | null
    imageUrl: string | null
    audioUrl: string | null
    instructions: string | null
    questionGroups: QuestionGroup[]
}

/**
 * Frontend test section part (teacher view)
 */
export interface TestSectionPartTeacher
    extends Omit<TestSectionPart, 'questionGroups'> {
    questionGroups: QuestionGroupTeacher[]
    structurePartId: string | null
}

/**
 * Frontend test section
 */
export interface TestSection {
    id: string
    name: string
    orderNumber: number
    skillArea: SkillArea | null
    timeLimitMinutes: number | null
    instructions: string | null
    parts: TestSectionPart[]
}

/**
 * Frontend test section (teacher view)
 */
export interface TestSectionTeacher extends Omit<TestSection, 'parts'> {
    parts: TestSectionPartTeacher[]
    structureSectionId: string | null
}

/**
 * Frontend test (base - student view)
 */
export interface Test {
    id: string
    title: string
    description: string | null
    instructions: string | null
    testType: TestType | null
    timeLimitMinutes: number | null
    totalPoints: number
    passingScore: number
    maxAttempts: number
    randomizeQuestions: boolean
    showResultsImmediately: boolean
    startTime: string | null
    endTime: string | null
    status: TestStatus
    aiGradingEnabled: boolean
    sections: TestSection[]
}

/**
 * Frontend test (teacher view)
 */
export interface TestTeacher extends Omit<Test, 'sections'> {
    sections: TestSectionTeacher[]
    classId: string | null
    courseId: string | null
    createdBy: string | null
    updatedBy: string | null
    createdAt: string | null
    updatedAt: string | null
    examTypeId: string | null
    structureId: string | null
    reviewedBy: string | null
    reviewedAt: string | null
}

/**
 * Frontend test list item
 */
export interface TestListItem {
    id: string
    title: string
    description: string | null
    skill: SkillArea
    difficulty: DifficultyLevel
    testType: TestType | null
    durationMinutes: number
    totalQuestions: number
    createdAt: string
    status?: TestStatus | null
    pendingAttemptsCount?: number
    totalAttemptsCount?: number
}

/**
 * Frontend student test list item (richer data)
 */
export interface StudentTestListItem {
    id: string
    title: string
    description: string | null
    testType: TestType | null
    timeLimitMinutes: number | null
    totalQuestions: number
    totalPoints: number
    passingScore: number
    startTime: string | null
    endTime: string | null
    attemptsCount: number
    maxAttempts: number
    canAttempt: boolean
    latestAttemptStatus: AttemptStatus | null
    latestAttemptScore: number | null
    status: TestStatus
    skill: SkillArea
    difficulty: DifficultyLevel
    durationMinutes: number
    createdAt: string
}

/**
 * Frontend test attempt
 */
export interface TestAttempt {
    attemptId: string
    testId: string
    attemptNumber: number
    startedAt: string
}

/**
 * Frontend question result
 */
export interface QuestionResult {
    questionId: string
    answered: boolean
    isCorrect: boolean | null
    autoGraded: boolean

    pointsEarned: number
    maxPoints: number
    bandScore: number | null
    rubricScores: Record<string, any> | null

    aiPointsEarned: number | null
    aiBandScore: number | null
    aiRubricScores: Record<string, any> | null
    aiFeedback: string | null

    teacherPointsEarned: number | null
    teacherBandScore: number | null
    teacherRubricScores: Record<string, any> | null
    teacherFeedback: string | null
}

/**
 * Frontend submit result
 */
export interface SubmitResult {
    attemptId: string
    status: AttemptStatus
    submittedAt: string
    timeTakenSeconds: number
    totalScore: number
    percentageScore: number
    bandScore: number | null
    passed: boolean | null
    gradedAt: string | null
    gradedBy: string | null
    aiFeedback: Record<string, any> | null
    teacherFeedback: string | null
    questionResults: QuestionResult[]
}

/**
 * Frontend speaking submission result
 */
export interface SpeakingSubmissionResult {
    questionId: string
    pointsEarned: number
    maxPoints: number
    audioUrl: string
    aiScore: number
    transcript: string
    feedback: string
}

/**
 * Frontend question result detail
 */
export interface QuestionResultDetail {
    questionId: string
    questionText: string
    questionType: QuestionType

    userAnswer: string | null
    responseData: any | null
    audioResponseUrl: string | null

    isCorrect: boolean | null
    autoGraded: boolean

    pointsEarned: number
    maxPoints: number
    bandScore: number | null
    rubricScores: Record<string, any> | null

    aiPointsEarned: number | null
    aiBandScore: number | null
    aiRubricScores: Record<string, any> | null
    aiFeedback: string | null

    teacherPointsEarned: number | null
    teacherBandScore: number | null
    teacherRubricScores: Record<string, any> | null
    teacherFeedback: string | null

    timeSpentSeconds: number | null
    flaggedForReview: boolean
}

/**
 * Frontend attempt detail
 */
export interface AttemptDetail {
    id: string
    testId: string
    testTitle: string
    studentId: string

    attemptNumber: number
    startedAt: string
    submittedAt: string | null
    timeTakenSeconds: number | null

    totalScore: number | null
    percentageScore: number | null
    bandScore: number | null
    passed: boolean | null
    status: AttemptStatus

    gradedBy: string | null
    gradedAt: string | null

    aiFeedback: Record<string, any> | null
    teacherFeedback: string | null

    details: QuestionResultDetail[]
}

/**
 * Frontend test summary
 */
export interface TestSummary {
    id: string
    title: string
    description: string | null
    testType: TestType | null
    status: TestStatus
    totalQuestions: number
    totalPoints: number
    timeLimitMinutes: number | null
    totalAttempts: number
    completedAttempts: number
    averageScore: number
    passRate: number
    createdAt: string
    startTime: string | null
    endTime: string | null
}

/**
 * Frontend passage
 */
export interface Passage {
    id: string
    title: string
    textContent: string | null
    audioUrl: string | null
    imageUrl: string | null
    durationSeconds: number | null
}

/**
 * Teacher attempt summary (for grading list)
 */
export interface TestAttemptSummaryResponse {
    id: string
    student_id: string
    student_name: string
    status: string
    score: number | null
    started_at: string
    submitted_at: string | null
}

/**
 * Grading request types
 */
export interface GradeQuestionRequest {
    question_id: string
    teacher_points_earned: number
    teacher_band_score?: number | null
    teacher_rubric_scores?: Record<string, number> | null
    teacher_feedback?: string | null
}

export interface GradeAttemptRequest {
    questions: GradeQuestionRequest[]
    overall_feedback?: string | null
}

// ============================================
// REQUEST PAYLOAD TYPES
// ============================================

/**
 * Question submission item (for submit attempt)
 */
export interface QuestionSubmitItem {
    question_id: string
    response_text?: string | null
    response_data?: any | null
    time_spent_seconds?: number | null
    flagged_for_review?: boolean
}

/**
 * Submit attempt request payload
 */
export interface SubmitAttemptRequest {
    responses: QuestionSubmitItem[]
}

/**
 * Question create payload (for creating test)
 */
export interface QuestionCreatePayload {
    id?: string | null
    title: string
    question_text: string
    question_type: QuestionType
    difficulty_level?: DifficultyLevel | null
    skill_area: SkillArea
    options?: BackendQuestionOption[] | null
    correct_answer?: string | null
    rubric?: any | null
    audio_url?: string | null
    image_url?: string | null
    points?: number
    tags?: string[] | null
    extra_metadata?: any | null
}

/**
 * Question group create payload
 */
export interface QuestionGroupCreatePayload {
    id?: string | null
    name: string
    order_number: number
    question_type: QuestionType
    instructions?: string | null
    image_url?: string | null
    min_questions?: number | null
    max_questions?: number | null
    questions: QuestionCreatePayload[]
}

/**
 * Test section create payload
 */
export interface TestSectionCreatePayload {
    id?: string | null
    structure_section_id?: string | null
    name: string
    order_number: number
    skill_area: SkillArea
    time_limit_minutes?: number | null
    instructions?: string | null
    parts: TestSectionPartCreatePayload[]
}

/**
 * Test create payload
 */
export interface TestCreatePayload {
    title: string
    description?: string | null
    instructions?: string | null

    time_limit_minutes?: number | null
    passing_score?: number | null
    max_attempts?: number | null
    randomize_questions?: boolean
    show_results_immediately?: boolean
    start_time?: string | null
    end_time?: string | null
    ai_grading_enabled?: boolean

    class_id?: string | null
    course_id?: string | null
    test_type?: TestType | null
    exam_type_id?: string | null
    structure_id?: string | null

    status?: TestStatus

    sections: TestSectionCreatePayload[]
}

// ============================================
// QUERY PARAMETER TYPES
// ============================================

/**
 * List tests query parameters
 */
export interface ListTestsParams {
    skip?: number
    limit?: number
    class_id?: string
    status?: TestStatus
    skill?: SkillArea
}

/**
 * List student tests query parameters
 */
export interface ListStudentTestsParams {
    skip?: number
    limit?: number
    class_id?: string
    skill?: SkillArea
}

export interface PassageCreatePayload {
    title: string
    content_type: string // "reading_passage" | "listening_audio" | "speaking_cue_card"
    text_content?: string | null
    audio_url?: string | null
    image_url?: string | null
    topic?: string | null
    difficulty_level?: string | null
    word_count?: number | null
    duration_seconds?: number | null
}

export interface TestSectionPartCreatePayload {
    id?: string | null
    structure_part_id?: string | null
    name: string
    order_number: number

    passage_id?: string | null
    passage?: PassageCreatePayload | null

    min_questions?: number | null
    max_questions?: number | null
    audio_url?: string | null
    image_url?: string | null
    instructions?: string | null
    question_groups: QuestionGroupCreatePayload[]
}

export interface PreUploadResponse {
    fileUploadId: string
    audioUrl: string
    questionId: string
    fileSize: number
    durationSeconds?: number
    uploadedAt: string
}

export interface SpeakingResponseItem {
    questionId: string
    fileUploadId: string
    durationSeconds?: number
    flaggedForReview?: boolean
}

export interface BatchSubmitSpeakingRequest {
    responses: SpeakingResponseItem[]
}

export interface QuestionGradingResult {
    questionId: string
    questionPart: string
    questionText?: string
    audioUrl: string
    durationSeconds?: number
    aiBandScore?: number
    aiRubricScores?: Record<string, number>
    aiFeedback?: string
    aiTranscript?: string
    aiPointsEarned?: number
    processed: boolean
    errorMessage?: string
    maxPoints: number
}

export interface OverallSpeakingScores {
    fluencyCoherence?: number
    lexicalResource?: number
    grammaticalRange?: number
    pronunciation?: number
    overallBand?: number
    part1AvgBand?: number
    part2AvgBand?: number
    part3AvgBand?: number
}

export interface BatchSubmitSpeakingResponse {
    attemptId: string
    testId: string
    submittedAt: string
    totalQuestions: number
    processedCount: number
    failedCount: number
    questionResults: QuestionGradingResult[]
    aiOverallScores?: OverallSpeakingScores
    aiOverallFeedback?: string
    aiTotalPoints?: number
    maxTotalPoints: number
    status: string
    requiresTeacherReview: boolean
    processingTimeSeconds?: number
}
