import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

type GuestSessionState = {
    guestSessionId: string
    getGuestSessionId: () => string
    clearGuestSession: () => void
}

export const useGuestSession = create<GuestSessionState>((set, get) => ({
    guestSessionId: localStorage.getItem('guest_session_id') || '',
    getGuestSessionId: () => {
        let currentId = get().guestSessionId
        if (!currentId) {
            currentId = uuidv4()
            localStorage.setItem('guest_session_id', currentId)
            set({ guestSessionId: currentId })
        }
        return currentId
    },
    clearGuestSession: () => {
        localStorage.removeItem('guest_session_id')
        set({ guestSessionId: '' })
    },
}))
