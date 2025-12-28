import { api } from './api'
import type {
    ScheduleGenerateRequest,
    ScheduleGenerateResponse,
    ScheduleApplyRequest,
    ScheduleApplyResponse,
    WeeklyScheduleFilter,
    WeeklyScheduleResponse,
    SessionCreateRequest,
    SessionUpdateRequest,
    SessionResponse,
    SessionDeleteResponse,
} from '@/types/schedule.types'

// ----------------------------------------------------------------------------
// Schedule API Service
// ----------------------------------------------------------------------------
export const scheduleApi = {
    // ========================================================================
    // 1. GENERATE SCHEDULE (AI Auto-scheduling)
    // ========================================================================
    /**
     * Tạo đề xuất lịch học tự động
     * POST /api/v1/schedule/generate
     *
     * @param data - Request với date range, class_ids, constraints
     * @returns Proposal với successful sessions và conflicts
     * @throws 400 - No active classes found
     * @throws 409 - Cannot fulfill target sessions
     */
    generateDraft: async (
        data: ScheduleGenerateRequest
    ): Promise<ScheduleGenerateResponse> => {
        return api<ScheduleGenerateResponse>('/api/v1/schedule/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    // ========================================================================
    // 2. APPLY SCHEDULE PROPOSAL
    // ========================================================================
    /**
     * Admin xác nhận và lưu proposal vào DB
     * POST /api/v1/schedule/apply
     *
     * @param proposal - Copy toàn bộ response từ generateDraft
     * @returns Success message với số lượng sessions đã tạo
     * @throws 500 - Failed to apply schedule
     */
    applySchedule: async (
        proposal: ScheduleApplyRequest
    ): Promise<ScheduleApplyResponse> => {
        return api<ScheduleApplyResponse>('/api/v1/schedule/apply', {
            method: 'POST',
            body: JSON.stringify(proposal),
        })
    },

    // ========================================================================
    // 3. GET WEEKLY SCHEDULE VIEW
    // ========================================================================
    /**
     * Lấy thời khóa biểu theo tuần
     * GET /api/v1/schedule/weekly
     *
     * @param params - Filter: date range, class_id, user_id
     * @returns Array of weekly sessions
     */
    getWeekly: async (
        params: WeeklyScheduleFilter
    ): Promise<WeeklyScheduleResponse> => {
        const searchParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value))
            }
        })

        const res = await api<any>(
            `/api/v1/schedule/weekly?${searchParams.toString()}`,
            { method: 'GET' }
        )

        // Handle different response formats from backend
        if (Array.isArray(res)) {
            return { schedule: res }
        }
        if (res?.schedule && Array.isArray(res.schedule)) {
            return res
        }
        if (res?.data && Array.isArray(res.data)) {
            return { schedule: res.data }
        }

        return { schedule: [] }
    },

    // ========================================================================
    // 4. CREATE SESSION MANUAL
    // ========================================================================
    /**
     * Tạo buổi học thủ công với conflict check
     * POST /api/v1/schedule/sessions
     *
     * @param data - Session data (class_id, date, time_slots...)
     * @returns Created session with full details
     * @throws 404 - Class not found
     * @throws 409 - Teacher/Room conflict
     */
    createSession: async (
        data: SessionCreateRequest
    ): Promise<SessionResponse> => {
        return api<SessionResponse>('/api/v1/schedule/sessions', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    // ========================================================================
    // 5. UPDATE SESSION
    // ========================================================================
    /**
     * Cập nhật buổi học (reschedule, change room, substitute teacher)
     * PUT /api/v1/schedule/sessions/{session_id}
     *
     * @param sessionId - UUID của session cần update
     * @param data - Các field cần update (all optional)
     * @returns Updated session details
     * @throws 404 - Session not found
     * @throws 409 - Teacher/Room conflict
     */
    updateSession: async (
        sessionId: string,
        data: SessionUpdateRequest
    ): Promise<SessionResponse> => {
        return api<SessionResponse>(`/api/v1/schedule/sessions/${sessionId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    // ========================================================================
    // 6. DELETE SESSION (Cancel)
    // ========================================================================
    /**
     * Soft delete session - đánh dấu 'cancelled'
     * DELETE /api/v1/schedule/sessions/{session_id}
     *
     * @param sessionId - UUID của session cần cancel
     * @returns Success message
     * @throws 404 - Session not found
     */
    deleteSession: async (
        sessionId: string
    ): Promise<SessionDeleteResponse> => {
        return api<SessionDeleteResponse>(
            `/api/v1/schedule/sessions/${sessionId}`,
            {
                method: 'DELETE',
            }
        )
    },

    // ========================================================================
    // 7. UTILITY FUNCTIONS
    // ========================================================================

    /**
     * Get current week date range (Monday - Sunday)
     */
    getCurrentWeekRange: (): { start_date: string; end_date: string } => {
        const today = new Date()
        const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday...
        const monday = new Date(today)
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

        const sunday = new Date(monday)
        sunday.setDate(monday.getDate() + 6)

        return {
            start_date: monday.toISOString().split('T')[0],
            end_date: sunday.toISOString().split('T')[0],
        }
    },

    /**
     * Format time slots to readable string
     * Example: [1, 2] => "Tiết 1-2 (08:00 - 11:15)"
     */
    formatTimeSlots: (slots: number[]): string => {
        if (!slots || slots.length === 0) return ''

        const sorted = [...slots].sort((a, b) => a - b)
        const first = sorted[0]
        const last = sorted[sorted.length - 1]

        // Import SYSTEM_TIME_SLOTS từ types
        const firstSlot = first // Simplified - trong thực tế cần map với SYSTEM_TIME_SLOTS
        const lastSlot = last

        if (first === last) {
            return `Tiết ${first}`
        }
        return `Tiết ${first}-${last}`
    },

    /**
     * Validate date range
     */
    validateDateRange: (startDate: string, endDate: string): boolean => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        return start <= end
    },

    /**
     * Check if session time overlaps
     */
    hasTimeOverlap: (slots1: number[], slots2: number[]): boolean => {
        const set1 = new Set(slots1)
        return slots2.some((slot) => set1.has(slot))
    },
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================
export default scheduleApi
