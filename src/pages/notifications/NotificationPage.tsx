import { useState, useMemo, useCallback } from 'react'
import s from './NotificationPage.module.css'
import { useSession } from '@/stores/session.store'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
    getNotifications,
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
import type { NotificationResponse } from '@/types/notification.types'

const tabItems: TabItem[] = [
    { label: 'Tất cả', value: 'all' },
    // Lưu ý: Hiện tại API getNotifications chưa support filter 'unread' server-side
    // nên tab này sẽ tạm thời lọc ở client trên trang hiện tại hoặc cần update API sau.
    { label: 'Chưa đọc', value: 'unread' },
]

const ITEMS_PER_PAGE = 10

export default function NotificationPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [showGradientName, setShowGradientName] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(0)

    // --- 1. Fetch Data ---
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', 'list', currentPage],
        queryFn: () =>
            getNotifications(currentPage * ITEMS_PER_PAGE, ITEMS_PER_PAGE),
        placeholderData: (previousData) => previousData,
    })

    // --- 2. Mutations ---
    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const markAllMutation = useMutation({
        mutationFn: async () => {
            // Vì API markAll có thể cần danh sách ID hoặc mark hết
            // Ở đây ta dùng logic map qua danh sách hiện tại nếu API không hỗ trợ "mark all database"
            const unreadIds = notifications
                .filter((n) => !n.read_at)
                .map((n) => n.id)
            if (unreadIds.length > 0) {
                await markAllAsRead(unreadIds)
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    // --- 3. Handlers ---
    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const handleItemClick = (item: NotificationResponse) => {
        if (!item.read_at) {
            markReadMutation.mutate(item.id)
        }
        if (item.action_url) {
            navigate(item.action_url)
        }
    }

    const handleMarkAllAsRead = () => {
        markAllMutation.mutate()
    }

    // --- 4. Processing Data for UI ---
    // Vì NotificationItem có thể mong đợi props khác với API response gốc
    // Ta map dữ liệu để tương thích (đặc biệt là field timestamp và isRead)
    const mappedNotifications = useMemo(() => {
        let data = notifications.map((n) => ({
            ...n,
            isRead: !!n.read_at,
            timestamp: formatTime(n.created_at),
        }))

        if (activeTab === 'unread') {
            data = data.filter((n) => !n.isRead)
        }
        return data
    }, [notifications, activeTab])

    // Tính toán phân trang
    // Lưu ý: Do API getNotifications hiện tại trả về mảng thay vì { items, total }
    // Ta sẽ tạm tính logic đơn giản: Nếu số lượng item trả về < limit -> Hết trang
    // Hoặc hardcode totalPages nếu muốn UI hiện số.
    const hasNextPage = notifications.length === ITEMS_PER_PAGE
    const totalPages = hasNextPage ? currentPage + 2 : currentPage + 1

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
                                !notifications.some((n) => !n.read_at) ||
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
                                        notification={item as any}
                                        onClick={() => handleItemClick(item)}
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

                {(currentPage > 0 || hasNextPage) && (
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
