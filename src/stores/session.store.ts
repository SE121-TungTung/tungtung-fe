import { create } from 'zustand'
import { type User } from '../types/auth'

type SessionState = {
    user: User | null | undefined
    setUser: (u: User | null) => void
    clear: () => void
}

export const useSession = create<SessionState>((set) => ({
    user: undefined,
    setUser: (u) => set({ user: u }),
    clear: () => set({ user: null }),
}))
