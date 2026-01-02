import { api } from './api'
import type {
    User,
    BackendUser,
    CreateUserPayload,
    UpdateUserPayload,
    UpdateMePayload,
    ChangePasswordPayload,
    ListUsersParams,
    ListUsersResponse,
    StudentOverviewStats,
    MyClass,
    AttendanceRecord,
    StudentCheckInResponse,
} from '@/types/user.types'

export * from '@/types/user.types'

// --- HELPER ---
const safeParse = (data: any) => {
    if (typeof data === 'string') {
        try {
            return JSON.parse(data)
        } catch {
            return null
        }
    }
    return data
}

export const mapUser = (u: BackendUser): User => ({
    id: u.id,
    email: u.email,
    firstName: u.first_name,
    lastName: u.last_name,
    fullName: `${u.first_name} ${u.last_name}`.trim(),
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
    emergencyContact: safeParse(u.emergency_contact),
})

// --- API FUNCTIONS ---

// 1. Get Me
export async function getMe(): Promise<User> {
    const data = await api<BackendUser>('/api/v1/users/me', { method: 'GET' })
    return mapUser(data)
}

// 2. List Users
export async function listUsers(params: ListUsersParams = {}) {
    const qs = new URLSearchParams()
    if (params.role) qs.set('role', params.role)
    if (params.search) qs.set('search', params.search)
    if (params.skip != null) qs.set('skip', String(params.skip))
    if (params.limit != null) qs.set('limit', String(params.limit))
    if (typeof params.include_deleted === 'boolean') {
        qs.set('include_deleted', String(params.include_deleted))
    }

    const path = `/api/v1/users/?${qs.toString()}`
    const res = await api<ListUsersResponse>(path, { method: 'GET' })

    const raw =
        params.include_deleted === true
            ? res.users
            : res.users.filter((u) => !u.deleted_at)

    return {
        ...res,
        users: raw.map(mapUser),
    }
}

// 3. Create User
export async function createUser(
    body: CreateUserPayload,
    opts?: { defaultClassId?: string | null }
): Promise<User> {
    const qs = new URLSearchParams()
    if (opts?.defaultClassId) qs.set('default_class_id', opts.defaultClassId)

    const path = `/api/v1/users/?${qs.toString()}`
    const res = await api<BackendUser>(path, {
        method: 'POST',
        body: JSON.stringify(body),
    })
    return mapUser(res)
}

// 4. Update User (Admin updating others)
export async function updateUser(
    userId: string,
    body: UpdateUserPayload,
    avatarFile?: File | null
): Promise<User> {
    const formData = new FormData()

    if (body.first_name) formData.append('first_name', body.first_name)
    if (body.last_name) formData.append('last_name', body.last_name)
    if (body.phone) formData.append('phone', body.phone)
    if (body.address) formData.append('address', body.address)

    if (body.emergency_contact) {
        formData.append(
            'emergency_contact',
            JSON.stringify(body.emergency_contact)
        )
    }
    if (body.preferences) {
        formData.append('preferences', JSON.stringify(body.preferences))
    }

    if (avatarFile) {
        formData.append('avatar_file', avatarFile)
    }

    const res = await api<BackendUser>(`/api/v1/users/${userId}`, {
        method: 'PUT',
        body: formData,
    })

    return mapUser(res)
}

// 5. Delete User
export async function deleteUser(userId: string) {
    return api<string>(`/api/v1/users/${userId}`, { method: 'DELETE' })
}

// 6. Update Me (User updating themselves)
export async function updateMe(body: UpdateMePayload) {
    const fd = new FormData()

    if (body.first_name !== undefined)
        fd.append('first_name', body.first_name || '')
    if (body.last_name !== undefined)
        fd.append('last_name', body.last_name || '')
    if (body.phone !== undefined) fd.append('phone', body.phone || '')
    if (body.address !== undefined) fd.append('address', body.address || '')

    if (body.emergency_contact !== undefined) {
        fd.append('emergency_contact', JSON.stringify(body.emergency_contact))
    }
    if (body.preferences !== undefined) {
        fd.append('preferences', JSON.stringify(body.preferences))
    }

    if (body.avatar_file !== undefined) {
        if (body.avatar_file) {
            fd.append('avatar_file', body.avatar_file)
        } else {
            // Trường hợp muốn xóa avatar hoặc gửi empty
            fd.append('avatar_file', new Blob([]), '')
        }
    }

    const res = await api<BackendUser>(`/api/v1/users/me`, {
        method: 'PUT',
        body: fd,
    })
    return mapUser(res)
}

// 7. Change Password
export async function changePassword(body: ChangePasswordPayload) {
    return api<string>(`/api/v1/users/me/change-password`, {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

// 8. Get Overview
export async function getUserOverview(): Promise<StudentOverviewStats> {
    return api<StudentOverviewStats>('/api/v1/users/overview', {
        method: 'GET',
    })
}

// 9. Get My Classes
export async function getMyClasses(): Promise<MyClass[]> {
    const data = await api<MyClass[] | { classes: MyClass[] }>(
        '/api/v1/users/me/classes',
        { method: 'GET' }
    )
    return Array.isArray(data) ? data : data.classes || []
}

// 10. Attendance
export async function getSessionAttendance(sessionId: string) {
    return api<AttendanceRecord[]>(
        `/api/v1/sessions/${sessionId}/attendance/`,
        { method: 'GET' }
    )
}

export async function selfCheckIn(sessionId: string) {
    return api<StudentCheckInResponse>(
        `/api/v1/sessions/${sessionId}/attendance/self-check-in`,
        {
            method: 'POST',
            body: JSON.stringify({ session_id: sessionId }),
        }
    )
}
