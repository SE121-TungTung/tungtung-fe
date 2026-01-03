// ============================================
// BACKEND RESPONSE TYPES (Snake Case)
// ============================================

export interface BackendUserInfo {
    id: string
    user_id?: string
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
    sender_id?: string
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
    sender_id: string | null
    content: string
    message_type: string
    timestamp: string
    status: string
    attachments?: any[]
    created_at: string
    updated_at?: string
    is_edited?: boolean
    sender?: {
        id: string
        first_name: string
        last_name: string
        avatar_url?: string | null
    }
}

export interface BackendChatHistoryMessage {
    message_id: string
    sender_id: string | null
    sender_name: string
    content: string
    message_type: string
    timestamp: string
    attachments: any[]
    is_read: boolean
    is_starred: boolean
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
    fullName: string
    firstName?: string
    lastName?: string
    avatarUrl: string | null
    isOnline?: boolean
    role?: string
}

export interface Message {
    id: string
    conversationId: string
    senderId: string | null
    content: string
    attachments: Attachment[]
    createdAt: string
    updatedAt?: string
    isEdited?: boolean
    messageType?: string
    status?: MessageStatus
    sender?: Participant
    isRead?: boolean
    isStarred?: boolean
    isPending?: boolean
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
    isMuted?: boolean
    isAdmin?: boolean
}

// ============================================
// API PAYLOAD TYPES - UPDATED
// ============================================

export interface SendMessagePayload {
    room_id?: string
    receiver_id?: string
    content: string
}

export interface CreateGroupPayload {
    title: string
    description?: string
    member_ids: string[]
    avatar?: File
}

export interface UpdateGroupPayload {
    title?: string
    description?: string | null
    avatar?: File
}

export interface AddMembersRequest {
    user_ids: string[]
}

export interface MarkAsReadRequest {
    message_ids?: string[]
}

export interface SearchMessagesParams {
    q: string
    room_id?: string
    skip?: number
    limit?: number
}

// ============================================
// WEBSOCKET MESSAGE TYPES
// ============================================

export type WebSocketMessageType =
    | 'connected'
    | 'new_message'
    | 'system_message'
    | 'group_created'
    | 'typing'
    | 'error'
    | 'pong'
    | 'member_added'
    | 'member_removed'
    | 'group_updated'

export interface WSConnectedMessage {
    type: 'connected'
    message: string
    user_id: string
    connection_id: string
}

export interface WSNewMessage {
    type: 'new_message'
    message_id: string
    sender_id: string
    room_id: string
    room_type: 'direct' | 'group' | 'class'
    content: string
    timestamp: string
    attachments: any[]
}

export interface WSSystemMessage {
    type: 'system_message'
    message_id: string
    room_id: string
    content: string
    timestamp: string
}

export interface WSGroupCreated {
    type: 'group_created'
    room_id: string
    title: string
    created_by: string
    member_count: number
}

export interface WSTypingIndicator {
    type: 'typing'
    room_id: string
    user_id: string
    is_typing: boolean
}

export interface WSError {
    type: 'error'
    message: string
    code?: string
}

export interface WSPong {
    type: 'pong'
}

export type WSIncomingMessage =
    | WSConnectedMessage
    | WSNewMessage
    | WSSystemMessage
    | WSGroupCreated
    | WSTypingIndicator
    | WSError
    | WSPong

export interface WSOutgoingPing {
    type: 'ping'
}

export interface WSOutgoingTyping {
    type: 'typing'
    room_id: string
    is_typing: boolean
}

export interface WSOutgoingSendMessage {
    type: 'message'
    room_id?: string
    receiver_id?: string
    content: string
}

export type WSOutgoingMessage =
    | WSOutgoingPing
    | WSOutgoingTyping
    | WSOutgoingSendMessage

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

// ============================================
// API RESPONSE TYPES
// ============================================

export interface UnreadCountResponse {
    unread_count: number
}

export interface OnlineUsersResponse {
    online_users: string[]
    total: number
}

export interface AddMembersResponse {
    added_count: number
    added_user_ids: string[]
}

export interface RemoveMemberResponse {
    message: string
}

export interface WebSocketStatsResponse {
    total_connections: number
    active_users: number
    rooms: Record<string, number>
}

export interface DeleteConversationResponse {
    success: boolean
    room_id?: string
    scope?: 'self' | 'all'
    message: string
}

export interface DeleteMessageResponse {
    success: boolean
    message_id?: string
    message: string
}
