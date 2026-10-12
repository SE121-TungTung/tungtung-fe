import React from 'react'
import s from '../ChatDetailsPanel.module.css'
import { UserAvatar } from '@/components/common/avatar'
import { GroupAvatar } from '../GroupAvatar'
import type { Participant } from '@/types/message.types'

interface ChatProfileHeaderProps {
    isGroup: boolean
    avatarUrl?: string | null
    displayName: string
    displayStatus: string
    participants: Participant[]
    otherParticipant?: Participant | null
    otherUserId?: string | null
}

export const ChatProfileHeader: React.FC<ChatProfileHeaderProps> = ({
    isGroup,
    avatarUrl,
    displayName,
    displayStatus,
    participants,
    otherParticipant,
    otherUserId,
}) => {
    const targetUserId = isGroup
        ? displayName
        : otherParticipant?.id || otherUserId || undefined

    return (
        <div className={s.profileSection}>
            <div className={s.avatarWrapper}>
                {isGroup ? (
                    avatarUrl ? (
                        <UserAvatar
                            userId={targetUserId}
                            src={avatarUrl}
                            name={displayName}
                            alt={displayName}
                            className={s.avatar}
                            size={96}
                        />
                    ) : participants.length > 0 ? (
                        <GroupAvatar participants={participants} size="lg" />
                    ) : (
                        <UserAvatar
                            userId={targetUserId}
                            name={displayName}
                            alt={displayName}
                            className={s.avatar}
                            size={96}
                        />
                    )
                ) : (
                    <UserAvatar
                        userId={targetUserId}
                        src={otherParticipant?.avatarUrl || avatarUrl}
                        name={displayName}
                        alt={displayName}
                        className={s.avatar}
                        size={96}
                    />
                )}
            </div>
            <h3 className={s.displayName}>{displayName}</h3>
            <p className={s.displayStatus}>{displayStatus}</p>
        </div>
    )
}
