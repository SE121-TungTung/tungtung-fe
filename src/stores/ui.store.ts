import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'monochrome'

interface UIState {
    isChatOpen: boolean
    theme: Theme
    toggleChat: () => void
    setChatOpen: (isOpen: boolean) => void
    setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isChatOpen: false,
            theme: 'light',
            toggleChat: () =>
                set((state) => ({ isChatOpen: !state.isChatOpen })),
            setChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'ui-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({ theme: state.theme }), // only save theme
        }
    )
)
