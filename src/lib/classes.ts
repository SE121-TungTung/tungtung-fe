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
        limit = 10,
        search = '',
        status,
        courseId,
        teacherId,
        sortBy,
        sortDir = 'desc',
    } = params

    const queryParams = new URLSearchParams()
    queryParams.append('skip', '0')
    queryParams.append('limit', '1000')
    if (search) queryParams.append('search', search)

    const url = `${CLASSES_API_URL}?${queryParams.toString()}`
    const res = await api<any>(url, { method: 'GET' })

    const rawItems: BackendClass[] = res.items ?? (Array.isArray(res) ? res : [])
    let items = rawItems.map(mapClass)

    if (status) {
        items = items.filter((c) => c.status === status)
    }
    if (courseId) {
        items = items.filter((c) => c.course.id === courseId)
    }
    if (teacherId) {
        items = items.filter((c) => c.teacher.id === teacherId)
    }

    if (sortBy) {
        items.sort((a: any, b: any) => {
            const valA = a[sortBy] || ''
            const valB = b[sortBy] || ''
            if (sortDir === 'asc') return valA > valB ? 1 : -1
            return valA < valB ? 1 : -1
        })
    }

    const total = items.length
    const startIndex = (page - 1) * limit
    const paginatedItems = items.slice(startIndex, startIndex + limit)

    return {
        items: paginatedItems,
        total: total,
        page: page,
        size: limit,
        pages: Math.ceil(total / limit),
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
