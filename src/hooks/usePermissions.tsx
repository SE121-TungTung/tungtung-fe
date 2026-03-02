import { useMemo, useCallback } from 'react'
import { useSession } from '@/stores/session.store'
import { hasPermission, type Permission } from '@/config/permissions.config'
import { type Role } from '@/types/auth'

export const usePermissions = () => {
    const user = useSession((s) => s.user)
    const role = user?.role as Role | undefined

    const can = useCallback(
        (permission: Permission): boolean => {
            return hasPermission(role, permission)
        },
        [role]
    )

    const canAny = useCallback(
        (permissions: Permission[]): boolean => {
            if (!role) return false
            if (role === 'system_admin') return true
            return permissions.some((p) => hasPermission(role, p))
        },
        [role]
    )

    return useMemo(() => ({ can, canAny, role }), [can, canAny, role])
}
