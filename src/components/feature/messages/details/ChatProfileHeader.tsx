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
}

export const ChatProfileHeader: React.FC<ChatProfileHeaderProps> = ({
    isGroup,
    avatarUrl,
    displayName,
    displayStatus,
    participants,
    otherParticipant,
}) => {
    return (
        <div className={s.profileSection}>
            <div className={s.avatarWrapper}>
                {isGroup ? (
                    avatarUrl ? (
                        <UserAvatar
                            userId={displayName}
                            src={avatarUrl}
                            name={displayName}
                            alt={displayName}
                            className={s.avatar}
                            size={72}
                        />
                    ) : participants.length > 0 ? (
                        <GroupAvatar participants={participants} size="lg" />
                    ) : (
                        <UserAvatar
                            userId={displayName}
                            name={displayName}
                            alt={displayName}
                            className={s.avatar}
                            size={72}
                        />
                    )
                ) : (
                    <UserAvatar
                        userId={otherParticipant?.id}
                        src={otherParticipant?.avatarUrl}
                        name={otherParticipant?.fullName || displayName}
                        alt={displayName}
                        className={s.avatar}
                        size={72}
                    />
                )}
            </div>
            <h3 className={s.displayName}>{displayName}</h3>
            <p className={s.displayStatus}>{displayStatus}</p>
        </div>
    )
}
