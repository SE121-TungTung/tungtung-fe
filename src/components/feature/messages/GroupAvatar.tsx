import React from 'react'
import s from './GroupAvatar.module.css'
import type { Participant } from '@/types/message.types'
import { UserAvatar } from '@/components/common/avatar'

interface GroupAvatarProps {
    participants: Participant[]
    size?: 'sm' | 'md' | 'lg'
}

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
    participants,
    size = 'md',
}) => {
    // Only show first 3 avatars
    const avatarsToShow = participants.slice(0, 3)
    const remainingCount = participants.length - 3

    // If only 1 participant, show single large avatar
    if (avatarsToShow.length === 1) {
        return (
            <div className={`${s.stack} ${s[size]}`}>
                <UserAvatar
                    userId={avatarsToShow[0].id}
                    src={avatarsToShow[0].avatarUrl}
                    name={avatarsToShow[0].fullName}
                    alt={avatarsToShow[0].fullName}
                    className={s.avatar}
                />
            </div>
        )
    }

    // If 2 participants, show 2 avatars
    if (avatarsToShow.length === 2) {
        return (
            <div className={`${s.stack} ${s[size]}`}>
                <UserAvatar
                    userId={avatarsToShow[0].id}
                    src={avatarsToShow[0].avatarUrl}
                    name={avatarsToShow[0].fullName}
                    alt={avatarsToShow[0].fullName}
                    className={`${s.avatar} ${s.avatar1}`}
                />
                <UserAvatar
                    userId={avatarsToShow[1].id}
                    src={avatarsToShow[1].avatarUrl}
                    name={avatarsToShow[1].fullName}
                    alt={avatarsToShow[1].fullName}
                    className={`${s.avatar} ${s.avatar2}`}
                />
            </div>
        )
    }

    // 3+ participants: show 3 avatars + count if needed
    return (
        <div className={`${s.stack} ${s[size]}`}>
            <UserAvatar
                userId={avatarsToShow[0]?.id}
                src={avatarsToShow[0]?.avatarUrl}
                name={avatarsToShow[0]?.fullName || 'User'}
                alt={avatarsToShow[0]?.fullName || 'User'}
                className={`${s.avatar} ${s.avatar1}`}
            />
            <UserAvatar
                userId={avatarsToShow[1]?.id}
                src={avatarsToShow[1]?.avatarUrl}
                name={avatarsToShow[1]?.fullName || 'User'}
                alt={avatarsToShow[1]?.fullName || 'User'}
                className={`${s.avatar} ${s.avatar2}`}
            />
            <UserAvatar
                userId={avatarsToShow[2]?.id}
                src={avatarsToShow[2]?.avatarUrl}
                name={avatarsToShow[2]?.fullName || 'User'}
                alt={avatarsToShow[2]?.fullName || 'User'}
                className={`${s.avatar} ${s.avatar3}`}
            />
            {remainingCount > 0 && (
                <div className={s.plusCount}>+{remainingCount}</div>
            )}
        </div>
    )
}
