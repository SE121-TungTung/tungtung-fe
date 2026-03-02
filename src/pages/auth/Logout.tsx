import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import { logout } from '@/lib/auth'
import LoadingScreen from '@/components/core/LoadingPage'

const clearTokens = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
}

export default function LogoutPage() {
    const navigate = useNavigate()
    const setUser = useSession((s) => s.setUser)

    useEffect(() => {
        ;(async () => {
            try {
                await logout()
            } catch {
                /* ignore */
            }
            clearTokens()
            setUser(null)
            navigate('/login', { replace: true })
        })()
    }, [navigate, setUser])

    return <LoadingScreen title="Đang đăng xuất..." />
}
