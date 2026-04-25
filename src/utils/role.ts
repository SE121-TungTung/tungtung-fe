import type { Role } from '@/types/auth'

export const homePathByRole = (r: Role) => {
    const roleLower = r?.toLowerCase()
    if (roleLower === 'student') return '/student'
    if (roleLower === 'teacher') return '/teacher'
    if (roleLower === 'office_admin') return '/admin'
    if (roleLower === 'center_admin') return '/admin'
    return '/admin'
}
