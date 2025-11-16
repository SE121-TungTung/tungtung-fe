import { api } from './api'
import type { User, Role } from '@/types/auth'

export type CreateUserPayload = {
    email: string
    first_name: string
    last_name: string
    phone?: string
    date_of_birth?: string
    address?: string
    role:
        | Role
        | 'student'
        | 'teacher'
        | 'office_admin'
        | 'center_admin'
        | 'system_admin'
}

export async function createUser(
    body: CreateUserPayload,
    opts?: { defaultClassId?: string | null }
) {
    const qs = new URLSearchParams()
    if (opts?.defaultClassId) qs.set('default_class_id', opts.defaultClassId)
    const path = `/api/v1/users/${qs.toString() ? `?${qs}` : ''}`
    return api<User>(path, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export type UpdateUserPayload = {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    emergency_contact?: Record<string, unknown>
    preferences?: Record<string, unknown>
}

export async function updateUser(userId: string, body: UpdateUserPayload) {
    const wrappedBody = {
        user_update: body,
    }

    const res = await api<BackendUser>(`/api/v1/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(wrappedBody),
    })
    return mapUser(res)
}

export async function deleteUser(userId: string) {
    return api<string>(`/api/v1/users/${userId}`, { method: 'DELETE' })
}

export type UpdateMePayload = {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    emergency_contact?: Record<string, unknown>
    preferences?: Record<string, unknown>
    avatar_file?: File | null
}

export async function updateMe(body: UpdateMePayload) {
    const fd = new FormData()

    if (body.first_name !== undefined)
        fd.append('first_name', body.first_name || '')
    if (body.last_name !== undefined)
        fd.append('last_name', body.last_name || '')
    if (body.phone !== undefined) fd.append('phone', body.phone || '')
    if (body.address !== undefined) fd.append('address', body.address || '')
    if (body.emergency_contact !== undefined)
        fd.append('emergency_contact', JSON.stringify(body.emergency_contact))
    if (body.preferences !== undefined)
        fd.append('preferences', JSON.stringify(body.preferences))

    if (body.avatar_file !== undefined) {
        if (body.avatar_file) {
            fd.append('avatar_file', body.avatar_file)
        } else {
            fd.append('avatar_file', new Blob([]), '')
        }
    }

    const res = await api<BackendUser>(`/api/v1/users/me`, {
        method: 'PUT',
        body: fd,
    })
    return mapUser(res)
}

export type ChangePasswordPayload = {
    current_password: string
    new_password: string
}

export async function changePassword(body: ChangePasswordPayload) {
    return api<string>(`/api/v1/users/me/change-password`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export interface MyClassStudent {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
}

export interface MyClassTeacher {
    id: string
    full_name: string
    email: string
    avatar_url?: string
}

export interface MyClass {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
    max_students: number
    current_students: number
    teacher?: MyClassTeacher
    students?: MyClassStudent[]
}

export async function getMyClasses(): Promise<MyClass[]> {
    const data = await api<MyClass[] | { classes: MyClass[] }>(
        '/api/v1/users/me/classes',
        {
            method: 'GET',
        }
    )
    return Array.isArray(data) ? data : data.classes || []
}

export type ListClassesParams = {
    skip?: number
    limit?: number
    sort_by?: string | null
    sort_order?: 'asc' | 'desc'
    search?: string | null
    include_deleted?: boolean
}

export type ClassItem = {
    id: string
    name: string
    course_id: string
    teacher_id: string | null
    substitute_teacher_id: string | null
    room_id: string | null
    start_date: string
    end_date: string
    schedule?: Record<string, unknown>
    max_students: number
    current_students: number
    fee_amount?: string
    sessions_per_week?: number
    status: 'scheduled' | 'ongoing' | 'completed' | string
    notes?: string
    created_at: string
    updated_at: string
    deleted_at?: string | null
    created_by?: string
    updated_by?: string
}

export type ListClassesResponse = {
    total: number
    page: number
    size: number
    pages: number
    has_next: boolean
    has_prev: boolean
    items: ClassItem[]
}

export async function listClasses(params: ListClassesParams = {}) {
    const qs = new URLSearchParams()
    if (params.skip != null) qs.set('skip', String(params.skip))
    if (params.limit != null) qs.set('limit', String(params.limit))
    if (params.sort_by != null) qs.set('sort_by', params.sort_by ?? '')
    if (params.sort_order) qs.set('sort_order', params.sort_order)
    if (params.search != null) qs.set('search', params.search ?? '')
    if (typeof params.include_deleted === 'boolean') {
        qs.set('include_deleted', String(params.include_deleted))
    }
    const path = `/api/v1/classes/${qs.toString() ? `?${qs}` : ''}`
    return api<ListClassesResponse>(path, { method: 'GET' })
}

export type ListUsersParams = {
    role?: Role | null
    search?: string | null
    skip?: number
    limit?: number
    include_deleted?: boolean
}

type BackendUser = {
    id: string
    email: string
    first_name: string
    last_name: string
    phone?: string | null
    date_of_birth?: string | null
    address?: string | null
    role: Role
    status: 'active' | 'inactive' | 'suspended' | string
    avatar_url?: string | null
    last_login?: string | null
    created_at: string
    updated_at: string
    is_first_login?: boolean | null
    deleted_at?: string | null
}

export type ListUsersResponse = {
    users: BackendUser[]
    total: number
    page: number
    size: number
    pages: number
}

const mapUser = (u: BackendUser): User => ({
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    phone: u.phone ?? '',
    dateOfBirth: u.date_of_birth ?? '',
    address: u.address ?? '',
    role: u.role,
    status: u.status as User['status'],
    avatarUrl: u.avatar_url ?? '',
    lastLogin: u.last_login ?? '',
    createdAt: u.created_at,
    updatedAt: u.updated_at,
    isFirstLogin: !!u.is_first_login,
})

export async function listUsers(params: ListUsersParams = {}) {
    const qs = new URLSearchParams()
    if (params.role) qs.set('role', params.role)
    if (params.search != null) qs.set('search', params.search ?? '')
    if (params.skip != null) qs.set('skip', String(params.skip))
    if (params.limit != null) qs.set('limit', String(params.limit))
    if (typeof params.include_deleted === 'boolean') {
        qs.set('include_deleted', String(params.include_deleted))
    } else {
        qs.set('include_deleted', 'false')
    }

    const path = `/api/v1/users/${qs.toString() ? `?${qs}` : ''}`
    const res = await api<ListUsersResponse>(path, { method: 'GET' })

    const raw =
        params.include_deleted === true
            ? res.users
            : res.users.filter((u) => !u.deleted_at)
    return {
        ...res,
        items: raw.map(mapUser),
        total: params.include_deleted ? res.total : raw.length,
    }
}

export async function getMe(): Promise<User> {
    const data = await api<BackendUser>('/api/v1/users/me', { method: 'GET' })
    return mapUser(data)
}
