import React from 'react'
import s from '../ChatDetailsPanel.module.css'
import AvatarImg from '@/assets/avatar-placeholder.png'
import type { Participant } from '@/types/message.types'

interface ChatMemberListProps {
    participants: Participant[]
    currentUserId: string
    isLoading: boolean
}

export const ChatMemberList: React.FC<ChatMemberListProps> = ({
    participants,
    currentUserId,
    isLoading,
}) => {
    return (
        <div className={s.section}>
            <h5 className={s.sectionTitle}>
                Thành viên ({participants.length})
            </h5>
            {isLoading ? (
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
                        <div key={p.id} className={s.memberItem}>
                            <img
                                src={p.avatarUrl || AvatarImg}
                                className={s.memberAvatar}
                                alt=""
                            />
                            <div className={s.memberInfo}>
                                <div className={s.memberName}>
                                    {p.firstName} {p.lastName}
                                    {p.id === currentUserId && (
                                        <span
                                            style={{
                                                color: '#888',
                                                fontWeight: 'normal',
                                                marginLeft: 4,
                                            }}
                                        >
                                            (Bạn)
                                        </span>
                                    )}
                                </div>
                                <div className={s.memberStatus}>
                                    {p.role === 'admin' ? (
                                        <span
                                            style={{
                                                color: 'var(--color-text-on-primary)',
                                                fontWeight: 700,
                                                fontSize: 11,
                                                backgroundColor:
                                                    'var(--color-brand-primary)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                marginTop: '2px',
                                            }}
                                        >
                                            Quản trị viên
                                        </span>
                                    ) : p.isOnline ? (
                                        <span style={{ color: '#10b981' }}>
                                            Đang hoạt động
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
    )
}
