import React, { useState, useMemo } from 'react'
import s from './ConversationList.module.css'
import InputField from '@/components/common/input/InputField'
import { ConversationItem } from './ConversationItem'
import type { Conversation } from '@/types/message.types'
import SearchIcon from '@/assets/Action Eye Tracking.svg'

interface ConversationListProps {
    conversations: Conversation[]
    activeId: string | null
    onSelectConversation: (id: string) => void
    currentUserId: string
    isLoading?: boolean
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeId,
    onSelectConversation,
    currentUserId,
    isLoading = false,
}) => {
    const [searchTerm, setSearchTerm] = useState('')

    // ✅ FIX: Use correct field 'name' instead of 'title'
    const filteredConversations = useMemo(() => {
        if (!searchTerm.trim()) return conversations

        const lowerTerm = searchTerm.toLowerCase().trim()

        return conversations.filter((conversation) => {
            // Search in conversation name
            const displayName = conversation.name || 'Chưa đặt tên'
            if (displayName.toLowerCase().includes(lowerTerm)) {
                return true
            }

            // ✅ ENHANCEMENT: Search in participants' names for direct chats
            if (!conversation.isGroup && conversation.participants.length > 0) {
                return conversation.participants.some((participant) => {
                    const fullName = participant.fullName?.toLowerCase() || ''
                    const firstName = participant.firstName?.toLowerCase() || ''
                    const lastName = participant.lastName?.toLowerCase() || ''
                    const email = participant.email?.toLowerCase() || ''

                    return (
                        fullName.includes(lowerTerm) ||
                        firstName.includes(lowerTerm) ||
                        lastName.includes(lowerTerm) ||
                        email.includes(lowerTerm)
                    )
                })
            }

            // ✅ ENHANCEMENT: Search in last message content
            if (conversation.lastMessage?.content) {
                return conversation.lastMessage.content
                    .toLowerCase()
                    .includes(lowerTerm)
            }

            return false
        })
    }, [conversations, searchTerm])

    // ✅ FIX: Sort conversations by most recent
    const sortedConversations = useMemo(() => {
        return [...filteredConversations].sort((a, b) => {
            // Sort by updatedAt (most recent first)
            const dateA = new Date(a.updatedAt).getTime()
            const dateB = new Date(b.updatedAt).getTime()
            return dateB - dateA
        })
    }, [filteredConversations])

    return (
        <div className={s.listWrapper}>
            <div className={s.searchBar}>
                <InputField
                    placeholder="Tìm kiếm đoạn chat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<img src={SearchIcon} alt="Search" />}
                    variant="soft"
                    mode="light"
                    uiSize="sm"
                    fullWidth
                    disabled={isLoading && conversations.length === 0}
                    aria-label="Tìm kiếm cuộc trò chuyện"
                />
            </div>

            <div className={s.list}>
                {isLoading && conversations.length === 0 ? (
                    // ✅ FIX: Show loading only on initial load
                    <div className={s.loadingState}>
                        <div className={s.spinner}></div>
                        <span>Đang tải cuộc trò chuyện...</span>
                    </div>
                ) : sortedConversations.length > 0 ? (
                    // ✅ FIX: Render sorted conversations
                    sortedConversations.map((convo) => (
                        <ConversationItem
                            key={convo.id}
                            conversation={convo}
                            isActive={convo.id === activeId}
                            onClick={() => onSelectConversation(convo.id)}
                            currentUserId={currentUserId}
                        />
                    ))
                ) : (
                    // ✅ FIX: Better empty states
                    <div className={s.emptyState}>
                        {searchTerm ? (
                            <>
                                <p>Không tìm thấy kết quả</p>
                                <small>Thử tìm kiếm với từ khóa khác</small>
                            </>
                        ) : conversations.length === 0 ? (
                            <>
                                <p>Chưa có cuộc trò chuyện nào</p>
                                <small>Nhấn "+ Mới" để bắt đầu chat</small>
                            </>
                        ) : (
                            <p>Không có cuộc trò chuyện nào</p>
                        )}
                    </div>
                )}

                {/* ✅ ENHANCEMENT: Show conversation count */}
                {!isLoading && conversations.length > 0 && (
                    <div className={s.conversationCount}>
                        {searchTerm && (
                            <small>
                                Hiển thị {sortedConversations.length} /{' '}
                                {conversations.length} cuộc trò chuyện
                            </small>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
