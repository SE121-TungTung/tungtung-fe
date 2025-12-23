export const NotificationType = {
    SYSTEM: 'system',
    PROMOTION: 'promotion',
    CLASS_ALERT: 'class_alert',
    GRADE: 'grade',
    ANNOUNCEMENT: 'announcement',
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

export interface NotificationResponse {
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

export function isNotificationType(value: string): value is NotificationType {
    return Object.values(NotificationType).includes(value as NotificationType)
}

export interface UnreadCountResponse {
    unread_count: number
}
