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
} from 'recharts'
import styles from './AbilityHistoryChart.module.css'

export interface AbilityHistoryPoint {
    itemIndex: number
    theta: number
    se: number
    thetaUpper: number
    thetaLower: number
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
    const data: AbilityHistoryPoint[] = history.map((h) => ({
        itemIndex: h.item_sequence,
        theta: Number(h.theta_after.toFixed(2)),
        se: Number(h.se_after.toFixed(2)),
        thetaUpper: Number((h.theta_after + h.se_after).toFixed(2)),
        thetaLower: Number((h.theta_after - h.se_after).toFixed(2)),
        isCorrect: h.is_correct,
    }))

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>
                    Tiến Trình Hội Tụ Năng Lực (&theta;) & Sai Số (SE)
                </h3>
                <div className={styles.chartLegend}>
                    <div className={styles.legendItem}>
                        <div
                            className={styles.legendIndicator}
                            style={{ background: '#2563eb' }}
                        />
                        <span>Năng lực ước lượng (&theta;)</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div
                            className={styles.legendIndicator}
                            style={{ background: 'rgba(59, 130, 246, 0.15)' }}
                        />
                        <span>Khoảng tin cậy (&plusmn;1 SE)</span>
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="itemIndex"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            label={{
                                value: 'Thứ tự câu hỏi',
                                position: 'insideBottom',
                                offset: -4,
                                fontSize: 12,
                                fill: '#94a3b8',
                            }}
                        />
                        <YAxis
                            domain={[-4, 4]}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            label={{
                                value: 'Năng lực θ',
                                angle: -90,
                                position: 'insideLeft',
                                fontSize: 12,
                                fill: '#94a3b8',
                            }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const point = payload[0]
                                        .payload as AbilityHistoryPoint
                                    return (
                                        <div
                                            style={{
                                                background: '#ffffff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8,
                                                padding: '0.75rem',
                                                boxShadow:
                                                    '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                fontSize: 12,
                                            }}
                                        >
                                            <p
                                                style={{
                                                    margin: '0 0 4px 0',
                                                    fontWeight: 700,
                                                    color: '#0f172a',
                                                }}
                                            >
                                                Câu hỏi #{point.itemIndex}
                                                {point.isCorrect !==
                                                    undefined && (
                                                    <span
                                                        style={{
                                                            marginLeft: 8,
                                                            color: point.isCorrect
                                                                ? '#16a34a'
                                                                : '#dc2626',
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
                                                    margin: '0 0 2px 0',
                                                    color: '#2563eb',
                                                }}
                                            >
                                                Năng lực &theta;:{' '}
                                                <strong>{point.theta}</strong>
                                            </p>
                                            <p
                                                style={{
                                                    margin: '0 0 2px 0',
                                                    color: '#64748b',
                                                }}
                                            >
                                                Sai số SE:{' '}
                                                <strong>
                                                    &plusmn;{point.se}
                                                </strong>
                                            </p>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: '#94a3b8',
                                                }}
                                            >
                                                Khoảng tin cậy: [
                                                {point.thetaLower},{' '}
                                                {point.thetaUpper}]
                                            </p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        {/* Shaded Confidence Interval ±1 SE */}
                        <Area
                            type="monotone"
                            dataKey="thetaUpper"
                            stroke="none"
                            fill="#3b82f6"
                            fillOpacity={0.15}
                        />
                        <Area
                            type="monotone"
                            dataKey="thetaLower"
                            stroke="none"
                            fill="#ffffff"
                            fillOpacity={1}
                        />
                        {/* Ability Line */}
                        <Line
                            type="monotone"
                            dataKey="theta"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{
                                r: 4,
                                fill: '#2563eb',
                                strokeWidth: 2,
                                stroke: '#ffffff',
                            }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
