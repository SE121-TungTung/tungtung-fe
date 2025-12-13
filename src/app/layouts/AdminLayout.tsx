import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import type { Role } from '@/types/auth'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'

import NavigationMenu from '@/components/common/menu/NavigationMenu'

import styles from '@/pages/profile/ProfilePage.module.css'
import { useMemo } from 'react'

export const AdminLayout: React.FC = () => {
    const session = useSession((state) => state.user)
    const location = useLocation()
    const navigate = useNavigate()

    const userRole = (session?.role as Role) || 'student'
    const currentPath = location.pathname

    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [userRole, currentPath, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [userRole, navigate]
    )

    return (
        <div className={styles.pageWrapper}>
            <header className={styles.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img src={session?.avatarUrl} alt="User Avatar" />
                    }
                />
            </header>

            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    )
}
