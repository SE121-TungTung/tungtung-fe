import { useState, useEffect } from 'react'

interface UseTestTimerOptions {
    startTime: string
    timeLimitMinutes: number | null
    onTimeout: () => void
    enabled?: boolean
}

/**
 * Calculate remaining seconds
 */
function calculateRemainingTime(
    startTime: string,
    timeLimitMinutes: number
): number {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - start) / 1000)
    const limit = timeLimitMinutes * 60
    const remaining = limit - elapsed
    return Math.max(0, remaining)
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function useTestTimer({
    startTime,
    timeLimitMinutes,
    onTimeout,
    enabled = true,
}: UseTestTimerOptions) {
    const [timeLeft, setTimeLeft] = useState(0)

    // Initialize time on mount
    useEffect(() => {
        if (!timeLimitMinutes || !enabled) return

        const remaining = calculateRemainingTime(startTime, timeLimitMinutes)
        setTimeLeft(remaining)

        if (remaining === 0) {
            onTimeout()
        }
    }, [startTime, timeLimitMinutes, onTimeout, enabled])

    // Countdown timer
    useEffect(() => {
        if (!enabled || timeLeft <= 0) return

        const timerId = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerId)
                    onTimeout()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timerId)
    }, [timeLeft, onTimeout, enabled])

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        isLowTime: timeLeft < 300, // Less than 5 minutes
    }
}
