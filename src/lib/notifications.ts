import { api } from '@/lib/api'
import type {
    Notification,
    NotificationListResponse,
    UnreadCountResponse,
} from '@/types/notification.types'

const BASE_URL = '/api/v1/notifications'

export async function getNotifications(
    skip = 0,
    limit = 50
): Promise<NotificationListResponse> {
    const qs = new URLSearchParams()
    qs.set('skip', String(skip))
    qs.set('limit', String(limit))

    return api<NotificationListResponse>(`${BASE_URL}/?${qs.toString()}`, {
        method: 'GET',
    })
}

export async function getUnreadCount(): Promise<number> {
    const res = await api<UnreadCountResponse>(`${BASE_URL}/unread-count`, {
        method: 'GET',
    })
    return res.unread_count
}

export async function markAsRead(
    notificationId: string
): Promise<Notification> {
    return api<Notification>(`${BASE_URL}/${notificationId}/read`, {
        method: 'PUT',
    })
}

export async function markAllAsRead(): Promise<{
    message: string
    count: number
}> {
    return api<{ message: string; count: number }>(`${BASE_URL}/read-all`, {
        method: 'PUT',
    })
}
