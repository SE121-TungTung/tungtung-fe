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
import type { Notification } from '@/types/notification.types'

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

    // Query unread count
    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCount,
        refetchInterval: 30000,
    })

    // Query notifications
    const { data: notificationList = [] } = useQuery({
        queryKey: ['notifications', 'recent'],
        queryFn: () => getNotifications(0, 10),
        enabled: isOpen,
        select: (data) => data.notifications,
    })

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const markAllMutation = useMutation({
        mutationFn: async () => {
            const unreadIds = notificationList
                .filter((n: Notification) => !n.read_at)
                .map((n: Notification) => n.id)

            if (unreadIds.length > 0) {
                await Promise.all(unreadIds.map((id: string) => markAsRead(id)))
            }
        },
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

    const handleNotificationClick = (notification: Notification) => {
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

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation() // Ngăn đóng popup
        if (unreadCount > 0) {
            markAllMutation.mutate()
        }
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
                {/* Icon Chuông giữ nguyên */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.2599H18.66C19.96 18.2599 20.45 16.9499 19.74 15.7699L18.59 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M13.87 3.20006C13.56 3.11006 13.24 3.04006 12.91 3.01006C11.95 2.93006 11.03 3.09006 10.22 3.44006C10.17 3.46006 10.12 3.48006 10.07 3.50006"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M15.02 19.0601C15.02 20.7101 13.67 22.0601 12.02 22.0601C11.2 22.0601 10.44 21.7201 9.90002 21.1801C9.36002 20.6401 9.02002 19.8801 9.02002 19.0601"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
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
                            <div className={s.headerTitleRow}>
                                <h3 className={s.title}>Thông báo</h3>
                                {unreadCount > 0 && (
                                    <span className={s.unreadText}>
                                        {unreadCount} mới
                                    </span>
                                )}
                            </div>

                            <button
                                className={s.markAllBtn}
                                onClick={handleMarkAllRead}
                                disabled={
                                    unreadCount === 0 ||
                                    markAllMutation.isPending
                                }
                                title="Đánh dấu tất cả đã đọc"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z" />
                                </svg>
                            </button>
                        </div>

                        <div className={s.list}>
                            {notificationList.length > 0 ? (
                                notificationList.map((notification) => (
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
    // Giữ nguyên logic switch case cũ
    switch (type) {
        case 'system':
            return (
                <svg {...iconProps} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
                </svg>
            )
        // ... Các icon khác
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
