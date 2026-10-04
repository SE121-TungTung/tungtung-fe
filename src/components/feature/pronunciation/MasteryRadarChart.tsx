import React, { useMemo } from 'react'
import s from './MasteryRadarChart.module.css'

interface CategoryData {
    avg_mastery: number
    practiced_count: number
    total_phonemes: number
}

interface MasteryRadarChartProps {
    categories: Record<string, CategoryData>
}

const CHART_SIZE = 280
const CENTER = CHART_SIZE / 2
const RADIUS = 110
const LEVELS = 5 // 0%, 25%, 50%, 75%, 100%

/**
 * Pure SVG Radar Chart — hiển thị mastery trung bình theo 8 nhóm âm.
 * Không cần thư viện bên ngoài (recharts/d3).
 */
export const MasteryRadarChart: React.FC<MasteryRadarChartProps> = ({
    categories,
}) => {
    const labels = Object.keys(categories)
    const n = labels.length

    const points = useMemo(() => {
        return labels.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2
            return {
                x: CENTER + RADIUS * Math.cos(angle),
                y: CENTER + RADIUS * Math.sin(angle),
                angle,
            }
        })
    }, [n, labels])

    // Data polygon
    const dataPoints = useMemo(() => {
        return labels.map((label, i) => {
            const val = (categories[label]?.avg_mastery ?? 0) / 100
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2
            const r = RADIUS * val
            return {
                x: CENTER + r * Math.cos(angle),
                y: CENTER + r * Math.sin(angle),
            }
        })
    }, [labels, categories, n])

    const dataPath =
        dataPoints
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ') + ' Z'

    // Grid levels
    const gridLevels = Array.from(
        { length: LEVELS },
        (_, i) => (i + 1) / LEVELS
    )

    // Short label names
    const shortLabels: Record<string, string> = {
        Stops: 'Stops',
        Fricatives: 'Fric.',
        Affricates: 'Affr.',
        Nasals: 'Nasal',
        Approximants: 'Approx.',
        'Short Vowels': 'Short V',
        'Long Vowels': 'Long V',
        Diphthongs: 'Diph.',
    }

    return (
        <div className={s.wrapper}>
            <svg viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`} className={s.svg}>
                {/* Grid circles */}
                {gridLevels.map((level) => (
                    <polygon
                        key={level}
                        points={points
                            .map((p) => {
                                const r = RADIUS * level
                                const x = CENTER + r * Math.cos(p.angle)
                                const y = CENTER + r * Math.sin(p.angle)
                                return `${x},${y}`
                            })
                            .join(' ')}
                        fill="none"
                        stroke="var(--color-border-soft, rgba(148,163,184,0.18))"
                        strokeWidth={1}
                    />
                ))}

                {/* Axis lines */}
                {points.map((p, i) => (
                    <line
                        key={i}
                        x1={CENTER}
                        y1={CENTER}
                        x2={p.x}
                        y2={p.y}
                        stroke="var(--color-border-soft, rgba(148,163,184,0.15))"
                        strokeWidth={1}
                    />
                ))}

                {/* Data polygon */}
                <path
                    d={dataPath}
                    fill="rgba(23, 86, 118, 0.2)"
                    stroke="var(--color-brand-primary, #175676)"
                    strokeWidth={2}
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {dataPoints.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={3.5}
                        fill="var(--color-brand-primary, #175676)"
                        stroke="var(--color-surface-card, #ffffff)"
                        strokeWidth={1.5}
                    />
                ))}

                {/* Labels */}
                {points.map((p, i) => {
                    const label = shortLabels[labels[i]] || labels[i]
                    const labelR = RADIUS + 22
                    const lx = CENTER + labelR * Math.cos(p.angle)
                    const ly = CENTER + labelR * Math.sin(p.angle)
                    return (
                        <text
                            key={i}
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={s.label}
                        >
                            {label}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}
