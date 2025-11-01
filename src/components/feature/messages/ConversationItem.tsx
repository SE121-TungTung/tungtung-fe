import clsx from 'clsx'
import styles from './ConversationItem.module.css'

interface ConversationItemProps {
    name: string
    avatarUrl: string
    lastMessage: string
    timestamp: string
    isActive: boolean
    onClick: () => void
}

export function ConversationItem({
    name,
    avatarUrl,
    lastMessage,
    timestamp,
    isActive,
    onClick,
}: ConversationItemProps) {
    return (
        <div
            className={clsx(styles.item, isActive && styles.active)}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <img src={avatarUrl} alt={name} className={styles.avatar} />
            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.timestamp}>{timestamp}</span>
                </div>
                <p className={styles.lastMessage}>{lastMessage}</p>
            </div>
        </div>
    )
}
