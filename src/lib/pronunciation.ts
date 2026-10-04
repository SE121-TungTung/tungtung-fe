import { api } from './api'
import type {
    PronunciationPracticeResponse,
    PronunciationPracticeListItem,
    PronunciationStatsResponse,
    PronunciationStreakResponse,
    TargetType,
} from '@/types/pronunciation.types'

/**
 * Gửi file ghi âm của học viên lên API backend để phân tích phát âm qua AI.
 * Sử dụng FormData để gửi file binary mà không set Content-Type thủ công.
 */
export async function submitPronunciationPractice(
    audioBlob: Blob,
    target: string,
    targetType: TargetType,
    accent: 'US' | 'UK' = 'US'
): Promise<PronunciationPracticeResponse> {
    const formData = new FormData()
    // Đặt tên file là practice.webm hoặc audio file phù hợp
    formData.append('audio', audioBlob, 'practice.webm')
    formData.append('target', target)
    formData.append('target_type', targetType)
    formData.append('accent', accent)

    return api<PronunciationPracticeResponse>(
        '/api/v1/pronunciation/practices',
        {
            method: 'POST',
            body: formData,
        }
    )
}

/**
 * Lấy lịch sử các lượt luyện phát âm của học viên hiện tại.
 */
export async function getPronunciationHistory(params?: {
    page?: number
    limit?: number
    target_type?: TargetType
}): Promise<{
    items: PronunciationPracticeListItem[]
    total: number
    page: number
    limit: number
}> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.target_type) query.set('target_type', params.target_type)

    const queryString = query.toString()
    const path = `/api/v1/pronunciation/practices${queryString ? `?${queryString}` : ''}`

    return api<{
        items: PronunciationPracticeListItem[]
        total: number
        page: number
        limit: number
    }>(path, {
        method: 'GET',
    })
}

/**
 * Lấy thông tin chi tiết một lượt luyện phát âm cụ thể.
 */
export async function getPronunciationDetail(
    id: string
): Promise<PronunciationPracticeResponse> {
    return api<PronunciationPracticeResponse>(
        `/api/v1/pronunciation/practices/${id}`,
        {
            method: 'GET',
        }
    )
}

/**
 * Lấy dữ liệu thống kê tổng hợp phát âm (điểm TB, âm yếu, xu hướng gần đây).
 */
export async function getPronunciationStats(): Promise<PronunciationStatsResponse> {
    return api<PronunciationStatsResponse>(
        '/api/v1/pronunciation/practices/stats',
        {
            method: 'GET',
        }
    )
}

/**
 * Lấy thông tin chuỗi ngày luyện tập liên tục (streak).
 */
export async function getPronunciationStreak(): Promise<PronunciationStreakResponse> {
    return api<PronunciationStreakResponse>(
        '/api/v1/pronunciation/practices/streak',
        {
            method: 'GET',
        }
    )
}

/**
 * Lấy danh sách 5 từ/câu gợi ý luyện phát âm theo chủ đề IELTS (Drill Mode).
 */
export async function getDrillSuggestions(
    topic: string
): Promise<{ topic: string; items: string[] }> {
    return api<{ topic: string; items: string[] }>(
        `/api/v1/pronunciation/drill-suggestions?topic=${encodeURIComponent(topic)}`,
        {
            method: 'GET',
        }
    )
}

// ── Phase 2: Assessment + Mastery + Missions ──────────────

/**
 * Lấy danh sách items cho Placement Test (8 từ + 2 câu).
 */
export async function getAssessmentItems(): Promise<{
    items: {
        target_text: string
        target_type: string
        ipa?: string
        phonemes?: string[]
    }[]
    total: number
}> {
    return api('/api/v1/pronunciation/assessment/items', { method: 'GET' })
}

/**
 * Nộp kết quả Placement Test.
 */
export async function submitAssessment(
    items: {
        target_text: string
        target_type: string
        overall_score: number
        phoneme_results?: unknown[]
    }[]
): Promise<{
    id: string
    cefr_level: string
    ielts_band_estimate: number
    weak_phonemes: string[]
    strong_phonemes: string[]
    retake_count: number
}> {
    return api('/api/v1/pronunciation/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
    })
}

/**
 * Lấy kết quả placement test gần nhất.
 */
export async function getLatestAssessment(): Promise<{
    id: string
    cefr_level: string
    ielts_band_estimate: number
    weak_phonemes: string[]
    strong_phonemes: string[]
    retake_count: number
} | null> {
    return api('/api/v1/pronunciation/assessment/latest', { method: 'GET' })
}

/**
 * Lấy daily missions cá nhân hóa.
 */
export interface MissionItem {
    mission_id: string
    type: 'review' | 'weak_practice' | 'new_phoneme' | 'sentence'
    label: string
    description: string
    target_text: string
    target_type: string
    phoneme: string | null
    priority: number
    completed: boolean
}

export async function getDailyMissions(): Promise<{
    date: string
    missions: MissionItem[]
    total_missions: number
    completed_count: number
    streak_bonus: boolean
}> {
    return api('/api/v1/pronunciation/missions/today', { method: 'GET' })
}

/**
 * Lấy phoneme mastery map (44 phonemes + status).
 */
export interface PhonemeMasteryItem {
    phoneme: string
    mastery_level: number
    avg_score: number | null
    total_attempts: number
    status: 'unseen' | 'learning' | 'familiar' | 'practiced' | 'mastered'
}

export async function getMasteryMap(): Promise<{
    phonemes: PhonemeMasteryItem[]
}> {
    return api('/api/v1/pronunciation/mastery/map', { method: 'GET' })
}

/**
 * Lấy mastery summary cho Radar Chart.
 */
export async function getMasterySummary(): Promise<{
    categories: Record<
        string,
        { avg_mastery: number; practiced_count: number; total_phonemes: number }
    >
    total_mastered: number
    total_learning: number
    total_unseen: number
    due_for_review_count: number
}> {
    return api('/api/v1/pronunciation/mastery/summary', { method: 'GET' })
}
