import { api } from './api'
import type {
    PronunciationPracticeResponse,
    PronunciationPracticeListItem,
    PronunciationStatsResponse,
    PronunciationStreakResponse,
    TargetType,
    PronunciationWordListItem,
    PronunciationWordListResponse,
    WordListAddPayload,
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
    // Backend chỉ hỗ trợ word | phrase | sentence | ipa — 'paragraph' quy về 'sentence'
    formData.append(
        'target_type',
        targetType === 'paragraph' ? 'sentence' : targetType
    )
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

// ── IPA từ điển + bộ luyện tập do AI sinh ──────────────

export interface IpaLookupItem {
    text: string
    ipa_us: string | null
    ipa_uk: string | null
    source: 'cache' | 'dictionary' | 'ai' | 'none'
}

/** Tra IPA US/UK cho danh sách từ/câu (tối đa 20). */
export async function lookupIpaBatch(
    texts: string[]
): Promise<IpaLookupItem[]> {
    const res = await api<{ items: IpaLookupItem[] }>(
        '/api/v1/dictionary/ipa',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts }),
        }
    )
    return res.items
}

export type PracticeSetKind = 'roadmap' | 'phoneme' | 'drill'

export interface PracticeSetItem {
    id: string
    text: string
    target_type: 'word' | 'phrase' | 'sentence'
    ipa_us: string | null
    ipa_uk: string | null
    hint: string | null
}

export interface PracticeSetPayload {
    kind: PracticeSetKind
    level?: number
    phoneme?: string
    topic?: string
    count?: number
    exclude?: string[]
}

export interface PracticeSetResult {
    kind: PracticeSetKind
    context_key: string
    items: PracticeSetItem[]
    generated_new: number
    from_pool: number
}

/** Sinh (hoặc lấy từ kho dùng chung) một bộ từ luyện phát âm mới. */
export async function generatePracticeSet(
    payload: PracticeSetPayload
): Promise<PracticeSetResult> {
    return api<PracticeSetResult>(
        '/api/v1/pronunciation/practice-sets/generate',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }
    )
}

export interface DrillTopic {
    key: string
    label: string
}

export async function getDrillTopics(): Promise<DrillTopic[]> {
    const res = await api<{ topics: DrillTopic[] }>(
        '/api/v1/pronunciation/drill-topics',
        { method: 'GET' }
    )
    return res.topics
}

// ── Word List (liên kết Flashcard <-> Pronunciation) ──────────────

/**
 * Lấy danh sách từ/câu luyện phát âm cá nhân (kèm điểm luyện tập).
 */
export async function getPronunciationWordList(): Promise<PronunciationWordListResponse> {
    return api<PronunciationWordListResponse>(
        '/api/v1/pronunciation/word-list',
        { method: 'GET' }
    )
}

/**
 * Thêm từ/câu hoặc thẻ flashcard vào danh sách luyện phát âm (idempotent).
 */
export async function addToPronunciationWordList(
    payload: WordListAddPayload
): Promise<PronunciationWordListItem> {
    return api<PronunciationWordListItem>('/api/v1/pronunciation/word-list', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Xóa một mục khỏi danh sách luyện phát âm.
 */
export async function removeFromPronunciationWordList(
    itemId: string
): Promise<void> {
    await api<null>(`/api/v1/pronunciation/word-list/${itemId}`, {
        method: 'DELETE',
    })
}

/** Tạo deep link tới trang luyện phát âm cho một từ/câu. */
export function buildPracticeLink(
    text: string,
    type: 'word' | 'phrase' | 'sentence' = 'word'
): string {
    const qs = new URLSearchParams({ text, type })
    return `/student/pronunciation?${qs.toString()}`
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
