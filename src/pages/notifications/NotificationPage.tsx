import { useState, useCallback, useMemo } from 'react'
import s from './NotificationPage.module.css'
import { useSession } from '@/stores/session.store'
import { useNavigate } from 'react-router-dom'

import { getNavItems, getUserMenuItems } from '@/config/navigation.config'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import TextType from '@/components/common/text/TextType'
import Card from '@/components/common/card/Card'
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { NotificationItem } from '@/components/common/list/NotificationItem'
import type { Notification } from '@/types/notification.types'

import AvatarImg from '@/assets/avatar-placeholder.png'
import MarkReadIcon from '@/assets/Check.svg'
import Pagination from '@/components/common/menu/Pagination'
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        type: 'system',
        title: 'Chào mừng bạn đến với TungTung!',
        content:
            'Khám phá các tính năng mới và bắt đầu hành trình học tập của bạn ngay hôm nay.',
        timestamp: '1 giờ trước',
        isRead: false,
    },
    {
        id: 'n2',
        type: 'promotion',
        title: 'Ưu đãi tháng 11: Giảm 20% học phí!',
        content:
            'Đăng ký khóa học IELTS Advanced trước ngày 30/11 để nhận ưu đãi đặc biệt.',
        timestamp: 'Hôm qua',
        isRead: false,
    },
    {
        id: 'n3',
        type: 'class_alert',
        title: 'Thông báo nghỉ lớp (IELTS 6.5)',
        content:
            'Lớp IELTS 6.5 tối thứ 3 (04/11) sẽ nghỉ. Lịch học bù sẽ được thông báo sau.',
        timestamp: '01/11/2025',
        isRead: true,
    },
    {
        id: 'n4',
        type: 'grade',
        title: 'Điểm thi Mock Test #3 đã có!',
        content: 'Bạn đã đạt 7.5 Overall. Click để xem chi tiết.',
        timestamp: '01/11/2025',
        isRead: true,
        link: '/student/exams/results/3',
    },
    {
        id: 'n5',
        type: 'system',
        title: 'Cập nhật mật khẩu',
        content: 'Mật khẩu của bạn sẽ hết hạn trong 3 ngày. Vui lòng cập nhật.',
        timestamp: '31/10/2025',
        isRead: true,
    },
    {
        id: 'n6',
        type: 'promotion',
        title: 'Học bổng 50%',
        content:
            'Tham gia cuộc thi viết luận để có cơ hội nhận học bổng 50% khóa học...',
        timestamp: '30/10/2025',
        isRead: true,
    },
    {
        id: 'n7',
        type: 'class_alert',
        title: 'Tài liệu mới: Reading Unit 5',
        content: 'Giáo viên đã đăng tài liệu mới cho lớp IELTS 6.5.',
        timestamp: '29/10/2025',
        isRead: true,
    },
]

const tabItems: TabItem[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chưa đọc', value: 'unread' },
]

const ITEMS_PER_PAGE = 5

export default function NotificationPage() {
    const sessionState = useSession()
    const userRole = sessionState?.user?.role || 'student'

    const navigate = useNavigate()
    const [showGradientName, setShowGradientName] = useState(false)

    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(0)

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const navItems = getNavItems(userRole as any, '/notifications')
    const userMenuItems = getUserMenuItems(userRole as any)

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'unread') {
            return notifications.filter((n) => !n.isRead)
        }
        return notifications
    }, [notifications, activeTab])

    const pageCount = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE)
    const paginatedNotifications = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE
        return filteredNotifications.slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE
        )
    }, [filteredNotifications, currentPage])

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    }

    const handleItemClick = (item: Notification) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        )
        if (item.link) {
            navigate(item.link)
        }
    }

    return (
        <div className={s.pageWrapper}>
            {/* --- Header --- */}
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={sessionState?.user?.avatarUrl || AvatarImg}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            {/* --- Main Content --- */}
            <main className={s.mainContent}>
                {/* Tiêu đề trang */}
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

                {/* --- Khung thông báo --- */}
                <Card
                    title="Thông báo"
                    variant="outline"
                    mode="light"
                    className={s.notificationCard}
                >
                    {/* Header của Card: Tabs và Nút */}
                    <div className={s.cardHeader}>
                        <TabMenu
                            items={tabItems}
                            value={activeTab}
                            onChange={(val) => setActiveTab(val)}
                            variant="flat"
                            activeStyle="filled"
                        />
                        <ButtonGhost
                            size="sm"
                            mode="light"
                            leftIcon={<img src={MarkReadIcon} alt="Đã đọc" />}
                            onClick={handleMarkAllAsRead}
                            // Chỉ bật khi có tin chưa đọc
                            disabled={!notifications.some((n) => !n.isRead)}
                        >
                            Đánh dấu tất cả đã đọc
                        </ButtonGhost>
                    </div>

                    {/* Danh sách thông báo (cuộn) */}
                    <ul className={s.notificationList}>
                        {paginatedNotifications.length > 0 ? (
                            paginatedNotifications.map((item) => (
                                <NotificationItem
                                    key={item.id}
                                    notification={item}
                                    onClick={() => handleItemClick(item)}
                                />
                            ))
                        ) : (
                            <div className={s.emptyState}>
                                <p>
                                    Bạn không có thông báo nào
                                    {activeTab === 'unread' ? ' chưa đọc' : ''}.
                                </p>
                            </div>
                        )}
                    </ul>
                </Card>

                {pageCount > 1 && (
                    <div className={s.pagination}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pageCount}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </main>
        </div>
    )
}
