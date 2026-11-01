import React, { useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
    ReferenceLine,
} from 'recharts'
import { CheckCircleIcon, XCircleIcon } from './AdaptiveIcons'
import styles from './ItemCharacteristicCurve.module.css'

export interface ItemCharacteristicCurveProps {
    title: string
    a: number // discrimination
    b: number // difficulty
    c: number // guessing
    isCorrect: boolean
    thetaFinal: number
}

export const ItemCharacteristicCurve: React.FC<
    ItemCharacteristicCurveProps
> = ({ title, a, b, c, isCorrect, thetaFinal }) => {
    // Generate 3PL curve points: theta from -4 to +4
    const data = useMemo(() => {
        const points = []
        const D = 1.7
        for (let t = -4.0; t <= 4.05; t += 0.25) {
            const expVal = Math.exp(-D * a * (t - b))
            const p = c + (1 - c) / (1 + expVal)
            points.push({
                theta: Number(t.toFixed(2)),
                probability: Number(p.toFixed(3)),
            })
        }
        return points
    }, [a, b, c])

    // Compute P(theta_final)
    const studentP = useMemo(() => {
        const D = 1.7
        const expVal = Math.exp(-D * a * (thetaFinal - b))
        return Number((c + (1 - c) / (1 + expVal)).toFixed(3))
    }, [a, b, c, thetaFinal])

    const strokeColor = isCorrect ? '#16a34a' : '#dc2626'

    return (
        <div className={styles.iccContainer}>
            <div className={styles.header}>
                <h4 className={styles.itemTitle}>{title}</h4>
                <span
                    className={`${styles.resultBadge} ${
                        isCorrect ? styles.correctBadge : styles.incorrectBadge
                    }`}
                >
                    {isCorrect ? (
                        <>
                            <CheckCircleIcon size={14} /> Đúng
                        </>
                    ) : (
                        <>
                            <XCircleIcon size={14} /> Sai
                        </>
                    )}
                </span>
            </div>

            <div className={styles.paramRow}>
                <span>
                    Mức độ khó:{' '}
                    <span className={styles.paramValue}>{b.toFixed(2)}</span>
                </span>
                <span>
                    Độ phân loại:{' '}
                    <span className={styles.paramValue}>{a.toFixed(2)}</span>
                </span>
                <span>
                    Tỷ lệ đoán ngẫu nhiên:{' '}
                    <span className={styles.paramValue}>
                        {Math.round(c * 100)}%
                    </span>
                </span>
                <span>
                    Khả năng làm đúng:{' '}
                    <span className={styles.paramValue}>
                        {(studentP * 100).toFixed(1)}%
                    </span>
                </span>
            </div>

            <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="theta"
                            domain={[-4, 4]}
                            type="number"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickCount={9}
                        />
                        <YAxis
                            domain={[0, 1]}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${(Number(value) * 100).toFixed(1)}%`,
                                'Khả năng làm đúng',
                            ]}
                            labelFormatter={(label) =>
                                `Điểm năng lực: ${label}`
                            }
                            contentStyle={{
                                borderRadius: 8,
                                fontSize: 12,
                                border: '1px solid #e2e8f0',
                            }}
                        />
                        <ReferenceLine
                            x={b}
                            stroke="#94a3b8"
                            strokeDasharray="3 3"
                            label={{
                                value: `Độ khó ${b.toFixed(1)}`,
                                position: 'insideTopLeft',
                                fontSize: 12,
                                fill: '#64748b',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="probability"
                            stroke="var(--color-brand-primary, #2484b5)"
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={false}
                        />
                        <ReferenceDot
                            x={Number(thetaFinal.toFixed(2))}
                            y={studentP}
                            r={6}
                            fill={strokeColor}
                            stroke="#ffffff"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
