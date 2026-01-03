import React, { useRef, useEffect } from 'react'
import s from './ChatWindow.module.css'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import type { Conversation, Message } from '@/types/message.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'

import BackIcon from '@/assets/arrow-left.svg'
import InfoIcon from '@/assets/Information.svg'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { GroupAvatar } from './GroupAvatar'
import { format, isSameDay, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'
import AvatarImg from '@/assets/avatar-placeholder.png'
import { useDialog } from '@/hooks/useDialog'

const DateSeparator = ({ dateString }: { dateString: string }) => {
    if (!dateString) {
        return null
    }
    try {
        const date = new Date(dateString)

        if (isNaN(date.getTime())) {
            return null
        }

        let label = format(date, 'dd/MM/yyyy', { locale: vi })

        if (isToday(date)) label = 'Hôm nay'
        if (isYesterday(date)) label = 'Hôm qua'

        return (
            <div className={s.dateSeparator}>
                <span>{label}</span>
            </div>
        )
    } catch (error) {
        console.error('Invalid date:', dateString, error)
        return null
    }
}

interface ChatWindowProps {
    conversation: Conversation
    currentUserId: string
    onCloseChat: () => void
    onToggleDetails: () => void
    highlightedMessageId?: string | null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversation,
    currentUserId,
    onCloseChat,
    onToggleDetails,
    highlightedMessageId,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const queryClient = useQueryClient()
    const { alert: showAlert } = useDialog()

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['messages', conversation.id],
        queryFn: () => messageApi.getMessages(conversation.id),
        staleTime: 30000,
        refetchInterval: 10000,
        refetchIntervalInBackground: true,
    })

    useEffect(() => {
        const handleNewMessage = (event: Event) => {
            const customEvent = event as CustomEvent<any>
            const data = customEvent.detail

            console.log('WebSocket event received:', data)

            if (
                data.type === 'new_message' &&
                data.room_id === conversation.id
            ) {
                console.log('Invalidating queries for:', conversation.id)

                queryClient.invalidateQueries({
                    queryKey: ['messages', conversation.id],
                })
                queryClient.invalidateQueries({
                    queryKey: ['conversations'],
                })
            }
        }

        window.addEventListener('ws-new-message', handleNewMessage)

        return () => {
            window.removeEventListener('ws-new-message', handleNewMessage)
        }
    }, [conversation.id, queryClient])

    const sendMessageMutation = useMutation({
        mutationFn: (content: string) =>
            messageApi.sendMessage({
                room_id: conversation.id,
                content,
            }),

        onMutate: async (content: string) => {
            await queryClient.cancelQueries({
                queryKey: ['messages', conversation.id],
            })

            const previousMessages = queryClient.getQueryData([
                'messages',
                conversation.id,
            ])

            const optimisticMessage = {
                id: `temp-${Date.now()}`,
                content,
                senderId: currentUserId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isEdited: false,
                isPending: true,
                sender: {
                    id: currentUserId,
                    fullName: 'You',
                    email: '',
                    avatarUrl: null,
                    firstName: '',
                    lastName: '',
                },
            }

            queryClient.setQueryData(
                ['messages', conversation.id],
                (old: any[] = []) => [...old, optimisticMessage]
            )

            return { previousMessages, optimisticMessage }
        },

        onSuccess: (response, _variables, context) => {
            console.log('✅ Message sent successfully')

            const realMessage = {
                ...response,
                isPending: false,
                createdAt: response.createdAt || new Date().toISOString(),
                updatedAt: response.updatedAt || new Date().toISOString(),
            }

            queryClient.setQueryData(
                ['messages', conversation.id],
                (old: any[] = []) => {
                    if (!context?.optimisticMessage) return old

                    return old.map((msg) =>
                        msg.id === context.optimisticMessage.id
                            ? realMessage
                            : msg
                    )
                }
            )

            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['messages', conversation.id],
                })
                queryClient.invalidateQueries({ queryKey: ['conversations'] })
                queryClient.invalidateQueries({
                    queryKey: ['totalUnreadCount'],
                })
            }, 500)
        },

        onError: (error, _variables, context) => {
            console.error('Failed to send message:', error)

            if (context?.previousMessages) {
                queryClient.setQueryData(
                    ['messages', conversation.id],
                    context.previousMessages
                )
            }

            showAlert(
                'Không thể gửi tin nhắn. Vui lòng thử lại sau.',
                'Lỗi gửi tin'
            )
        },
    })

    const editMessageMutation = useMutation({
        mutationFn: ({
            messageId,
            content,
        }: {
            messageId: string
            content: string
        }) => messageApi.editMessage(messageId, content),

        onMutate: async ({ messageId, content }) => {
            await queryClient.cancelQueries({
                queryKey: ['messages', conversation.id],
            })

            const previousMessages = queryClient.getQueryData([
                'messages',
                conversation.id,
            ])

            queryClient.setQueryData(
                ['messages', conversation.id],
                (old: Message[] = []) => {
                    return old.map((msg) =>
                        msg.id === messageId
                            ? {
                                  ...msg,
                                  content: content,
                                  isEdited: true,
                                  updatedAt: new Date().toISOString(),
                                  isPending: true,
                              }
                            : msg
                    )
                }
            )

            return { previousMessages, messageId }
        },

        onSuccess: (response, _variables, context) => {
            console.log('✅ Message edited successfully')

            queryClient.setQueryData(
                ['messages', conversation.id],
                (old: Message[] = []) => {
                    return old.map((msg) =>
                        msg.id === context?.messageId
                            ? {
                                  ...msg,
                                  ...response,
                                  isPending: false,
                              }
                            : msg
                    )
                }
            )

            setTimeout(() => {
                queryClient.invalidateQueries({
                    queryKey: ['messages', conversation.id],
                })
            }, 500)
        },

        onError: (error, _variables, context) => {
            console.error('Failed to edit message:', error)

            if (context?.previousMessages) {
                queryClient.setQueryData(
                    ['messages', conversation.id],
                    context.previousMessages
                )
            }

            showAlert(
                'Không thể chỉnh sửa tin nhắn. Vui lòng thử lại sau.',
                'Lỗi chỉnh sửa tin'
            )
        },
    })

    const deleteMessageMutation = useMutation({
        mutationFn: async (messageId: string) => {
            await messageApi.deleteMessage(messageId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['messages', conversation.id],
            })
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
        },
        onError: (error) => {
            console.error('Failed to delete message:', error)
            showAlert(
                'Không thể xóa tin nhắn. Vui lòng thử lại sau.',
                'Lỗi xóa tin'
            )
        },
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
            const element = messageRefs.current[highlightedMessageId]
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })

            element?.classList.add(s.highlighted)
            const timer = setTimeout(() => {
                element?.classList.remove(s.highlighted)
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [highlightedMessageId, messages])

    useEffect(() => {
        if (!highlightedMessageId) {
            scrollToBottom()
        }
    }, [messages, highlightedMessageId])

    useEffect(() => {
        scrollToBottom()
    }, [conversation.id])

    const otherParticipant = !conversation.isGroup
        ? conversation.participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = conversation.isGroup
        ? conversation.name
        : otherParticipant
          ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() ||
            otherParticipant.fullName ||
            'Unknown User'
          : 'Unknown User'

    const displayStatus = conversation.isGroup
        ? conversation.participants?.length
            ? `${conversation.participants.length} thành viên`
            : 'Đang tải...'
        : otherParticipant?.isOnline
          ? 'Đang hoạt động'
          : 'Không hoạt động'

    useEffect(() => {
        if (conversation.id && conversation.unreadCount > 0) {
            const timer = setTimeout(async () => {
                try {
                    await messageApi.markAsRead(conversation.id)
                    queryClient.invalidateQueries({
                        queryKey: ['conversations'],
                    })
                    queryClient.invalidateQueries({
                        queryKey: ['totalUnreadCount'],
                    })
                } catch (error) {
                    console.error('Failed to mark as read:', error)
                }
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [conversation.id, conversation.unreadCount])

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
                            conversation.avatarUrl ? (
                                <img
                                    src={conversation.avatarUrl}
                                    className={s.headerAvatar}
                                    alt={conversation.name}
                                />
                            ) : conversation.participants?.length > 0 ? (
                                <GroupAvatar
                                    participants={conversation.participants}
                                />
                            ) : (
                                <img
                                    src={AvatarImg}
                                    className={s.headerAvatar}
                                    alt="Group"
                                />
                            )
                        ) : (
                            <>
                                <img
                                    src={
                                        otherParticipant?.avatarUrl || AvatarImg
                                    }
                                    className={s.headerAvatar}
                                    alt={otherParticipant?.fullName || 'User'}
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
                        <small style={{ opacity: 0.6, marginTop: '8px' }}>
                            Gửi tin nhắn đầu tiên để bắt đầu trò chuyện
                        </small>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isSent = msg.senderId === currentUserId
                        let showSenderInfo = false

                        if (msg.senderId === null) {
                            return (
                                <div key={msg.id} className={s.systemMessage}>
                                    <span>{msg.content}</span>
                                </div>
                            )
                        }

                        const prevMsg = messages[index - 1]
                        const showDateSeparator =
                            !prevMsg ||
                            !isSameDay(
                                new Date(msg.createdAt),
                                new Date(prevMsg.createdAt)
                            )

                        const sender =
                            conversation.participants?.find(
                                (p) => p.id === msg.senderId
                            ) || msg.sender // Fallback to sender from message API

                        // Don't hide messages if sender not found - use fallback
                        if (!sender && !isSent) {
                            console.warn(
                                '⚠️ Sender not found for message:',
                                msg.id,
                                'senderId:',
                                msg.senderId,
                                'participants:',
                                conversation.participants
                            )
                            // Use a fallback sender instead of hiding message
                            const fallbackSender = {
                                id: msg.senderId || 'unknown',
                                fullName: 'Unknown User',
                                email: '',
                                avatarUrl: null,
                                firstName: 'Unknown',
                                lastName: 'User',
                            }

                            return (
                                <div
                                    key={msg.id}
                                    ref={(el) => {
                                        messageRefs.current[msg.id] = el
                                    }}
                                >
                                    {showDateSeparator && (
                                        <DateSeparator
                                            dateString={msg.createdAt}
                                        />
                                    )}

                                    <MessageBubble
                                        message={msg}
                                        isSent={false}
                                        sender={fallbackSender}
                                        showSenderName={
                                            conversation.isGroup &&
                                            showSenderInfo
                                        }
                                        showAvatar={showSenderInfo}
                                        onEdit={(messageId, content) =>
                                            editMessageMutation.mutate({
                                                messageId,
                                                content,
                                            })
                                        }
                                        onDelete={(messageId) =>
                                            deleteMessageMutation.mutate(
                                                messageId
                                            )
                                        }
                                    />
                                </div>
                            )
                        }

                        if (!isSent && conversation.isGroup) {
                            const nextMsg = messages[index + 1]

                            if (!nextMsg || nextMsg.senderId !== msg.senderId) {
                                showSenderInfo = true
                            }

                            if (
                                nextMsg &&
                                !isSameDay(
                                    new Date(msg.createdAt),
                                    new Date(nextMsg.createdAt)
                                )
                            ) {
                                showSenderInfo = true
                            }
                        }

                        return (
                            <div
                                key={msg.id}
                                ref={(el) => {
                                    messageRefs.current[msg.id] = el
                                }}
                            >
                                {showDateSeparator && (
                                    <DateSeparator dateString={msg.createdAt} />
                                )}

                                <MessageBubble
                                    message={msg}
                                    isSent={isSent}
                                    sender={
                                        sender || {
                                            id: currentUserId,
                                            fullName: 'You',
                                            email: '',
                                            avatarUrl: null,
                                            firstName: '',
                                            lastName: '',
                                        }
                                    }
                                    showSenderName={
                                        conversation.isGroup && showSenderInfo
                                    }
                                    showAvatar={!isSent && showSenderInfo}
                                    onEdit={(messageId, content) =>
                                        editMessageMutation.mutate({
                                            messageId,
                                            content,
                                        })
                                    }
                                    onDelete={(messageId) =>
                                        deleteMessageMutation.mutate(messageId)
                                    }
                                />
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className={s.footer}>
                <ChatInput
                    onSendMessage={(text) => sendMessageMutation.mutate(text)}
                    disabled={sendMessageMutation.isPending}
                />
            </footer>
        </div>
    )
}
