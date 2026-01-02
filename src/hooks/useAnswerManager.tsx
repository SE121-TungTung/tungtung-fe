import { useState, useEffect, useCallback } from 'react'

const STORAGE_PREFIX = 'testAnswers_'
const AUTO_SAVE_INTERVAL = 15000

interface UseAnswerManagerOptions {
    attemptId: string
    enabled?: boolean
}

export function useAnswerManager({
    attemptId,
    enabled = true,
}: UseAnswerManagerOptions) {
    const [answers, setAnswers] = useState<Record<string, any>>({})

    // Load saved answers on mount
    useEffect(() => {
        if (!attemptId || !enabled) return

        const storageKey = `${STORAGE_PREFIX}${attemptId}`
        const saved = localStorage.getItem(storageKey)

        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setAnswers(parsed)
            } catch (err) {
                console.error('Failed to parse saved answers:', err)
            }
        }
    }, [attemptId, enabled])

    // Auto-save answers periodically
    useEffect(() => {
        if (!attemptId || !enabled) return

        const storageKey = `${STORAGE_PREFIX}${attemptId}`

        const interval = setInterval(() => {
            if (Object.keys(answers).length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(answers))
            }
        }, AUTO_SAVE_INTERVAL)

        return () => clearInterval(interval)
    }, [answers, attemptId, enabled])

    const handleAnswerChange = useCallback((questionId: string, value: any) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }))
    }, [])

    const clearAnswers = useCallback(() => {
        if (!attemptId) return

        const storageKey = `${STORAGE_PREFIX}${attemptId}`
        localStorage.removeItem(storageKey)
        setAnswers({})
    }, [attemptId])

    const getAnswer = useCallback(
        (questionId: string) => {
            return answers[questionId]
        },
        [answers]
    )

    return {
        answers,
        handleAnswerChange,
        clearAnswers,
        getAnswer,
    }
}
