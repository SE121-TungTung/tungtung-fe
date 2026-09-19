import { api } from './api'

export interface PublicCourse {
    id: string
    name: string
    description?: string
    level: string
    course_type: string
    duration_hours: number
    fee_amount: number
    currency: string
}

export interface PublicClass {
    id: string
    name: string
    course_id: string
    course_name: string
    course_level: string
    start_date: string
    end_date: string
    sessions_per_week: number
    is_online: boolean
    fee_amount: number
    max_students: number
    current_students: number
    available_spots: number
}

export interface PublicLeadPayload {
    full_name: string
    email: string
    phone: string
    target_band?: string
    intent?: string
}

export const publicApi = {
    getCourses: async () => {
        const res = await api<PublicCourse[]>('/api/v1/public/courses', {
            method: 'GET',
        })
        return res || []
    },

    getClasses: async () => {
        const res = await api<PublicClass[]>('/api/v1/public/classes/open', {
            method: 'GET',
        })
        return res || []
    },

    submitLead: async (payload: PublicLeadPayload) => {
        const res = await api<{ success: boolean; message: string; data: any }>(
            '/api/v1/public/leads',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        )
        return res
    },

    chatbotAsk: async (message: string, history: any[] = []) => {
        const res = await api<{ success: boolean; data: any }>(
            '/api/v1/public/chatbot/ask',
            {
                method: 'POST',
                body: JSON.stringify({ message, history }),
            }
        )
        return res.data
    },
}
