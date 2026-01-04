import { api } from '@/lib/api'

export type ClassStatus =
    | 'scheduled'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'postponed'

export type BackendClass = {
    id: string
    name: string
    course_id: string
    teacher_id: string
    substitute_teacher_id?: string | null
    room_id: string
    status: ClassStatus
    start_date: string
    end_date: string
    schedule: any
    max_students: number
    current_students: number
    fee_amount?: number | string | null
    sessions_per_week?: number | null
    notes?: string | null
    created_at: string
    updated_at: string
    deleted_at?: string | null
    created_by?: string
    updated_by?: string
    course_name?: string
    teacher_name?: string
    room_name?: string
}

export type Class = {
    id: string
    name: string
    course: { id: string; name: string }
    teacher: { id: string; name: string }
    room: { id: string; name: string }
    status: ClassStatus
    startDate: string
    endDate: string
    scheduleDefinition: any
    maxStudents: number
    currentStudents: number
    feeAmount?: number | null
    sessionsPerWeek?: number | null
    notes?: string | null
    createdAt: string
    updatedAt: string
}

const mapClass = (c: BackendClass): Class => ({
    id: c.id,
    name: c.name,
    course: { id: c.course_id, name: c.course_name || c.course_id },
    teacher: { id: c.teacher_id, name: c.teacher_name || c.teacher_id },
    room: { id: c.room_id, name: c.room_name || c.room_id },
    status: c.status,
    startDate: c.start_date ? c.start_date.split('T')[0] : '',
    endDate: c.end_date ? c.end_date.split('T')[0] : '',
    scheduleDefinition: c.schedule,
    maxStudents: c.max_students,
    currentStudents: c.current_students,
    feeAmount: c.fee_amount ? Number(c.fee_amount) : null,
    sessionsPerWeek: c.sessions_per_week,
    notes: c.notes,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
})

const CLASSES_API_URL = '/api/v1/classes'

export interface ListClassesParams {
    page?: number
    limit?: number
    search?: string
    status?: ClassStatus | ''
    courseId?: string
    teacherId?: string
    sortBy?: string
    sortDir?: string
}

type PaginatedResponse<T> = {
    items: T[]
    total: number
    page: number
    size: number
    pages: number
    has_next?: boolean
    has_prev?: boolean
}

export const listClasses = async (
    params: ListClassesParams = {}
): Promise<PaginatedResponse<Class>> => {
    const {
        page = 1,
        limit = 100,
        search,
        status,
        courseId,
        teacherId,
        sortBy,
        sortDir,
    } = params

    const queryParams = new URLSearchParams()
    queryParams.append('skip', String((page - 1) * limit))
    queryParams.append('limit', String(limit))

    if (search) queryParams.append('search', search)
    if (sortBy) queryParams.append('sort_by', sortBy)
    if (sortDir) queryParams.append('sort_order', sortDir)
    if (status) queryParams.append('status', status)
    if (courseId) queryParams.append('course_id', courseId)
    if (teacherId) queryParams.append('teacher_id', teacherId)

    const url = `${CLASSES_API_URL}?${queryParams.toString()}`

    const res = await api<any>(url, {
        method: 'GET',
    })

    let rawItems: BackendClass[] = []
    let total = 0
    let totalPages = 1

    if (Array.isArray(res)) {
        rawItems = res
        total = res.length
        totalPages = Math.ceil(total / limit) || 1
    } else if (res.items && Array.isArray(res.items)) {
        rawItems = res.items
        total = res.total ?? rawItems.length
        totalPages = res.pages ?? Math.ceil(total / limit)
    } else if (res.data && Array.isArray(res.data)) {
        rawItems = res.data
        total = res.total ?? rawItems.length
    }

    return {
        items: rawItems.map(mapClass),
        total: total,
        page: res.page ?? page,
        size: res.size ?? limit,
        pages: totalPages,
    }
}

export type CreateClassDto = {
    name: string
    course_id: string
    teacher_id: string
    substitute_teacher_id?: string | null
    room_id: string
    status: ClassStatus
    start_date: string
    end_date: string
    schedule: any
    max_students: number
    current_students?: number
    fee_amount?: string | null
    sessions_per_week?: number | null
    notes?: string | null
}

export async function createClass(body: CreateClassDto): Promise<Class> {
    const res = await api<BackendClass>(`${CLASSES_API_URL}/`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return mapClass(res)
}

export type UpdateClassDto = Partial<CreateClassDto>

export async function updateClass(
    id: string,
    body: UpdateClassDto
): Promise<Class> {
    const res = await api<BackendClass>(`${CLASSES_API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    })
    return mapClass(res)
}

export async function deleteClass(id: string): Promise<void> {
    await api(`${CLASSES_API_URL}/${id}`, {
        method: 'DELETE',
    })
}

export async function getClass(id: string): Promise<Class> {
    const res = await api<BackendClass>(`${CLASSES_API_URL}/${id}`, {
        method: 'GET',
    })
    return mapClass(res)
}

export async function getTeacherClasses(): Promise<Class[]> {
    const res = await api<BackendClass[]>(`/api/v1/teacher/classes`, {
        method: 'GET',
    })
    return res.map(mapClass)
}
