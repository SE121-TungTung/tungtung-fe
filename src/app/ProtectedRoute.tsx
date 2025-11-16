import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import type { Role } from '@/types/auth'
import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/core/LoadingPage'

interface ProtectedRouteProps {
    children?: React.ReactNode
    allowedRoles?: Role[]
}

const getToken = () =>
    localStorage.getItem('token') ?? sessionStorage.getItem('token')

const TOKEN_WAIT_MS = 5000
const POLL_MS = 250

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
}) => {
    const [token, setToken] = useState<string | null>(getToken())
    const [redirect, setRedirect] = useState(false)
    const user = useSession((state) => state.user)

    useEffect(() => {
        if (token) return
        let elapsed = 0
        const iv = setInterval(() => {
            const t = getToken()
            if (t) {
                setToken(t)
                clearInterval(iv)
            } else {
                elapsed += POLL_MS
                if (elapsed >= TOKEN_WAIT_MS) {
                    setRedirect(true)
                    clearInterval(iv)
                }
            }
        }, POLL_MS)
        return () => clearInterval(iv)
    }, [token])

    if (redirect) return <Navigate to="/login" replace />

    if (!token)
        return <LoadingScreen title="Đang kiểm tra phiên đăng nhập..." />
    if (token && !user)
        return <LoadingScreen title="Đang tải dữ liệu người dùng..." />

    if (allowedRoles?.length && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    return children ? <>{children}</> : <Outlet />
}
