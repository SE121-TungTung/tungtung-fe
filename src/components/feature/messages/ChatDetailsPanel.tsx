import React, { useState, useEffect } from 'react'
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

import SearchIcon from '@/assets/Action Eye Tracking.svg'
import AddUserIcon from '@/assets/User Add.svg'
import EditIcon from '@/assets/Edit Pen.svg'
import LeaveIcon from '@/assets/Close X Thin.svg'
import BlockIcon from '@/assets/Block.svg'
import CloseIcon from '@/assets/Close X Thin.svg'

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
    onClose: () => void
    onNavigateToMessage?: (messageId: string) => void
}

export const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({
    conversation,
    currentUserId,
    onClose,
    onNavigateToMessage,
}) => {
    const [showSearch, setShowSearch] = useState(false)
    const queryClient = useQueryClient()
    const { isGroup, participants } = conversation

    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
    const [memberSearchTerm, setMemberSearchTerm] = useState('')
    const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserResult[]>(
        []
    )

    useEffect(() => {
        if (isRenameModalOpen && conversation.name) {
            setNewGroupName(conversation.name)
        }
    }, [isRenameModalOpen, conversation.name])

    useEffect(() => {
        if (isAddMemberModalOpen) {
            setMemberSearchTerm('')
            setSelectedUsersToAdd([])
        }
    }, [isAddMemberModalOpen])

    const otherParticipant = !isGroup
        ? participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = conversation.isGroup
        ? conversation.name
        : otherParticipant
          ? `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim() ||
            otherParticipant.fullName
          : 'Unknown User'

    const displayStatus = isGroup
        ? `${participants.length} thành viên`
        : otherParticipant?.isOnline
          ? 'Đang hoạt động'
          : 'Không hoạt động'

    // ==========================================
    // QUERY: Tìm kiếm User để thêm vào nhóm
    // ==========================================
    const { data: searchResults = [], isLoading: isSearching } = useQuery({
        queryKey: ['users', 'search', memberSearchTerm],
        queryFn: async () => {
            if (!memberSearchTerm.trim()) return []
            const users = await listUsers({
                search: memberSearchTerm,
                limit: 10,
            })
            return users.items.map((user) => ({
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

    // Lọc bỏ những user đã có trong nhóm
    const filteredSearchResults = searchResults.filter(
        (user) => !participants.some((p) => p.id === user.id)
    )

    // ==========================================
    // MUTATIONS
    // ==========================================

    const renameGroupMutation = useMutation({
        mutationFn: (newTitle: string) =>
            messageApi.updateGroup(conversation.id, { title: newTitle }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            setIsRenameModalOpen(false)
        },
        onError: (error: any) => {
            console.error('Failed to rename group:', error)
            const msg =
                error?.response?.data?.detail ||
                error?.message ||
                'Không thể đổi tên nhóm.'
            alert(msg)
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
            console.error('Failed to leave group:', error)
            const backendMsg = error?.response?.data?.detail
            const msg = backendMsg || error?.message || 'Lỗi khi rời nhóm.'
            alert(`⚠️ ${msg}`)
            setIsLeaveModalOpen(false)
        },
    })

    const addMemberMutation = useMutation({
        mutationFn: (userIds: string[]) =>
            messageApi.addMembersToGroup(conversation.id, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
            queryClient.invalidateQueries({
                queryKey: ['groups', conversation.id],
            })
            setIsAddMemberModalOpen(false)
            alert('Đã thêm thành viên thành công!')
        },
        onError: (error: any) => {
            console.error('Failed to add member:', error)
            const msg =
                error?.response?.data?.detail || 'Không thể thêm thành viên.'
            alert(msg)
        },
    })

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleRenameSubmit = () => {
        if (newGroupName && newGroupName.trim() !== conversation.name) {
            renameGroupMutation.mutate(newGroupName.trim())
        } else {
            setIsRenameModalOpen(false)
        }
    }

    const handleLeaveSubmit = () => {
        leaveGroupMutation.mutate()
    }

    const handleAddMemberSubmit = () => {
        if (selectedUsersToAdd.length > 0) {
            const userIds = selectedUsersToAdd.map((u) => u.id)
            addMemberMutation.mutate(userIds)
        }
    }

    const toggleSelectUser = (user: UserResult) => {
        const isSelected = selectedUsersToAdd.some((u) => u.id === user.id)
        if (isSelected) {
            setSelectedUsersToAdd((prev) =>
                prev.filter((u) => u.id !== user.id)
            )
        } else {
            setSelectedUsersToAdd((prev) => [...prev, user])
        }
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
                            <GroupAvatar
                                participants={participants}
                                size="lg"
                            />
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
                            onNavigateToMessage={(messageId) => {
                                onNavigateToMessage?.(messageId)
                            }}
                            onClose={() => setShowSearch(false)}
                        />
                    ) : (
                        <>
                            {isGroup && (
                                <div className={s.section}>
                                    <h5 className={s.sectionTitle}>
                                        Thành viên ({participants.length})
                                    </h5>
                                    <div className={s.memberList}>
                                        {participants.map((p) => (
                                            <div
                                                key={p.id}
                                                className={s.memberItem}
                                            >
                                                <img
                                                    src={
                                                        p.avatarUrl || AvatarImg
                                                    }
                                                    className={s.memberAvatar}
                                                    alt=""
                                                />
                                                <div className={s.memberInfo}>
                                                    <div
                                                        className={s.memberName}
                                                    >
                                                        {p.firstName}{' '}
                                                        {p.lastName}
                                                    </div>
                                                    <div
                                                        className={
                                                            s.memberStatus
                                                        }
                                                    >
                                                        {p.role === 'admin' ? (
                                                            <span
                                                                style={{
                                                                    color: 'var(--brand-primary-500-light)',
                                                                    fontWeight: 600,
                                                                    fontSize: 11,
                                                                }}
                                                            >
                                                                Quản trị viên
                                                            </span>
                                                        ) : p.isOnline ? (
                                                            'Đang hoạt động'
                                                        ) : (
                                                            'Không hoạt động'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <ul className={s.menuList}>
                                {isGroup ? (
                                    <>
                                        <li
                                            className={s.menuItem}
                                            onClick={() =>
                                                setIsAddMemberModalOpen(true)
                                            }
                                        >
                                            <img src={AddUserIcon} alt="Add" />
                                            Thêm thành viên
                                        </li>
                                        <li
                                            className={s.menuItem}
                                            onClick={() =>
                                                setIsRenameModalOpen(true)
                                            }
                                        >
                                            <img src={EditIcon} alt="Edit" />
                                            Đổi tên nhóm
                                        </li>
                                        <li
                                            className={s.menuItem}
                                            onClick={() => setShowSearch(true)}
                                        >
                                            <img
                                                src={SearchIcon}
                                                alt="Search"
                                            />
                                            Tìm kiếm tin nhắn
                                        </li>
                                        <li className={s.divider} />
                                        <li
                                            className={`${s.menuItem} ${s.danger}`}
                                            onClick={() =>
                                                setIsLeaveModalOpen(true)
                                            }
                                        >
                                            <img src={LeaveIcon} alt="Leave" />
                                            Rời khỏi nhóm
                                        </li>
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
                                            />
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
                                            <img src={BlockIcon} alt="Block" />
                                            Chặn người này
                                        </li>
                                    </>
                                )}
                            </ul>
                        </>
                    )}
                </div>
            </div>

            {/* ✅ 1. MODAL ĐỔI TÊN NHÓM */}
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

            {/* ✅ 2. MODAL RỜI NHÓM */}
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
                        <ButtonGhost onClick={() => setIsLeaveModalOpen(false)}>
                            Hủy
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleLeaveSubmit}
                            disabled={leaveGroupMutation.isPending}
                            style={{
                                backgroundColor:
                                    'var(--status-danger-500-light)',
                                borderColor: 'var(--status-danger-500-light)',
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
                    <strong>{conversation.name}</strong> không? Bạn sẽ không thể
                    nhận tin nhắn từ nhóm này nữa.
                </p>
            </Modal>

            {/* ✅ 3. MODAL THÊM THÀNH VIÊN */}
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
                        onChange={(e) => setMemberSearchTerm(e.target.value)}
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

                    {/* Danh sách người đã chọn */}
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

                    {/* Danh sách kết quả tìm kiếm */}
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
                                        onClick={() => toggleSelectUser(user)}
                                        className={s.memberItem} // Tái sử dụng class memberItem
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
                                            src={user.avatarUrl || AvatarImg}
                                            className={s.memberAvatar}
                                            alt=""
                                        />
                                        <div className={s.memberInfo}>
                                            <div className={s.memberName}>
                                                {user.firstName} {user.lastName}
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
                                Không tìm thấy người dùng phù hợp hoặc đã có
                                trong nhóm.
                            </p>
                        ) : null}
                    </div>
                </div>
            </Modal>
        </>
    )
}
