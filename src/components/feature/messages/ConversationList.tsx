import InputField from '@/components/common/input/InputField'
import type { Conversation } from '@/pages/messages/mockData'
import { ConversationItem } from './ConversationItem'
import styles from './ConversationList.module.css'

interface ConversationListProps {
    conversations: Conversation[]
    activeConversationId: string | null
    onSelectConversation: (id: string) => void
    currentUserId: string
}

export function ConversationList({
    conversations,
    activeConversationId,
    onSelectConversation,
    currentUserId,
}: ConversationListProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.search}>
                {/* Tái sử dụng InputField có sẵn */}
                <InputField placeholder="Tìm kiếm tin nhắn..." />
            </div>
            <div className={styles.list}>
                {conversations.map((conv) => {
                    // Lấy thông tin người đối thoại (không phải người dùng hiện tại)
                    const participant = conv.participants.find(
                        (p) => p.id !== currentUserId
                    )

                    if (!participant) return null

                    return (
                        <ConversationItem
                            key={conv.id}
                            name={participant.name}
                            avatarUrl={participant.avatarUrl}
                            lastMessage={conv.lastMessage}
                            timestamp={conv.lastMessageTimestamp}
                            isActive={conv.id === activeConversationId}
                            onClick={() => onSelectConversation(conv.id)}
                        />
                    )
                })}
            </div>
        </div>
    )
}
