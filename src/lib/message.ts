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
        createdAt: msg.created_at,
        attachments: msg.attachments || [],
        sender: sender,
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
    /**
     * Get all conversations (Direct + Group)
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
     * Get message history for a room
     * Endpoint: GET /rooms/{room_id}/history
     */
    getMessages: async (
        roomId: string,
        skip = 0,
        limit = 50
    ): Promise<Message[]> => {
        const response = await api<BackendMessageResponse[]>(
            `${BASE_URL}/rooms/${roomId}/history?skip=${skip}&limit=${limit}`,
            { method: 'GET' }
        )

        // BE returns newest first, reverse to get chronological order
        return response.map(mapMessage).reverse()
    },

    /**
     * Send a message
     * Endpoint: POST /send
     *
     * Note: sender_id is automatically set by BE from auth token
     */
    sendMessage: async (payload: SendMessagePayload): Promise<Message> => {
        // Validate: either conversation_id or recipient_id must be provided
        if (!payload.conversation_id && !payload.recipient_id) {
            throw new Error(
                'Either conversation_id or recipient_id must be provided'
            )
        }

        const body = {
            conversation_id: payload.conversation_id,
            receiver_id: payload.recipient_id,
            content: payload.content,
            message_type: payload.message_type || 'text',
            attachment_ids: payload.attachment_ids || [],
        }

        const response = await api<BackendMessageResponse>(`${BASE_URL}/send`, {
            method: 'POST',
            body: JSON.stringify(body),
        })

        return mapMessage(response)
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
     * Add members to group
     * Endpoint: POST /groups/{room_id}/members
     */
    addMembersToGroup: async (
        roomId: string,
        userIds: string[]
    ): Promise<{ added_count: number; added_user_ids: string[] }> => {
        return api<{ added_count: number; added_user_ids: string[] }>(
            `${BASE_URL}/groups/${roomId}/members`,
            {
                method: 'POST',
                body: JSON.stringify({ user_ids: userIds }),
            }
        )
    },

    /**
     * Remove member from group
     * Endpoint: DELETE /groups/{room_id}/members/{user_id}
     */
    removeMemberFromGroup: async (
        roomId: string,
        userId: string
    ): Promise<{ message: string }> => {
        return api<{ message: string }>(
            `${BASE_URL}/groups/${roomId}/members/${userId}`,
            { method: 'DELETE' }
        )
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
     * Get or create direct conversation
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
}
