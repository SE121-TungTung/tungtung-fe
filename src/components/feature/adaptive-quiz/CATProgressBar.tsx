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
    const answeredCount = Math.max(0, currentPosition - 1)
    const itemPercent = Math.min(
        100,
        Math.round((currentPosition / maxItems) * 100)
    )

    // Standard error convergence: SE goes from 1.0 down towards targetSE (0.3)
    // Also factor in answered items so legacy unregularized SE or flat 3PL tails
    // still show monotonic progress after each answered question.
    const rawSePercent = Math.round(
        ((1.0 - seCurrent) / (1.0 - targetSE)) * 100
    )
    const itemBasedFloor =
        answeredCount > 0
            ? Math.min(95, Math.round((answeredCount / maxItems) * 85) + 8)
            : 0

    const isConverged = answeredCount > 0 && seCurrent <= targetSE
    const seConvergence = isConverged
        ? 100
        : answeredCount === 0
          ? 0
          : Math.min(99, Math.max(itemBasedFloor, rawSePercent))

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
                            Đã xác định rõ trình độ (Độ tin cậy đạt chuẩn)
                        </>
                    ) : answeredCount === 0 ? (
                        <>Đang khởi tạo đánh giá năng lực</>
                    ) : (
                        <>
                            Đang phân tích trình độ (Độ tin cậy: {seConvergence}
                            %)
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
                    <span>Tiến độ câu hỏi ({itemPercent}%)</span>
                    <span>
                        {answeredCount === 0
                            ? 'Bắt đầu phân tích sau câu 1'
                            : `Độ tin cậy kết quả: ${seConvergence}%`}
                    </span>
                </div>
            </div>
        </div>
    )
}
