import React from 'react'
import styles from './StatusBadge.module.css'

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'neutral'

interface StatusBadgeProps {
    variant: StatusBadgeVariant
    label: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label }) => {
    const validVariant = styles[variant] ? variant : 'neutral'
    const className = `${styles.badge} ${styles[validVariant]}`

    return <span className={className}>{label}</span>
}
