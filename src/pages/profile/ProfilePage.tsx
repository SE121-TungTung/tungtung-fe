import { useState, useCallback } from 'react'
import s from './ProfilePage.module.css'
import { useSession } from '@/stores/session.store'
import { useLocation } from 'react-router-dom'

import { getNavItems, getUserMenuItems } from '@/config/navigation.config'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import TextType from '@/components/common/text/TextType'
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import AvatarImg from '@/assets/avatar-placeholder.png'

import { ProfileOverview } from '@/components/feature/profile/ProfileOverview'
import { ProfileEditor } from '@/components/feature/profile/ProfileEditor'

const tabItems: TabItem[] = [
    { label: 'Tổng quan', value: 'overview' },
    { label: 'Cập nhật thông tin', value: 'edit' },
]

export default function ProfilePage() {
    const sessionState = useSession()
    const location = useLocation()

    const userRole = sessionState?.user?.role || 'student'
    const currentPath = location.pathname

    const [activeTab, setActiveTab] = useState('overview')
    const [showGradientName, setShowGradientName] = useState(false)

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const navItems = getNavItems(userRole as any, currentPath)
    const userMenuItems = getUserMenuItems(userRole as any)

    const userData = sessionState?.user || {
        first_name: 'Người dùng',
        last_name: 'Mới',
        email: 'user@example.com',
        role: userRole,
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone: null,
        date_of_birth: null,
        address: null,
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
                        text="Hồ sơ "
                        typingSpeed={50}
                        loop={false}
                        showCursor={!showGradientName}
                        onSentenceComplete={handleGreetingComplete}
                    />
                    {showGradientName && (
                        <TextType
                            as="span"
                            className={s.gradientText}
                            text="cá nhân"
                            typingSpeed={70}
                            loop={false}
                        />
                    )}
                </h1>

                {/* --- Thanh Tab Controls --- */}
                <div className={s.tabControls}>
                    <TabMenu
                        items={tabItems}
                        value={activeTab}
                        onChange={(val) => setActiveTab(val)}
                        variant="flat"
                        activeStyle="filled"
                    />
                </div>

                {/* --- Nội dung Tab --- */}
                <div className={s.tabContent}>
                    {activeTab === 'overview' && (
                        <ProfileOverview
                            user={userData}
                            role={userRole as any}
                        />
                    )}
                    {activeTab === 'edit' && <ProfileEditor user={userData} />}
                </div>
            </main>
        </div>
    )
}
