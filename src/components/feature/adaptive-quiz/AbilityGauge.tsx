import React from 'react'
import { ActivityIcon, AwardIcon } from './AdaptiveIcons'
import styles from './AbilityGauge.module.css'

interface AbilityGaugeProps {
    theta: number
    se: number
    estimatedBand?: number | null
    title?: string
    showDetails?: boolean
}

export const AbilityGauge: React.FC<AbilityGaugeProps> = ({
    theta,
    se,
    estimatedBand,
    title = 'Năng Lực Thích Ứng (IRT Theta)',
    showDetails = true,
}) => {
    // Clamp theta to [-3.0, 3.0] for gauge angle calculation
    const clampedTheta = Math.max(-3.0, Math.min(3.0, theta))
    // Normalize to [0, 1] range: -3 -> 0, 0 -> 0.5, 3 -> 1.0
    const normalized = (clampedTheta + 3.0) / 6.0
    // Angle in degrees from -90deg (left) to +90deg (right)
    const angle = normalized * 180 - 90

    // Arc radius and circumference for a half-circle (pi * r)
    const r = 90
    const arcLength = Math.PI * r // ~282.74
    const strokeDashoffset = arcLength * (1 - normalized)

    // Calculate confidence band [theta - SE, theta + SE]
    const lowerTheta = (theta - se).toFixed(2)
    const upperTheta = (theta + se).toFixed(2)

    // Compute band fallback if not provided
    const displayBand =
        estimatedBand !== undefined && estimatedBand !== null
            ? estimatedBand.toFixed(1)
            : thetaToBandFallback(theta).toFixed(1)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>
                    <ActivityIcon size={16} />
                    {title}
                </span>
                <span className={styles.badge}>
                    <AwardIcon size={14} />
                    IELTS Band {displayBand}
                </span>
            </div>

            <div className={styles.gaugeWrapper}>
                <svg className={styles.gaugeSvg} viewBox="0 0 220 120">
                    <defs>
                        <linearGradient
                            id="gaugeGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="50%" stopColor="#0d9488" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>

                    {/* Background Arc */}
                    <path
                        d="M 20 110 A 90 90 0 0 1 200 110"
                        className={styles.arcBg}
                    />

                    {/* Filled Value Arc */}
                    <path
                        d="M 20 110 A 90 90 0 0 1 200 110"
                        className={styles.arcFill}
                        style={{
                            strokeDasharray: arcLength,
                            strokeDashoffset: strokeDashoffset,
                        }}
                    />

                    {/* Pivot center dot */}
                    <circle cx="110" cy="110" r="6" fill="#0f172a" />

                    {/* Needle pointer */}
                    <g
                        className={styles.needle}
                        style={{
                            transform: `rotate(${angle}deg)`,
                        }}
                    >
                        <line
                            x1="110"
                            y1="110"
                            x2="110"
                            y2="30"
                            stroke="#0f172a"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </g>
                </svg>

                <div className={styles.centerValue}>
                    <span className={styles.thetaVal}>
                        {theta >= 0 ? `+${theta.toFixed(2)}` : theta.toFixed(2)}
                    </span>
                    <span className={styles.thetaLabel}>Theta (θ)</span>
                </div>
            </div>

            {showDetails && (
                <div className={styles.statsFooter}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                            Sai số chuẩn (SE)
                        </span>
                        <span className={styles.statValue}>
                            ±{se.toFixed(3)}
                        </span>
                        {se <= 0.3 ? (
                            <span
                                className={styles.confidenceRange}
                                style={{
                                    color: '#059669',
                                    background: 'rgba(5, 150, 105, 0.1)',
                                }}
                            >
                                Độ tin cậy cao (SE ≤ 0.3)
                            </span>
                        ) : (
                            <span className={styles.confidenceRange}>
                                Đang hội tụ
                            </span>
                        )}
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                            Khoảng năng lực 68%
                        </span>
                        <span className={styles.statValue}>
                            [{lowerTheta}, {upperTheta}]
                        </span>
                        <span className={styles.confidenceRange}>
                            Logit scale [-3, +3]
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

function thetaToBandFallback(theta: number): number {
    if (theta < -2.5) return 3.5
    if (theta < -1.5) return 4.5
    if (theta < -0.5) return 5.5
    if (theta < 0.5) return 6.5
    if (theta < 1.5) return 7.5
    if (theta < 2.5) return 8.5
    return 9.0
}
