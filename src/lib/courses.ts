import { api } from '@/lib/api'

export type CourseLevel =
    | 'beginner'
    | 'elementary'
    | 'intermediate'
    | 'upper_intermediate'
    | 'advanced'
    | 'proficiency'
export type CourseStatus = 'active' | 'inactive' | 'archived'

export type BackendCourse = {
    id: string
    name: string
    description?: string | null
    fee_amount: number
    duration_hours: number
    level: CourseLevel
    status: CourseStatus
    created_at: string
    updated_at: string
}

export type Course = {
    id: string
    name: string
    description?: string | null
    feeAmount: number
    durationHours: number
    level: CourseLevel
    status: CourseStatus
    createdAt: string
    updatedAt: string
}

const mapCourse = (c: BackendCourse): Course => ({
    id: c.id,
    name: c.name,
    description: c.description ?? null,
    feeAmount: c.fee_amount,
    durationHours: c.duration_hours,
    level: c.level,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
})

const COURSES_API_URL = '/api/v1/courses/'

export interface ListCoursesParams {
    page?: number
    limit?: number
    search?: string
    level?: CourseLevel | ''
    status?: CourseStatus | ''
    sortBy?: 'name' | 'fee_amount' | 'created_at' | 'duration_hours'
    sortOrder?: 'asc' | 'desc'
    includeDeleted?: boolean
}

type PaginatedResponse<T> = {
    items: T[]
    total: number
    page: number
    size: number
    pages: number
}

export const listCourses = async (
    p: ListCoursesParams = {}
): Promise<PaginatedResponse<Course>> => {
    const {
        search = '',
        page = 1,
        limit = 10,
        sortBy,
        sortOrder = 'desc',
        level,
        status,
    } = p

    const qs = new URLSearchParams()
    qs.set('skip', '0')
    qs.set('limit', '1000')
    if (search) qs.set('search', search)

    const url = `${COURSES_API_URL}${qs.toString() ? `?${qs.toString()}` : ''}`
    const res = await api<any>(url, { method: 'GET' })

    const raw = res.items ?? (Array.isArray(res) ? res : [])
    let items = raw.map(mapCourse)

    if (level) {
        items = items.filter((c: Course) => c.level === level)
    }
    if (status) {
        items = items.filter((c: Course) => c.status === status)
    }

    if (sortBy) {
        items.sort((a: any, b: any) => {
            const field =
                sortBy === 'created_at'
                    ? 'createdAt'
                    : sortBy === 'fee_amount'
                      ? 'feeAmount'
                      : sortBy === 'duration_hours'
                        ? 'durationHours'
                        : sortBy

            const valA = a[field]
            const valB = b[field]

            if (sortOrder === 'asc') return valA > valB ? 1 : -1
            return valA < valB ? 1 : -1
        })
    }

    const total = items.length
    const startIndex = (page - 1) * limit
    const paginatedItems = items.slice(startIndex, startIndex + limit)

    return {
        items: paginatedItems,
        total,
        page,
        size: limit,
        pages: Math.ceil(total / limit),
    }
}

export type CreateCourseDto = {
    name: string
    description?: string | null
    fee_amount: number
    duration_hours: number
    level: CourseLevel
    status: CourseStatus
}

export async function createCourse(body: CreateCourseDto): Promise<Course> {
    const res = await api<BackendCourse>(COURSES_API_URL, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return mapCourse(res)
}

export type UpdateCourseDto = Partial<CreateCourseDto>

export async function updateCourse(
    id: string,
    body: UpdateCourseDto
): Promise<Course> {
    const res = await api<BackendCourse>(`${COURSES_API_URL}${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    return mapCourse(res)
}

export async function deleteCourse(id: string): Promise<void> {
    await api(`${COURSES_API_URL}${id}`, {
        method: 'DELETE',
    })
}
