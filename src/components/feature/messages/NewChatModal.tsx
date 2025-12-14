import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useSession } from '@/stores/session.store'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './NewChatModal.module.css'

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

    const { data: searchResults = [] } = useQuery({
        queryKey: ['users', 'search', searchTerm],
        queryFn: async () => {
            if (!searchTerm) return []
            return api<UserResult[]>(
                `/api/v1/users?search=${searchTerm}&limit=5`
            )
        },
        enabled: searchTerm.length > 2,
    })

    const handleSelectUser = (user: UserResult) => {
        if (selectedUsers.find((u) => u.id === user.id)) return
        if (!isGroup) {
            onStartChat([user.id])
        } else {
            setSelectedUsers([...selectedUsers, user])
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
        <div className={s.overlay}>
            <div className={s.modal}>
                <div className={s.header}>
                    <h3>Tạo cuộc trò chuyện mới</h3>
                    <button onClick={onClose} className={s.closeBtn}>
                        ×
                    </button>
                </div>

                <div className={s.tabs}>
                    <button
                        className={!isGroup ? s.activeTab : ''}
                        onClick={() => {
                            setIsGroup(false)
                            setSelectedUsers([])
                        }}
                    >
                        Chat 1-1
                    </button>
                    <button
                        className={isGroup ? s.activeTab : ''}
                        onClick={() => setIsGroup(true)}
                    >
                        Tạo Nhóm
                    </button>
                </div>

                <div className={s.body}>
                    {isGroup && (
                        <div className="mb-4">
                            <InputField
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Đặt tên nhóm..."
                                fullWidth
                            />
                            {/* List user đã chọn */}
                            <div className={s.selectedList}>
                                {selectedUsers.map((u) => (
                                    <span key={u.id} className={s.selectedTag}>
                                        {u.firstName}{' '}
                                        <span
                                            onClick={() =>
                                                handleRemoveUser(u.id)
                                            }
                                        >
                                            ×
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <InputField
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo email hoặc tên..."
                        fullWidth
                        autoFocus
                    />

                    <div className={s.resultList}>
                        {searchResults
                            .filter((u) => u.id !== currentUserId)
                            .map((user) => (
                                <div
                                    key={user.id}
                                    className={s.userItem}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <img
                                        src={
                                            user.avatarUrl ||
                                            '/default-avatar.png'
                                        }
                                        alt=""
                                        className={s.avatar}
                                    />
                                    <div>
                                        <div className={s.userName}>
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className={s.userEmail}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        {searchTerm && searchResults.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                Không tìm thấy user nào
                            </div>
                        )}
                    </div>
                </div>

                {isGroup && (
                    <div className={s.footer}>
                        <ButtonGhost onClick={onClose}>Hủy</ButtonGhost>
                        <ButtonPrimary
                            onClick={handleSubmitGroup}
                            disabled={!groupName || selectedUsers.length === 0}
                        >
                            Tạo nhóm
                        </ButtonPrimary>
                    </div>
                )}
            </div>
        </div>
    )
}
