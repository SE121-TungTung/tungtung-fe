// components/feature/message/NewChatModal.tsx - UPDATED
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/stores/session.store'
import InputField from '@/components/common/input/InputField'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './NewChatModal.module.css'
import { listUsers } from '@/lib/users'
import DefaultAvatar from '@/assets/avatar-placeholder.png'

interface UserResult {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string
}

interface NewChatModalProps {
    onClose: () => void
    onStartChat: (
        selectedUserIds: string[],
        groupName?: string,
        groupAvatar?: File,
        groupDesc?: string
    ) => void
}

export function NewChatModal({ onClose, onStartChat }: NewChatModalProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([])

    // Group State
    const [isGroup, setIsGroup] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [groupDesc, setGroupDesc] = useState('')

    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const currentUserId = useSession((s) => s.user?.id)
    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        searchInputRef.current?.focus()
    }, [isGroup])

    const { data: searchResults = [], isLoading } = useQuery({
        queryKey: ['users', 'search', searchTerm],
        queryFn: async () => {
            if (!searchTerm.trim()) return []
            const users = await listUsers({
                search: searchTerm,
                limit: 5,
            })

            return users.users.map((user) => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatarUrl: user.avatarUrl,
            })) as UserResult[]
        },
        enabled: searchTerm.length > 1,
    })

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Kích thước file không được vượt quá 5MB')
                return
            }

            setAvatarFile(file)

            // Create preview URL
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveAvatar = () => {
        setAvatarFile(null)
        setAvatarPreview('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

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
                setSearchTerm('')
                searchInputRef.current?.focus()
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
            groupName,
            avatarFile || undefined,
            groupDesc
        )
    }

    return (
        <div className={s.overlay} onClick={handleOverlayClick}>
            <div className={s.modal}>
                <div className={s.header}>
                    <h3>{isGroup ? 'Tạo nhóm mới' : 'Cuộc trò chuyện mới'}</h3>
                    <button
                        onClick={onClose}
                        className={s.closeBtn}
                        title="Đóng"
                    >
                        ×
                    </button>
                </div>

                <div className={s.body}>
                    {/* Tabs */}
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

                    {/* FORM TẠO NHÓM */}
                    {isGroup && (
                        <div className={s.groupForm}>
                            <div className={s.groupHeaderInput}>
                                <div className={s.avatarUpload}>
                                    <img
                                        src={avatarPreview || DefaultAvatar}
                                        alt="Group Avatar"
                                        className={s.avatarPreview}
                                        onError={(e) =>
                                            (e.currentTarget.src =
                                                DefaultAvatar)
                                        }
                                    />

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />

                                    <button
                                        type="button"
                                        className={s.uploadBtn}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        {avatarFile ? 'Đổi ảnh' : 'Tải ảnh'}
                                    </button>

                                    {avatarFile && (
                                        <button
                                            type="button"
                                            className={s.removeBtn}
                                            onClick={handleRemoveAvatar}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>

                                {/* Info Inputs */}
                                <div className={s.groupInfoInputs}>
                                    <InputField
                                        value={groupName}
                                        onChange={(e) =>
                                            setGroupName(e.target.value)
                                        }
                                        placeholder="Tên nhóm (Bắt buộc)"
                                        fullWidth
                                        uiSize="sm"
                                    />
                                    <input
                                        className={s.descInput}
                                        value={groupDesc}
                                        onChange={(e) =>
                                            setGroupDesc(e.target.value)
                                        }
                                        placeholder="Mô tả nhóm (Tùy chọn)"
                                    />
                                </div>
                            </div>

                            {/* Selected Members Tags */}
                            {selectedUsers.length > 0 && (
                                <div className={s.selectedContainer}>
                                    <span className={s.selectedLabel}>
                                        Thành viên:
                                    </span>
                                    {selectedUsers.map((u) => (
                                        <span
                                            key={u.id}
                                            className={s.selectedTag}
                                        >
                                            <img
                                                src={
                                                    u.avatarUrl || DefaultAvatar
                                                }
                                                className={s.tagAvatar}
                                                alt=""
                                            />
                                            {u.lastName}
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

                    {/* SEARCH AREA */}
                    <div className={s.searchSection}>
                        <InputField
                            ref={searchInputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={
                                isGroup
                                    ? 'Tìm người để thêm vào nhóm...'
                                    : 'Tìm người muốn chat...'
                            }
                            fullWidth
                        />

                        <div className={s.resultList}>
                            {isLoading && (
                                <div className={s.loadingText}>
                                    Đang tìm kiếm...
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
                                            onClick={() =>
                                                handleSelectUser(user)
                                            }
                                        >
                                            <div className={s.userItemLeft}>
                                                <img
                                                    src={
                                                        user.avatarUrl ||
                                                        DefaultAvatar
                                                    }
                                                    alt=""
                                                    className={s.avatar}
                                                />
                                                <div className={s.userInfo}>
                                                    <div className={s.userName}>
                                                        {user.firstName}{' '}
                                                        {user.lastName}
                                                    </div>
                                                    <div
                                                        className={s.userEmail}
                                                    >
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>

                                            {isGroup && (
                                                <div
                                                    className={`${s.checkbox} ${isSelected ? s.checked : ''}`}
                                                >
                                                    {isSelected && '✓'}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                            {searchTerm &&
                                searchResults.length === 0 &&
                                !isLoading && (
                                    <div className={s.emptyText}>
                                        Không tìm thấy kết quả nào
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                <div className={s.footer}>
                    <ButtonGhost onClick={onClose} size="sm">
                        Hủy bỏ
                    </ButtonGhost>
                    {isGroup && (
                        <ButtonPrimary
                            onClick={handleSubmitGroup}
                            disabled={
                                !groupName.trim() || selectedUsers.length === 0
                            }
                            size="sm"
                        >
                            Tạo nhóm ({selectedUsers.length})
                        </ButtonPrimary>
                    )}
                </div>
            </div>
        </div>
    )
}
