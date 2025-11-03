/**
 * Thông tin cơ bản của một người tham gia cuộc trò chuyện.
 */
export interface Participant {
    id: string // Tương đương users.id (UUID)
    name: string // Tương đương users.first_name + users.last_name
    avatarUrl: string | null // Tương đương users.avatar_url
    onlineStatus: boolean // Sẽ cần logic để xác định (ví dụ: last_login)
}

/**
 * Đại diện cho một cuộc trò chuyện (đơn hoặc nhóm).
 */
export interface Conversation {
    id: string
    isGroup: boolean
    groupName?: string // Tên nhóm, nếu isGroup = true
    participants: Participant[]
    lastMessage: string
    lastMessageTimestamp: string // Thời gian của tin nhắn cuối
    // unreadCount?: number // (Tùy chọn) Số tin nhắn chưa đọc
}

/**
 * Đại diện cho một tin nhắn đơn lẻ.
 */
export interface Message {
    id: string
    senderId: string // ID của người gửi (từ users.id)
    text: string
    timestamp: string
    // reactions?: { icon: string; userId: string }[] // (Cải tiến)
    // readBy?: string[] // (Cải tiến)
}
