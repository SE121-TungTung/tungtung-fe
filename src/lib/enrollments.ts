import { api } from '@/lib/api'

const ENROLLMENTS_API_URL = '/api/v1/classenrollments'

export type EnrollmentStatus =
    'active' | 'completed' | 'dropped' | 'suspended' | 'transferred'

export type ClassEnrollment = {
    id: string
    class_id: string
    student_id: string
    enrollment_date: string
    fee_paid: number
    payment_status: 'pending' | 'paid' | 'partial' | 'refunded' | 'overdue'
    status: EnrollmentStatus
    completion_date?: string | null
    final_grade?: number | null
    attendance_rate: number
    notes?: string | null
    created_at: string
    updated_at: string
    student_name?: string
    class_name?: string
}

export type EnrollmentResponse = ClassEnrollment

export interface ListEnrollmentsParams {
    class_id?: string
    student_id?: string
    status?: EnrollmentStatus | ''
    page?: number
    limit?: number
}

type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    meta: {
        total: number
        page: number
        limit: number
        total_pages: number
    }
    message?: string
}

export const getEnrollments = async (
    params: ListEnrollmentsParams = {}
): Promise<PaginatedResponse<ClassEnrollment>> => {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.class_id) queryParams.append('class_id', params.class_id)
    if (params.student_id) queryParams.append('student_id', params.student_id)
    if (params.status) queryParams.append('status', params.status)

    const url = `${ENROLLMENTS_API_URL}?${queryParams.toString()}`
    // The backend returns the paginated response object directly
    return await api<PaginatedResponse<ClassEnrollment>>(url, { method: 'GET' })
}

export type CreateEnrollmentDto = {
    class_id: string
    student_id: string
    fee_paid?: number
    payment_status?: string
    status?: string
    notes?: string
}

export const createEnrollment = async (
    body: CreateEnrollmentDto
): Promise<ClassEnrollment> => {
    // Note: the generic CRUD router returns { success, data, message } or similar.
    // api() wrapper extracts `data` if it exists, or returns the whole json.
    const res = await api<any>(`${ENROLLMENTS_API_URL}/`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return res.data || res
}

export type UpdateEnrollmentDto = Partial<CreateEnrollmentDto> & {
    completion_date?: string | null
    final_grade?: number | null
    attendance_rate?: number
}

export const updateEnrollment = async (
    id: string,
    body: UpdateEnrollmentDto
): Promise<ClassEnrollment> => {
    const res = await api<any>(`${ENROLLMENTS_API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    return res.data || res
}
