import React, { useRef, useEffect } from 'react'
import s from './ChatWindow.module.css'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import type { Conversation } from '@/types/message.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'

import BackIcon from '@/assets/arrow-left.svg'
import InfoIcon from '@/assets/Information.svg'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { GroupAvatar } from './GroupAvatar'

interface ChatWindowProps {
    conversation: Conversation
    currentUserId: string
    onCloseChat: () => void
    onToggleDetails: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    currentUserId,
    onCloseChat,
    onToggleDetails,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const queryClient = useQueryClient()

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['messages', conversation.id],
        queryFn: () => messageApi.getMessages(conversation.id),
        refetchInterval: 3000,
    })

    const sendMessageMutation = useMutation({
        mutationFn: (content: string) =>
            messageApi.sendMessage({
                conversation_id: conversation.id,
                content,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['messages', conversation.id],
            })
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const otherParticipant = !conversation.isGroup
        ? conversation.participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = conversation.isGroup
        ? conversation.name
        : otherParticipant?.firstName + ' ' + otherParticipant?.lastName

    const displayStatus = conversation.isGroup
        ? `${conversation.participants.length} thành viên`
        : otherParticipant?.isOnline
          ? 'Đang hoạt động'
          : 'Không hoạt động'

    return (
        <div className={s.window}>
            <header className={s.header}>
                <div className={s.headerLeft}>
                    <ButtonGhost
                        onClick={onCloseChat}
                        className={s.backButton}
                        size="sm"
                        mode="light"
                    >
                        <img src={BackIcon} alt="Back" />
                    </ButtonGhost>

                    <div className={s.avatarWrapper}>
                        {conversation.isGroup ? (
                            <GroupAvatar
                                participants={conversation.participants}
                            />
                        ) : (
                            <>
                                <img
                                    src={
                                        otherParticipant?.avatarUrl ||
                                        '/default-avatar.png'
                                    }
                                    className={s.headerAvatar}
                                    alt=""
                                />
                                {otherParticipant?.isOnline && (
                                    <div className={s.onlineBadge} />
                                )}
                            </>
                        )}
                    </div>

                    <div className={s.headerInfo}>
                        <h3 className={s.chatName}>{displayName}</h3>
                        <p className={s.chatStatus}>{displayStatus}</p>
                    </div>
                </div>

                <div className={s.headerActions}>
                    <ButtonGhost
                        onClick={onToggleDetails}
                        size="sm"
                        mode="light"
                    >
                        <img src={InfoIcon} alt="Info" />
                    </ButtonGhost>
                </div>
            </header>

            {/* Messages List */}
            <div className={s.messageList}>
                {isLoading ? (
                    <div className={s.loadingContainer}>
                        <div className={s.skeletonMessage}>
                            <div className={s.skeletonAvatar} />
                            <div className={s.skeletonBubble} />
                        </div>
                        <div className={`${s.skeletonMessage} ${s.right}`}>
                            <div className={s.skeletonBubble} />
                        </div>
                        <div className={s.skeletonMessage}>
                            <div className={s.skeletonAvatar} />
                            <div className={s.skeletonBubble} />
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className={s.emptyState}>
                        <svg
                            className={s.emptyIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <p>Chưa có tin nhắn nào</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isSent = msg.senderId === currentUserId
                        let showSenderInfo = false
                        const sender = conversation.participants.find(
                            (p) => p.id === msg.senderId
                        )
                        if (!sender && !isSent) return null
                        if (!isSent) {
                            const nextMsg = messages[index + 1]
                            if (!nextMsg || nextMsg.senderId !== msg.senderId) {
                                showSenderInfo = true
                            }
                        }

                        return (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                isSent={isSent}
                                sender={sender!}
                                showSenderName={
                                    conversation.isGroup && showSenderInfo
                                }
                                showAvatar={!isSent && showSenderInfo}
                            />
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer Input */}
            <footer className={s.footer}>
                <ChatInput
                    onSendMessage={(text) => sendMessageMutation.mutate(text)}
                    disabled={sendMessageMutation.isPending}
                />
            </footer>
        </div>
    )
}
