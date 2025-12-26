import { useEffect, useState } from 'react'
import { useSession } from '@/stores/session.store'
import FirstLoginPasswordModal from './FirstLoginPasswordModal'
import { getMe } from '@/lib/users'

/**
 * FirstLoginGuard - Component để check first login và hiện modal
 *
 * Usage: Wrap component này ở layout level hoặc dashboard
 *
 * Example:
 * ```tsx
 * function DashboardLayout() {
 *   return (
 *     <div>
 *       <FirstLoginGuard />
 *       <YourContent />
 *     </div>
 *   )
 * }
 * ```
 */
export default function FirstLoginGuard() {
    const user = useSession((s) => s.user)
    const setUser = useSession((s) => s.setUser)
    const [showModal, setShowModal] = useState(false)

    const getToken = () =>
        localStorage.getItem('token') ?? sessionStorage.getItem('token')
    const token = getToken()

    useEffect(() => {
        if (user && token && user.isFirstLogin) {
            setShowModal(true)
        }
    }, [user?.isFirstLogin, token])

    const handleSuccess = async () => {
        try {
            // Refresh user data to get updated is_first_login flag
            const updatedUser = await getMe()
            setUser(updatedUser)
            setShowModal(false)
        } catch (error) {
            console.error('Failed to refresh user data:', error)
            // Still close modal even if refresh fails
            setShowModal(false)
        }
    }

    // Only render modal when needed
    if (!showModal) return null

    return <FirstLoginPasswordModal onSuccess={handleSuccess} />
}
