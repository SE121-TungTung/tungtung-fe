import { Navigate } from 'react-router-dom'
import { useSession } from '@/stores/session.store'
import type { JSX } from 'react'

export function ProtectedRoute({ children }: { children: JSX.Element }) {
    const user = useSession((s) => s.user)
    if (user === undefined) return <div /> // splash/loader
    return user ? children : <Navigate to="/login" replace />
}
