import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Dot,
} from 'recharts'
import styles from './ForgettingCurveChart.module.css'

interface ForgettingCurveChartProps {
    stability: number
    dueDateDaysFromNow: number | null
}

const FACTOR = 19 / 81
const DECAY = -0.5

function calculateRetention(t: number, s: number): number {
    if (s <= 0) return 0
    return Math.pow(1 + FACTOR * (t / s), DECAY) * 100
}

export function ForgettingCurveChart({
    stability,
    dueDateDaysFromNow,
}: ForgettingCurveChartProps) {
    const data = []
    for (let t = 0; t <= 30; t++) {
        data.push({
            day: t,
            retention: Number(calculateRetention(t, stability).toFixed(1)),
        })
    }

    const dueDay =
        dueDateDaysFromNow != null
            ? Math.max(0, Math.min(30, dueDateDaysFromNow))
            : null
    const dueRetention =
        dueDay != null ? calculateRetention(dueDay, stability) : null

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    Đường cong trí nhớ (Forgetting Curve)
                </h3>
                <div className={styles.legend}>
                    <span className={styles.legendItem}>
                        <span
                            className={styles.legendColor}
                            style={{ background: '#16a34a' }}
                        />
                        An toàn (&gt;90%)
                    </span>
                    <span className={styles.legendItem}>
                        <span
                            className={styles.legendColor}
                            style={{ background: '#ea580c' }}
                        />
                        Cần ôn (&lt;90%)
                    </span>
                </div>
            </div>

            <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="colorRetention"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#16a34a"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#16a34a"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="colorWarning"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#ea580c"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#ea580c"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="var(--color-border-soft)"
                        />
                        <XAxis
                            dataKey="day"
                            tick={{
                                fontSize: 12,
                                fill: 'var(--color-text-secondary)',
                            }}
                            tickLine={false}
                            axisLine={{ stroke: 'var(--color-border-soft)' }}
                            tickFormatter={(v) => `${v}d`}
                        />
                        <YAxis
                            tick={{
                                fontSize: 12,
                                fill: 'var(--color-text-secondary)',
                            }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--color-surface-card)',
                                border: '1px solid var(--color-border-soft)',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxShadow: 'var(--primitive-shadow-md)',
                            }}
                            formatter={(value: any) => [
                                `${value}%`,
                                'Khả năng nhớ',
                            ]}
                            labelFormatter={(label) => `Ngày ${label}`}
                        />

                        <ReferenceLine
                            y={90}
                            stroke="#ea580c"
                            strokeDasharray="3 3"
                            label={{
                                position: 'insideTopLeft',
                                value: 'Ngưỡng quên 90%',
                                fill: '#ea580c',
                                fontSize: 11,
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="retention"
                            stroke="#16a34a"
                            fillOpacity={1}
                            fill="url(#colorRetention)"
                            isAnimationActive={false}
                        />

                        {/* Dot for due date */}
                        {dueDay != null && dueRetention != null && (
                            <ReferenceLine
                                x={dueDay}
                                stroke="var(--color-brand-primary)"
                                strokeDasharray="3 3"
                            >
                                <Dot
                                    cx={0} // Recharts handles this based on x/y
                                    cy={0}
                                    r={4}
                                    fill="var(--color-brand-primary)"
                                    stroke="white"
                                    strokeWidth={2}
                                />
                            </ReferenceLine>
                        )}
                    </AreaChart>
                </ResponsiveContainer>

                {/* Overlay dot since Recharts ReferenceLine Dot is tricky */}
                {dueDay != null && dueRetention != null && (
                    <div
                        className={styles.dueDot}
                        style={{
                            left: `${(dueDay / 30) * 100}%`,
                            bottom: `${dueRetention}%`,
                        }}
                        title={`Ngày cần ôn: ${dueRetention.toFixed(1)}%`}
                    >
                        <div className={styles.pulse} />
                    </div>
                )}
            </div>

            <div className={styles.info}>
                <p>
                    Độ ổn định trí nhớ (S):{' '}
                    <strong>{stability.toFixed(2)} ngày</strong>
                </p>
                {dueDay != null && (
                    <p>
                        Hôm nay: <strong>Ngày {dueDay}</strong> kể từ lần ôn
                        trước.
                    </p>
                )}
            </div>
        </div>
    )
}
