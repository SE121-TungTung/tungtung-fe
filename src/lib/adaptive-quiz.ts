/**
 * API client for Adaptive Quiz (CAT & IRT).
 * Communicates with backend endpoints at /api/v1/adaptive-quiz.
 */

import { api } from '@/lib/api'
import type {
    AdaptiveSession,
    AdaptiveSkillArea,
    CalibrationStats,
    FinishSessionResult,
    NextQuestion,
    PaginatedResult,
    QuestionIRT,
    SubmitResponsePayload,
    SubmitResponseResult,
    UpdateQuestionIRTPayload,
} from '@/types/adaptive-quiz'

const BASE_URL = '/api/v1/adaptive-quiz'

export const adaptiveQuizApi = {
    /**
     * Start or resume an adaptive test session
     */
    startSession(
        skillArea: AdaptiveSkillArea,
        maxItems: number = 20
    ): Promise<AdaptiveSession> {
        return api<AdaptiveSession>(`${BASE_URL}/sessions`, {
            method: 'POST',
            body: JSON.stringify({
                skill_area: skillArea,
                max_items: maxItems,
            }),
        })
    },

    /**
     * List previous adaptive quiz sessions for the current user
     */
    listSessions(
        skillArea?: string,
        page: number = 1,
        pageSize: number = 20
    ): Promise<PaginatedResult<AdaptiveSession>> {
        const params = new URLSearchParams()
        if (skillArea) params.append('skill_area', skillArea)
        params.append('page', String(page))
        params.append('page_size', String(pageSize))

        return api<PaginatedResult<AdaptiveSession>>(
            `${BASE_URL}/sessions?${params.toString()}`
        )
    },

    /**
     * Get detailed information for a specific session, including theta history
     */
    getSession(sessionId: string): Promise<AdaptiveSession> {
        return api<AdaptiveSession>(`${BASE_URL}/sessions/${sessionId}`)
    },

    /**
     * Retrieve the next optimally selected adaptive question
     */
    getNextQuestion(sessionId: string): Promise<NextQuestion> {
        return api<NextQuestion>(
            `${BASE_URL}/sessions/${sessionId}/next-question`
        )
    },

    /**
     * Submit an answer to the current question and update theta
     */
    submitResponse(
        sessionId: string,
        payload: SubmitResponsePayload
    ): Promise<SubmitResponseResult> {
        return api<SubmitResponseResult>(
            `${BASE_URL}/sessions/${sessionId}/responses`,
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        )
    },

    /**
     * Finalize an adaptive session manually or when terminating early
     */
    finishSession(sessionId: string): Promise<FinishSessionResult> {
        return api<FinishSessionResult>(
            `${BASE_URL}/sessions/${sessionId}/finish`,
            {
                method: 'POST',
                body: JSON.stringify({}),
            }
        )
    },

    /**
     * List questions with psychometric IRT parameters (Teacher/Admin)
     */
    listQuestions(params?: {
        skillArea?: string
        calibrated?: boolean
        search?: string
        page?: number
        pageSize?: number
    }): Promise<PaginatedResult<QuestionIRT>> {
        const searchParams = new URLSearchParams()
        if (params?.skillArea)
            searchParams.append('skill_area', params.skillArea)
        if (params?.calibrated !== undefined)
            searchParams.append('calibrated', String(params.calibrated))
        if (params?.search) searchParams.append('search', params.search)
        searchParams.append('page', String(params?.page || 1))
        searchParams.append('page_size', String(params?.pageSize || 20))

        return api<PaginatedResult<QuestionIRT>>(
            `${BASE_URL}/questions?${searchParams.toString()}`
        )
    },

    /**
     * Manually update question IRT parameters (Teacher/Admin)
     */
    updateQuestionIRT(
        questionId: string,
        payload: UpdateQuestionIRTPayload
    ): Promise<QuestionIRT> {
        return api<QuestionIRT>(`${BASE_URL}/questions/${questionId}/irt`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    /**
     * Fetch IRT calibration metrics and pool health (Teacher/Admin)
     */
    getCalibrationStats(): Promise<CalibrationStats> {
        return api<CalibrationStats>(`${BASE_URL}/calibration-stats`)
    },

    /**
     * Trigger batch recalibration job (System Admin only)
     */
    triggerBatchCalibration(
        minResponses: number = 50
    ): Promise<{
        calibrated_items_count: number
        message: string
        timestamp: string
    }> {
        return api<{
            calibrated_items_count: number
            message: string
            timestamp: string
        }>(`${BASE_URL}/calibrate`, {
            method: 'POST',
            body: JSON.stringify({ min_responses: minResponses }),
        })
    },
}
