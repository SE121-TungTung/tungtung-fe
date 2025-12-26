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
} from '@/types/message.types'

const BASE_URL = '/api/v1/messaging'

// ============================================
// MAPPING UTILITIES
// ============================================

/**
 * Parse full name into first/last name
 * Note: This is a best-effort approach and may not work for all name formats
 */
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

    // For Vietnamese names: "Nguyen Van An" -> firstName="Nguyen Van", lastName="An"
    // For Western names: "John Doe" -> firstName="John", lastName="Doe"
    const lastName = parts[parts.length - 1]
    const firstName = parts.slice(0, -1).join(' ')

    return { firstName, lastName }
}

/**
 * Map backend member response to frontend Participant
 */
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

/**
 * Map backend message response to frontend Message
 */
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

/**
 * Map backend chat history message (from /history endpoint)
 */
function mapHistoryMessage(msg: BackendChatHistoryMessage): Message {
    const { firstName, lastName } = parseFullName(msg.sender_name)

    return {
        id: msg.message_id,
        conversationId: '', // Will be set by caller
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

/**
 * Map backend conversation to frontend Conversation
 */
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
        participants: [], // Will be populated separately if needed
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
// API METHODS
// ============================================

export const messageApi = {
    // ========================================
    // CONVERSATIONS
    // ========================================

    /**
     * Get all conversations (Direct + Group + Class)
     * Endpoint: GET /conversations/all
     */
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

    /**
     * Get or create direct conversation with another user
     * Endpoint: GET /conversations/direct/{other_user_id}
     */
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

    /**
     * Get message history for a room with pagination
     * Endpoint: GET /rooms/{room_id}/history
     */
    getMessages: async (
        roomId: string,
        skip = 0,
        limit = 50
    ): Promise<Message[]> => {
        const response = await api<BackendChatHistoryMessage[]>(
            `${BASE_URL}/rooms/${roomId}/history?skip=${skip}&limit=${limit}`,
            { method: 'GET' }
        )

        // Map and set conversationId
        return response.map((msg) => ({
            ...mapHistoryMessage(msg),
            conversationId: roomId,
        }))
    },

    /**
     * Send a message (REST API)
     * Endpoint: POST /send
     *
     * ✅ FIXED: Use correct field names (room_id, receiver_id)
     */
    sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
        // Validate: either room_id or receiver_id must be provided
        if (!payload.room_id && !payload.receiver_id) {
            throw new Error('Either room_id or receiver_id must be provided')
        }

        const body = {
            room_id: payload.room_id, // ✅ CORRECT
            receiver_id: payload.receiver_id, // ✅ CORRECT
            content: payload.content,
        }

        const response = await api<BackendMessageResponse>(`${BASE_URL}/send`, {
            method: 'POST',
            body: JSON.stringify(body),
        })

        return mapMessage(response)
    },

    /**
     * ✅ IMPLEMENTED: Mark all messages in conversation as read
     * Endpoint: POST /conversations/{room_id}/read
     */
    markAsRead: async (
        roomId: string
    ): Promise<{ success: boolean; marked_count: number }> => {
        return api<{ success: boolean; room_id: string; marked_count: number }>(
            `${BASE_URL}/conversations/${roomId}/read`,
            { method: 'POST' }
        )
    },

    /**
     * ✅ IMPLEMENTED: Search messages
     * Endpoint: GET /search_messages
     */
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

                // Search result thường không kèm thông tin sender chi tiết (name/avatar)
                // Nếu cần hiển thị tên, backend cần join bảng User hoặc FE tự lookup
                sender: undefined,
            })),
        }
    },

    /**
     * ⚠️ PARTIAL: Delete message (soft delete - recipient side only)
     * Endpoint: Not explicitly defined in router, needs implementation
     *
     * Note: Current backend only marks as deleted for recipient, not actual delete
     */
    deleteMessage: async (messageId: string): Promise<{ success: boolean }> => {
        // TODO: Backend needs explicit endpoint
        console.warn(
            'deleteMessage: Backend service exists but no router endpoint'
        )
        throw new Error('API endpoint not exposed in router')

        // When backend adds endpoint:
        // return api<{ success: boolean }>(
        //     `${BASE_URL}/messages/${messageId}`,
        //     { method: 'DELETE' }
        // )
    },

    /**
     * ✅ IMPLEMENTED: Edit message
     * Endpoint: POST /edit_message/{message_id}
     */
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

    /**
     * ✅ IMPLEMENTED: Get total unread count
     * Endpoint: GET /unread-count
     */
    getTotalUnreadCount: async (): Promise<number> => {
        const response = await api<UnreadCountResponse>(
            `${BASE_URL}/unread-count`,
            { method: 'GET' }
        )
        return response.unread_count
    },

    // ========================================
    // GROUP MANAGEMENT
    // ========================================

    /**
     * Get group details with members
     * Endpoint: GET /groups/{room_id}
     */
    getGroupDetails: async (roomId: string): Promise<Conversation> => {
        const response = await api<BackendGroupDetailResponse>(
            `${BASE_URL}/groups/${roomId}`,
            { method: 'GET' }
        )

        return {
            id: response.id,
            name: response.title,
            type: response.room_type as 'direct' | 'group' | 'class',
            isGroup: true,
            avatarUrl: response.avatar_url || null,
            description: response.description || null,
            unreadCount: 0, // Not provided in detail endpoint
            updatedAt: response.created_at,
            participants: (response.members || []).map(mapParticipant),
            memberCount: response.member_count,
        }
    },

    /**
     * Create new group chat
     * Endpoint: POST /groups
     */
    createGroup: async (payload: CreateGroupPayload): Promise<Conversation> => {
        const response = await api<BackendGroupDetailResponse>(
            `${BASE_URL}/groups`,
            {
                method: 'POST',
                body: JSON.stringify({
                    title: payload.title,
                    description: payload.description,
                    member_ids: payload.member_ids,
                    avatar_url: payload.avatar_url,
                }),
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
     * Update group information
     * Endpoint: PUT /groups/{room_id}
     */
    updateGroup: async (
        roomId: string,
        payload: UpdateGroupPayload
    ): Promise<BackendGroupDetailResponse> => {
        return api<BackendGroupDetailResponse>(`${BASE_URL}/groups/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    /**
     * Add members to group
     * Endpoint: POST /groups/{room_id}/members
     */
    addMembersToGroup: async (
        roomId: string,
        userIds: string[]
    ): Promise<AddMembersResponse> => {
        return api<AddMembersResponse>(`${BASE_URL}/groups/${roomId}/members`, {
            method: 'POST',
            body: JSON.stringify({ user_ids: userIds }),
        })
    },

    /**
     * Remove member from group (or self-leave)
     * Endpoint: DELETE /groups/{room_id}/members/{user_id}
     */
    removeMemberFromGroup: async (
        roomId: string,
        userId: string
    ): Promise<RemoveMemberResponse> => {
        return api<RemoveMemberResponse>(
            `${BASE_URL}/groups/${roomId}/members/${userId}`,
            { method: 'DELETE' }
        )
    },

    /**
     * ✅ IMPLEMENTED: Mute conversation
     * Endpoint: POST /rooms/{room_id}/mute
     */
    muteConversation: async (
        roomId: string
    ): Promise<{ success: boolean; is_muted: boolean }> => {
        return api<{ success: boolean; is_muted: boolean }>(
            `${BASE_URL}/rooms/${roomId}/mute`,
            { method: 'POST' }
        )
    },

    /**
     * ✅ IMPLEMENTED: Unmute conversation
     * Endpoint: POST /rooms/{room_id}/unmute
     */
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

    /**
     * Get online users
     * Endpoint: GET /ws/online-users
     */
    getOnlineUsers: async (): Promise<string[]> => {
        const response = await api<OnlineUsersResponse>(
            `${BASE_URL}/ws/online-users`,
            { method: 'GET' }
        )
        return response.online_users
    },

    /**
     * Get WebSocket connection stats (admin)
     * Endpoint: GET /ws/stats
     */
    getWebSocketStats: async () => {
        return api(`${BASE_URL}/ws/stats`, { method: 'GET' })
    },
}
