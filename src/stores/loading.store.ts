import { create } from 'zustand'

export type LoadingStatus =
    'idle' | 'loading' | 'finishing' | 'freezing' | 'exiting'

interface LoadingState {
    activeCount: number
    title: string
    subtitle?: string
    progress: number
    status: LoadingStatus
    startLoading: (title?: string, subtitle?: string) => void
    finishLoading: () => void
    setProgress: (progress: number) => void
}

let tickTimer: ReturnType<typeof setInterval> | null = null
let glideTimer: ReturnType<typeof setInterval> | null = null
let freezeTimer: ReturnType<typeof setTimeout> | null = null
let exitTimer: ReturnType<typeof setTimeout> | null = null

const clearAllTimers = () => {
    if (tickTimer) {
        clearInterval(tickTimer)
        tickTimer = null
    }
    if (glideTimer) {
        clearInterval(glideTimer)
        glideTimer = null
    }
    if (freezeTimer) {
        clearTimeout(freezeTimer)
        freezeTimer = null
    }
    if (exitTimer) {
        clearTimeout(exitTimer)
        exitTimer = null
    }
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
    activeCount: 0,
    title: 'Đang tải…',
    subtitle: undefined,
    progress: 0,
    status: 'idle',

    startLoading: (title?: string, subtitle?: string) => {
        clearAllTimers()

        const currentCount = get().activeCount
        const currentProgress = get().progress
        const newTitle =
            title || (currentCount > 0 ? get().title : 'Đang nạp dữ liệu…')
        const newSubtitle = subtitle !== undefined ? subtitle : get().subtitle

        // If restarting or starting from idle/exiting, start progress smoothly
        const initialProgress =
            get().status === 'idle' || get().status === 'exiting'
                ? 12
                : Math.max(12, currentProgress)

        set({
            activeCount: currentCount + 1,
            title: newTitle,
            subtitle: newSubtitle,
            progress: initialProgress,
            status: 'loading',
        })

        // Simulate natural loading progression towards 92%
        tickTimer = setInterval(() => {
            const state = get()
            if (state.status !== 'loading') {
                if (tickTimer) clearInterval(tickTimer)
                return
            }

            if (state.progress >= 92) {
                // Keep micro-pulsing around 92-95% while waiting for real completion
                if (state.progress < 95 && Math.random() > 0.6) {
                    set({ progress: state.progress + 0.5 })
                }
                return
            }

            const remaining = 92 - state.progress
            const step = Math.max(0.6, remaining * 0.05 + Math.random() * 1.8)
            set({ progress: Math.min(92, state.progress + step) })
        }, 80)
    },

    finishLoading: () => {
        const nextCount = Math.max(0, get().activeCount - 1)
        set({ activeCount: nextCount })

        // Only transition to 100% when all active requests/loaders have finished
        if (nextCount > 0) return

        if (tickTimer) {
            clearInterval(tickTimer)
            tickTimer = null
        }

        set({ status: 'finishing' })

        // 1. Rapidly and smoothly glide from current progress to 100%
        glideTimer = setInterval(() => {
            const current = get().progress
            if (current >= 100) {
                if (glideTimer) clearInterval(glideTimer)
                glideTimer = null

                // 2. FREEZE at 100% for ~260ms so user clearly registers 100% completion
                set({ progress: 100, status: 'freezing' })

                freezeTimer = setTimeout(() => {
                    // 3. BLUR & FADE OUT: transition to 'exiting' for 400ms
                    set({ status: 'exiting' })

                    exitTimer = setTimeout(() => {
                        // 4. Fully finished & idle
                        set({
                            status: 'idle',
                            progress: 0,
                            activeCount: 0,
                        })
                    }, 400)
                }, 260)

                return
            }

            // Smooth acceleration to 100%
            const distance = 100 - current
            const step = Math.max(3, distance * 0.35 + 2)
            set({ progress: Math.min(100, current + step) })
        }, 22)
    },

    setProgress: (progress: number) => {
        set({ progress: Math.min(100, Math.max(0, progress)) })
    },
}))
