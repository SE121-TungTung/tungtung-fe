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
    title = 'Năng Lực Hiện Tại',
    showDetails = true,
}) => {
    // Clamp theta to [-3.0, 3.0] for gauge angle calculation
    const clampedTheta = Math.max(-3.0, Math.min(3.0, theta))
    // Normalize to [0, 1] range: -3 -> 0, 0 -> 0.5, 3 -> 1.0
    const normalized = (clampedTheta + 3.0) / 6.0
    // Angle in degrees from -90deg (left) to +90deg (right)
    const angle = Number((normalized * 180 - 90).toFixed(2))

    // Arc radius and circumference for a half-circle (pi * r)
    const r = 84
    const arcLength = Math.PI * r // ~263.89
    const strokeDashoffset = arcLength * (1 - normalized)

    // Clamp displayed SE so legacy unregularized values stay readable
    const displaySE = Math.min(1.5, Math.max(0.05, se))
    const lowerTheta = Math.max(-3.0, theta - displaySE).toFixed(2)
    const upperTheta = Math.min(3.0, theta + displaySE).toFixed(2)

    // Compute band fallback if not provided
    const displayBand =
        estimatedBand !== undefined && estimatedBand !== null
            ? estimatedBand.toFixed(1)
            : thetaToBandFallback(theta).toFixed(1)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.title}>
                    <ActivityIcon size={15} />
                    {title}
                </span>
                <span className={styles.badge}>
                    <AwardIcon size={13} />
                    Band {displayBand}
                </span>
            </div>

            <div className={styles.gaugeWrapper}>
                <svg
                    className={styles.gaugeSvg}
                    viewBox="0 0 220 122"
                    aria-hidden="true"
                >
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

                    {/* Scale labels */}
                    <text
                        x="22"
                        y="118"
                        textAnchor=" middle"
                        className={styles.scaleLabel}
                    >
                        -3.0
                    </text>
                    <text
                        x="110"
                        y="11"
                        textAnchor="middle"
                        className={styles.scaleLabel}
                    >
                        0.0
                    </text>
                    <text
                        x="198"
                        y="118"
                        textAnchor="middle"
                        className={styles.scaleLabel}
                    >
                        +3.0
                    </text>

                    {/* Background Arc (center 110, 102, radius 84) */}
                    <path
                        d="M 26 102 A 84 84 0 0 1 194 102"
                        className={styles.arcBg}
                    />

                    {/* Filled Value Arc */}
                    <path
                        d="M 26 102 A 84 84 0 0 1 194 102"
                        className={styles.arcFill}
                        style={{
                            strokeDasharray: arcLength,
                            strokeDashoffset: strokeDashoffset,
                        }}
                    />

                    {/* Needle pointer using explicit SVG rotate(angle, cx, cy) */}
                    <g
                        className={styles.needle}
                        transform={`rotate(${angle}, 110, 102)`}
                    >
                        <line
                            x1="110"
                            y1="102"
                            x2="110"
                            y2="28"
                            stroke="var(--color-text-primary, #0f172a)"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Pivot center ring & dot */}
                    <circle
                        cx="110"
                        cy="102"
                        r="7"
                        fill="var(--color-surface-card, #ffffff)"
                        stroke="var(--color-text-primary, #0f172a)"
                        strokeWidth="3"
                    />
                </svg>

                <div className={styles.centerValue}>
                    <span className={styles.thetaVal}>
                        {theta >= 0 ? `+${theta.toFixed(2)}` : theta.toFixed(2)}
                    </span>
                    <span className={styles.thetaLabel}>Điểm năng lực</span>
                </div>
            </div>

            {showDetails && (
                <div className={styles.statsFooter}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Độ dao động</span>
                        <span className={styles.statValue}>
                            &plusmn;{displaySE.toFixed(2)}
                        </span>
                        {displaySE <= 0.3 ? (
                            <span
                                className={styles.confidenceRange}
                                style={{
                                    color: '#059669',
                                    background: 'rgba(5, 150, 105, 0.1)',
                                }}
                            >
                                Độ tin cậy cao
                            </span>
                        ) : (
                            <span className={styles.confidenceRange}>
                                Đang phân tích
                            </span>
                        )}
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>
                            Khoảng ước tính
                        </span>
                        <span className={styles.statValue}>
                            [{lowerTheta}, {upperTheta}]
                        </span>
                        <span className={styles.confidenceRange}>
                            Thang [-3, +3]
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
