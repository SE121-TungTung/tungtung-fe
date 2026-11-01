import React from 'react'
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
} from 'recharts'
import styles from './AbilityHistoryChart.module.css'

export interface AbilityHistoryPoint {
    itemIndex: number
    itemLabel: string
    theta: number
    se: number
    thetaUpper: number
    thetaLower: number
    thetaBand: [number, number]
    isCorrect?: boolean
}

export interface AbilityHistoryChartProps {
    history: {
        item_sequence: number
        theta_after: number
        se_after: number
        is_correct?: boolean
    }[]
}

export const AbilityHistoryChart: React.FC<AbilityHistoryChartProps> = ({
    history,
}) => {
    const data: AbilityHistoryPoint[] = history.map((h) => {
        const clampedTheta = Math.max(-3.0, Math.min(3.0, h.theta_after))
        // Cap displayed SE at 1.2 so legacy unregularized points don't blow up the chart
        const displaySE = Math.min(1.2, Math.max(0.05, h.se_after))
        const lower = Number(
            Math.max(-3.4, clampedTheta - displaySE).toFixed(2)
        )
        const upper = Number(Math.min(3.4, clampedTheta + displaySE).toFixed(2))
        return {
            itemIndex: h.item_sequence,
            itemLabel: `Câu ${h.item_sequence}`,
            theta: Number(clampedTheta.toFixed(2)),
            se: Number(displaySE.toFixed(2)),
            thetaUpper: upper,
            thetaLower: lower,
            thetaBand: [lower, upper],
            isCorrect: h.is_correct,
        }
    })

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    Biểu Đồ Thay Đổi Mức Năng Lực Qua Từng Câu Hỏi
                </h3>
                <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                        <div
                            className={styles.legendIndicator}
                            style={{
                                background:
                                    'var(--color-brand-primary, #2484b5)',
                            }}
                        />
                        <span>Điểm năng lực ước tính</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div
                            className={styles.legendIndicator}
                            style={{
                                background: 'rgba(36, 132, 181, 0.18)',
                                border: '1px dashed rgba(36, 132, 181, 0.45)',
                            }}
                        />
                        <span>Khoảng dao động ước tính</span>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 12, right: 20, left: 4, bottom: 8 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="var(--color-border-soft, #e2e8f0)"
                        />
                        <XAxis
                            dataKey="itemLabel"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                            tick={{
                                fontSize: 12,
                                fill: 'var(--color-text-secondary, #64748b)',
                            }}
                        />
                        <YAxis
                            domain={[-3.5, 3.5]}
                            ticks={[-3, -1.5, 0, 1.5, 3]}
                            allowDataOverflow={true}
                            axisLine={false}
                            tickLine={false}
                            width={44}
                            tickFormatter={(val: number) =>
                                val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)
                            }
                            tick={{
                                fontSize: 12,
                                fill: 'var(--color-text-secondary, #64748b)',
                            }}
                        />
                        <ReferenceLine
                            y={0}
                            stroke="var(--color-border-medium, #cbd5e1)"
                            strokeDasharray="4 4"
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const point = payload[0]
                                        .payload as AbilityHistoryPoint
                                    return (
                                        <div
                                            style={{
                                                background:
                                                    'var(--color-surface-card, #ffffff)',
                                                border: '1px solid var(--color-border-soft, #e2e8f0)',
                                                borderRadius: 10,
                                                padding: '0.75rem 0.875rem',
                                                boxShadow:
                                                    '0 10px 15px -3px rgba(0,0,0,0.08)',
                                                fontSize: 12,
                                            }}
                                        >
                                            <p
                                                style={{
                                                    margin: '0 0 6px 0',
                                                    fontWeight: 700,
                                                    color: 'var(--color-text-primary, #0f172a)',
                                                }}
                                            >
                                                Câu hỏi #{point.itemIndex}
                                                {point.isCorrect !==
                                                    undefined && (
                                                    <span
                                                        style={{
                                                            marginLeft: 8,
                                                            color: point.isCorrect
                                                                ? 'var(--color-success, #16a34a)'
                                                                : 'var(--color-brand-secondary, #dc2626)',
                                                        }}
                                                    >
                                                        (
                                                        {point.isCorrect
                                                            ? 'Đúng'
                                                            : 'Sai'}
                                                        )
                                                    </span>
                                                )}
                                            </p>
                                            <p
                                                style={{
                                                    margin: '0 0 3px 0',
                                                    color: 'var(--color-brand-primary, #2484b5)',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                Điểm năng lực:{' '}
                                                <strong>
                                                    {point.theta >= 0
                                                        ? `+${point.theta.toFixed(2)}`
                                                        : point.theta.toFixed(
                                                              2
                                                          )}
                                                </strong>
                                            </p>
                                            <p
                                                style={{
                                                    margin: '0 0 3px 0',
                                                    color: 'var(--color-text-secondary, #64748b)',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                Độ dao động:{' '}
                                                <strong>
                                                    &plusmn;
                                                    {point.se.toFixed(2)}
                                                </strong>
                                            </p>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: 'var(--color-text-tertiary, #94a3b8)',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                Khoảng ước tính: [
                                                {point.thetaLower.toFixed(2)},{' '}
                                                {point.thetaUpper.toFixed(2)}]
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        {/* Range Area Confidence Interval [thetaLower, thetaUpper] */}
                        <Area
                            type="monotone"
                            dataKey="thetaBand"
                            stroke="rgba(36, 132, 181, 0.3)"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            fill="var(--color-brand-primary, #2484b5)"
                            fillOpacity={0.14}
                            isAnimationActive={false}
                        />
                        {/* Ability Line */}
                        <Line
                            type="monotone"
                            dataKey="theta"
                            stroke="var(--color-brand-primary, #2484b5)"
                            strokeWidth={2.5}
                            dot={{
                                r: 4,
                                fill: 'var(--color-brand-primary, #2484b5)',
                                strokeWidth: 2,
                                stroke: '#ffffff',
                            }}
                            activeDot={{ r: 6 }}
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
