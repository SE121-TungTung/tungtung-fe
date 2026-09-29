import styles from './StreakBadge.module.css'

interface StreakBadgeProps {
    streakDays: number
}

export function StreakBadge({ streakDays }: StreakBadgeProps) {
    const isHot = streakDays >= 7

    return (
        <div className={`${styles.badge} ${isHot ? styles.hot : ''}`}>
            <div className={styles.iconWrapper}>
                {isHot ? (
                    <div className={styles.fireAnimation}>🔥</div>
                ) : (
                    <span className={styles.normalIcon}>⚡</span>
                )}
            </div>
            <div className={styles.content}>
                <span className={styles.value}>{streakDays}</span>
                <span className={styles.label}>ngày liên tiếp</span>
            </div>
        </div>
    )
}
