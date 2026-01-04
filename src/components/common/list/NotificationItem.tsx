import React from 'react'
import s from './NotificationItem.module.css'
import type { NotificationUI } from '@/types/notification.types'

import SystemIcon from '@/assets/Information.svg'
import PromotionIcon from '@/assets/Action Favourite.svg'

interface NotificationItemProps {
    notification: NotificationUI
    onClick: () => void
}

const getIcon = (notificationType: string) => {
    if (notificationType === 'promotion') {
        return <img src={PromotionIcon} alt="Promotion" />
    }
    return <img src={SystemIcon} alt="System" />
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onClick,
}) => {
    // ✅ Updated: Use correct field names from NotificationUI
    const { notification_type, title, content, timestamp, isRead } =
        notification
    const icon = getIcon(notification_type)

    return (
        <li
            className={`${s.item} ${isRead ? s.read : s.unread}`}
            onClick={onClick}
        >
            <div className={s.iconWrapper}>{icon}</div>
            <div className={s.contentWrapper}>
                <h4 className={s.title}>{title}</h4>
                <p className={s.content}>{content}</p>
                <span className={s.timestamp}>{timestamp}</span>
            </div>
            {!isRead && <span className={s.unreadDot} title="Chưa đọc"></span>}
        </li>
    )
}
