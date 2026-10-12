/**
 * TypeScript definitions for Adaptive Quiz (Computerized Adaptive Testing & Item Response Theory).
 */

export type AdaptiveSessionStatus = 'in_progress' | 'completed' | 'expired'

export type AdaptiveStopReason =
    'se_threshold' | 'max_items' | 'timeout' | 'user_quit' | 'pool_exhausted'

export type AdaptiveSkillArea = 'reading' | 'listening'

export interface ThetaHistoryItem {
    item_position: number
    theta: number
    se: number
    is_correct?: boolean
    question_id?: string
}

export interface AdaptiveSession {
    id: string
    user_id: string
    skill_area: AdaptiveSkillArea
    theta_initial: number
    theta_current: number
    theta_final: number | null
    se_current: number
    se_final: number | null
    items_administered: number
    max_items: number
    stop_reason: string | null
    estimated_band: number | null
    status: AdaptiveSessionStatus
    started_at: string
    completed_at: string | null
    theta_history: ThetaHistoryItem[]
}

export interface QuestionOption {
    id: string
    text: string
}

export interface NextQuestion {
    question_id: string
    item_position: number
    title: string
    question_text: string
    question_type: string
    skill_area: AdaptiveSkillArea
    options?: QuestionOption[] | string[] | null
    audio_url?: string | null
    image_url?: string | null
    current_theta: number
    current_se: number
    items_administered: number
    max_items: number
}

export interface SubmitResponsePayload {
    question_id: string
    response_data: string | Record<string, string>
    time_spent_seconds?: number
}

export interface SubmitResponseResult {
    item_position: number
    is_correct: boolean
    correct_answer?: string | null
    explanation?: string | null
    theta_before: number
    theta_after: number
    se_before: number
    se_after: number
    is_finished: boolean
    stop_reason?: string | null
    estimated_band?: number | null
}

export interface FinishSessionResult {
    id: string
    status: string
    theta_final: number
    se_final: number
    estimated_band: number
    items_administered: number
    stop_reason: string
    started_at: string
    completed_at: string
    theta_history: ThetaHistoryItem[]
}

export interface QuestionIRT {
    id: string
    title: string
    question_text: string
    question_type: string
    skill_area: AdaptiveSkillArea
    difficulty_level?: string | null
    irt_discrimination: number
    irt_difficulty: number
    irt_guessing: number
    irt_calibrated: boolean
    irt_calibrated_at?: string | null
    is_cat_eligible: boolean
    usage_count: number
}

export interface UpdateQuestionIRTPayload {
    irt_discrimination: number
    irt_difficulty: number
    irt_guessing: number
    is_cat_eligible?: boolean
}

export interface CalibrationStats {
    total_questions: number
    calibrated_count: number
    cat_eligible_count: number
    calibration_rate: number
    reading: {
        total: number
        calibrated: number
    }
    listening: {
        total: number
        calibrated: number
    }
    avg_difficulty: number
    avg_discrimination: number
}

export interface PaginatedResult<T> {
    success: boolean
    data: T[]
    meta: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
}

export interface SessionResponseDetail {
    id: string
    item_position: number
    question_id: string
    question_title?: string | null
    irt_a_used: number
    irt_b_used: number
    irt_c_used: number
    is_correct: boolean
    time_spent_seconds?: number | null
}
