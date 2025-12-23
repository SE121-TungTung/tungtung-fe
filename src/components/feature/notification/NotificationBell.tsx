import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
} from '@/lib/notifications'
import { createPortal } from 'react-dom'
import s from './NotificationBell.module.css'
import type { NotificationResponse } from '@/types/notification.types'

interface NotificationBellProps {
    className?: string
}

export default function NotificationBell({
    className = '',
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
    const triggerRef = useRef<HTMLButtonElement>(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCount,
        refetchInterval: 30000, // Poll every 30s
    })

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications', 'recent'],
        queryFn: () => getNotifications(0, 5), // Only 5 most recent
        enabled: isOpen,
    })

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    useEffect(() => {
        if (!isOpen) return

        const updatePosition = () => {
            if (!triggerRef.current) return
            const rect = triggerRef.current.getBoundingClientRect()
            const dropdownHeight = 400
            const isNearBottom =
                rect.bottom + dropdownHeight > window.innerHeight

            if (isNearBottom) {
                setPopupStyle({
                    bottom: `${window.innerHeight - rect.top + 12}px`,
                    right: `${window.innerWidth - rect.right}px`,
                })
            } else {
                setPopupStyle({
                    top: `${rect.bottom + 12}px`,
                    right: `${window.innerWidth - rect.right}px`,
                })
            }
        }

        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, { passive: true })

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('[data-notification-bell]')) {
                setIsOpen(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isOpen])

    const handleNotificationClick = (notification: NotificationResponse) => {
        if (!notification.read_at) {
            markReadMutation.mutate(notification.id)
        }

        setIsOpen(false)

        if (notification.action_url) {
            navigate(notification.action_url)
        }
    }

    const handleViewAll = () => {
        setIsOpen(false)
        navigate('/notifications')
    }

    return (
        <>
            <button
                ref={triggerRef}
                data-notification-bell
                className={`${s.bellButton} ${className}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Thông báo"
                aria-expanded={isOpen}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42116 18.2537 9.16816 18.1079C8.91515 17.9622 8.70486 17.7526 8.55835 17.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className={s.badge}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen &&
                createPortal(
                    <div
                        className={s.popup}
                        style={{
                            position: 'fixed',
                            zIndex: 1000,
                            ...popupStyle,
                        }}
                        data-notification-bell
                    >
                        <div className={s.header}>
                            <h3 className={s.title}>Thông báo</h3>
                            {unreadCount > 0 && (
                                <span className={s.unreadText}>
                                    {unreadCount} chưa đọc
                                </span>
                            )}
                        </div>

                        <div className={s.list}>
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        className={`${s.item} ${
                                            !notification.read_at
                                                ? s.unread
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleNotificationClick(
                                                notification
                                            )
                                        }
                                    >
                                        <div className={s.itemIcon}>
                                            {getNotificationIcon(
                                                notification.notification_type
                                            )}
                                        </div>
                                        <div className={s.itemContent}>
                                            <div className={s.itemTitle}>
                                                {notification.title}
                                            </div>
                                            <div className={s.itemText}>
                                                {notification.content}
                                            </div>
                                            <div className={s.itemTime}>
                                                {formatTime(
                                                    notification.created_at
                                                )}
                                            </div>
                                        </div>
                                        {!notification.read_at && (
                                            <div className={s.unreadDot} />
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className={s.empty}>
                                    <svg
                                        width="48"
                                        height="48"
                                        viewBox="0 0 48 48"
                                        fill="none"
                                        className={s.emptyIcon}
                                    >
                                        <path
                                            d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 40C15.18 40 8 32.82 8 24C8 15.18 15.18 8 24 8C32.82 8 40 15.18 40 24C40 32.82 32.82 40 24 40Z"
                                            fill="currentColor"
                                            opacity="0.3"
                                        />
                                    </svg>
                                    <p>Không có thông báo mới</p>
                                </div>
                            )}
                        </div>

                        <button className={s.footer} onClick={handleViewAll}>
                            Xem tất cả thông báo
                        </button>
                    </div>,
                    document.body
                )}
        </>
    )
}

function getNotificationIcon(type: string) {
    const iconProps = { width: 20, height: 20, fill: 'currentColor' }

    switch (type) {
        case 'system':
            return (
                <svg {...iconProps} viewBox="0 0 20 20">
                    <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H9v-2h2v2zm0-4H9V6h2v5z" />
                </svg>
            )
        case 'promotion':
            return (
                <svg {...iconProps} viewBox="0 0 20 20">
                    <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1L10 2z" />
                </svg>
            )
        case 'class_alert':
            return (
                <svg {...iconProps} viewBox="0 0 20 20">
                    <path d="M10 2L2 7v6c0 3.3 2.2 6.4 8 8 5.8-1.6 8-4.7 8-8V7l-8-5z" />
                </svg>
            )
        case 'grade':
            return (
                <svg {...iconProps} viewBox="0 0 20 20">
                    <path d="M3 3h14v14H3V3zm2 2v10h10V5H5zm3 2h4v2H8V7zm0 3h4v2H8v-2z" />
                </svg>
            )
        default:
            return (
                <svg {...iconProps} viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" />
                </svg>
            )
    }
}

function formatTime(timestamp: string): string {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`

    return date.toLocaleDateString('vi-VN')
}
