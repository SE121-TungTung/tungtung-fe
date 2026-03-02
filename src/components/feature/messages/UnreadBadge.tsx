import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import styles from './UnreadBadge.module.css'

interface UnreadBadgeProps {
    className?: string
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ className = '' }) => {
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['totalUnreadCount'],
        queryFn: () => messageApi.getTotalUnreadCount(),
        refetchInterval: 30000, // Refetch every 30s
        staleTime: 20000,
    })

    if (unreadCount === 0) return null

    return (
        <span className={`${styles.badge} ${className}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    )
}
