import { useState, useMemo } from 'react'
import s from './MessagesPage.module.css'
import { useSession } from '@/stores/session.store'
import { useQuery } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import { ConversationList } from '@/components/feature/messages/ConversationList'
import { ChatWindow } from '@/components/feature/messages/ChatWindow'
import { ChatDetailsPanel } from '@/components/feature/messages/ChatDetailsPanel'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { NewChatModal } from '@/components/feature/messages/NewChatModal'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'
import { queryClient } from '@/lib/query'
import DefaultAvatar from '@/assets/avatar-placeholder.png'
import type { Conversation } from '@/types/message.types'

export default function MessagesPage() {
    const sessionState = useSession()
    const userRole = sessionState?.user?.role || 'student'
    const currentUserId = sessionState?.user?.id || ''

    const navigate = useNavigate()
    const session = useSession((state) => state.user)
    const location = useLocation()

    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(null)
    const [highlightedMessageId, setHighlightedMessageId] = useState<
        string | null
    >(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [showNewChatModal, setShowNewChatModal] = useState(false)

    const {
        data: conversations = [],
        isLoading,
        error,
    } = useQuery<Conversation[]>({
        queryKey: ['conversations'],
        queryFn: messageApi.getConversations,
        staleTime: 30000,
        refetchInterval: 60000,
    })

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId),
        [conversations, activeConversationId]
    )

    const handleStartChat = async (userIds: string[], groupName?: string) => {
        try {
            if (userIds.length === 1 && !groupName) {
                // Direct chat
                const conversation =
                    await messageApi.getOrCreateDirectConversation(userIds[0])
                setActiveConversationId(conversation.id)
            } else {
                // Group chat
                const newGroup = await messageApi.createGroup({
                    title: groupName || 'Nhóm chat mới',
                    member_ids: userIds,
                })
                setActiveConversationId(newGroup.id)
            }

            await queryClient.invalidateQueries({ queryKey: ['conversations'] })
            setShowNewChatModal(false)
        } catch (error) {
            console.error('Failed to start chat:', error)
            alert('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.')
        }
    }

    const handleNavigateToMessage = (messageId: string) => {
        setHighlightedMessageId(messageId)
        setTimeout(() => setHighlightedMessageId(null), 3000)
    }

    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id)
        setHighlightedMessageId(null)
        setIsDetailsOpen(false)
    }

    const navItems = useMemo(
        () => getNavItems(userRole as any, location.pathname, navigate),
        [userRole, location.pathname, navigate]
    )

    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole as any, navigate),
        [userRole, navigate]
    )

    if (error) {
        return (
            <div className={s.pageWrapper}>
                <header className={s.header}>
                    <NavigationMenu
                        items={navItems}
                        rightSlotDropdownItems={userMenuItems}
                        rightSlot={
                            <img
                                src={session?.avatarUrl || DefaultAvatar}
                                className={s.avatar}
                                alt="User Avatar"
                            />
                        }
                    />
                </header>
                <main className={s.mainContent}>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#ef4444' }}>
                            Không thể tải tin nhắn. Vui lòng thử lại sau.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className={s.pageWrapper}>
            <header className={s.header}>
                <NavigationMenu
                    items={navItems}
                    rightSlotDropdownItems={userMenuItems}
                    rightSlot={
                        <img
                            src={session?.avatarUrl || DefaultAvatar}
                            className={s.avatar}
                            alt="User Avatar"
                        />
                    }
                />
            </header>

            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    Tin nhắn <span className={s.gradientText}>trực tuyến</span>
                </h1>

                <Card className={s.chatCard}>
                    <div
                        className={`${s.container} ${activeConversation && isDetailsOpen ? s.isDetailsActive : ''}`}
                    >
                        {/* 1. CONVERSATION LIST */}
                        <aside className={s.conversationPanel}>
                            <div className={s.sidebarHeader}>
                                <h3 className={s.sidebarTitle}>Đoạn chat</h3>
                                <ButtonPrimary
                                    size="sm"
                                    onClick={() => setShowNewChatModal(true)}
                                >
                                    + Mới
                                </ButtonPrimary>
                            </div>

                            <ConversationList
                                conversations={conversations}
                                activeId={activeConversationId}
                                onSelectConversation={handleSelectConversation}
                                currentUserId={currentUserId}
                                isLoading={isLoading}
                            />
                        </aside>

                        {/* 2. CHAT WINDOW */}
                        <section className={s.chatPanel}>
                            {activeConversation ? (
                                <ChatWindow
                                    key={activeConversation.id}
                                    conversation={activeConversation}
                                    currentUserId={currentUserId}
                                    onCloseChat={() =>
                                        setActiveConversationId(null)
                                    }
                                    onToggleDetails={() =>
                                        setIsDetailsOpen(!isDetailsOpen)
                                    }
                                    highlightedMessageId={highlightedMessageId}
                                />
                            ) : (
                                <div className={s.noChatSelected}>
                                    <img
                                        src="/assets/chat-placeholder.svg"
                                        alt=""
                                        style={{
                                            width: 120,
                                            opacity: 0.5,
                                            marginBottom: 16,
                                        }}
                                    />
                                    <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                                </div>
                            )}
                        </section>

                        {/* 3. DETAILS PANEL */}
                        {activeConversation && isDetailsOpen && (
                            <aside className={s.detailsPanel}>
                                <ChatDetailsPanel
                                    conversation={activeConversation}
                                    currentUserId={currentUserId}
                                    onClose={() => setIsDetailsOpen(false)}
                                    onNavigateToMessage={
                                        handleNavigateToMessage
                                    }
                                />
                            </aside>
                        )}
                    </div>
                </Card>
            </main>

            {/* NEW CHAT MODAL */}
            {showNewChatModal && (
                <NewChatModal
                    onClose={() => setShowNewChatModal(false)}
                    onStartChat={handleStartChat}
                />
            )}
        </div>
    )
}
