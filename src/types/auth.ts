export const ALL_ROLES = [
    'student',
    'teacher',
    'office_admin',
    'center_admin',
    'system_admin',
] as const
export type Role = (typeof ALL_ROLES)[number]

export const ALL_STATUSES = [
    'active',
    'suspended',
    'inactive',
    'pending_activation',
] as const
export type UserStatus = (typeof ALL_STATUSES)[number]

export interface User {
    id: string
    email: string
    role: Role
    status: UserStatus
    firstName: string
    lastName: string
    phone?: string
    avatarUrl?: string
    dateOfBirth?: string
    address?: string
    lastLogin?: string
    isFirstLogin: boolean
    createdAt: string
    updatedAt: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: Role
        avatarUrl?: string
    }
}
