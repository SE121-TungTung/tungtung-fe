import React from 'react'
import s from './NotificationItem.module.css'
import type { NotificationUI } from '@/types/notification.types'

import SystemIcon from '@/assets/Information.svg'
import PromotionIcon from '@/assets/Action Favourite.svg'

interface NotificationItemProps {
    notification: NotificationUI
    onClick: () => void
    onMarkAsRead?: (e: React.MouseEvent) => void
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
    onMarkAsRead,
}) => {
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
            {!isRead &&
                (onMarkAsRead ? (
                    <button
                        type="button"
                        className={s.markReadAction}
                        onClick={onMarkAsRead}
                        title="Đánh dấu đã đọc"
                        aria-label="Đánh dấu đã đọc"
                    >
                        <span className={s.unreadDot} />
                    </button>
                ) : (
                    <span className={s.unreadDot} title="Chưa đọc" />
                ))}
        </li>
    )
}
