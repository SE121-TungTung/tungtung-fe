import { useEffect } from 'react'
import { useSession } from '@/stores/session.store'
import { getMe } from '@/lib/users'

const getToken = () =>
    localStorage.getItem('token') ?? sessionStorage.getItem('token')

export function AppBootstrap({ children }: { children: React.ReactNode }) {
    const setUser = useSession((s) => s.setUser)
    useEffect(() => {
        const token = getToken()
        if (!token) {
            setUser(null)
            return
        }
        ;(async () => {
            try {
                setUser(await getMe())
            } catch {
                setUser(null)
            }
        })()
    }, [setUser])
    return <>{children}</>
}
