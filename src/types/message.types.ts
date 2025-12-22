// ============================================
// BACKEND RESPONSE TYPES (Snake Case)
// ============================================

export interface BackendUserInfo {
    id: string
    user_id?: string // Some endpoints use user_id instead of id
    email: string
    full_name: string
    first_name?: string
    last_name?: string
    avatar_url?: string | null
    is_online?: boolean
    role?: string
}

export interface BackendMemberResponse {
    user_id: string
    role: string
    joined_at: string
    nickname?: string | null
    full_name: string
    avatar_url?: string | null
    is_online: boolean
    email?: string
}

export interface BackendLastMessage {
    message_id: string
    content: string
    timestamp: string
    sender_id?: string // BE might include this
}

export interface BackendConversationResponse {
    room_id: string
    room_type: 'direct' | 'group' | 'class'
    title: string
    avatar_url?: string | null
    unread_count: number
    last_message_at?: string | null
    last_message?: BackendLastMessage | null
    description?: string | null
    member_count?: number
}

export interface BackendGroupDetailResponse {
    id: string
    title: string
    description?: string | null
    avatar_url?: string | null
    room_type: string
    created_at: string
    member_count: number
    members: BackendMemberResponse[]
}

export interface BackendMessageResponse {
    id: string
    chat_room_id: string
    sender_id: string | null // null for system messages
    content: string
    message_type: string
    created_at: string
    status: string
    attachments?: any[]
    sender?: {
        id: string
        first_name: string
        last_name: string
        avatar_url?: string | null
    }
}

// ============================================
// FRONTEND TYPES (Camel Case)
// ============================================

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

export interface Attachment {
    id: string
    fileName: string
    fileUrl: string
    fileType: 'image' | 'file'
    fileSize?: number
}

export interface Participant {
    id: string
    email: string
    fullName: string // Store full name as-is from BE
    firstName?: string // Optional parsed first name
    lastName?: string // Optional parsed last name
    avatarUrl: string | null
    isOnline?: boolean
    role?: string
}

export interface Message {
    id: string
    conversationId: string
    senderId: string | null // null for system messages
    content: string
    attachments: Attachment[]
    createdAt: string
    messageType?: string
    status?: MessageStatus
    sender?: Participant
}

export interface Conversation {
    id: string
    name: string
    isGroup: boolean
    type: 'direct' | 'group' | 'class'
    avatarUrl?: string | null
    unreadCount: number
    description?: string | null
    participants: Participant[]
    lastMessage?: {
        id: string
        content: string
        senderId?: string
        createdAt: string
    }
    updatedAt: string
    memberCount?: number
}

// ============================================
// API PAYLOAD TYPES
// ============================================

export interface SendMessagePayload {
    // Either conversation_id (existing chat) OR recipient_id (new direct chat)
    conversation_id?: string
    recipient_id?: string
    content: string
    message_type?: 'text' | 'image' | 'file' | 'system'
    attachment_ids?: string[]
    // Note: sender_id is NOT needed - BE gets it from auth token
}

export interface CreateGroupPayload {
    title: string
    description?: string
    member_ids: string[]
    avatar_url?: string
}

export interface UpdateGroupPayload {
    title?: string
    description?: string | null
    avatar_url?: string | null
}

export interface AddMembersRequest {
    user_ids: string[]
}

// ============================================
// USER SEARCH TYPES
// ============================================

export interface UserSearchResult {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
    role: string
}
