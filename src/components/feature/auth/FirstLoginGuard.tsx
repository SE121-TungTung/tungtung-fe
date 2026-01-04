import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import FirstLoginPasswordModal from './FirstLoginPasswordModal'
import { getMe } from '@/lib/users'

/**
 * FirstLoginGuard - Component để check first login và hiện modal
 */
export default function FirstLoginGuard() {
    const user = useSession((s) => s.user)
    const setUser = useSession((s) => s.setUser)
    const [showModal, setShowModal] = useState(false)
    const location = useLocation()

    const getToken = () =>
        localStorage.getItem('access_token') ??
        localStorage.getItem('token') ??
        sessionStorage.getItem('token')

    useEffect(() => {
        const token = getToken()
        const isFirstLogin = localStorage.getItem('is_first_login') === 'true'

        if (token && isFirstLogin) {
            setShowModal(true)
        }
    }, [location.pathname, user])

    const handleSuccess = async () => {
        try {
            localStorage.removeItem('is_first_login')

            // Refresh user data
            const updatedUser = await getMe()
            setUser(updatedUser)

            setShowModal(false)
        } catch (error) {
            console.error('Failed to refresh user data:', error)
            localStorage.removeItem('is_first_login')
            setShowModal(false)
        }
    }

    if (!showModal) return null

    return <FirstLoginPasswordModal onSuccess={handleSuccess} />
}
