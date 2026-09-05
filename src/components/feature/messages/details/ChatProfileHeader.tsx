import React from 'react'
import s from '../ChatDetailsPanel.module.css'
import AvatarImg from '@/assets/avatar-placeholder.png'
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
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className={s.avatar}
                        />
                    ) : participants.length > 0 ? (
                        <GroupAvatar participants={participants} size="lg" />
                    ) : (
                        <img
                            src={AvatarImg}
                            alt={displayName}
                            className={s.avatar}
                        />
                    )
                ) : (
                    <img
                        src={otherParticipant?.avatarUrl || AvatarImg}
                        alt={displayName}
                        className={s.avatar}
                    />
                )}
            </div>
            <h3 className={s.displayName}>{displayName}</h3>
            <p className={s.displayStatus}>{displayStatus}</p>
        </div>
    )
}
