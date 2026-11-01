import { api } from '@/lib/api'
import type {
    Notification,
    NotificationListResponse,
    UnreadCountResponse,
} from '@/types/notification.types'

const BASE_URL = '/api/v1/notifications'

export async function getNotifications(
    skip = 0,
    limit = 50,
    unreadOnly = false
): Promise<NotificationListResponse> {
    const page = limit > 0 ? Math.floor(skip / limit) + 1 : 1
    const qs = new URLSearchParams()
    qs.set('page', String(page))
    qs.set('skip', String(skip))
    qs.set('limit', String(limit))
    if (unreadOnly) {
        qs.set('unread_only', 'true')
    }

    // api() auto-unwraps {success, data} but returns the full object when 'meta' key exists.
    // BE now returns {success, data: Notification[], message, meta}
    const res = await api<NotificationListResponse | Notification[]>(
        `${BASE_URL}?${qs.toString()}`,
        {
            method: 'GET',
        }
    )

    // Fallback: api() already unwrapped, res IS the array
    if (Array.isArray(res)) {
        return { data: res, notifications: res, total: res.length }
    }

    // Handle both old shape {notifications, total} and new shape {data: [...], meta: {total}}
    if (Array.isArray(res?.data)) {
        return {
            data: res.data,
            notifications: res.data,
            total: res.meta?.total ?? res.data.length,
            meta: res.meta,
        }
    }
    // Legacy
    if (Array.isArray(res?.notifications)) {
        return {
            data: res.notifications,
            notifications: res.notifications,
            total: res.total ?? 0,
        }
    }
    return { data: [], notifications: [], total: 0 }
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

export interface BroadcastPayload {
    target_type: 'all' | 'role' | 'specific_users'
    target_role?: 'student' | 'teacher' | 'admin' | 'center_admin' | ''
    title: string
    content: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
}

export async function broadcastNotification(
    payload: BroadcastPayload
): Promise<any> {
    return api<any>(`${BASE_URL}/broadcast`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...payload,
            target_role: payload.target_role || undefined,
            channels: ['in_app'],
        }),
    })
}
