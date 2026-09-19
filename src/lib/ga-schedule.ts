import { api } from './api'
import type {
    GAScheduleRequest,
    GARunResponse,
    GARunDetailResponse,
    GAApplyResponse,
    GAPaginationResponse,
    TeacherUnavailabilityCreate,
    TeacherUnavailabilityResponse,
    AIAnalyzeRequest,
    AIAnalyzeResponse,
} from '@/types/ga-schedule.types'

const BASE = '/api/v1/schedule/ga'

// ============================================================================
// GA Run Endpoints
// ============================================================================

/** Khởi chạy GA → trả run_id ngay (HTTP 202) */
export const runGA = (request: GAScheduleRequest): Promise<GARunResponse> =>
    api<GARunResponse>(`${BASE}/run`, {
        method: 'POST',
        body: JSON.stringify(request),
    })

/** Lịch sử các lần chạy GA (phân trang) */
export const getRunHistory = (
    page: number = 1,
    limit: number = 20
): Promise<GAPaginationResponse<GARunResponse>> =>
    api<GAPaginationResponse<GARunResponse>>(
        `${BASE}/runs?page=${page}&limit=${limit}`
    )

/** Chi tiết kết quả GA run (sessions + conflicts + stats) */
export const getRunDetail = (runId: string): Promise<GARunDetailResponse> =>
    api<GARunDetailResponse>(`${BASE}/runs/${runId}`)

/** Admin xác nhận & áp dụng GA proposal → tạo ClassSession thật */
export const applyProposal = (runId: string): Promise<GAApplyResponse> =>
    api<GAApplyResponse>(`${BASE}/runs/${runId}/apply`, { method: 'POST' })

/** Xóa GA run (soft delete) */
export const deleteRun = (
    runId: string
): Promise<{ success: boolean; message: string }> =>
    api<{ success: boolean; message: string }>(`${BASE}/runs/${runId}`, {
        method: 'DELETE',
    })

// ============================================================================
// AI Analyze Constraints
// ============================================================================

/** Gửi yêu cầu ngôn ngữ tự nhiên → AI phân tích ra ràng buộc GA */
export const analyzeConstraints = (
    request: AIAnalyzeRequest
): Promise<AIAnalyzeResponse> =>
    api<AIAnalyzeResponse>(`${BASE}/analyze-constraints`, {
        method: 'POST',
        body: JSON.stringify(request),
    })

// ============================================================================
// Teacher Unavailability Endpoints
// ============================================================================

/** Thêm lịch bận giáo viên */
export const createTeacherUnavailability = (
    data: TeacherUnavailabilityCreate
): Promise<TeacherUnavailabilityResponse> =>
    api<TeacherUnavailabilityResponse>(`${BASE}/teacher-unavailability`, {
        method: 'POST',
        body: JSON.stringify(data),
    })

/** Danh sách lịch bận (phân trang, lọc theo teacher) */
export const getTeacherUnavailability = (
    teacherId?: string,
    page: number = 1,
    limit: number = 50
): Promise<GAPaginationResponse<TeacherUnavailabilityResponse>> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    })
    if (teacherId) params.set('teacher_id', teacherId)
    return api<GAPaginationResponse<TeacherUnavailabilityResponse>>(
        `${BASE}/teacher-unavailability?${params.toString()}`
    )
}

/** Xóa lịch bận */
export const deleteTeacherUnavailability = (
    recordId: string
): Promise<{ success: boolean; message: string }> =>
    api<{ success: boolean; message: string }>(
        `${BASE}/teacher-unavailability/${recordId}`,
        { method: 'DELETE' }
    )
