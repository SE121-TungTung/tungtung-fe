export type Role =
    | 'student'
    | 'teacher'
    | 'office_admin'
    | 'center_admin'
    | 'system_admin'

export const ALL_ROLES: Role[] = [
    'student',
    'teacher',
    'office_admin',
    'center_admin',
    'system_admin',
]

export type UserStatus =
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'pending_activation'

export interface UserParams {
    skip?: number
    limit?: number
    search?: string
    role?: Role | ''
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    include_deleted?: boolean
}

export interface EmergencyContact {
    name?: string
    relationship?: string
    phone?: string
}

// --- BACKEND RAW TYPES ---
export interface BackendUser {
    id: string
    email: string
    first_name: string
    last_name: string
    role: Role
    status: string
    phone?: string | null
    address?: string | null
    date_of_birth?: string | null
    avatar_url?: string | null
    last_login?: string | null
    created_at: string
    updated_at: string
    is_first_login?: boolean
    deleted_at?: string | null
    emergency_contact?: EmergencyContact | string | null
    preferences?: Record<string, any> | string | null
}

// --- FRONTEND MAPPED TYPES ---
export interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    fullName: string
    role: Role
    status: UserStatus
    phone: string
    address: string
    dateOfBirth: string
    avatarUrl: string
    lastLogin: string
    createdAt: string
    updatedAt: string
    isFirstLogin: boolean
    emergencyContact?: EmergencyContact | null
}

// --- PAYLOADS ---
export interface CreateUserPayload {
    email: string
    first_name: string
    last_name: string
    phone?: string
    date_of_birth?: string
    address?: string
    role: Role
}

export interface UpdateUserPayload {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    emergency_contact?: EmergencyContact | null
    preferences?: Record<string, any> | null
}

export type UpdateMePayload = {
    first_name?: string
    last_name?: string
    phone?: string
    address?: string
    emergency_contact?: EmergencyContact | null
    preferences?: Record<string, any> | null
    avatar_file?: File | null
}

export type ChangePasswordPayload = {
    current_password: string
    new_password: string
}

export interface ListUsersParams {
    page?: number
    limit?: number
    skip?: number
    search?: string
    role?: Role
    include_deleted?: boolean
}

export interface ListUsersResponse {
    users: BackendUser[]
    total: number
    page: number
    size: number
    pages: number
}

export interface StudentOverviewStats {
    role: 'student'
    active_courses: number
    upcoming_sessions_count: number
    tests_taken: number
    average_test_score: number
}

// --- CLASS / SESSION RELATED TYPES ---
export interface ClassSession {
    id: string
    class_id: string
    title: string | null
    session_date: string
    start_time: string
    end_time: string
    status: string
    room_id?: string | null
}

export interface MyClassUser {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
}

export interface MyClass {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
    max_students: number
    current_students: number
    teacher?: MyClassUser
    students?: MyClassUser[]
    sessions?: ClassSession[]
    room_name?: string
    course_name?: string
}

export interface AttendanceRecord {
    id: string
    student_id: string
    session_id: string
    status: 'present' | 'absent' | 'late' | 'excused'
    check_in_time?: string
}

export interface StudentCheckInResponse {
    success: boolean
    message: string
    attendance: AttendanceRecord
}
