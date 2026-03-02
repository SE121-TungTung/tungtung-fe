import type { Role } from '@/types/auth'

export type Permission =
    | 'user:read'
    | 'user:create:student'
    | 'user:create:teacher'
    | 'user:create:admin'
    | 'user:update'
    | 'user:delete'
    | 'user:lock'
    // Room permissions
    | 'room:read'
    | 'room:create'
    | 'room:update'
    | 'room:delete'
    //Course permissions
    | 'course:read'
    | 'course:create'
    | 'course:update'
    | 'course:delete'
    //Class permissions
    | 'class:read'
    | 'class:create'
    | 'class:update'
    | 'class:delete'

/**
 * Ánh xạ từ Role sang mảng các Permissions
 */
const ROLES: Record<Role, Permission[]> = {
    student: ['user:read', 'room:read', 'course:read', 'class:read'],
    teacher: ['user:read', 'room:read', 'course:read', 'class:read'],

    office_admin: [
        'user:read',
        'user:create:student',
        'user:create:teacher',
        'user:update',
        'course:read',
        'course:create',
        'course:update',
        'class:read',
        'class:create',
        'class:update',
    ],
    center_admin: [
        'user:read',
        'user:create:student',
        'user:create:teacher',
        'user:update',
        'user:delete',
        'user:lock',
        'room:read',
        'room:create',
        'room:update',
        'room:read',
        'room:create',
        'room:update',
        'room:delete',
        'course:read',
        'course:create',
        'course:update',
        'course:delete',
        'class:read',
        'class:create',
        'class:update',
        'class:delete',
    ],
    system_admin: [
        'user:read',
        'user:create:student',
        'user:create:teacher',
        'user:create:admin',
        'user:update',
        'user:delete',
        'user:lock',
        'room:read',
        'room:create',
        'room:update',
        'room:delete',
        'course:read',
        'course:create',
        'course:update',
        'course:delete',
        'class:read',
        'class:create',
        'class:update',
        'class:delete',
    ],
}

/**
 * Hàm helper kiểm tra xem một vai trò có quyền cụ thể hay không.
 * @param role Vai trò của người dùng (vd: 'center_admin')
 * @param permission Quyền cần kiểm tra (vd: 'user:delete')
 * @returns boolean
 */
export const hasPermission = (
    role: Role | undefined,
    permission: Permission
): boolean => {
    if (!role) {
        return false
    }
    if (role === 'system_admin') {
        return true
    }
    return ROLES[role]?.includes(permission) ?? false
}
