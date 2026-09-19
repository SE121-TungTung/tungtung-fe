import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, Suspense } from 'react'
import { useSession } from '@/stores/session.store'
import { useUIStore } from '@/stores/ui.store'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import Chatbot from '@/components/feature/chatbot/Chatbot'
import LoadingPage from '@/components/core/LoadingPage'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import type { Role } from '@/types/auth'
import s from './MainLayout.module.css'
import RobotIcon from '@/assets/Robot.svg'
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection'

export const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSession((state) => state.user)
    const currentUserId = user?.id

    const { isChatOpen, setChatOpen, theme } = useUIStore()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    const userRole = (user?.role as Role) || 'student'
    const currentPath = location.pathname
    const navItems = useMemo(
        () => getNavItems(userRole, currentPath, navigate),
        [userRole, currentPath, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole, navigate),
        [userRole, navigate]
    )

    useWebSocketConnection({
        currentUserId: currentUserId || undefined,
        onError: (error) => {
            console.error('WebSocket Error:', error)
        },
        onAuthError: (error) => {
            console.error('WebSocket Auth Error:', error)
        },
    })

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
                            src={user?.avatarUrl || DefaultAvatar}
                            alt="User"
                            className={s.avatar}
                        />
                    }
                />
            </header>

            {/* 2. Nội dung thay đổi của từng trang */}
            <main>
                <Suspense fallback={<LoadingPage title="Đang tải trang..." />}>
                    <Outlet />
                </Suspense>
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
