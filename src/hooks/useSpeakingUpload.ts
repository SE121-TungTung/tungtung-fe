import { useState, useCallback } from 'react'
import { testApi } from '@/lib/test'

// Types
interface UploadedFile {
    questionId: string
    fileUploadId: string
    audioUrl: string
    fileSize: number
    durationSeconds?: number
    uploadedAt: string
}

interface UploadState {
    [questionId: string]: {
        status: 'idle' | 'uploading' | 'uploaded' | 'error'
        progress: number
        file?: UploadedFile
        error?: string
    }
}

interface SpeakingResponse {
    questionId: string
    fileUploadId: string
    durationSeconds?: number
    flaggedForReview?: boolean
}

// ============================================
// HOOK
// ============================================
export const useSpeakingUpload = (attemptId: string) => {
    const [uploadState, setUploadState] = useState<UploadState>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // ============================================
    // STEP 1: PRE-UPLOAD SINGLE AUDIO
    // ============================================
    const uploadAudio = useCallback(
        async (
            questionId: string,
            audioBlob: Blob,
            durationSeconds?: number
        ) => {
            // Update state: uploading
            setUploadState((prev) => ({
                ...prev,
                [questionId]: {
                    status: 'uploading',
                    progress: 0,
                },
            }))

            try {
                // Call API
                const response = await testApi.preUploadSpeakingAudio(
                    attemptId,
                    questionId,
                    audioBlob
                )

                // Update state: uploaded
                setUploadState((prev) => ({
                    ...prev,
                    [questionId]: {
                        status: 'uploaded',
                        progress: 100,
                        file: {
                            questionId,
                            fileUploadId: response.fileUploadId,
                            audioUrl: response.audioUrl,
                            fileSize: response.fileSize,
                            durationSeconds:
                                durationSeconds || response.durationSeconds,
                            uploadedAt: response.uploadedAt,
                        },
                    },
                }))

                return response
            } catch (error: any) {
                console.error('Upload failed:', error)

                // Update state: error
                setUploadState((prev) => ({
                    ...prev,
                    [questionId]: {
                        status: 'error',
                        progress: 0,
                        error: error.message || 'Upload failed',
                    },
                }))

                throw error
            }
        },
        [attemptId]
    )

    // ============================================
    // STEP 2: BATCH SUBMIT ALL
    // ============================================
    const batchSubmit = useCallback(async () => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Collect all uploaded files
            const responses: SpeakingResponse[] = []

            Object.entries(uploadState).forEach(([questionId, state]) => {
                if (state.status === 'uploaded' && state.file) {
                    responses.push({
                        questionId,
                        fileUploadId: state.file.fileUploadId,
                        durationSeconds: state.file.durationSeconds,
                        flaggedForReview: false,
                    })
                }
            })

            // Validate
            if (responses.length === 0) {
                throw new Error('No audio files uploaded')
            }

            // Call API
            const result = await testApi.batchSubmitSpeaking(attemptId, {
                responses,
            })

            return result
        } catch (error: any) {
            console.error('Batch submit failed:', error)
            setSubmitError(error.message || 'Submit failed')
            throw error
        } finally {
            setIsSubmitting(false)
        }
    }, [attemptId, uploadState])

    // ============================================
    // HELPER METHODS
    // ============================================

    // Check if all required questions are uploaded
    const isReadyToSubmit = useCallback(
        (requiredQuestionIds: string[]) => {
            return requiredQuestionIds.every(
                (id) => uploadState[id]?.status === 'uploaded'
            )
        },
        [uploadState]
    )

    // Get upload progress summary
    const getProgress = useCallback(() => {
        const total = Object.keys(uploadState).length
        const uploaded = Object.values(uploadState).filter(
            (s) => s.status === 'uploaded'
        ).length

        return {
            total,
            uploaded,
            percentage: total > 0 ? Math.round((uploaded / total) * 100) : 0,
        }
    }, [uploadState])

    // Clear upload state (for retake)
    const clearUploads = useCallback(() => {
        setUploadState({})
        setSubmitError(null)
    }, [])

    // Retry failed upload
    const retryUpload = useCallback((questionId: string) => {
        setUploadState((prev) => ({
            ...prev,
            [questionId]: {
                status: 'idle',
                progress: 0,
            },
        }))
    }, [])

    // ============================================
    // RETURN
    // ============================================
    return {
        // State
        uploadState,
        isSubmitting,
        submitError,

        // Actions
        uploadAudio,
        batchSubmit,
        retryUpload,
        clearUploads,

        // Helpers
        isReadyToSubmit,
        getProgress,
    }
}
