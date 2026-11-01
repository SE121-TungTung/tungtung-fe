import { useState, useMemo, useCallback, useEffect } from 'react'
import s from './NotificationPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '@/lib/notifications'
import TextType from '@/components/common/text/TextType'
import Card from '@/components/common/card/Card'
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { NotificationItem } from '@/components/common/list/NotificationItem'
import Pagination from '@/components/common/menu/Pagination'

import MarkReadIcon from '@/assets/Check.svg'
import type { Notification, NotificationUI } from '@/types/notification.types'

const ITEMS_PER_PAGE = 10

export default function NotificationPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [showGradientName, setShowGradientName] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(0)

    const isUnreadTab = activeTab === 'unread'

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCount,
    })

    const { data, isLoading } = useQuery({
        queryKey: ['notifications', 'list', currentPage, isUnreadTab],
        queryFn: () =>
            getNotifications(
                currentPage * ITEMS_PER_PAGE,
                ITEMS_PER_PAGE,
                isUnreadTab
            ),
        placeholderData: (previousData) => previousData,
    })

    const notifications = useMemo(
        () => data?.notifications || [],
        [data?.notifications]
    )
    const totalCount = data?.total || 0

    const tabItems = useMemo<TabItem[]>(
        () => [
            { label: 'Tất cả', value: 'all' },
            {
                label:
                    unreadCount > 0 ? `Chưa đọc (${unreadCount})` : 'Chưa đọc',
                value: 'unread',
            },
        ],
        [unreadCount]
    )

    const markAllMutation = useMutation({
        mutationFn: markAllAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] })
            queryClient.setQueryData(['notifications', 'unread-count'], 0)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] })
            queryClient.setQueryData<number>(
                ['notifications', 'unread-count'],
                (old = 0) => Math.max(0, old - 1)
            )
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    // Handlers
    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const handleItemClick = (item: Notification) => {
        if (!item.read_at) {
            markReadMutation.mutate(item.id)
        }
        if (item.action_url) {
            navigate(item.action_url)
        }
    }

    const handleMarkItemAsRead = (
        e: React.MouseEvent,
        notificationId: string
    ) => {
        e.stopPropagation()
        markReadMutation.mutate(notificationId)
    }

    const handleMarkAllAsRead = () => {
        markAllMutation.mutate()
    }

    const mappedNotifications = useMemo((): NotificationUI[] => {
        return notifications.map(
            (n): NotificationUI => ({
                ...n,
                isRead: !!n.read_at,
                timestamp: formatTime(n.created_at),
            })
        )
    }, [notifications])

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    const hasUnreadNotifications =
        unreadCount > 0 || notifications.some((n) => !n.read_at)

    useEffect(() => {
        if (currentPage > 0 && totalPages > 0 && currentPage >= totalPages) {
            setCurrentPage(totalPages - 1)
        }
    }, [currentPage, totalPages])

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    <TextType
                        text="Thông báo "
                        typingSpeed={50}
                        loop={false}
                        showCursor={!showGradientName}
                        onSentenceComplete={handleGreetingComplete}
                    />
                    {showGradientName && (
                        <TextType
                            as="span"
                            className={s.gradientText}
                            text="của bạn"
                            typingSpeed={70}
                            loop={false}
                        />
                    )}
                </h1>

                <Card
                    title="Thông báo"
                    variant="outline"
                    mode="light"
                    className={s.notificationCard}
                >
                    <div className={s.cardHeader}>
                        <TabMenu
                            items={tabItems}
                            value={activeTab}
                            onChange={(val) => {
                                setActiveTab(val)
                                setCurrentPage(0)
                            }}
                            variant="flat"
                            activeStyle="filled"
                        />
                        <ButtonGhost
                            size="sm"
                            mode="light"
                            leftIcon={<img src={MarkReadIcon} alt="Đã đọc" />}
                            onClick={handleMarkAllAsRead}
                            disabled={
                                !hasUnreadNotifications ||
                                markAllMutation.isPending
                            }
                        >
                            {markAllMutation.isPending
                                ? 'Đang xử lý...'
                                : 'Đánh dấu tất cả đã đọc'}
                        </ButtonGhost>
                    </div>

                    {isLoading ? (
                        <div className={s.emptyState}>
                            <p>Đang tải thông báo...</p>
                        </div>
                    ) : (
                        <ul className={s.notificationList}>
                            {mappedNotifications.length > 0 ? (
                                mappedNotifications.map((item) => (
                                    <NotificationItem
                                        key={item.id}
                                        notification={item}
                                        onClick={() => handleItemClick(item)}
                                        onMarkAsRead={(e) =>
                                            handleMarkItemAsRead(e, item.id)
                                        }
                                    />
                                ))
                            ) : (
                                <div className={s.emptyState}>
                                    <p>
                                        Bạn không có thông báo nào
                                        {activeTab === 'unread'
                                            ? ' chưa đọc'
                                            : ''}
                                        .
                                    </p>
                                </div>
                            )}
                        </ul>
                    )}
                </Card>

                {totalPages > 1 && (
                    <div className={s.pagination}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}

function formatTime(timestamp: string): string {
    if (!timestamp) return ''
    const now = new Date()
    const date = new Date(timestamp)
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Vừa xong'
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`

    return date.toLocaleDateString('vi-VN')
}
