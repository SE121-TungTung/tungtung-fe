import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import { logout } from '@/lib/auth'
import LoadingScreen from '@/components/core/LoadingPage'

export default function LogoutPage() {
    const navigate = useNavigate()
    const clearSession = useSession((s) => s.clear)

    useEffect(() => {
        ;(async () => {
            try {
                await logout()
            } catch {
                /* ignore */
            }

            clearSession()
            navigate('/login', { replace: true })
        })()
    }, [navigate, clearSession])

    return <LoadingScreen title="Đang đăng xuất..." />
}
