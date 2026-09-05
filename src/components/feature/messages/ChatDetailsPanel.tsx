import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import s from './ChatDetailsPanel.module.css'
import type { Conversation } from '@/types/message.types'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { MessageSearch } from './MessageSearch'
import CloseIcon from '@/assets/Close X Thin.svg'
import { useDialog } from '@/hooks/useDialog'

// Subcomponents
import { ChatProfileHeader } from './details/ChatProfileHeader'
import { ChatMemberList } from './details/ChatMemberList'
import { ChatActionsMenu } from './details/ChatActionsMenu'

// Modals
import { GroupAvatarPreviewModal } from './modals/GroupAvatarPreviewModal'
import { RenameGroupModal } from './modals/RenameGroupModal'
import { LeaveGroupModal } from './modals/LeaveGroupModal'
import { AddMemberModal } from './modals/AddMemberModal'
import { DeleteConversationModal } from './modals/DeleteConversationModal'

interface ChatDetailsPanelProps {
    conversation: Conversation
    currentUserId: string
    isAdmin?: boolean
    onClose: () => void
    onNavigateToMessage?: (messageId: string) => void
}

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    return createPortal(children, document.body)
}

export const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({
    conversation,
    currentUserId,
    isAdmin = false,
    onClose,
    onNavigateToMessage,
}) => {
    const [showSearch, setShowSearch] = useState(false)
    const queryClient = useQueryClient()
    const isGroup = conversation.isGroup
    const { alert } = useDialog()

    // Modals visibility state
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Avatar state
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
        null
    )
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 1. Fetch group details
    const { data: groupDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['groupDetails', conversation.id],
        queryFn: () =>
            messageApi.getGroupDetails(conversation.id, currentUserId),
        enabled: isGroup,
        staleTime: 60 * 1000,
    })

    const currentConversationData =
        isGroup && groupDetails ? groupDetails : conversation
    const participants = currentConversationData.participants || []

    const otherParticipant = !isGroup
        ? participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = isGroup
        ? currentConversationData.name
        : otherParticipant
          ? `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim() ||
            otherParticipant.fullName
          : 'Unknown User'

    const displayStatus = isGroup
        ? `${participants.length} thành viên`
        : otherParticipant?.isOnline
          ? 'Đang hoạt động'
          : 'Không hoạt động'

    // 2. Mutations
    const renameGroupMutation = useMutation({
        mutationFn: (newTitle: string) =>
            messageApi.updateGroup(conversation.id, { title: newTitle }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            queryClient.invalidateQueries({
                queryKey: ['groupDetails', conversation.id],
            })
            setIsRenameModalOpen(false)
        },
        onError: (error: any) => {
            alert(error?.message || 'Lỗi đổi tên')
        },
    })

    const leaveGroupMutation = useMutation({
        mutationFn: () =>
            messageApi.removeMemberFromGroup(conversation.id, currentUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            setIsLeaveModalOpen(false)
            onClose()
        },
        onError: () => {
            alert('Lỗi khi rời nhóm')
        },
    })

    const addMemberMutation = useMutation({
        mutationFn: (userIds: string[]) =>
            messageApi.addMembersToGroup(conversation.id, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            queryClient.invalidateQueries({
                queryKey: ['groupDetails', conversation.id],
            })
            setIsAddMemberModalOpen(false)
            alert('Đã thêm thành viên!')
        },
        onError: () => {
            alert('Lỗi thêm thành viên')
        },
    })

    const updateGroupAvatarMutation = useMutation({
        mutationFn: (file: File) =>
            messageApi.updateGroup(conversation.id, { avatar: file }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            queryClient.invalidateQueries({
                queryKey: ['groupDetails', conversation.id],
            })
            alert('Đã cập nhật ảnh đại diện!')
            setAvatarFile(null)
        },
    })

    const deleteConversationMutation = useMutation({
        mutationFn: () => messageApi.deleteConversation(conversation.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            setIsDeleteModalOpen(false)
            onClose()
        },
        onError: () => {
            alert('Không thể xóa cuộc trò chuyện')
        },
    })

    // 3. Handlers
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (
            file &&
            file.type.startsWith('image/') &&
            file.size <= 5 * 1024 * 1024
        ) {
            setAvatarFile(file)
            const url = URL.createObjectURL(file)
            setAvatarPreviewUrl(url)
            setIsAvatarModalOpen(true)
            e.target.value = ''
        }
    }

    const handleConfirmAvatarUpdate = () => {
        if (avatarFile) {
            updateGroupAvatarMutation.mutate(avatarFile)
            setIsAvatarModalOpen(false)
            if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
            setAvatarPreviewUrl(null)
        }
    }

    const handleCancelAvatarUpdate = () => {
        setAvatarFile(null)
        setIsAvatarModalOpen(false)
        if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl)
        setAvatarPreviewUrl(null)
    }

    return (
        <>
            <div className={s.panel}>
                <header className={s.header}>
                    <h4 className={s.title}>Chi tiết</h4>
                    <ButtonGhost size="sm" mode="light" onClick={onClose}>
                        <img src={CloseIcon} alt="Đóng" />
                    </ButtonGhost>
                </header>

                <ChatProfileHeader
                    isGroup={isGroup}
                    avatarUrl={currentConversationData.avatarUrl}
                    displayName={displayName}
                    displayStatus={displayStatus}
                    participants={participants}
                    otherParticipant={otherParticipant}
                />

                <div className={s.content}>
                    {showSearch ? (
                        <MessageSearch
                            roomId={conversation.id}
                            onNavigateToMessage={(id) =>
                                onNavigateToMessage?.(id)
                            }
                            onClose={() => setShowSearch(false)}
                        />
                    ) : (
                        <>
                            {isGroup && (
                                <ChatMemberList
                                    participants={participants}
                                    currentUserId={currentUserId}
                                    isLoading={isLoadingDetails}
                                />
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />

                            <ChatActionsMenu
                                isGroup={isGroup}
                                isAdmin={isAdmin}
                                onAddMember={() =>
                                    setIsAddMemberModalOpen(true)
                                }
                                onRename={() => setIsRenameModalOpen(true)}
                                onChangeAvatarClick={() =>
                                    fileInputRef.current?.click()
                                }
                                onSearchClick={() => setShowSearch(true)}
                                onLeaveClick={() => setIsLeaveModalOpen(true)}
                                onDeleteClick={() => setIsDeleteModalOpen(true)}
                                onBlockClick={() =>
                                    alert('Backend chưa hỗ trợ chặn user')
                                }
                            />
                        </>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <ModalPortal>
                <GroupAvatarPreviewModal
                    isOpen={isAvatarModalOpen}
                    avatarPreviewUrl={avatarPreviewUrl}
                    onClose={handleCancelAvatarUpdate}
                    onConfirm={handleConfirmAvatarUpdate}
                    isSubmitting={updateGroupAvatarMutation.isPending}
                />

                <RenameGroupModal
                    isOpen={isRenameModalOpen}
                    currentName={currentConversationData.name}
                    onClose={() => setIsRenameModalOpen(false)}
                    onSubmit={(newName) => renameGroupMutation.mutate(newName)}
                    isSubmitting={renameGroupMutation.isPending}
                />

                <LeaveGroupModal
                    isOpen={isLeaveModalOpen}
                    groupName={currentConversationData.name}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onConfirm={() => leaveGroupMutation.mutate()}
                    isSubmitting={leaveGroupMutation.isPending}
                />

                <AddMemberModal
                    isOpen={isAddMemberModalOpen}
                    existingParticipantIds={participants.map((p) => p.id)}
                    onClose={() => setIsAddMemberModalOpen(false)}
                    onSubmit={(userIds) => addMemberMutation.mutate(userIds)}
                    isSubmitting={addMemberMutation.isPending}
                />

                <DeleteConversationModal
                    isOpen={isDeleteModalOpen}
                    isGroup={isGroup}
                    titleName={
                        isGroup ? currentConversationData.name : displayName
                    }
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => deleteConversationMutation.mutate()}
                    isSubmitting={deleteConversationMutation.isPending}
                />
            </ModalPortal>
        </>
    )
}
