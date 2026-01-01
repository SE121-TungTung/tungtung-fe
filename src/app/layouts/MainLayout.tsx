import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import { useUIStore } from '@/stores/ui.store'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import Chatbot from '@/components/feature/chatbot/Chatbot'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import type { Role } from '@/types/auth'
import { useMemo } from 'react'
import s from './MainLayout.module.css'
import RobotIcon from '@/assets/Robot.svg'

export const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const session = useSession((state) => state.user)

    const { isChatOpen, setChatOpen } = useUIStore()

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
        <div className={s.pageWrapper}>
            {/* 1. Global Header */}
            <header className={s.header}>
                {' '}
                {/* Import style header chung */}
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={session?.avatarUrl || DefaultAvatar}
                            alt="User"
                            className={s.avatar}
                        />
                    }
                />
            </header>

            {/* 2. Nội dung thay đổi của từng trang */}
            <main>
                <Outlet />
            </main>

            {/* 3. Global Chatbot */}
            <button
                className={s.floatingBtn}
                onClick={() => setChatOpen(isChatOpen ? false : true)}
                title="Chat với AI"
            >
                {/* Thay bằng icon Chat/Robot của bạn */}
                <img src={RobotIcon} alt="Chatbot" />
            </button>

            {/* Cửa sổ Chatbot */}
            <Chatbot isOpen={isChatOpen} onClose={() => setChatOpen(false)} />
        </div>
    )
}
