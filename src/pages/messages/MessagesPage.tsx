import { useState } from 'react'
import styles from './MessagesPage.module.css'
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from './mockData'
import { ConversationList } from '@/components/feature/messages/ConversationList'
import { ChatWindow } from '@/components/feature/messages/ChatWindow'

// Giả định ID của người dùng hiện tại
const CURRENT_USER_ID = 'user_0'

export function MessagesPage() {
    const [activeConversationId, setActiveConversationId] = useState<
        string | null
    >(MOCK_CONVERSATIONS[0]?.id || null)

    const activeConversation = MOCK_CONVERSATIONS.find(
        (c) => c.id === activeConversationId
    )

    // Lấy tin nhắn cho cuộc trò chuyện đang hoạt động
    const messages = activeConversation
        ? MOCK_MESSAGES[activeConversation.id] || []
        : []

    return (
        <>
            <title>Tin nhắn — TungTung</title>
            <meta
                name="description"
                content="Hộp thoại và thông báo tin nhắn"
            />
            <main className={styles.page}>
                <h1 className={styles.title}>Tin nhắn</h1>

                <div className={styles.container}>
                    <aside className={styles.conversationPanel}>
                        <ConversationList
                            conversations={MOCK_CONVERSATIONS}
                            activeConversationId={activeConversationId}
                            onSelectConversation={(id) =>
                                setActiveConversationId(id)
                            }
                            currentUserId={CURRENT_USER_ID}
                        />
                    </aside>
                    <section className={styles.chatPanel}>
                        {activeConversation ? (
                            <ChatWindow
                                key={activeConversation.id} // Key để reset component khi đổi chat
                                conversation={activeConversation}
                                messages={messages}
                                currentUserId={CURRENT_USER_ID}
                            />
                        ) : (
                            <div className={styles.noChatSelected}>
                                <p>
                                    Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    )
}
