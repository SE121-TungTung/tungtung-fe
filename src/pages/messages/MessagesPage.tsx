import { useState, useMemo, useEffect } from 'react'
import s from './MessagesPage.module.css'
import { useSession } from '@/stores/session.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import { ConversationList } from '@/components/feature/messages/ConversationList'
import { ChatWindow } from '@/components/feature/messages/ChatWindow'
import { ChatDetailsPanel } from '@/components/feature/messages/ChatDetailsPanel'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { NewChatModal } from '@/components/feature/messages/NewChatModal'
import type { Conversation } from '@/types/message.types'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { wsManager } from '@/lib/websocket'
import { useDialog } from '@/hooks/useDialog'

interface LocationState {
    startChatWith?: string
}

export default function MessagesPage() {
    const sessionState = useSession()
    const currentUserId = sessionState?.user?.id || ''
    const queryClient = useQueryClient()
    const { alert } = useDialog()

    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(null)
    const [highlightedMessageId, setHighlightedMessageId] = useState<
        string | null
    >(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [showNewChatModal, setShowNewChatModal] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

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

    const { data: detailedConversation } = useQuery({
        queryKey: ['conversationDetails', activeConversationId],
        queryFn: async () => {
            if (!activeConversationId) return null

            const baseConversation = conversations.find(
                (c) => c.id === activeConversationId
            )

            if (!baseConversation) return null

            // For group/class conversations, fetch full details with participants
            if (baseConversation.isGroup) {
                return messageApi.getGroupDetails(
                    activeConversationId,
                    currentUserId
                )
            } else {
                // const roomDetails = await messageApi.getGroupDetails(
                //     activeConversationId,
                //     currentUserId
                // )

                // const otherMember = roomDetails.participants.find(
                //     (p) => p.id !== currentUserId
                // )

                // if (otherMember) {
                //     return messageApi.getOrCreateDirectConversation(
                //         otherMember.id
                //     )
                // }

                // return roomDetails
                return messageApi.getGroupDetails(
                    activeConversationId,
                    currentUserId
                )
            }
        },
        enabled: !!activeConversationId,
        staleTime: 30000,
    })

    // Use detailed conversation if available, otherwise fallback to basic one
    const activeConversation = useMemo(() => {
        if (!activeConversationId) return null

        // If we have detailed data with participants, use it
        if (detailedConversation) {
            const baseData = conversations.find(
                (c) => c.id === activeConversationId
            )
            return {
                ...baseData,
                ...detailedConversation,
                // Preserve unread count from base conversation
                unreadCount: baseData?.unreadCount ?? 0,
            } as Conversation
        }

        // Fallback to basic conversation (without participants)
        return conversations.find((c) => c.id === activeConversationId) || null
    }, [conversations, activeConversationId, detailedConversation])

    useEffect(() => {
        if (!detailedConversation?.participants) {
            setIsAdmin(false)
            return
        }

        const isUserAdmin = detailedConversation.participants.some(
            (p) => p.id === currentUserId && p.role === 'admin'
        )

        setIsAdmin(isUserAdmin)
    }, [detailedConversation, currentUserId])

    useEffect(() => {
        const checkWsStatus = setInterval(() => {
            console.log('🔌 WebSocket Status:', wsManager.getConnectionState())
        }, 5000) // Check mỗi 5 giây

        return () => clearInterval(checkWsStatus)
    }, [])

    useEffect(() => {
        const handleNewMessage = (event: CustomEvent) => {
            try {
                const data = event.detail

                if (
                    data.type === 'new_message' &&
                    data.room_id === activeConversationId
                ) {
                    queryClient.invalidateQueries({
                        queryKey: ['conversationDetails', activeConversationId],
                    })
                }
            } catch (error) {
                console.error('Error handling WebSocket message:', error)
            }
        }

        window.addEventListener('ws-new-message', handleNewMessage as any)
        return () => {
            window.removeEventListener(
                'ws-new-message',
                handleNewMessage as any
            )
        }
    }, [activeConversationId])

    const location = useLocation()
    const { userId: routeUserId } = useParams<{ userId: string }>()
    const navigate = useNavigate()

    useEffect(() => {
        const state = location.state as LocationState | null
        const startChatWithUserId = routeUserId || state?.startChatWith

        console.log(
            '📍 [MessagesPage] State nhận được:',
            state,
            'Route params:',
            routeUserId
        )

        if (startChatWithUserId) {
            console.log(
                '🚀 [MessagesPage] Bắt đầu tạo hội thoại với User:',
                startChatWithUserId
            )
            // Nếu có route params thì replace URL về /messages
            if (routeUserId) {
                navigate('/messages', { replace: true })
            } else {
                window.history.replaceState({}, document.title)
            }

            messageApi
                .getOrCreateDirectConversation(startChatWithUserId)
                .then((conversation) => {
                    queryClient.setQueryData(
                        ['conversations'],
                        (oldData: Conversation[] | undefined) => {
                            if (!oldData) return [conversation]
                            const exists = oldData.find(
                                (c) => c.id === conversation.id
                            )
                            return exists ? oldData : [conversation, ...oldData]
                        }
                    )

                    setActiveConversationId(conversation.id)
                })
                .catch((err) => {
                    console.error('Failed to start chat:', err)
                })
        }
    }, [location, queryClient])

    const handleStartChat = async (
        userIds: string[],
        groupName?: string,
        groupAvatar?: File,
        groupDesc?: string
    ) => {
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
                    avatar: groupAvatar,
                    description: groupDesc,
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

    if (error) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
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
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    className={`${s.container} ${activeConversation && isDetailsOpen ? s.isDetailsActive : ''}`}
                >
                    {/* 1. CONVERSATION LIST */}
                    <aside className={s.conversationPanel}>
                        <div className={s.sidebarHeader}>
                            <h3 className={s.sidebarTitle}>Đoạn chat</h3>
                            <ButtonPrimary
                                size="sm"
                                variant="outline"
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
                                isAdmin={isAdmin}
                                onClose={() => setIsDetailsOpen(false)}
                                onNavigateToMessage={handleNavigateToMessage}
                            />
                        </aside>
                    )}
                </div>
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
