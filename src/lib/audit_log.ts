import { api } from '@/lib/api'
import type {
    AuditLogListResponse,
    AuditLogFilters,
} from '@/types/audit_log.types'

const BASE_URL = '/api/v1/audit-logs'

export async function getAuditLogs(
    filters: AuditLogFilters = {}
): Promise<AuditLogListResponse> {
    const params = new URLSearchParams()

    // 1. Check token exists
    const token = localStorage.getItem('access_token')
    console.log('Token exists:', !!token)

    // 2. Decode token to check role
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('User:', payload)
        console.log(
            'Role:',
            payload.role || payload.user_role || 'NO ROLE FIELD'
        )
    }

    // Pagination (translate skip + limit to page + limit)
    const limit = filters.limit ?? 20
    const page =
        filters.skip !== undefined ? Math.floor(filters.skip / limit) + 1 : 1
    params.set('page', String(page))
    params.set('limit', String(limit))

    // Filters
    if (filters.user_id) params.set('user_id', filters.user_id)
    if (filters.action) params.set('action', filters.action)
    if (filters.table_name) params.set('table_name', filters.table_name)
    if (filters.record_id) params.set('record_id', filters.record_id)
    if (filters.success !== undefined)
        params.set('success', String(filters.success))
    if (filters.search) params.set('search', filters.search)

    const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL

    return api<AuditLogListResponse>(url, {
        method: 'GET',
        credentials: 'include',
    })
}
