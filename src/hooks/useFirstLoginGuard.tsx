import { useEffect, useState } from 'react'
import { useSession } from '@/stores/session.store'
import { getMe } from '@/lib/users'

/**
 * useFirstLoginGuard - Hook để check first login và quản lý modal state
 *
 * Usage trong component:
 *
 * ```tsx
 * function Dashboard() {
 *   const { showFirstLoginModal, handleFirstLoginSuccess } = useFirstLoginGuard()
 *
 *   return (
 *     <div>
 *       <YourContent />
 *       {showFirstLoginModal && (
 *         <FirstLoginPasswordModal onSuccess={handleFirstLoginSuccess} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFirstLoginGuard() {
    const user = useSession((s) => s.user)
    const setUser = useSession((s) => s.setUser)
    const [showFirstLoginModal, setShowFirstLoginModal] = useState(false)

    useEffect(() => {
        // Check if user needs to change password on first login
        if (user?.isFirstLogin) {
            setShowFirstLoginModal(true)
        }
    }, [user?.isFirstLogin])

    const handleFirstLoginSuccess = async () => {
        try {
            // Refresh user data to get updated is_first_login flag
            const updatedUser = await getMe()
            setUser(updatedUser)
            setShowFirstLoginModal(false)
        } catch (error) {
            console.error('Failed to refresh user data:', error)
            // Still close modal even if refresh fails
            setShowFirstLoginModal(false)
        }
    }

    return {
        showFirstLoginModal,
        handleFirstLoginSuccess,
        user,
    }
}
