import { api } from '@/lib/api'
import type {
    Conversation,
    Message,
    SendMessagePayload,
    CreateGroupPayload,
} from '@/types/message.types'

const BASE_URL = '/api/v1/messages'

export const messageApi = {
    /**
     * Lấy danh sách các cuộc trò chuyện
     */
    getConversations: async () => {
        return api<Conversation[]>(`${BASE_URL}/conversations`, {
            method: 'GET',
        })
    },

    /**
     * Lấy chi tiết một cuộc trò chuyện (bao gồm cả check xem có tồn tại không)
     */
    getConversationById: async (id: string) => {
        return api<Conversation>(`${BASE_URL}/conversations/${id}`, {
            method: 'GET',
        })
    },

    /**
     * Lấy lịch sử tin nhắn của một cuộc hội thoại
     * @param page Dùng cho infinite scroll
     */
    getMessages: async (conversationId: string, page = 1, limit = 20) => {
        return api<Message[]>(
            `${BASE_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
            { method: 'GET' }
        )
    },

    /**
     * Gửi tin nhắn
     */
    sendMessage: async (payload: SendMessagePayload) => {
        return api<Message>(`${BASE_URL}/`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    /**
     * Tạo nhóm chat mới
     */
    createGroup: async (payload: CreateGroupPayload) => {
        return api<Conversation>(`${BASE_URL}/groups`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    /**
     * Thêm thành viên vào nhóm
     */
    addMembersToGroup: async (groupId: string, memberIds: string[]) => {
        return api<Conversation>(`${BASE_URL}/groups/${groupId}/members`, {
            method: 'POST',
            body: JSON.stringify({ member_ids: memberIds }),
        })
    },

    /**
     * Xóa thành viên khỏi nhóm
     */
    removeMemberFromGroup: async (groupId: string, userId: string) => {
        return api<void>(`${BASE_URL}/groups/${groupId}/members/${userId}`, {
            method: 'DELETE',
        })
    },

    /**
     * Đánh dấu đã đọc tin nhắn
     */
    markAsRead: async (conversationId: string) => {
        return api<void>(`${BASE_URL}/conversations/${conversationId}/read`, {
            method: 'POST',
        })
    },
}
