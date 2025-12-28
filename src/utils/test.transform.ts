/**
 * Utilities for transforming data between Backend (snake_case) and Frontend (camelCase)
 */

import {
    AttemptStatus,
    // Backend types
    type BackendQuestionResponse,
    type BackendQuestionTeacherResponse,
    type BackendQuestionGroupResponse,
    type BackendQuestionGroupTeacherResponse,
    type BackendPartResponse,
    type BackendPartTeacherResponse,
    type BackendSectionResponse,
    type BackendSectionTeacherResponse,
    type BackendTestResponse,
    type BackendTestTeacherResponse,
    type BackendTestListResponse,
    type BackendStudentTestListItem,
    type BackendStartAttemptResponse,
    type BackendQuestionResult,
    type BackendSubmitAttemptResponse,
    type BackendQuestionResultDetail,
    type BackendAttemptDetailResponse,
    type BackendTestSummary,
    type BackendSpeakingSubmissionResponse,
    type BackendQuestionOption,
    ContentStatus,
    DifficultyLevel,

    // Frontend types
    type Question,
    type QuestionTeacher,
    type QuestionGroup,
    type QuestionGroupTeacher,
    SkillArea,
    type TestSectionPart,
    type TestSectionPartTeacher,
    type TestSection,
    type TestSectionTeacher,
    type Test,
    type TestTeacher,
    type TestListItem,
    type StudentTestListItem,
    type TestAttempt,
    type QuestionResult,
    type SubmitResult,
    type QuestionResultDetail,
    type AttemptDetail,
    type TestSummary,
    type SpeakingSubmissionResult,
    type QuestionOption,

    // Enums
    QuestionType,
    TestStatus,
    TestType,
} from '@/types/test.types'

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// ============================================
// QUESTION TRANSFORMS
// ============================================

/**
 * Transform backend question option to frontend
 */
export function transformQuestionOption(
    option: BackendQuestionOption
): QuestionOption {
    return {
        key: option.key,
        text: option.text,
        isCorrect: option.is_correct,
    }
}

/**
 * Transform frontend question option to backend
 */
export function transformQuestionOptionToBackend(
    option: QuestionOption
): BackendQuestionOption {
    return {
        key: option.key,
        text: option.text,
        is_correct: option.isCorrect,
    }
}

/**
 * Transform backend question response to frontend question
 */
export function transformQuestion(data: BackendQuestionResponse): Question {
    return {
        id: data.id,
        title: data.title,
        questionText: data.question_text,
        questionType:
            parseEnum(QuestionType, data.question_type) ||
            QuestionType.MULTIPLE_CHOICE,
        difficultyLevel: parseEnum(DifficultyLevel, data.difficulty_level),
        skillArea: parseEnum(SkillArea, data.skill_area),
        options: data.options?.map(transformQuestionOption) || null,
        imageUrl: data.image_url,
        audioUrl: data.audio_url,
        points: data.points,
        tags: data.tags,
        metadata: data.visible_metadata,
        orderNumber: data.order_number,
        status: parseEnum(ContentStatus, data.status) || undefined,
    }
}

/**
 * Transform backend teacher question to frontend teacher question
 */
export function transformQuestionTeacher(
    data: BackendQuestionTeacherResponse
): QuestionTeacher {
    return {
        ...transformQuestion(data),
        correctAnswer: data.correct_answer,
        rubric: data.rubric,
        explanation: data.explanation,
        usageCount: data.usage_count,
        successRate: data.success_rate,
    }
}

// ============================================
// QUESTION GROUP TRANSFORMS
// ============================================

/**
 * Transform backend question group to frontend
 */
export function transformQuestionGroup(
    data: BackendQuestionGroupResponse
): QuestionGroup {
    return {
        id: data.id,
        name: data.name,
        orderNumber: data.order_number,
        questionType:
            parseEnum(QuestionType, data.question_type) ||
            QuestionType.MULTIPLE_CHOICE,
        instructions: data.instructions,
        imageUrl: data.image_url,
        questions: data.questions.map(transformQuestion),
    }
}

/**
 * Transform backend teacher question group to frontend
 */
export function transformQuestionGroupTeacher(
    data: BackendQuestionGroupTeacherResponse
): QuestionGroupTeacher {
    return {
        id: data.id,
        name: data.name,
        orderNumber: data.order_number,
        questionType:
            parseEnum(QuestionType, data.question_type) ||
            QuestionType.MULTIPLE_CHOICE,
        instructions: data.instructions,
        imageUrl: data.image_url,
        questions: data.questions.map(transformQuestionTeacher),
    }
}

// ============================================
// PART TRANSFORMS
// ============================================

/**
 * Transform backend part to frontend
 */
export function transformPart(data: BackendPartResponse): TestSectionPart {
    return {
        id: data.id,
        name: data.name,
        orderNumber: data.order_number,
        content: data.content,
        minQuestions: data.min_questions,
        maxQuestions: data.max_questions,
        imageUrl: data.image_url,
        audioUrl: data.audio_url,
        instructions: data.instructions,
        questionGroups: data.question_groups.map(transformQuestionGroup),
    }
}

/**
 * Transform backend teacher part to frontend
 */
export function transformPartTeacher(
    data: BackendPartTeacherResponse
): TestSectionPartTeacher {
    return {
        id: data.id,
        name: data.name,
        orderNumber: data.order_number,
        content: data.content,
        minQuestions: data.min_questions,
        maxQuestions: data.max_questions,
        imageUrl: data.image_url,
        audioUrl: data.audio_url,
        instructions: data.instructions,
        structurePartId: data.structure_part_id,
        questionGroups: data.question_groups.map(transformQuestionGroupTeacher),
    }
}

// ============================================
// SECTION TRANSFORMS
// ============================================

/**
 * Transform backend section to frontend
 */
export function transformSection(data: BackendSectionResponse): TestSection {
    return {
        id: data.id,
        name: data.name,
        orderNumber: data.order_number,
        skillArea: parseEnum(SkillArea, data.skill_area),
        timeLimitMinutes: data.time_limit_minutes,
        instructions: data.instructions,
        parts: data.parts.map(transformPart),
    }
}

/**
 * Transform backend teacher section to frontend
 */
export function transformSectionTeacher(
    data: BackendSectionTeacherResponse
): TestSectionTeacher {
    return {
        id: data.id,
        name: data.name,
        orderNumber: data.order_number,
        skillArea: parseEnum(SkillArea, data.skill_area),
        timeLimitMinutes: data.time_limit_minutes,
        instructions: data.instructions,
        structureSectionId: data.structure_section_id,
        parts: data.parts.map(transformPartTeacher),
    }
}

// ============================================
// TEST TRANSFORMS
// ============================================

/**
 * Transform backend test to frontend
 */
export function transformTest(data: BackendTestResponse): Test {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        testType: parseEnum(TestType, data.test_type),
        timeLimitMinutes: data.time_limit_minutes,
        totalPoints: data.total_points,
        passingScore: data.passing_score,
        maxAttempts: data.max_attempts,
        randomizeQuestions: data.randomize_questions,
        showResultsImmediately: data.show_results_immediately,
        startTime: data.start_time,
        endTime: data.end_time,
        status: parseEnum(TestStatus, data.status) || TestStatus.DRAFT,
        aiGradingEnabled: data.ai_grading_enabled,
        sections: data.sections.map(transformSection),
    }
}

/**
 * Transform backend teacher test to frontend
 */
export function transformTestTeacher(
    data: BackendTestTeacherResponse
): TestTeacher {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        testType: parseEnum(TestType, data.test_type),
        timeLimitMinutes: data.time_limit_minutes,
        totalPoints: data.total_points,
        passingScore: data.passing_score,
        maxAttempts: data.max_attempts,
        randomizeQuestions: data.randomize_questions,
        showResultsImmediately: data.show_results_immediately,
        startTime: data.start_time,
        endTime: data.end_time,
        status: parseEnum(TestStatus, data.status) || TestStatus.DRAFT,
        aiGradingEnabled: data.ai_grading_enabled,
        classId: data.class_id,
        courseId: data.course_id,
        createdBy: data.created_by,
        updatedBy: data.updated_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        examTypeId: data.exam_type_id,
        structureId: data.structure_id,
        reviewedBy: data.reviewed_by,
        reviewedAt: data.reviewed_at,
        sections: data.sections.map(transformSectionTeacher),
    }
}

/**
 * Transform backend test list item to frontend
 */
export function transformTestListItem(
    data: BackendTestListResponse
): TestListItem {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        skill: parseEnum(SkillArea, data.skill) || SkillArea.READING,
        difficulty:
            parseEnum(DifficultyLevel, data.difficulty) ||
            DifficultyLevel.MEDIUM,
        testType: parseEnum(TestType, data.test_type),
        durationMinutes: data.duration_minutes,
        totalQuestions: data.total_questions,
        createdAt: data.created_at,
        status: parseEnum(TestStatus, data.status),
    }
}

/**
 * Transform backend student test list item to frontend
 */
export function transformStudentTestListItem(
    data: BackendStudentTestListItem
): StudentTestListItem {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        testType: parseEnum(TestType, data.test_type),
        timeLimitMinutes: data.time_limit_minutes,
        totalQuestions: data.total_questions,
        totalPoints: data.total_points,
        passingScore: data.passing_score,
        startTime: data.start_time,
        endTime: data.end_time,
        attemptsCount: data.attempts_count,
        maxAttempts: data.max_attempts,
        canAttempt: data.can_attempt,
        latestAttemptStatus: parseEnum(
            AttemptStatus,
            data.latest_attempt_status
        ),
        latestAttemptScore: data.latest_attempt_score,
        status: parseEnum(TestStatus, data.status) || TestStatus.DRAFT,
    }
}

// ============================================
// ATTEMPT TRANSFORMS
// ============================================

/**
 * Transform backend start attempt response to frontend
 */
export function transformStartAttempt(
    data: BackendStartAttemptResponse
): TestAttempt {
    return {
        attemptId: data.attempt_id,
        testId: data.test_id,
        attemptNumber: data.attempt_number,
        startedAt: data.started_at,
    }
}

/**
 * Transform backend question result to frontend
 */
export function transformQuestionResult(
    data: BackendQuestionResult
): QuestionResult {
    return {
        questionId: data.question_id,
        answered: data.answered,
        isCorrect: data.is_correct,
        pointsEarned: data.points_earned,
        maxPoints: data.max_points,
        autoGraded: data.auto_graded,
        aiScore: data.ai_score,
        aiFeedback: data.ai_feedback,
    }
}

/**
 * Transform backend submit attempt response to frontend
 */
export function transformSubmitResult(
    data: BackendSubmitAttemptResponse
): SubmitResult {
    return {
        attemptId: data.attempt_id,
        status:
            parseEnum(AttemptStatus, data.status) || AttemptStatus.SUBMITTED,
        submittedAt: data.submitted_at,
        timeTakenSeconds: data.time_taken_seconds,
        totalScore: data.total_score,
        percentageScore: data.percentage_score,
        bandScore: data.band_score,
        passed: data.passed,
        gradedAt: data.graded_at,
        gradedBy: data.graded_by,
        questionResults: data.question_results.map(transformQuestionResult),
    }
}

/**
 * Transform backend question result detail to frontend
 */
export function transformQuestionResultDetail(
    data: BackendQuestionResultDetail
): QuestionResultDetail {
    return {
        questionId: data.question_id,
        questionText: data.question_text,
        userAnswer: data.user_answer,
        audioResponseUrl: data.audio_response_url,
        aiScore: data.ai_score,
        aiFeedback: data.ai_feedback,
        pointsEarned: data.points_earned,
        maxPoints: data.max_points,
        teacherScore: data.teacher_score,
        teacherFeedback: data.teacher_feedback,
        timeSpentSeconds: data.time_spent_seconds,
        flaggedForReview: data.flagged_for_review,
    }
}

/**
 * Transform backend attempt detail to frontend
 */
export function transformAttemptDetail(
    data: BackendAttemptDetailResponse
): AttemptDetail {
    return {
        id: data.id,
        testId: data.test_id,
        testTitle: data.test_title,
        studentId: data.student_id,
        startTime: data.start_time,
        endTime: data.end_time,
        totalScore: data.total_score,
        status:
            parseEnum(AttemptStatus, data.status) || AttemptStatus.IN_PROGRESS,
        details: data.details.map(transformQuestionResultDetail),
    }
}

/**
 * Transform backend test summary to frontend
 */
export function transformTestSummary(data: BackendTestSummary): TestSummary {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        testType: parseEnum(TestType, data.test_type),
        status: parseEnum(TestStatus, data.status) || TestStatus.DRAFT,
        totalQuestions: data.total_questions,
        totalPoints: data.total_points,
        timeLimitMinutes: data.time_limit_minutes,
        totalAttempts: data.total_attempts,
        completedAttempts: data.completed_attempts,
        averageScore: data.average_score,
        passRate: data.pass_rate,
        createdAt: data.created_at,
        startTime: data.start_time,
        endTime: data.end_time,
    }
}

/**
 * Transform backend speaking submission to frontend
 */
export function transformSpeakingSubmission(
    data: BackendSpeakingSubmissionResponse
): SpeakingSubmissionResult {
    return {
        questionId: data.question_id,
        pointsEarned: data.points_earned,
        maxPoints: data.max_points,
        audioUrl: data.audio_url,
        aiScore: data.ai_score,
        transcript: data.transcript,
        feedback: data.feedback,
    }
}

// ============================================
// REVERSE TRANSFORMS (Frontend -> Backend)
// ============================================

/**
 * Transform frontend question option to backend (for create/update)
 */
export function questionOptionToBackend(
    option: QuestionOption
): BackendQuestionOption {
    return {
        key: option.key,
        text: option.text,
        is_correct: option.isCorrect,
    }
}
