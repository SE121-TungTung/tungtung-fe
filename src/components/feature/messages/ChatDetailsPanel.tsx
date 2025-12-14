import React from 'react'
import s from './ChatDetailsPanel.module.css'
import type { Conversation } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { GroupAvatar } from './GroupAvatar'

import UserIcon from '@/assets/User.svg'
import SearchIcon from '@/assets/Action Eye Tracking.svg'
import AddUserIcon from '@/assets/User Add.svg'
import EditIcon from '@/assets/Edit Pen.svg'
import LeaveIcon from '@/assets/Close X Thin.svg'
import BlockIcon from '@/assets/Block.svg'
import CloseIcon from '@/assets/Close X Thin.svg'

interface ChatDetailsPanelProps {
    conversation: Conversation
    currentUserId: string
    onClose: () => void
}

export const ChatDetailsPanel: React.FC<ChatDetailsPanelProps> = ({
    conversation,
    currentUserId,
    onClose,
}) => {
    const { isGroup, participants } = conversation

    const otherParticipant = !isGroup
        ? participants.find((p) => p.id !== currentUserId)
        : null

    const displayName = conversation.isGroup
        ? conversation.name
        : 'Thông tin hội thoại'
    const displayAvatar = isGroup ? (
        <GroupAvatar participants={participants} size="lg" />
    ) : (
        <img
            src={otherParticipant?.avatarUrl || AvatarImg}
            alt={displayName}
            className={s.avatar}
        />
    )
    const displayStatus = isGroup
        ? `${participants.length} thành viên`
        : otherParticipant?.isOnline
          ? 'Online'
          : 'Offline'

    return (
        <div className={s.panel}>
            <header className={s.header}>
                <h4 className={s.title}>Chi tiết</h4>
                <ButtonGhost size="sm" mode="light" onClick={onClose}>
                    <img src={CloseIcon} alt="Đóng" />
                </ButtonGhost>
            </header>

            <div className={s.profileSection}>
                <div className={s.avatarWrapper}>{displayAvatar}</div>
                <h3 className={s.displayName}>{displayName}</h3>
                <p className={s.displayStatus}>{displayStatus}</p>
            </div>

            <ul className={s.menuList}>
                <div className={s.memberList}>
                    <h3>Thành viên ({conversation.participants.length})</h3>
                    {conversation.participants.map((p) => (
                        <div key={p.id} className={s.memberItem}>
                            <img
                                src={p.avatarUrl || '/default-avatar.png'}
                                className={s.avatar}
                            />
                            <div>
                                <div className={s.memberName}>
                                    {p.firstName} {p.lastName}
                                </div>
                                <div className={s.memberStatus}>
                                    {p.isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {isGroup ? (
                    <>
                        <li
                            className={s.menuItem}
                            onClick={() => alert('Thêm...')}
                        >
                            <img src={AddUserIcon} alt="Add" />
                            Thêm thành viên
                        </li>
                        <li
                            className={s.menuItem}
                            onClick={() => alert('Đổi tên...')}
                        >
                            <img src={EditIcon} alt="Edit" />
                            Đổi tên nhóm
                        </li>
                        <li
                            className={s.menuItem}
                            onClick={() => alert('Tìm kiếm...')}
                        >
                            <img src={SearchIcon} alt="Search" />
                            Tìm kiếm tin nhắn
                        </li>
                        <li className={s.divider} />
                        <li
                            className={`${s.menuItem} ${s.danger}`}
                            onClick={() => alert('Rời nhóm...')}
                        >
                            <img src={LeaveIcon} alt="Leave" />
                            Rời khỏi nhóm
                        </li>
                    </>
                ) : (
                    <>
                        <li
                            className={s.menuItem}
                            onClick={() => alert('Xem hồ sơ...')}
                        >
                            <img src={UserIcon} alt="Profile" />
                            Xem hồ sơ
                        </li>
                        <li
                            className={s.menuItem}
                            onClick={() => alert('Tìm kiếm...')}
                        >
                            <img src={SearchIcon} alt="Search" />
                            Tìm kiếm tin nhắn
                        </li>
                        <li className={s.divider} />
                        <li
                            className={`${s.menuItem} ${s.danger}`}
                            onClick={() => alert('Chặn...')}
                        >
                            <img src={BlockIcon} alt="Block" />
                            Chặn người này
                        </li>
                    </>
                )}
            </ul>
        </div>
    )
}
