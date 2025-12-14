import type { User } from './auth'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

export interface Attachment {
    id: string
    fileName: string
    fileUrl: string
    fileType: 'image' | 'file'
    fileSize?: number
}

export interface Participant extends User {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | undefined
    email: string
    isOnline?: boolean
}

export interface Message {
    id: string
    conversationId: string
    senderId: string
    content: string
    attachments: Attachment[]
    createdAt: string

    status?: MessageStatus
    sender?: Participant
}

export interface Conversation {
    id: string
    name?: string
    isGroup: boolean
    avatarUrl?: string

    participants: Participant[]

    lastMessage?: Message
    unreadCount: number
    updatedAt: string
}

export interface SendMessagePayload {
    conversation_id?: string
    recipient_id?: string
    content?: string
    attachment_ids?: string[]
}

export interface CreateGroupPayload {
    name: string
    member_ids: string[]
}
