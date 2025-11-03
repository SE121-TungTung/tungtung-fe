import { useState, useEffect, useCallback } from 'react'
import s from './MessagesPage.module.css'
import { useSession } from '@/stores/session.store'

import { ConversationList } from '@/components/feature/messages/ConversationList'
import { ChatWindow } from '@/components/feature/messages/ChatWindow'

import NavigationMenu, {
    type NavItem,
} from '@/components/common/menu/NavigationMenu'
import Card from '@/components/common/card/Card'
import TextType from '@/components/common/text/TextType'
import AvatarImg from '@/assets/avatar-placeholder.png'
import type { SideMenuItem } from '@/components/common/menu/SideMenuSet'

import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from './mockData'
import type { Conversation, Message } from '@/types/message.types'

import ClassIcon from '@/assets/Book 2.svg'
import ExamIcon from '@/assets/Card Question.svg'
import RoadmapIcon from '@/assets/Merge.svg'
import { ChatDetailsPanel } from '@/components/feature/messages/ChatDetailsPanel'

const userMenuItems: SideMenuItem[] = [
    { id: 'profile', label: 'Hồ sơ' },
    { id: 'settings', label: 'Cài đặt' },
    { id: 'help', label: 'Trợ giúp' },
    { id: 'logout', label: 'Đăng xuất' },
]
const studyMenuItems: SideMenuItem[] = [
    { id: 'classes', label: 'Lớp học', icon: <img src={ClassIcon} /> },
    { id: 'exams', label: 'Luyện thi', icon: <img src={ExamIcon} /> },
    { id: 'roadmap', label: 'Lộ trình', icon: <img src={RoadmapIcon} /> },
]
const navItems: NavItem[] = [
    { id: '1', label: 'Dashboard', href: '/student/dashboard' },
    {
        id: '2',
        label: 'Học tập',
        href: '/student/schedule',
        dropdownItems: studyMenuItems,
    },
    { id: '3', label: 'Thông báo', href: '#' },
    { id: '4', label: 'Tin nhắn', href: '/student/messages', active: true },
]

export default function MessagesPage() {
    const sessionState = useSession()
    const currentUserId = sessionState?.user?.id || 'user_0'
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [messages, setMessages] = useState<Record<string, Message[]>>({})
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(null)
    const [showGradientName, setShowGradientName] = useState(false)

    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    useEffect(() => {
        setConversations(MOCK_CONVERSATIONS)
        setMessages(MOCK_MESSAGES)
        if (window.innerWidth > 800 && MOCK_CONVERSATIONS.length > 0) {
            setActiveConversationId(MOCK_CONVERSATIONS[0].id)
        }
    }, [])

    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    const handleCloseChat = () => {
        setActiveConversationId(null)
    }

    const handleToggleDetails = () => {
        setIsDetailsOpen((prev) => !prev)
    }

    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id)
        setIsDetailsOpen(false)
    }

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId
    )
    const activeMessages = messages[activeConversationId || ''] || []

    const containerClasses = [
        s.container,
        activeConversationId ? s.isChatActive : '',
        isDetailsOpen ? s.isDetailsActive : '',
    ].join(' ')

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
                        text="Tin nhắn "
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

                {/* --- Container Chat (Nội dung chính) --- */}
                <Card
                    variant="flat"
                    mode="light"
                    className={s.chatContainerCard}
                >
                    <div className={containerClasses}>
                        <aside className={s.conversationPanel}>
                            <ConversationList
                                conversations={conversations}
                                activeConversationId={activeConversationId}
                                onSelectConversation={handleSelectConversation}
                                currentUserId={currentUserId}
                            />
                        </aside>

                        <section className={s.chatPanel}>
                            {activeConversation ? (
                                <ChatWindow
                                    key={activeConversation.id}
                                    conversation={activeConversation}
                                    messages={activeMessages}
                                    currentUserId={currentUserId}
                                    onCloseChat={handleCloseChat}
                                    onToggleDetails={handleToggleDetails}
                                />
                            ) : (
                                <div className={s.noChatSelected}>
                                    <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                                </div>
                            )}
                        </section>

                        {activeConversation && isDetailsOpen && (
                            <aside className={s.detailsPanel}>
                                <ChatDetailsPanel
                                    conversation={activeConversation}
                                    currentUserId={currentUserId}
                                    onClose={handleToggleDetails}
                                />
                            </aside>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    )
}
