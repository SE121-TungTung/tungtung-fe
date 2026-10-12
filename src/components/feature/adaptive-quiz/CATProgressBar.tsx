import React from 'react'
import { TargetIcon, CheckCircleIcon } from './AdaptiveIcons'
import styles from './CATProgressBar.module.css'

interface CATProgressBarProps {
    currentPosition: number
    maxItems: number
    seCurrent: number
    targetSE?: number
}

export const CATProgressBar: React.FC<CATProgressBarProps> = ({
    currentPosition,
    maxItems,
    seCurrent,
    targetSE = 0.3,
}) => {
    const itemPercent = Math.min(
        100,
        Math.round((currentPosition / maxItems) * 100)
    )
    // Standard error convergence: SE goes from 1.0 (or higher) down towards targetSE
    // When SE <= targetSE, convergence = 100%
    const seConvergence = Math.min(
        100,
        Math.max(0, Math.round(((1.0 - seCurrent) / (1.0 - targetSE)) * 100))
    )
    const isConverged = seCurrent <= targetSE

    return (
        <div className={styles.container}>
            <div className={styles.topRow}>
                <div className={styles.itemTracker}>
                    <TargetIcon size={18} className={styles.itemIcon} />
                    <span>
                        Câu {currentPosition} / {maxItems} câu tối đa
                    </span>
                </div>

                <div
                    className={`${styles.precisionBadge} ${
                        isConverged ? styles.precisionBadgeConverged : ''
                    }`}
                >
                    {isConverged ? (
                        <>
                            <CheckCircleIcon size={14} />
                            Đã đạt độ hội tụ (SE = {seCurrent.toFixed(3)})
                        </>
                    ) : (
                        <>
                            Đang đo đạc (SE: {seCurrent.toFixed(3)} → mục tiêu ≤{' '}
                            {targetSE.toFixed(2)})
                        </>
                    )}
                </div>
            </div>

            <div className={styles.barWrapper}>
                <div className={styles.track}>
                    <div
                        className={styles.fill}
                        style={{ width: `${itemPercent}%` }}
                    />
                </div>
                <div className={styles.labels}>
                    <span>Tiến độ bài thi ({itemPercent}%)</span>
                    <span>Độ chính xác đo lường: {seConvergence}%</span>
                </div>
            </div>
        </div>
    )
}
