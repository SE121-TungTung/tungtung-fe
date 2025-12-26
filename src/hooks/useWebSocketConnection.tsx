import { useEffect, useRef, useCallback } from 'react'
import { WebSocketManager, wsManager } from '@/lib/websocket'
import { useQueryClient } from '@tanstack/react-query'
import type { WSNewMessage } from '@/types/message.types'

interface UseWebSocketOptions {
    currentUserId?: string
    onError?: (error: Error) => void
    onAuthError?: (error: string) => void
}

export function useWebSocketConnection(options: UseWebSocketOptions = {}) {
    const { currentUserId, onError, onAuthError } = options
    const wsManagerRef = useRef<WebSocketManager | null>(wsManager)
    const queryClient = useQueryClient()

    const showNotification = useCallback(
        (message: string, type: 'error' | 'info' = 'error') => {
            console.log(`[${type.toUpperCase()}]:`, message)
            if (type === 'error') {
                // Trigger toast here
            }
        },
        []
    )

    const handleAuthError = useCallback(
        (error: string) => {
            console.error('Authentication error:', error)
            showNotification(
                'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
                'error'
            )
            onAuthError?.(error)

            // Xử lý logout an toàn
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            // window.location.href = '/login'
        },
        [onAuthError, showNotification]
    )

    useEffect(() => {
        // 1. Nếu không có user, ngắt kết nối
        if (!currentUserId) {
            wsManager.disconnect()
            return
        }

        // 2. Init
        console.log('Initializing WebSocket hook...')
        wsManagerRef.current = wsManager

        /* ================= HANDLERS ================= */
        const unsubscribeMessage = wsManager.onMessage((message) => {
            switch (message.type) {
                case 'connected':
                    console.log('WebSocket authenticated')
                    break
                case 'new_message': {
                    const msg = message as WSNewMessage
                    queryClient.invalidateQueries({
                        queryKey: ['messages', msg.room_id],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ['conversations'],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ['notifications'],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ['unread-count'],
                    })
                    break
                }
                case 'system_message':
                case 'member_added':
                case 'member_removed':
                case 'group_updated':
                    queryClient.invalidateQueries({
                        queryKey: ['conversations'],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ['notifications'],
                    })
                    break
                case 'error':
                    if (message.code !== 'AUTH_FAILED') {
                        showNotification(
                            message.message || 'Lỗi server',
                            'error'
                        )
                    }
                    break
                default:
                    break
            }
        })

        const unsubscribeStatus = wsManager.onStatusChange((connected) => {
            // Không cần log quá nhiều ở đây nếu không cần thiết
        })

        const unsubscribeError = wsManager.onError((error: Error) => {
            onError?.(error)
        })

        const unsubscribeAuthError = wsManager.onAuthError(handleAuthError)

        // 3. KẾT NỐI (Idempotent - Gọi nhiều lần không sao)
        wsManager.connect().catch((err) => {
            // Lỗi đã được log trong wsManager, không cần log lại ở đây
        })

        // 4. CLEANUP
        return () => {
            // Chỉ unsubscribe listeners, KHÔNG disconnect
            unsubscribeMessage()
            unsubscribeStatus()
            unsubscribeError()
            unsubscribeAuthError()
        }
    }, [currentUserId, queryClient, onError, handleAuthError, showNotification])

    return wsManagerRef.current
}
