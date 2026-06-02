import { api } from './api'

export interface PaginationResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
}

const BASE_URL = '/api/v1/chatbot'

export interface ChatbotResponse {
    reply: string
    sources?: string[]
}

export interface UploadResponse {
    filename: string
    status: string
    message: string
}

export interface ChatbotDocument {
    id: string
    doc_id: string
    filename: string
    category: string
    uploaded_by_name: string
    created_at: string
    updated_at: string
}

export const chatbotApi = {
    uploadDocument: async (
        file: File,
        docCategory: string = 'business'
    ): Promise<UploadResponse> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('doc_category', docCategory)

        return api<UploadResponse>(`${BASE_URL}/admin/upload-doc`, {
            method: 'POST',
            body: formData,
        })
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

    askBot: async (message: string, history: any[] = []) => {
        return api<ChatbotResponse>(`${BASE_URL}/ask`, {
            method: 'POST',
            body: JSON.stringify({ message, history }),
        })
    },
}
