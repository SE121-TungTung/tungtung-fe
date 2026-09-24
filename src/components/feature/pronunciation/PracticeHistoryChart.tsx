import React, { useRef, useEffect, useState } from 'react'
import type { RecentTrendItem } from '@/types/pronunciation.types'
import s from './PracticeHistoryChart.module.css'

interface PracticeHistoryChartProps {
    trendData?: RecentTrendItem[]
    height?: number
}

export const PracticeHistoryChart: React.FC<PracticeHistoryChartProps> = ({
    trendData,
    height = 200,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [hoveredPoint, setHoveredPoint] = useState<{
        date: string
        score: number
        count: number
        x: number
        y: number
    } | null>(null)

    // Dữ liệu mẫu 7 ngày gần nhất nếu chưa có đủ lịch sử từ backend
    const defaultData: RecentTrendItem[] = [
        { date: 'T2', avg_score: 65, count: 3 },
        { date: 'T3', avg_score: 72, count: 5 },
        { date: 'T4', avg_score: 58, count: 2 },
        { date: 'T5', avg_score: 81, count: 4 },
        { date: 'T6', avg_score: 85, count: 6 },
        { date: 'T7', avg_score: 78, count: 4 },
        { date: 'CN', avg_score: 88, count: 7 },
    ]

    const points = trendData && trendData.length > 0 ? trendData : defaultData

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        const width = rect.width || 400
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        ctx.clearRect(0, 0, width, height)

        const padding = { top: 25, right: 25, bottom: 35, left: 35 }
        const chartWidth = width - padding.left - padding.right
        const chartHeight = height - padding.top - padding.bottom

        // Vẽ các đường kẻ ngang mức điểm (0, 25, 50, 75, 100)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'
        ctx.lineWidth = 1
        ctx.font = '10px monospace'
        ctx.fillStyle = '#64748b'
        ctx.textAlign = 'right'

        const gridLines = [0, 50, 80, 100]
        gridLines.forEach((val) => {
            const y = padding.top + chartHeight - (val / 100) * chartHeight
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(padding.left + chartWidth, y)
            ctx.stroke()
            ctx.fillText(String(val), padding.left - 6, y + 3)
        })

        if (points.length === 0) return

        // Tính toán tọa độ các điểm trên biểu đồ
        const coords = points.map((p, idx) => {
            const x =
                padding.left +
                (idx / Math.max(1, points.length - 1)) * chartWidth
            const y =
                padding.top +
                chartHeight -
                (Math.min(100, Math.max(0, p.avg_score)) / 100) * chartHeight
            return { x, y, point: p }
        })

        // Vẽ dải diện tích bên dưới đường (Gradient Fill)
        const avgScore =
            points.reduce((acc, cur) => acc + cur.avg_score, 0) / points.length
        const areaGradient = ctx.createLinearGradient(0, padding.top, 0, height)

        if (avgScore >= 80) {
            areaGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)')
            areaGradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)')
        } else if (avgScore >= 60) {
            areaGradient.addColorStop(0, 'rgba(245, 158, 11, 0.25)')
            areaGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)')
        } else {
            areaGradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)')
            areaGradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)')
        }

        ctx.beginPath()
        ctx.moveTo(coords[0].x, padding.top + chartHeight)
        coords.forEach((c) => ctx.lineTo(c.x, c.y))
        ctx.lineTo(coords[coords.length - 1].x, padding.top + chartHeight)
        ctx.closePath()
        ctx.fillStyle = areaGradient
        ctx.fill()

        // Vẽ đường nối các điểm (Smooth Polyline)
        ctx.beginPath()
        ctx.moveTo(coords[0].x, coords[0].y)
        for (let i = 1; i < coords.length; i++) {
            ctx.lineTo(coords[i].x, coords[i].y)
        }
        ctx.strokeStyle =
            avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444'
        ctx.lineWidth = 3
        ctx.stroke()

        // Vẽ các chấm điểm tròn và nhãn ngày trục X
        ctx.textAlign = 'center'
        coords.forEach((c) => {
            const score = c.point.avg_score
            const pointColor =
                score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

            // Chấm điểm
            ctx.beginPath()
            ctx.arc(c.x, c.y, 4.5, 0, Math.PI * 2)
            ctx.fillStyle = pointColor
            ctx.fill()
            ctx.strokeStyle = '#0f172a'
            ctx.lineWidth = 2
            ctx.stroke()

            // Nhãn ngày trục X
            ctx.fillStyle = '#94a3b8'
            ctx.font = '11px sans-serif'
            ctx.fillText(c.point.date, c.x, height - 10)
        })
    }, [points, height])

    return (
        <div className={s.chartWrapper}>
            <div className={s.header}>
                <div className={s.titleRow}>
                    <span className={s.icon}>📈</span>
                    <h4 className={s.title}>Xu Hướng Điểm 7 Ngày Gần Nhất</h4>
                </div>
                <div className={s.legend}>
                    <span className={s.legendItem}>
                        <span className={`${s.dot} ${s.dotGreen}`} /> ≥80
                    </span>
                    <span className={s.legendItem}>
                        <span className={`${s.dot} ${s.dotYellow}`} /> 60-79
                    </span>
                    <span className={s.legendItem}>
                        <span className={`${s.dot} ${s.dotRed}`} /> &lt;60
                    </span>
                </div>
            </div>

            <div className={s.canvasContainer} style={{ height }}>
                <canvas ref={canvasRef} className={s.canvas} />
                {hoveredPoint && (
                    <div
                        className={s.tooltip}
                        style={{
                            left: `${hoveredPoint.x}px`,
                            top: `${hoveredPoint.y}px`,
                        }}
                    >
                        <strong>{hoveredPoint.date}</strong>
                        <span>Điểm: {Math.round(hoveredPoint.score)}/100</span>
                        <small>{hoveredPoint.count} lượt luyện</small>
                    </div>
                )}
            </div>
        </div>
    )
}
