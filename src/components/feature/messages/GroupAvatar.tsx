import React from 'react'
import s from './GroupAvatar.module.css'
import type { Participant } from '@/types/message.types'
import AvatarImg from '@/assets/avatar-placeholder.png'

interface GroupAvatarProps {
    participants: Participant[]
    size?: 'sm' | 'md' | 'lg'
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
    participants,
    size = 'md',
}) => {
    const avatarsToShow = participants.slice(0, 3)
    const remainingCount = participants.length - avatarsToShow.length

    return (
        <div className={`${s.stack} ${s[size]}`}>
            {avatarsToShow.map((p, index) => (
                <img
                    key={p.id}
                    className={`${s.avatar} ${s['avatar' + (index + 1)]}`}
                    src={p.avatarUrl || AvatarImg}
                    alt={p.name}
                />
            ))}
            {remainingCount > 0 && (
                <div className={s.plusCount}>+{remainingCount}</div>
            )}
        </div>
    )
}
