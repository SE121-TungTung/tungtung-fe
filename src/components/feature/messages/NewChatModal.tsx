import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/stores/session.store'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './NewChatModal.module.css'
import { listUsers } from '@/lib/users'

interface UserResult {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string
}

interface NewChatModalProps {
    onClose: () => void
    onStartChat: (selectedUserIds: string[], groupName?: string) => void
}

export function NewChatModal({ onClose, onStartChat }: NewChatModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([])
    const [isGroup, setIsGroup] = useState(false)
    const [groupName, setGroupName] = useState('')
    const currentUserId = useSession((s) => s.user?.id)

    const { data: searchResults = [], isLoading } = useQuery({
        queryKey: ['users', 'search', searchTerm],
        queryFn: async () => {
            if (!searchTerm.trim()) return []
            const users = await listUsers({
                search: searchTerm,
                limit: 5,
            })

            return users.items.map((user) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl,
            })) as UserResult[]
        },
        enabled: searchTerm.length > 1,
    })

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleSelectUser = (user: UserResult) => {
        if (!isGroup) {
            onStartChat([user.id])
        } else {
            const exists = selectedUsers.find((u) => u.id === user.id)
            if (exists) {
                setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
            } else {
                setSelectedUsers([...selectedUsers, user])
            }
        }
    }

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== userId))
    }

    const handleSubmitGroup = () => {
        if (!groupName || selectedUsers.length === 0) return
        onStartChat(
            selectedUsers.map((u) => u.id),
            groupName
        )
    }

    return (
        <div className={s.overlay} onClick={handleOverlayClick}>
            <div className={s.modal}>
                <div className={s.header}>
                    <h3>Tạo cuộc trò chuyện</h3>
                    <button
                        onClick={onClose}
                        className={s.closeBtn}
                        title="Đóng"
                    >
                        ×
                    </button>
                </div>

                <div className={s.body}>
                    {/* Tabs chuyển đổi */}
                    <div className={s.tabs}>
                        <button
                            className={`${s.tabBtn} ${!isGroup ? s.active : ''}`}
                            onClick={() => {
                                setIsGroup(false)
                                setSelectedUsers([])
                            }}
                        >
                            Chat 1-1
                        </button>
                        <button
                            className={`${s.tabBtn} ${isGroup ? s.active : ''}`}
                            onClick={() => setIsGroup(true)}
                        >
                            Tạo Nhóm
                        </button>
                    </div>

                    {isGroup && (
                        <div>
                            <InputField
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Đặt tên nhóm..."
                                fullWidth
                            />
                            {/* Danh sách user đã chọn */}
                            {selectedUsers.length > 0 && (
                                <div className={s.selectedContainer}>
                                    {selectedUsers.map((u) => (
                                        <span
                                            key={u.id}
                                            className={s.selectedTag}
                                        >
                                            {u.firstName}{' '}
                                            <span
                                                className={s.removeTag}
                                                onClick={() =>
                                                    handleRemoveUser(u.id)
                                                }
                                            >
                                                ×
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <InputField
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={
                            isGroup
                                ? 'Thêm thành viên...'
                                : 'Tìm người muốn chat...'
                        }
                        fullWidth
                        autoFocus
                    />

                    <div className={s.resultList}>
                        {isLoading && (
                            <div className="text-center p-2 text-gray-400">
                                Đang tìm...
                            </div>
                        )}

                        {searchResults
                            .filter((u) => u.id !== currentUserId)
                            .map((user) => {
                                const isSelected = selectedUsers.some(
                                    (u) => u.id === user.id
                                )
                                return (
                                    <div
                                        key={user.id}
                                        className={`${s.userItem} ${isSelected ? s.selected : ''}`}
                                        onClick={() => handleSelectUser(user)}
                                    >
                                        <img
                                            src={
                                                user.avatarUrl ||
                                                '/assets/avatar-placeholder.png'
                                            }
                                            alt=""
                                            className={s.avatar}
                                        />
                                        <div className={s.userInfo}>
                                            <div className={s.userName}>
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className={s.userEmail}>
                                                {user.email}
                                            </div>
                                        </div>
                                        {isGroup && isSelected && (
                                            <span style={{ color: 'green' }}>
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                )
                            })}

                        {searchTerm &&
                            searchResults.length === 0 &&
                            !isLoading && (
                                <div className="text-center text-gray-500 py-4">
                                    Không tìm thấy user nào
                                </div>
                            )}
                    </div>
                </div>

                <div className={s.footer}>
                    <ButtonGhost onClick={onClose}>Hủy</ButtonGhost>
                    {isGroup && (
                        <ButtonPrimary
                            onClick={handleSubmitGroup}
                            disabled={!groupName || selectedUsers.length === 0}
                        >
                            Tạo nhóm
                        </ButtonPrimary>
                    )}
                </div>
            </div>
        </div>
    )
}
