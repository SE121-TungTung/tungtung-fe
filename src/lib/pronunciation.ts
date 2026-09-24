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
    targetType: TargetType
): Promise<PronunciationPracticeResponse> {
    const formData = new FormData()
    // Đặt tên file là practice.webm hoặc audio file phù hợp
    formData.append('audio', audioBlob, 'practice.webm')
    formData.append('target', target)
    formData.append('target_type', targetType)

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
