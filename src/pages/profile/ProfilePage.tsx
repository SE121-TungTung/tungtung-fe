import { useState, useCallback, useEffect } from 'react'
import s from './ProfilePage.module.css'
import { useSession } from '@/stores/session.store'
import { useLocation, useNavigate } from 'react-router-dom'

import { getNavItems, getUserMenuItems } from '@/config/navigation.config'

import NavigationMenu from '@/components/common/menu/NavigationMenu'
import TextType from '@/components/common/text/TextType'
import TabMenu, { type TabItem } from '@/components/common/menu/TabMenu'
import DefaultAvatar from '@/assets/avatar-placeholder.png'

import { ProfileOverview } from '@/components/feature/profile/ProfileOverview'
import { ProfileEditor } from '@/components/feature/profile/ProfileEditor'
import { getMe, updateMe } from '@/lib/users'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserFormValues } from '@/forms/user.schema'

const tabItems: TabItem[] = [
    { label: 'Tổng quan', value: 'overview' },
    { label: 'Cập nhật thông tin', value: 'edit' },
]

export default function ProfilePage() {
    const sessionState = useSession()
    const setUser = useSession((s) => s.setUser)
    const queryClient = useQueryClient()

    const location = useLocation()
    const navigate = useNavigate()

    const userRole = sessionState?.user?.role || 'student'
    const currentPath = location.pathname

    const [activeTab, setActiveTab] = useState('overview')
    const [showGradientName, setShowGradientName] = useState(false)

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const navItems = getNavItems(userRole as any, currentPath, navigate)
    const userMenuItems = getUserMenuItems(userRole as any, navigate)

    const { data: meUser } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
        enabled: !sessionState?.user,
    })
    useEffect(() => {
        if (meUser) setUser(meUser)
    }, [meUser, setUser])

    const { mutateAsync: updateMeMutate, isPending: isSaving } = useMutation({
        mutationFn: (payload: Parameters<typeof updateMe>[0]) =>
            updateMe(payload),
        onSuccess: (updated) => {
            setUser(updated)
            queryClient.invalidateQueries({ queryKey: ['me'] })
        },
    })

    const onSubmitForm = async (
        values: UserFormValues & { avatarFile?: File | null }
    ) => {
        const payload = {
            first_name: values.firstName || undefined,
            last_name: values.lastName || undefined,
            phone: values.phone || undefined,
            address: values.address || undefined,
            // Add other fields as necessary:
            // emergency_contact: values.emergencyContact,
            // preferences: values.preferences,
            avatar_file: values.avatarFile ?? undefined,
        }
        await updateMeMutate(payload)
        await queryClient.invalidateQueries({ queryKey: ['users'] })
        setActiveTab('overview')
        return
    }

    const userData = sessionState?.user

    return (
        <div className={s.pageWrapper}>
            {/* --- Header --- */}
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={sessionState?.user?.avatarUrl || DefaultAvatar}
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
                    {activeTab === 'edit' && (
                        <ProfileEditor
                            user={userData}
                            isSubmitting={isSaving}
                            onSubmit={onSubmitForm}
                        />
                    )}
                </div>
            </main>
        </div>
    )
}
