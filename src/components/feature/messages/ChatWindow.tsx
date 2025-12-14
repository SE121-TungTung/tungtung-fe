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

    return (
        <div className={s.wrapper}>
            <header className={s.header}>
                <div className={s.headerLeft}>
                    <ButtonGhost onClick={onCloseChat} className={s.backButton}>
                        <img src={BackIcon} alt="Back" />
                    </ButtonGhost>

                    {conversation.isGroup ? (
                        <GroupAvatar participants={conversation.participants} />
                    ) : (
                        <img
                            src={
                                otherParticipant?.avatarUrl ||
                                '/default-avatar.png'
                            }
                            className={s.headerAvatar}
                            alt=""
                        />
                    )}

                    <div className={s.headerInfo}>
                        <h3 className={s.chatName}>{displayName}</h3>
                    </div>
                </div>
                <div className={s.headerActions}>
                    <ButtonGhost onClick={onToggleDetails}>
                        <img src={InfoIcon} alt="Info" />
                    </ButtonGhost>
                </div>
            </header>

            {/* Messages List */}
            <div className={s.messageList}>
                {isLoading && (
                    <div className="text-center p-4 text-gray-400">
                        Đang tải tin nhắn...
                    </div>
                )}

                {messages.map((msg, index) => {
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
                })}
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
