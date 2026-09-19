import { api } from './api'

export interface RecommendationTip {
    title: string
    description: string
}

export interface RecommendationData {
    title: string
    skill: string
    difficulty: string
    suggested_test_ids: string[]
    tips: string[]
    materials: any[]
    suggested_course?: {
        id: string
        name: string
        required_band: number
        target_band: number
        description: string
    }
}

export interface Milestone {
    month: number
    target_band: number
    target_cefr: string
    focus: string
}

export interface LearningPath {
    estimated_weeks: number
    milestones: Milestone[]
    narrative: string
}

export interface NudgeMessage {
    message: string
    days_inactive: number
    urgency: string
}

export interface RecommendationResponse {
    id: string
    student_id: string
    generated_at: string
    is_read: boolean
    skill_scores: Record<string, number>
    attendance_rate: number | null
    target_band: number | null
    target_cefr: string | null
    predicted_band: number | null
    predicted_cefr: string | null
    weakest_skill: string | null
    estimated_weeks: number | null
    recommendation_type: string
    recommendation_data: RecommendationData
    learning_path: LearningPath
    nudge: NudgeMessage | null
}

// 1. Get Today's Recommendation
export async function getTodayRecommendation(): Promise<RecommendationResponse> {
    return api<RecommendationResponse>('/api/v1/recommendations/today', {
        method: 'GET',
    })
}

// 2. Get Learning Path
export async function getLearningPath(): Promise<LearningPath> {
    return api<LearningPath>('/api/v1/recommendations/learning-path', {
        method: 'GET',
    })
}

export interface HistoryRecommendationLog {
    id: string
    generated_at: string | null
    recommendation_type: string
    is_read: boolean
    predicted_band: number | null
    target_band: number | null
    attendance_rate: number | null
    skill_scores: Record<string, number> | null
}

export async function getRecommendationHistory(): Promise<
    HistoryRecommendationLog[]
> {
    return api<HistoryRecommendationLog[]>(
        '/api/v1/recommendations/history?page=1&size=50',
        {
            method: 'GET',
        }
    )
}
