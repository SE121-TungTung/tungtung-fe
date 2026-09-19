import { create } from 'zustand'
import { type User } from '../types/auth'

type SessionState = {
    user: User | null | undefined
    isAuthenticated: boolean
    setUser: (u: User | null) => void
    clear: () => void
    login: (
        accessToken: string,
        refreshToken: string,
        remember: boolean
    ) => void
}

export const useSession = create<SessionState>((set) => ({
    user: undefined,
    isAuthenticated:
        typeof window !== 'undefined'
            ? !!localStorage.getItem('access_token') ||
              !!sessionStorage.getItem('access_token')
            : false,
    setUser: (u) => set({ user: u }),
    clear: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('refresh_token')
        localStorage.removeItem('is_first_login')
        set({ user: null, isAuthenticated: false })
    },
    login: (accessToken: string, refreshToken: string, remember: boolean) => {
        const storage = remember ? localStorage : sessionStorage
        storage.setItem('access_token', accessToken)
        storage.setItem('refresh_token', refreshToken)
        set({ isAuthenticated: true })
    },
}))
