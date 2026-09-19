import { useEffect } from 'react'
import { useSession } from '@/stores/session.store'
import { useUIStore } from '@/stores/ui.store'
import { getMe } from '@/lib/users'

const getToken = () =>
    localStorage.getItem('access_token') ??
    sessionStorage.getItem('access_token')

export function AppBootstrap({ children }: { children: React.ReactNode }) {
    const setUser = useSession((s) => s.setUser)
    const theme = useUIStore((s) => s.theme)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

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
