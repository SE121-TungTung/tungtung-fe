// src/components/feature/messages/ConversationList.tsx
import React, { useState, useMemo } from 'react'
import s from './ConversationList.module.css'
import InputField from '@/components/common/input/InputField'
import { ConversationItem } from './ConversationItem' // Component con
import type { Conversation } from '@/types/message.types'

// Icon
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import EditIcon from '@/assets/Edit Pen.svg'
import ButtonGhost from '@/components/common/button/ButtonGhost'

interface ConversationListProps {
    conversations: Conversation[]
    activeConversationId: string | null
    onSelectConversation: (id: string) => void
    currentUserId: string
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    currentUserId,
}) => {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredConversations = useMemo(() => {
        if (!searchTerm) return conversations
        return conversations.filter((convo) => {
            const otherParticipant = convo.participants.find(
                (p) => p.id !== currentUserId
            )
            const name = convo.isGroup
                ? convo.groupName
                : otherParticipant?.name
            return name?.toLowerCase().includes(searchTerm.toLowerCase())
        })
    }, [conversations, searchTerm, currentUserId])

    return (
        <div className={s.listWrapper}>
            <header className={s.header}>
                <h2 className={s.title}>Chats</h2>
                <ButtonGhost
                    size="sm"
                    mode="light"
                    aria-label="Soạn tin nhắn mới"
                    onClick={() => alert('Soạn tin mới...')}
                >
                    <img src={EditIcon} alt="Soạn tin" />
                </ButtonGhost>
            </header>

            <div className={s.searchBar}>
                <InputField
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<img src={SearchIcon} alt="Search" />}
                    variant="soft"
                    mode="light"
                    uiSize="sm"
                />
            </div>

            <div className={s.list}>
                {filteredConversations.length > 0 ? (
                    filteredConversations.map((convo) => (
                        <ConversationItem
                            key={convo.id}
                            conversation={convo}
                            isActive={convo.id === activeConversationId}
                            onClick={() => onSelectConversation(convo.id)}
                            currentUserId={currentUserId}
                        />
                    ))
                ) : (
                    <div className={s.emptyState}>Không tìm thấy kết quả</div>
                )}
            </div>
        </div>
    )
}
