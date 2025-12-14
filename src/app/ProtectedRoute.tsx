import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import type { Role } from '@/types/auth'
import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/core/LoadingPage'
import { getMe } from '@/lib/users'

interface ProtectedRouteProps {
    children?: React.ReactNode
    allowedRoles?: Role[]
}

const getToken = () => {
    return (
        localStorage.getItem('access_token') ??
        localStorage.getItem('token') ??
        sessionStorage.getItem('token')
    )
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const token = getToken()
    const user = useSession((state) => state.user)
    const setUser = useSession((state) => state.setUser)
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setIsChecking(false)
                return
            }

            if (user) {
                setIsChecking(false)
                return
            }

            try {
                const me = await getMe()
                setUser(me)
            } catch (error) {
                console.error('Auth check failed:', error)
                localStorage.removeItem('access_token')
                localStorage.removeItem('token')
            } finally {
                setIsChecking(false)
            }
        }

        checkAuth()
    }, [token, user, setUser])

    if (isChecking) {
        return <LoadingScreen title="Đang tải dữ liệu..." />
    }

    if (!getToken() || !useSession.getState().user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles?.length && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children ? <>{children}</> : <Outlet />
}
