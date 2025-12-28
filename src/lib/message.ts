import { api } from '@/lib/api'
import type {
    Conversation,
    Message,
    SendMessagePayload,
    CreateGroupPayload,
    UpdateGroupPayload,
    Participant,
    BackendConversationResponse,
    BackendGroupDetailResponse,
    BackendMessageResponse,
    BackendMemberResponse,
    BackendChatHistoryMessage,
    UnreadCountResponse,
    OnlineUsersResponse,
    AddMembersResponse,
    RemoveMemberResponse,
    SearchMessagesParams,
    DeleteConversationResponse,
    DeleteMessageResponse,
} from '@/types/message.types'

const BASE_URL = '/api/v1/messaging'

// ============================================
// MAPPING UTILITIES
// ============================================

function parseFullName(fullName: string): {
    firstName: string
    lastName: string
} {
    const trimmed = fullName.trim()
    if (!trimmed) {
        return { firstName: '', lastName: '' }
    }

    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' }
    }

    const lastName = parts[parts.length - 1]
    const firstName = parts.slice(0, -1).join(' ')

    return { firstName, lastName }
}

function mapParticipant(member: BackendMemberResponse): Participant {
    const fullName = member.full_name || 'Unknown User'
    const { firstName, lastName } = parseFullName(fullName)

    return {
        id: member.user_id,
        email: member.email || '',
        fullName: fullName,
        firstName: firstName,
        lastName: lastName,
        avatarUrl: member.avatar_url || null,
        isOnline: member.is_online,
        role: member.role,
    }
}

function mapMessage(msg: BackendMessageResponse): Message {
    let sender: Participant | undefined

    if (msg.sender) {
        const fullName =
            `${msg.sender.first_name} ${msg.sender.last_name}`.trim()
        const { firstName, lastName } = parseFullName(fullName)

        sender = {
            id: msg.sender.id,
            fullName: fullName,
            firstName: firstName,
            lastName: lastName,
            avatarUrl: msg.sender.avatar_url || null,
            email: '',
        }
    }

    return {
        id: msg.id,
        conversationId: msg.chat_room_id,
        senderId: msg.sender_id,
        content: msg.content,
        messageType: msg.message_type,
        status: (msg.status as any) || 'read',
        createdAt: msg.timestamp,
        attachments: msg.attachments || [],
        sender: sender,
    }
}

function mapHistoryMessage(msg: BackendChatHistoryMessage): Message {
    const { firstName, lastName } = parseFullName(msg.sender_name)

    return {
        id: msg.message_id,
        conversationId: '',
        senderId: msg.sender_id,
        content: msg.content,
        messageType: msg.message_type,
        createdAt: msg.timestamp,
        attachments: msg.attachments || [],
        isRead: msg.is_read,
        isStarred: msg.is_starred,
        sender: msg.sender_id
            ? {
                  id: msg.sender_id,
                  fullName: msg.sender_name,
                  firstName,
                  lastName,
                  email: '',
                  avatarUrl: null,
              }
            : undefined,
    }
}

function mapConversation(dto: BackendConversationResponse): Conversation {
    return {
        id: dto.room_id,
        name: dto.title,
        type: dto.room_type,
        isGroup: dto.room_type === 'group' || dto.room_type === 'class',
        avatarUrl: dto.avatar_url || null,
        description: dto.description || null,
        unreadCount: dto.unread_count,
        updatedAt: dto.last_message_at || new Date().toISOString(),
        participants: [],
        memberCount: dto.member_count,
        lastMessage: dto.last_message
            ? {
                  id: dto.last_message.message_id,
                  content: dto.last_message.content,
                  senderId: dto.last_message.sender_id,
                  createdAt: dto.last_message.timestamp,
              }
            : undefined,
    }
}

// ============================================
// API METHODS - UPDATED
// ============================================

export const messageApi = {
    // ========================================
    // CONVERSATIONS
    // ========================================

    getConversations: async (): Promise<Conversation[]> => {
        try {
            const response = await api<BackendConversationResponse[]>(
                `${BASE_URL}/conversations/all`,
                { method: 'GET' }
            )
            return response.map(mapConversation)
        } catch (error) {
            console.error('Error fetching conversations:', error)
            return []
        }
    },

    getOrCreateDirectConversation: async (
        otherUserId: string
    ): Promise<Conversation> => {
        const response = await api<BackendConversationResponse>(
            `${BASE_URL}/conversations/direct/${otherUserId}`,
            { method: 'GET' }
        )
        return mapConversation(response)
    },

    // ========================================
    // MESSAGES
    // ========================================

    getMessages: async (
        roomId: string,
        skip = 0,
        limit = 50
    ): Promise<Message[]> => {
        const response = await api<BackendChatHistoryMessage[]>(
            `${BASE_URL}/rooms/${roomId}/history?skip=${skip}&limit=${limit}`,
            { method: 'GET' }
        )
        return response.map((msg) => ({
            ...mapHistoryMessage(msg),
            conversationId: roomId,
        }))
    },

    sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
        if (!payload.room_id && !payload.receiver_id) {
            throw new Error('Either room_id or receiver_id must be provided')
        }

        const body = {
            room_id: payload.room_id,
            receiver_id: payload.receiver_id,
            content: payload.content,
        }

        const response = await api<BackendMessageResponse>(`${BASE_URL}/send`, {
            method: 'POST',
            body: JSON.stringify(body),
        })

        return mapMessage(response)
    },

    markAsRead: async (
        roomId: string
    ): Promise<{ success: boolean; marked_count: number }> => {
        return api<{ success: boolean; room_id: string; marked_count: number }>(
            `${BASE_URL}/conversations/${roomId}/read`,
            { method: 'POST' }
        )
    },

    searchMessages: async (
        params: SearchMessagesParams
    ): Promise<{
        total: number
        results: Message[]
    }> => {
        const query = new URLSearchParams({
            query: params.q,
            ...(params.room_id && { room_id: params.room_id }),
            skip: String(params.skip || 0),
            limit: String(params.limit || 20),
        })

        const response = await api<{
            total: number
            results: any[]
        }>(`${BASE_URL}/search_messages?${query}`, { method: 'GET' })

        return {
            total: response.total,
            results: response.results.map((msg) => ({
                id: msg.id,
                conversationId: msg.chat_room_id,
                senderId: msg.sender_id,
                content: msg.content,
                messageType: msg.message_type || 'text',
                createdAt: msg.created_at,
                attachments: msg.attachments || [],
                status: msg.status || 'sent',
                sender: undefined,
            })),
        }
    },

    deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
        return api<DeleteMessageResponse>(`/api/v1/messages/${messageId}`, {
            method: 'DELETE',
        })
    },

    editMessage: async (
        messageId: string,
        newContent: string
    ): Promise<Message> => {
        const response = await api<BackendMessageResponse>(
            `${BASE_URL}/edit_message/${messageId}?new_content=${encodeURIComponent(newContent)}`,
            { method: 'POST' }
        )
        return mapMessage(response)
    },

    getTotalUnreadCount: async (): Promise<number> => {
        const response = await api<UnreadCountResponse>(
            `${BASE_URL}/unread-count`,
            { method: 'GET' }
        )
        return response.unread_count
    },

    // ========================================
    // GROUP MANAGEMENT - UPDATED
    // ========================================

    getGroupDetails: async (
        roomId: string,
        currentUserId: string
    ): Promise<Conversation> => {
        const response = await api<BackendGroupDetailResponse>(
            `${BASE_URL}/groups/${roomId}`,
            { method: 'GET' }
        )

        const currentMember = response.members.find(
            (m) => m.user_id === currentUserId
        )

        return {
            id: response.id,
            name: response.title,
            type: response.room_type as 'direct' | 'group' | 'class',
            isGroup: true,
            avatarUrl: response.avatar_url || null,
            description: response.description || null,
            unreadCount: 0,
            updatedAt: response.created_at,
            participants: (response.members || []).map(mapParticipant),
            memberCount: response.member_count,
            isAdmin: currentMember?.role === 'admin',
        }
    },

    /**
     * Backend expects FormData with:
     * - title: string (Form)
     * - description: string (Form, optional)
     * - member_ids: comma-separated string (Form)
     * - avatar: File (File, optional)
     */
    createGroup: async (payload: CreateGroupPayload): Promise<Conversation> => {
        const formData = new FormData()

        formData.append('title', payload.title)

        if (payload.description) {
            formData.append('description', payload.description)
        }

        formData.append('member_ids', payload.member_ids.join(','))

        if (payload.avatar) {
            formData.append('avatar', payload.avatar)
        }

        const response = await api<BackendGroupDetailResponse>(
            `${BASE_URL}/groups`,
            {
                method: 'POST',
                body: formData,
            }
        )

        return {
            id: response.id,
            name: response.title,
            type: 'group',
            isGroup: true,
            avatarUrl: response.avatar_url || null,
            description: response.description || null,
            unreadCount: 0,
            updatedAt: response.created_at,
            participants: (response.members || []).map(mapParticipant),
            memberCount: response.member_count,
        }
    },

    /**
     * Backend expects FormData with:
     * - title: string (Form, optional)
     * - description: string (Form, optional)
     * - avatar: File (File, optional)
     */
    updateGroup: async (
        roomId: string,
        payload: UpdateGroupPayload
    ): Promise<BackendGroupDetailResponse> => {
        const formData = new FormData()

        if (payload.title !== undefined) {
            formData.append('title', payload.title)
        }

        if (payload.description !== undefined) {
            formData.append('description', payload.description || '')
        }

        if (payload.avatar) {
            formData.append('avatar', payload.avatar)
        }

        return api<BackendGroupDetailResponse>(`${BASE_URL}/groups/${roomId}`, {
            method: 'PUT',
            body: formData,
        })
    },

    /**
     * ✅ NEW: Delete/Clear conversation
     * - Direct chat: Clear for current user only
     * - Group chat: Delete entire room (admin only)
     * Endpoint: DELETE /rooms/{room_id}
     */
    deleteConversation: async (
        roomId: string
    ): Promise<DeleteConversationResponse> => {
        return api<DeleteConversationResponse>(`${BASE_URL}/rooms/${roomId}`, {
            method: 'DELETE',
        })
    },

    addMembersToGroup: async (
        roomId: string,
        userIds: string[]
    ): Promise<AddMembersResponse> => {
        return api<AddMembersResponse>(`${BASE_URL}/groups/${roomId}/members`, {
            method: 'POST',
            body: JSON.stringify({ user_ids: userIds }),
        })
    },

    removeMemberFromGroup: async (
        roomId: string,
        userId: string
    ): Promise<RemoveMemberResponse> => {
        return api<RemoveMemberResponse>(
            `${BASE_URL}/groups/${roomId}/members/${userId}`,
            { method: 'DELETE' }
        )
    },

    muteConversation: async (
        roomId: string
    ): Promise<{ success: boolean; is_muted: boolean }> => {
        return api<{ success: boolean; is_muted: boolean }>(
            `${BASE_URL}/rooms/${roomId}/mute`,
            { method: 'POST' }
        )
    },

    unmuteConversation: async (
        roomId: string
    ): Promise<{ success: boolean; is_muted: boolean }> => {
        return api<{ success: boolean; is_muted: boolean }>(
            `${BASE_URL}/rooms/${roomId}/unmute`,
            { method: 'POST' }
        )
    },

    // ========================================
    // WEBSOCKET UTILITIES
    // ========================================

    getOnlineUsers: async (): Promise<string[]> => {
        const response = await api<OnlineUsersResponse>(
            `${BASE_URL}/ws/online-users`,
            { method: 'GET' }
        )
        return response.online_users
    },

    getWebSocketStats: async () => {
        return api(`${BASE_URL}/ws/stats`, { method: 'GET' })
    },
}
