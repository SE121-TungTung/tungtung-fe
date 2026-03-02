import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import type { QuestionSubmitItem } from '@/types/test.types'
import { useDialog } from './useDialog'

interface UseTestSubmitOptions {
    attemptId: string
    onSuccess?: () => void
    onError?: (error: Error) => void
}

export function useTestSubmit({
    attemptId,
    onSuccess,
    onError,
}: UseTestSubmitOptions) {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { alert: showAlert } = useDialog()

    const submit = useCallback(
        async (
            answers: Record<string, any>,
            options?: {
                clearStorage?: boolean
                redirectToResults?: boolean
            }
        ) => {
            if (isSubmitting || !attemptId) return

            const { clearStorage = true, redirectToResults = true } =
                options || {}

            setIsSubmitting(true)

            try {
                // Transform answers to API format
                const responses: QuestionSubmitItem[] = Object.entries(
                    answers
                ).map(([questionId, value]) => {
                    const isComplexData =
                        typeof value === 'object' && value !== null

                    return {
                        question_id: questionId,
                        response_text: !isComplexData
                            ? String(value)
                            : undefined,
                        response_data: isComplexData ? value : undefined,
                    }
                })

                // Submit to API
                await testApi.submitAttempt(attemptId, { responses })

                // Clear localStorage if requested
                if (clearStorage) {
                    localStorage.removeItem(`testAnswers_${attemptId}`)
                    localStorage.removeItem(`attempt_${attemptId}`)
                }

                // Call success callback
                onSuccess?.()

                // Navigate to results
                if (redirectToResults) {
                    navigate(`/student/tests/results/${attemptId}`)
                }
            } catch (error) {
                const err = error as Error
                console.error('Submit failed:', err)

                // Call error callback
                onError?.(err)

                // Show error to user
                showAlert(
                    `Submission failed: ${err.message || 'Unknown error'}`
                )
            } finally {
                setIsSubmitting(false)
            }
        },
        [attemptId, navigate, isSubmitting, onSuccess, onError]
    )

    return {
        submit,
        isSubmitting,
    }
}
