import { create } from 'zustand'

interface UIState {
    isChatOpen: boolean
    toggleChat: () => void
    setChatOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    isChatOpen: false,
    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
    setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
}))
