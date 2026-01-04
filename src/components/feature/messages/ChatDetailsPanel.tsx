import React, { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messageApi } from '@/lib/message'
import { listUsers } from '@/lib/users'
import s from './ChatDetailsPanel.module.css'
import type { Conversation } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import { Modal } from '@/components/core/Modal'
import { GroupAvatar } from './GroupAvatar'
import { MessageSearch } from './MessageSearch'

import DeleteIcon from '@/assets/Trash Bin Delete.svg'
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import AddUserIcon from '@/assets/User Add.svg'
import EditIcon from '@/assets/Edit Pen.svg'
import LeaveIcon from '@/assets/Close X Thin.svg'
import BlockIcon from '@/assets/Block.svg'
import CloseIcon from '@/assets/Close X Thin.svg'
import { createPortal } from 'react-dom'
import { useDialog } from '@/hooks/useDialog'

interface UserResult {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string
}

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

    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
        null
    )
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

    // FETCH GROUP DETAILS
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

    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserResult[]>(
        []
    )

    // Fix: Removed unused avatarPreview state
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    useEffect(() => {
        if (isRenameModalOpen && currentConversationData.name) {
            setNewGroupName(currentConversationData.name)
        }
    }, [isRenameModalOpen, currentConversationData.name])

    useEffect(() => {
        if (isAddMemberModalOpen) {
            setMemberSearchTerm('')
            setSelectedUsersToAdd([])
        }
    }, [isAddMemberModalOpen])

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

    // QUERY SEARCH USERS
    const { data: searchResults = [], isLoading: isSearching } = useQuery({
        queryKey: ['users', 'search', memberSearchTerm],
        queryFn: async () => {
            if (!memberSearchTerm.trim()) return []
            const users = await listUsers({
                search: memberSearchTerm,
                limit: 10,
            })
            return users.users.map((user) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl,
            })) as UserResult[]
        },
        enabled: isAddMemberModalOpen && memberSearchTerm.length > 1,
        staleTime: 5000,
    })

    const filteredSearchResults = searchResults.filter(
        (user) => !participants.some((p) => p.id === user.id)
    )

    // MUTATIONS
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
            console.error(error)
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
        onError: (error: any) => {
            console.error(error)
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
        onError: (error: any) => {
            console.error(error)
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
        onError: (error: any) => {
            console.error(error)
            alert('Không thể xóa cuộc trò chuyện')
        },
    })

    // HANDLERS
    const handleRenameSubmit = () => {
        if (
            newGroupName &&
            newGroupName.trim() !== currentConversationData.name
        ) {
            renameGroupMutation.mutate(newGroupName.trim())
        } else {
            setIsRenameModalOpen(false)
        }
    }

    const handleLeaveSubmit = () => leaveGroupMutation.mutate()

    const handleAddMemberSubmit = () => {
        if (selectedUsersToAdd.length > 0) {
            addMemberMutation.mutate(selectedUsersToAdd.map((u) => u.id))
        }
    }

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

    const handleDeleteConversation = () => setIsDeleteModalOpen(true)

    const toggleSelectUser = (user: UserResult) => {
        const isSelected = selectedUsersToAdd.some((u) => u.id === user.id)
        if (isSelected)
            setSelectedUsersToAdd((prev) =>
                prev.filter((u) => u.id !== user.id)
            )
        else setSelectedUsersToAdd((prev) => [...prev, user])
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

                <div className={s.profileSection}>
                    <div className={s.avatarWrapper}>
                        {isGroup ? (
                            currentConversationData.avatarUrl ? (
                                <img
                                    src={currentConversationData.avatarUrl}
                                    alt={displayName}
                                    className={s.avatar}
                                />
                            ) : participants.length > 0 ? (
                                <GroupAvatar
                                    participants={participants}
                                    size="lg"
                                />
                            ) : (
                                <img
                                    src={AvatarImg}
                                    alt={displayName}
                                    className={s.avatar}
                                />
                            )
                        ) : (
                            <img
                                src={otherParticipant?.avatarUrl || AvatarImg}
                                alt={displayName}
                                className={s.avatar}
                            />
                        )}
                    </div>
                    <h3 className={s.displayName}>{displayName}</h3>
                    <p className={s.displayStatus}>{displayStatus}</p>
                </div>
                <div className={s.content}>
                    {showSearch ? (
                        <MessageSearch
                            roomId={conversation.id}
                            // FIX: Wrapper function để xử lý undefined
                            onNavigateToMessage={(id) =>
                                onNavigateToMessage?.(id)
                            }
                            onClose={() => setShowSearch(false)}
                        />
                    ) : (
                        <>
                            {isGroup && (
                                <div className={s.section}>
                                    <h5 className={s.sectionTitle}>
                                        Thành viên ({participants.length})
                                    </h5>
                                    {isLoadingDetails ? (
                                        <div
                                            style={{
                                                padding: '10px',
                                                textAlign: 'center',
                                                color: '#888',
                                                fontSize: '13px',
                                            }}
                                        >
                                            Đang tải danh sách...
                                        </div>
                                    ) : (
                                        <div className={s.memberList}>
                                            {participants.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className={s.memberItem}
                                                >
                                                    <img
                                                        src={
                                                            p.avatarUrl ||
                                                            AvatarImg
                                                        }
                                                        className={
                                                            s.memberAvatar
                                                        }
                                                        alt=""
                                                    />
                                                    <div
                                                        className={s.memberInfo}
                                                    >
                                                        <div
                                                            className={
                                                                s.memberName
                                                            }
                                                        >
                                                            {p.firstName}{' '}
                                                            {p.lastName}
                                                            {p.id ===
                                                                currentUserId && (
                                                                <span
                                                                    style={{
                                                                        color: '#888',
                                                                        fontWeight:
                                                                            'normal',
                                                                        marginLeft: 4,
                                                                    }}
                                                                >
                                                                    (Bạn)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                s.memberStatus
                                                            }
                                                        >
                                                            {p.role ===
                                                            'admin' ? (
                                                                <span
                                                                    style={{
                                                                        color: 'var(--brand-primary-500-light)',
                                                                        fontWeight: 700,
                                                                        fontSize: 11,
                                                                        backgroundColor:
                                                                            'var(--brand-primary-50-light)',
                                                                        padding:
                                                                            '2px 6px',
                                                                        borderRadius:
                                                                            '4px',
                                                                        display:
                                                                            'inline-block',
                                                                        marginTop:
                                                                            '2px',
                                                                    }}
                                                                >
                                                                    Quản trị
                                                                    viên
                                                                </span>
                                                            ) : p.isOnline ? (
                                                                <span
                                                                    style={{
                                                                        color: '#10b981',
                                                                    }}
                                                                >
                                                                    Đang hoạt
                                                                    động
                                                                </span>
                                                            ) : (
                                                                'Không hoạt động'
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <ul className={s.menuList}>
                                {isGroup ? (
                                    <>
                                        {isAdmin && (
                                            <>
                                                <li
                                                    className={s.menuItem}
                                                    onClick={() =>
                                                        setIsAddMemberModalOpen(
                                                            true
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={AddUserIcon}
                                                        alt="Add"
                                                    />{' '}
                                                    Thêm thành viên
                                                </li>
                                                <li
                                                    className={s.menuItem}
                                                    onClick={() =>
                                                        setIsRenameModalOpen(
                                                            true
                                                        )
                                                    }
                                                >
                                                    <img
                                                        src={EditIcon}
                                                        alt="Edit"
                                                    />{' '}
                                                    Đổi tên nhóm
                                                </li>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleAvatarChange
                                                    }
                                                    style={{ display: 'none' }}
                                                />
                                                <li
                                                    className={s.menuItem}
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >
                                                    <img
                                                        src={EditIcon}
                                                        alt="Avatar"
                                                    />{' '}
                                                    Đổi ảnh đại diện
                                                </li>
                                            </>
                                        )}
                                        <li
                                            className={s.menuItem}
                                            onClick={() => setShowSearch(true)}
                                        >
                                            <img
                                                src={SearchIcon}
                                                alt="Search"
                                            />{' '}
                                            Tìm kiếm tin nhắn
                                        </li>
                                        <li className={s.divider} />
                                        <li
                                            className={`${s.menuItem} ${s.danger}`}
                                            onClick={() =>
                                                setIsLeaveModalOpen(true)
                                            }
                                        >
                                            <img src={LeaveIcon} alt="Leave" />{' '}
                                            Rời khỏi nhóm
                                        </li>
                                        {isAdmin && (
                                            <>
                                                <li className={s.divider} />
                                                <li
                                                    className={`${s.menuItem} ${s.danger}`}
                                                    onClick={
                                                        handleDeleteConversation
                                                    }
                                                >
                                                    <img
                                                        src={DeleteIcon}
                                                        alt="Delete"
                                                    />{' '}
                                                    Xóa nhóm vĩnh viễn
                                                </li>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <li
                                            className={s.menuItem}
                                            onClick={() => setShowSearch(true)}
                                        >
                                            <img
                                                src={SearchIcon}
                                                alt="Search"
                                            />{' '}
                                            Tìm kiếm tin nhắn
                                        </li>
                                        <li className={s.divider} />
                                        <li
                                            className={`${s.menuItem} ${s.danger}`}
                                            onClick={() =>
                                                alert(
                                                    'Backend chưa hỗ trợ chặn user'
                                                )
                                            }
                                        >
                                            <img src={BlockIcon} alt="Block" />{' '}
                                            Chặn người này
                                        </li>
                                        <li
                                            className={`${s.menuItem} ${s.danger}`}
                                            onClick={handleDeleteConversation}
                                        >
                                            <img
                                                src={DeleteIcon}
                                                alt="Delete"
                                            />{' '}
                                            Xóa cuộc trò chuyện
                                        </li>
                                    </>
                                )}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            {/* MODALS */}
            <ModalPortal>
                {/* Avatar Preview Modal */}
                <Modal
                    isOpen={isAvatarModalOpen}
                    onClose={handleCancelAvatarUpdate}
                    title="Xem trước ảnh đại diện"
                    footer={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                            }}
                        >
                            <ButtonGhost onClick={handleCancelAvatarUpdate}>
                                Hủy
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={handleConfirmAvatarUpdate}
                                disabled={updateGroupAvatarMutation.isPending}
                            >
                                {updateGroupAvatarMutation.isPending
                                    ? 'Đang tải lên...'
                                    : 'Lưu thay đổi'}
                            </ButtonPrimary>
                        </div>
                    }
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '20px 0',
                        }}
                    >
                        <div
                            style={{
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid var(--surface-raised-light)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            {avatarPreviewUrl && (
                                <img
                                    src={avatarPreviewUrl}
                                    alt="Preview"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            )}
                        </div>
                        <p
                            style={{
                                marginTop: '16px',
                                color: 'var(--text-secondary-light)',
                                textAlign: 'center',
                            }}
                        >
                            Ảnh đại diện nhóm sẽ hiển thị như thế này với mọi
                            thành viên.
                        </p>
                    </div>
                </Modal>

                {/* Rename Group Modal */}
                <Modal
                    isOpen={isRenameModalOpen}
                    onClose={() => setIsRenameModalOpen(false)}
                    title="Đổi tên nhóm"
                    footer={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                            }}
                        >
                            <ButtonGhost
                                onClick={() => setIsRenameModalOpen(false)}
                            >
                                Hủy
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={handleRenameSubmit}
                                disabled={
                                    !newGroupName.trim() ||
                                    renameGroupMutation.isPending
                                }
                            >
                                {renameGroupMutation.isPending
                                    ? 'Đang lưu...'
                                    : 'Lưu thay đổi'}
                            </ButtonPrimary>
                        </div>
                    }
                >
                    <div style={{ paddingTop: '10px' }}>
                        <InputField
                            label="Tên nhóm mới"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Nhập tên nhóm..."
                            fullWidth
                            autoFocus
                        />
                    </div>
                </Modal>

                {/* Leave Group Modal */}
                <Modal
                    isOpen={isLeaveModalOpen}
                    onClose={() => setIsLeaveModalOpen(false)}
                    title="Rời khỏi nhóm?"
                    footer={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                            }}
                        >
                            <ButtonGhost
                                onClick={() => setIsLeaveModalOpen(false)}
                            >
                                Hủy
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={handleLeaveSubmit}
                                disabled={leaveGroupMutation.isPending}
                                style={{
                                    backgroundColor:
                                        'var(--status-danger-500-light)',
                                    borderColor:
                                        'var(--status-danger-500-light)',
                                }}
                            >
                                {leaveGroupMutation.isPending
                                    ? 'Đang xử lý...'
                                    : 'Rời nhóm'}
                            </ButtonPrimary>
                        </div>
                    }
                >
                    <p
                        style={{
                            color: 'var(--text-secondary-light)',
                            lineHeight: 1.5,
                        }}
                    >
                        Bạn có chắc chắn muốn rời khỏi nhóm{' '}
                        <strong>{currentConversationData.name}</strong> không?
                    </p>
                </Modal>

                {/* Add Member Modal */}
                <Modal
                    isOpen={isAddMemberModalOpen}
                    onClose={() => setIsAddMemberModalOpen(false)}
                    title="Thêm thành viên"
                    footer={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                            }}
                        >
                            <ButtonGhost
                                onClick={() => setIsAddMemberModalOpen(false)}
                            >
                                Hủy
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={handleAddMemberSubmit}
                                disabled={
                                    selectedUsersToAdd.length === 0 ||
                                    addMemberMutation.isPending
                                }
                            >
                                {addMemberMutation.isPending
                                    ? 'Đang thêm...'
                                    : `Thêm (${selectedUsersToAdd.length})`}
                            </ButtonPrimary>
                        </div>
                    }
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            minHeight: '300px',
                        }}
                    >
                        <InputField
                            value={memberSearchTerm}
                            onChange={(e) =>
                                setMemberSearchTerm(e.target.value)
                            }
                            placeholder="Tìm người muốn thêm..."
                            fullWidth
                            autoFocus
                            leftIcon={
                                <img
                                    src={SearchIcon}
                                    alt=""
                                    style={{ width: 16, opacity: 0.5 }}
                                />
                            }
                        />
                        {selectedUsersToAdd.length > 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                }}
                            >
                                {selectedUsersToAdd.map((u) => (
                                    <span
                                        key={u.id}
                                        style={{
                                            background: '#eef2ff',
                                            color: 'var(--brand-primary-600-light)',
                                            padding: '4px 10px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        {u.firstName} {u.lastName}
                                        <span
                                            onClick={() => toggleSelectUser(u)}
                                            style={{
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            ×
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {isSearching ? (
                                <p
                                    style={{
                                        textAlign: 'center',
                                        color: '#999',
                                        fontSize: '13px',
                                        marginTop: '20px',
                                    }}
                                >
                                    Đang tìm...
                                </p>
                            ) : filteredSearchResults.length > 0 ? (
                                filteredSearchResults.map((user) => {
                                    const isSelected = selectedUsersToAdd.some(
                                        (u) => u.id === user.id
                                    )
                                    return (
                                        <div
                                            key={user.id}
                                            onClick={() =>
                                                toggleSelectUser(user)
                                            }
                                            className={s.memberItem}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected
                                                    ? '#eff6ff'
                                                    : undefined,
                                                border: isSelected
                                                    ? '1px solid var(--brand-primary-200-light)'
                                                    : '1px solid transparent',
                                            }}
                                        >
                                            <img
                                                src={
                                                    user.avatarUrl || AvatarImg
                                                }
                                                className={s.memberAvatar}
                                                alt=""
                                            />
                                            <div className={s.memberInfo}>
                                                <div className={s.memberName}>
                                                    {user.firstName}{' '}
                                                    {user.lastName}
                                                </div>
                                                <div className={s.memberStatus}>
                                                    {user.email}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <span
                                                    style={{
                                                        color: 'green',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            ) : memberSearchTerm.length > 1 ? (
                                <p
                                    style={{
                                        textAlign: 'center',
                                        color: '#999',
                                        fontSize: '13px',
                                        marginTop: '20px',
                                    }}
                                >
                                    Không tìm thấy.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title={isGroup ? 'Xóa nhóm?' : 'Xóa cuộc trò chuyện?'}
                    footer={
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                            }}
                        >
                            <ButtonGhost
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Hủy
                            </ButtonGhost>
                            <ButtonPrimary
                                onClick={() =>
                                    deleteConversationMutation.mutate()
                                }
                                disabled={deleteConversationMutation.isPending}
                                style={{
                                    backgroundColor:
                                        'var(--status-danger-500-light)',
                                    borderColor:
                                        'var(--status-danger-500-light)',
                                }}
                            >
                                {deleteConversationMutation.isPending
                                    ? 'Đang xóa...'
                                    : 'Xóa'}
                            </ButtonPrimary>
                        </div>
                    }
                >
                    <p
                        style={{
                            color: 'var(--text-secondary-light)',
                            lineHeight: 1.5,
                        }}
                    >
                        {isGroup
                            ? `Bạn có chắc muốn xóa nhóm "${currentConversationData.name}"?`
                            : `Bạn có chắc muốn xóa cuộc trò chuyện với ${displayName}?`}
                    </p>
                </Modal>
            </ModalPortal>
        </>
    )
}
