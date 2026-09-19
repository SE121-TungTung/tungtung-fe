import { API, getAccessToken } from './api'

export interface Lead {
    id: string
    full_name: string
    email: string
    phone: string | null
    source: string | null
    status: 'new' | 'contacted' | 'converted' | 'lost'
    target_band: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface PaginationResponse<T> {
    data: T[]
    meta: {
        total: number
        page: number
        limit: number
        total_pages: number
    }
}

export interface GetLeadsParams {
    page?: number
    limit?: number
    status?: string
    search?: string
}

export const leadsApi = {
    getLeads: async (params: GetLeadsParams): Promise<PaginationResponse<Lead>> => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.status) queryParams.append('status', params.status)
        if (params.search) queryParams.append('search', params.search)

        const res = await fetch(`${API}/api/v1/leads?${queryParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`
            }
        })
        if (!res.ok) {
            if (res.status === 403) throw new Error('FORBIDDEN')
            throw new Error('Failed to fetch leads')
        }
        const responseData = await res.json()
        return responseData
    },

    updateLeadStatus: async (id: string, status: string, notes?: string): Promise<Lead> => {
        const res = await fetch(`${API}/api/v1/leads/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAccessToken()}`
            },
            body: JSON.stringify({ status, notes })
        })
        if (!res.ok) {
            if (res.status === 403) throw new Error('FORBIDDEN')
            throw new Error('Failed to update lead')
        }
        const data = await res.json()
        return data.data
    }
}
