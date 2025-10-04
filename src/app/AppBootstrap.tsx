import { useEffect } from 'react'
import { useSession } from '@/stores/session.store'
import { me } from '@/lib/auth'

export function AppBootstrap({ children }: { children: React.ReactNode }) {
    const setUser = useSession((s) => s.setUser)
    useEffect(() => {
        ;(async () => {
            try {
                const user = await me()
                setUser(user)
            } catch {
                setUser(null)
            }
        })()
    }, [setUser])
    return <>{children}</>
}
