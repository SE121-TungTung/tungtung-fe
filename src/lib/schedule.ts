import { api } from './api'
import type {
    ScheduleGenerateRequest,
    ScheduleApplyRequest,
    WeeklyScheduleFilter,
    ScheduleGenerateResponse,
} from '@/types/schedule.types'

export const scheduleApi = {
    getWeekly: async (params: WeeklyScheduleFilter) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value))
            }
        })

        const res = await api<any>(
            `/api/v1/schedule/weekly?${searchParams.toString()}`,
            {
                method: 'GET',
            }
        )

        if (Array.isArray(res)) return res
        if (Array.isArray(res?.data)) return res.data
        if (Array.isArray(res?.sessions)) return res.sessions
        return []
    },

    generateDraft: async (data: ScheduleGenerateRequest) => {
        const res = await api<ScheduleGenerateResponse>(
            '/api/v1/schedule/generate',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        )
        return res
    },

    applySchedule: async (data: ScheduleApplyRequest) => {
        return api<any>('/api/v1/schedule/apply', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },
}
