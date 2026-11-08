import { api } from './api'

export interface PaginationResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
}

const BASE_URL = '/api/v1/chatbot'

export type RetrievalMode = 'standard' | 'hybrid' | 'hybrid_rerank'

export interface ChatbotSourceCitation {
    filename: string
    title: string
    doc_id: string
    doc_category: string
    score: number
    snippet: string
}

export interface AgentToolCallEvent {
    tool: string
    status: 'running' | 'completed' | 'duplicate_skipped'
    label: string
}

export interface AgentUiActionEvent {
    action: 'navigate'
    route_key: string
    route: string
    label: string
}

export interface ChatbotStreamPacket {
    tool_call?: AgentToolCallEvent
    ui_action?: AgentUiActionEvent
    sources?: ChatbotSourceCitation[]
    retrieval_mode?: RetrievalMode
    text?: string
    done?: boolean
    mode?: 'agent' | 'rag' | 'rag_fallback' | 'quick_chitchat'
    fallback_reason?: string | null
    steps_used?: number
    llm_calls?: number
    error?: string
}

export interface ChatbotStreamMessageState {
    text: string
    sources?: ChatbotSourceCitation[]
    toolCalls?: AgentToolCallEvent[]
    uiActions?: AgentUiActionEvent[]
    fallbackNotice?: string
}

export function applyChatbotStreamPacket(
    current: ChatbotStreamMessageState,
    packet: ChatbotStreamPacket,
    onNavigate?: (route: string) => void
): ChatbotStreamMessageState {
    const next: ChatbotStreamMessageState = {
        ...current,
        toolCalls: current.toolCalls ? [...current.toolCalls] : [],
        uiActions: current.uiActions ? [...current.uiActions] : [],
        sources: current.sources ? [...current.sources] : [],
    }

    if (packet.tool_call) {
        const tc = packet.tool_call
        const existing = next.toolCalls || []
        const matchIdx = existing.findIndex(
            (item) => item.tool === tc.tool && item.status === 'running'
        )
        if (matchIdx >= 0 && tc.status !== 'running') {
            existing[matchIdx] = tc
        } else {
            existing.push(tc)
        }
        next.toolCalls = existing
    }

    if (packet.ui_action) {
        const act = packet.ui_action
        if (act.action === 'navigate' && act.route) {
            if (onNavigate) {
                onNavigate(act.route)
            }
            const currentActions = next.uiActions || []
            if (!currentActions.some((a) => a.route === act.route)) {
                currentActions.push(act)
            }
            next.uiActions = currentActions
        }
    }

    if (packet.sources && Array.isArray(packet.sources)) {
        next.sources = packet.sources
    }

    if (packet.text) {
        next.text = (next.text || '') + packet.text
    }

    if (
        packet.done &&
        packet.mode === 'rag_fallback' &&
        packet.fallback_reason &&
        packet.fallback_reason !== 'role_or_flag_rag_mode'
    ) {
        next.fallbackNotice =
            'Đã chuyển sang chế độ hỏi đáp tri thức tiêu chuẩn (hết hạn mức công cụ Agent tạm thời).'
    }

    return next
}

export interface ChatbotResponse {
    reply: string
    sources?: ChatbotSourceCitation[]
    retrieval_mode?: RetrievalMode
    mode?: 'agent' | 'rag' | 'rag_fallback' | 'quick_chitchat'
    fallback_reason?: string | null
    ui_actions?: AgentUiActionEvent[]
    tool_calls?: Array<{
        tool: string
        args: Record<string, unknown>
        status: string
    }>
    steps_used?: number
    llm_calls?: number
}

export interface UploadResponse {
    filename: string
    status: string
    message: string
}

export type DocStatus = 'processing' | 'completed' | 'failed'

export type DocumentAudience =
    'public' | 'student' | 'teacher' | 'staff' | 'admin'

export interface ChatbotDocument {
    id: string
    doc_id: string | null
    filename: string
    category: string
    audience: DocumentAudience[]
    audience_reviewed: boolean
    status: DocStatus
    error_message: string | null
    uploaded_by_name: string
    created_at: string
    updated_at: string
}

export interface RagasMetricsSummary {
    faithfulness: number
    answer_relevance: number
    context_precision: number
    context_recall: number
    overall_ragas_score: number
}

export interface RagasConfigEvaluation {
    config_id: string
    name: string
    retrieval_mode: RetrievalMode
    reranker: string
    embedding_model: string
    evaluated_questions: number
    metrics: RagasMetricsSummary
}

export interface RagasEvaluationPayload {
    benchmark_name: string
    evaluated_at: string
    dataset_size: number
    configurations: RagasConfigEvaluation[]
}

export const chatbotApi = {
    uploadDocument: async (
        file: File,
        docCategory: string = 'business',
        audience: DocumentAudience[] = ['student', 'teacher', 'staff', 'admin']
    ): Promise<ChatbotDocument> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('doc_category', docCategory)
        formData.append('audience', JSON.stringify(audience))

        return api<ChatbotDocument>(`${BASE_URL}/admin/upload-doc`, {
            method: 'POST',
            body: formData,
        })
    },

    updateDocumentAudience: async (
        docId: string,
        audience: DocumentAudience[],
        audienceReviewed: boolean = true
    ): Promise<ChatbotDocument> => {
        return api<ChatbotDocument>(
            `${BASE_URL}/admin/documents/${docId}/audience`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    audience,
                    audience_reviewed: audienceReviewed,
                }),
            }
        )
    },

    bulkUpdateDocumentAudience: async (
        documentIds: string[],
        audience: DocumentAudience[],
        audienceReviewed: boolean = true
    ): Promise<ChatbotDocument[]> => {
        return api<ChatbotDocument[]>(
            `${BASE_URL}/admin/documents/bulk-audience`,
            {
                method: 'PATCH',
                body: JSON.stringify({
                    document_ids: documentIds,
                    audience,
                    audience_reviewed: audienceReviewed,
                }),
            }
        )
    },

    getDocuments: async (params?: {
        page?: number
        limit?: number
        category?: string
    }) => {
        const searchParams = new URLSearchParams()
        if (params?.page) searchParams.append('page', params.page.toString())
        if (params?.limit) searchParams.append('limit', params.limit.toString())
        if (params?.category) searchParams.append('category', params.category)

        const qs = searchParams.toString()
        const url = `${BASE_URL}/admin/documents${qs ? `?${qs}` : ''}`
        return api<PaginationResponse<ChatbotDocument>>(url, {
            method: 'GET',
        })
    },

    getDocumentStatus: async (docDbId: string): Promise<ChatbotDocument> => {
        return api<ChatbotDocument>(
            `${BASE_URL}/admin/documents/${docDbId}/status`,
            { method: 'GET' }
        )
    },

    deleteDocument: async (docId: string) => {
        return api<string>(`${BASE_URL}/admin/documents/${docId}`, {
            method: 'DELETE',
        })
    },

    updateDocument: async (
        docId: string,
        file: File
    ): Promise<ChatbotDocument> => {
        const formData = new FormData()
        formData.append('file', file)

        return api<ChatbotDocument>(`${BASE_URL}/admin/documents/${docId}`, {
            method: 'PUT',
            body: formData,
        })
    },

    retryUpload: async (
        docDbId: string,
        file: File
    ): Promise<ChatbotDocument> => {
        const formData = new FormData()
        formData.append('file', file)

        return api<ChatbotDocument>(
            `${BASE_URL}/admin/documents/${docDbId}/retry`,
            {
                method: 'POST',
                body: formData,
            }
        )
    },

    askBot: async (
        message: string,
        history: Array<{ role: string; content: string }> = [],
        retrievalMode: RetrievalMode = 'hybrid_rerank'
    ) => {
        return api<ChatbotResponse>(`${BASE_URL}/ask`, {
            method: 'POST',
            body: JSON.stringify({
                message,
                history,
                retrieval_mode: retrievalMode,
            }),
        })
    },

    getRagasResults: async (): Promise<RagasEvaluationPayload> => {
        return api<RagasEvaluationPayload>(`${BASE_URL}/evaluation/results`, {
            method: 'GET',
        })
    },

    triggerRagasBenchmark: async (
        sampleSize?: number
    ): Promise<RagasEvaluationPayload> => {
        const qs = sampleSize ? `?sample_size=${sampleSize}` : ''
        return api<RagasEvaluationPayload>(
            `${BASE_URL}/evaluation/ragas-benchmark${qs}`,
            { method: 'POST' }
        )
    },
}
