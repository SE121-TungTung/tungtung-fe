import { useState, useMemo } from 'react'
import s from './MessagesPage.module.css'
import { useSession } from '@/stores/session.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import type { Conversation, SendMessagePayload } from '@/types/message.types'

import { ConversationList } from '@/components/feature/messages/ConversationList'
import { ChatWindow } from '@/components/feature/messages/ChatWindow'
import { ChatDetailsPanel } from '@/components/feature/messages/ChatDetailsPanel'
import NavigationMenu from '@/components/common/menu/NavigationMenu'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { NewChatModal } from '@/components/feature/messages/NewChatModal'

import { useLocation, useNavigate } from 'react-router-dom'
import { getNavItems, getUserMenuItems } from '@/config/navigation.config'

import DefaultAvatar from '@/assets/avatar-placeholder.png'

export default function MessagesPage() {
    const sessionState = useSession()
    const userRole = sessionState?.user?.role || 'student'
    const currentUserId = sessionState?.user?.id || ''

    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()

    // --- State ---
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [showNewChatModal, setShowNewChatModal] = useState(false) // State cho Modal

    // --- Data Fetching (Thay thế mockData) ---
    const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
        queryKey: ['conversations'],
        queryFn: messageApi.getConversations,
        refetchInterval: 10000, // Polling tạm 10s
    })

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId),
        [conversations, activeConversationId]
    )

    // --- Handlers ---
    const handleStartChat = async (userIds: string[], groupName?: string) => {
        try {
            let newConvo: Conversation

            if (userIds.length === 1 && !groupName) {
                // 1. Logic Chat 1-1
                // Kiểm tra xem đã có conversation với user này chưa
                // (Giả sử BE chưa có endpoint check, ta gửi message đầu tiên hoặc tạo room rỗng)
                // Ở đây ta gọi API tạo tin nhắn mở đầu hoặc API getOrCreateRoom
                const payload: SendMessagePayload = {
                    recipient_id: userIds[0],
                    content: '👋',
                } // Gửi tin nhắn chào
                const res = await messageApi.sendMessage(payload)

                // Sau khi gửi, reload list hội thoại để lấy ID
                await queryClient.invalidateQueries({
                    queryKey: ['conversations'],
                })
                // Tạm thời chưa biết ID mới, user cần chọn lại từ list (hoặc BE trả về conversationId trong response sendMessage)
                // Nếu BE trả về conversationId:
                // setActiveConversationId(res.conversationId)
            } else {
                // 2. Logic Tạo Group
                const res = await messageApi.createGroup({
                    name: groupName!,
                    member_ids: userIds,
                })
                newConvo = res
                await queryClient.invalidateQueries({
                    queryKey: ['conversations'],
                })
                setActiveConversationId(newConvo.id)
            }

            setShowNewChatModal(false)
        } catch (e) {
            console.error('Failed to start chat', e)
            alert('Không thể tạo cuộc trò chuyện')
        }
    }

    // Navigation (Giữ nguyên code cũ)
    const navItems = useMemo(
        () => getNavItems(userRole as any, location.pathname, navigate),
        [userRole, location.pathname, navigate]
    )
    const userMenuItems = useMemo(
        () => getUserMenuItems(userRole as any, navigate),
        [userRole, navigate]
    )

    return (
        <div className={s.pageWrapper}>
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

            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>
                    Tin nhắn <span className={s.gradientText}>trực tuyến</span>
                </h1>

                <Card className={s.chatCard}>
                    <div
                        className={`${s.container} ${activeConversation && isDetailsOpen ? s.isDetailsActive : ''}`}
                    >
                        {/* Sidebar: Danh sách chat */}
                        <aside className={s.conversationPanel}>
                            {/* Thêm Header cho Sidebar chứa nút Tạo mới */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-gray-700">
                                    Trò chuyện
                                </h3>
                                <ButtonPrimary
                                    size="sm"
                                    onClick={() => setShowNewChatModal(true)}
                                    style={{ padding: '6px 12px' }}
                                >
                                    + Mới
                                </ButtonPrimary>
                            </div>

                            {isLoading ? (
                                <div className="p-4 text-center text-gray-500">
                                    Đang tải...
                                </div>
                            ) : (
                                <ConversationList
                                    conversations={conversations}
                                    activeId={activeConversationId}
                                    onSelectConversation={
                                        setActiveConversationId
                                    }
                                    currentUserId={currentUserId}
                                />
                            )}
                        </aside>

                        {/* Main Chat Window */}
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
                                />
                            ) : (
                                <div className={s.noChatSelected}>
                                    <p>
                                        Chọn một cuộc trò chuyện hoặc tạo mới để
                                        bắt đầu
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Info Panel */}
                        {activeConversation && isDetailsOpen && (
                            <aside className={s.detailsPanel}>
                                <ChatDetailsPanel
                                    conversation={activeConversation}
                                    currentUserId={currentUserId}
                                    onClose={() => setIsDetailsOpen(false)}
                                />
                            </aside>
                        )}
                    </div>
                </Card>
            </main>

            {/* Modal */}
            {showNewChatModal && (
                <NewChatModal
                    onClose={() => setShowNewChatModal(false)}
                    onStartChat={handleStartChat}
                />
            )}
        </div>
    )
}
