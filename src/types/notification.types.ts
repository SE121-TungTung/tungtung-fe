export const NotificationType = {
    SYSTEM: 'system',
    PROMOTION: 'promotion',
    CLASS_ALERT: 'class_alert',
    GRADE: 'grade',
    ANNOUNCEMENT: 'announcement',
    SCHEDULE_CHANGE: 'schedule_change',
    PAYMENT: 'payment',
} as const

export type NotificationType =
    (typeof NotificationType)[keyof typeof NotificationType]

export const NotificationPriority = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
} as const

export type NotificationPriority =
    (typeof NotificationPriority)[keyof typeof NotificationPriority]

export interface Notification {
    id: string
    user_id: string
    title: string
    content: string
    notification_type: NotificationType
    priority: NotificationPriority
    data?: Record<string, any>
    action_url?: string | null
    channels: string[]
    read_at: string | null
    created_at: string
    sent_channels?: Record<string, any> | null
}

// export interface NotificationResponse extends Notification {}

export interface NotificationUI extends Notification {
    isRead: boolean
    timestamp: string
}

export function isNotificationType(value: string): value is NotificationType {
    return Object.values(NotificationType).includes(value as NotificationType)
}

// New BE response shape: { success, data: Notification[], message, meta }
export interface NotificationListResponse {
    success?: boolean
    data: Notification[]
    message?: string | null
    meta?: { total?: number; page?: number; limit?: number } | null
    // Legacy fields (kept for backward compat)
    notifications?: Notification[]
    total?: number
}

export interface UnreadCountResponse {
    unread_count: number
}
