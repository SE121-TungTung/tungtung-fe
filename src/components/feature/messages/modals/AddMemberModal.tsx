import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listUsers } from '@/lib/users'
import { Modal } from '@/components/core/Modal'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'
import AvatarImg from '@/assets/avatar-placeholder.png'
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import s from '../ChatDetailsPanel.module.css'

export interface UserResult {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string
}

interface AddMemberModalProps {
    isOpen: boolean
    existingParticipantIds: string[]
    onClose: () => void
    onSubmit: (userIds: string[]) => void
    isSubmitting: boolean
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
    isOpen,
    existingParticipantIds,
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<UserResult[]>([])

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('')
            setSelectedUsers([])
        }
    }, [isOpen])

    const { data: searchResults = [], isLoading: isSearching } = useQuery({
        queryKey: ['users', 'search', searchTerm],
        queryFn: async () => {
            if (!searchTerm.trim()) return []
            const users = await listUsers({
                search: searchTerm,
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
        enabled: isOpen && searchTerm.length > 1,
        staleTime: 5000,
    })

    const filteredSearchResults = searchResults.filter(
        (user) => !existingParticipantIds.includes(user.id)
    )

    const toggleSelectUser = (user: UserResult) => {
        const isSelected = selectedUsers.some((u) => u.id === user.id)
        if (isSelected) {
            setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id))
        } else {
            setSelectedUsers((prev) => [...prev, user])
        }
    }

    const handleSubmit = () => {
        if (selectedUsers.length > 0) {
            onSubmit(selectedUsers.map((u) => u.id))
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Thêm thành viên"
            footer={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                    }}
                >
                    <ButtonGhost onClick={onClose}>Hủy</ButtonGhost>
                    <ButtonPrimary
                        onClick={handleSubmit}
                        disabled={selectedUsers.length === 0 || isSubmitting}
                    >
                        {isSubmitting
                            ? 'Đang thêm...'
                            : `Thêm (${selectedUsers.length})`}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                {selectedUsers.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                        }}
                    >
                        {selectedUsers.map((u) => (
                            <span
                                key={u.id}
                                style={{
                                    background: '#eef2ff',
                                    color: 'var(--color-brand-primary)',
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
                            const isSelected = selectedUsers.some(
                                (u) => u.id === user.id
                            )
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => toggleSelectUser(user)}
                                    className={s.memberItem}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: isSelected
                                            ? '#eff6ff'
                                            : undefined,
                                        border: isSelected
                                            ? '1px solid var(--color-brand-primary)'
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
                    ) : searchTerm.length > 1 ? (
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
    )
}
