import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/stores/session.store'

export function useNotificationSocket() {
    const queryClient = useQueryClient()
    const user = useSession((s) => s.user)

    useEffect(() => {
        if (!user) return

        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

        const ws = new WebSocket(`${wsUrl}/ws/${user.id}`)

        ws.onopen = () => {
            console.log('Connected to notification socket')
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Kiểm tra đúng loại message
                if (data.type === 'NEW_NOTIFICATION') {
                    // Refetch lại danh sách thông báo
                    queryClient.invalidateQueries({
                        queryKey: ['notifications'],
                    })

                    // Refetch số lượng chưa đọc (nếu có query này)
                    queryClient.invalidateQueries({
                        queryKey: ['unread-count'],
                    })
                }
            } catch (error) {
                console.error('Socket message parse error', error)
            }
        }

        return () => {
            ws.close()
        }
    }, [user, queryClient])
}
