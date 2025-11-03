export type Role =
    | 'student'
    | 'teacher'
    | 'office_admin'
    | 'center_admin'
    | 'system_admin'

export type User = {
    id: string
    email: string
    firstName: string
    lastName: string
    role: Role
    avatarUrl?: string
    isFirstLogin?: boolean
}
