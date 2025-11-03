export interface Notification {
    id: string
    type: 'system' | 'promotion' | 'class_alert' | 'grade'
    title: string
    content: string
    timestamp: string
    isRead: boolean
    link?: string
}
