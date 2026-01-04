import { create } from 'zustand'
import { type User } from '../types/auth'

type SessionState = {
    user: User | null | undefined
    isAuthenticated: boolean
    setUser: (u: User | null) => void
    clear: () => void
    login: (accessToken: string, refreshToken: string) => void
}

export const useSession = create<SessionState>((set) => ({
    user: undefined,
    isAuthenticated: false,
    setUser: (u) => set({ user: u }),
    clear: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
    },
    login: (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        set({ isAuthenticated: true })
    },
}))
