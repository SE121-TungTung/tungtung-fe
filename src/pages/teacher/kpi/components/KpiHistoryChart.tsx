import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './KpiHistoryChart.module.css'
import Card from '@/components/common/card/Card'
import { EmptyState } from '@/components/common/state/EmptyState'
import type { StaffKPIHistoryItem } from '@/types/kpi.types'

interface KpiHistoryChartProps {
    history: StaffKPIHistoryItem[]
    isLoading?: boolean
    error?: Error | null
}

export const KpiHistoryChart: React.FC<KpiHistoryChartProps> = ({
    history,
    isLoading,
    error,
}) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

    if (error) {
        return (
            <Card variant="glass" className={s.chartCard}>
                <h3 className={s.chartTitle}>Biểu đồ xu hướng KPI</h3>
                <div className={`${s.stateBox} ${s.errorText}`}>
                    Lỗi tải lịch sử KPI: {error.message}
                </div>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card variant="glass" className={s.chartCard}>
                <h3 className={s.chartTitle}>Biểu đồ xu hướng KPI</h3>
                <div className={`${s.stateBox} ${s.loadingText}`}>
                    Đang tải dữ liệu biểu đồ...
                </div>
            </Card>
        )
    }

    // Filter and prepare data (oldest first for chronological trend)
    const scoredItems = [...history]
        .reverse()
        .filter(
            (item) => item.total_score != null && item.total_score !== undefined
        )

    if (scoredItems.length < 2) {
        return (
            <EmptyState
                title="Biểu đồ lịch sử"
                description="Lịch sử điểm sẽ được hiển thị khi bạn có đủ dữ liệu >= 2 kỳ."
            />
        )
    }

    const maxScore = Math.max(
        ...scoredItems.map((item) => item.total_score || 0),
        1
    )

    return (
        <Card variant="glass" className={s.chartCard}>
            <h3 className={s.chartTitle}>Biểu đồ xu hướng KPI</h3>

            <div className={s.chartContainer}>
                {/* Y-Axis Labels */}
                <div className={s.yAxisLabels}>
                    <span>{Math.round(maxScore * 100)}%</span>
                    <span>{Math.round(maxScore * 75)}%</span>
                    <span>{Math.round(maxScore * 50)}%</span>
                    <span>{Math.round(maxScore * 25)}%</span>
                    <span>0%</span>
                </div>

                {/* Grid Lines */}
                <div className={s.gridLines}>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className={i === 4 ? s.gridLineBase : s.gridLine}
                        />
                    ))}
                </div>

                {/* Bars Container */}
                <div className={s.barsContainer}>
                    {scoredItems.map((item, idx) => {
                        const scoreVal = item.total_score || 0
                        const pct = (scoreVal / maxScore) * 100
                        const isHovered = hoveredIdx === idx

                        return (
                            <div
                                key={item.period_id}
                                className={s.barColumn}
                                style={{
                                    width: `${80 / scoredItems.length}%`,
                                    maxWidth: '80px',
                                }}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            >
                                {/* Bar */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${pct}%` }}
                                    transition={{
                                        duration: 0.8,
                                        ease: 'easeOut',
                                    }}
                                    className={`${s.barItem} ${isHovered ? s.barHovered : ''}`}
                                />

                                {/* X-Axis Label */}
                                <div className={s.xAxisLabel}>
                                    {item.period_name}
                                </div>

                                {/* Tooltip */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            className={s.tooltip}
                                            style={{ bottom: `${pct + 5}%` }}
                                        >
                                            <div className={s.tooltipTitle}>
                                                {item.period_name}
                                            </div>
                                            <div className={s.tooltipRow}>
                                                <span>Điểm KPI:</span>
                                                <strong
                                                    className={s.kpiScoreValue}
                                                >
                                                    {(scoreVal * 100).toFixed(
                                                        1
                                                    )}
                                                    %
                                                </strong>
                                            </div>
                                            {item.bonus_amount != null && (
                                                <div className={s.tooltipRow}>
                                                    <span>Thưởng:</span>
                                                    <strong
                                                        className={s.bonusValue}
                                                    >
                                                        {new Intl.NumberFormat(
                                                            'vi-VN',
                                                            {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                                maximumFractionDigits: 0,
                                                            }
                                                        ).format(
                                                            item.bonus_amount
                                                        )}
                                                    </strong>
                                                </div>
                                            )}
                                            <div className={s.tooltipRow}>
                                                <span>Trạng thái:</span>
                                                <span
                                                    className={`${s.statusBadge} ${
                                                        item.approval_status ===
                                                        'APPROVED'
                                                            ? s.statusApproved
                                                            : s.statusPending
                                                    }`}
                                                >
                                                    {item.approval_status ===
                                                    'APPROVED'
                                                        ? 'Đã duyệt'
                                                        : item.approval_status ===
                                                            'SUBMITTED'
                                                          ? 'Chờ duyệt'
                                                          : 'Nháp'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}

export default KpiHistoryChart
