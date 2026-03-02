import { api } from './api'

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

export const chatbotApi = {
    uploadDocument: async (file: File): Promise<UploadResponse> => {
        const formData = new FormData()
        formData.append('file', file)

        return api<UploadResponse>(`${BASE_URL}/admin/upload-doc`, {
            method: 'POST',
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
