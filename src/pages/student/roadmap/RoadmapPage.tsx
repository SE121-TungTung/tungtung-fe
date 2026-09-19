import { useMemo } from 'react'
import s from './RoadmapPage.module.css'
import { useQuery } from '@tanstack/react-query'
import {
    getTodayRecommendation,
    getRecommendationHistory,
} from '@/lib/recommendations'
import Skeleton from '@/components/effect/Skeleton'

import Card from '@/components/common/card/Card'
import {
    RoadmapStageItem,
    type RoadmapStage,
} from '@/components/feature/roadmap/RoadmapStageItem'

import { useSession } from '@/stores/session.store'

export default function RoadmapPage() {
    const user = useSession((state) => state.user)
    const { data: recData, isLoading: recLoading } = useQuery({
        queryKey: ['today-recommendation'],
        queryFn: () => getTodayRecommendation(),
    })

    const { data: historyLogs = [] } = useQuery({
        queryKey: ['recommendation-history'],
        queryFn: () => getRecommendationHistory(),
    })

    const expectedExamDate = user?.preferences?.expected_exam_date
        ? (() => {
              try {
                  return new Date(
                      user.preferences.expected_exam_date
                  ).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                  })
              } catch {
                  return user.preferences.expected_exam_date
              }
          })()
        : null

    const sortedHistory = useMemo(() => {
        if (!historyLogs || !Array.isArray(historyLogs)) return []
        return [...historyLogs]
            .filter((log) => log.generated_at)
            .sort(
                (a, b) =>
                    new Date(a.generated_at!).getTime() -
                    new Date(b.generated_at!).getTime()
            )
    }, [historyLogs])

    const chartData = useMemo(() => {
        // Fallback to sample data for display if not enough history exists yet
        const baseLogs =
            sortedHistory.length >= 2
                ? sortedHistory
                : [
                      {
                          generated_at: new Date(
                              Date.now() - 30 * 24 * 3600 * 1000
                          ).toISOString(),
                          predicted_band: 5.0,
                          target_band: 7.0,
                          attendance_rate: 75,
                      },
                      {
                          generated_at: new Date(
                              Date.now() - 15 * 24 * 3600 * 1000
                          ).toISOString(),
                          predicted_band: 5.5,
                          target_band: 7.0,
                          attendance_rate: 80,
                      },
                      {
                          generated_at: new Date().toISOString(),
                          predicted_band: 6.0,
                          target_band: 7.0,
                          attendance_rate: 88,
                      },
                  ]

        const width = 500
        const height = 180
        const paddingLeft = 40
        const paddingRight = 20
        const paddingTop = 20
        const paddingBottom = 30

        const minBand = 3.0
        const maxBand = 9.0
        const bandRange = maxBand - minBand

        const minAtt = 40
        const maxAtt = 100
        const attRange = maxAtt - minAtt

        const pointsBand = baseLogs.map((log, index) => {
            const x =
                paddingLeft +
                (index * (width - paddingLeft - paddingRight)) /
                    Math.max(1, baseLogs.length - 1)
            const pred = log.predicted_band || minBand
            const y =
                height -
                paddingBottom -
                ((pred - minBand) * (height - paddingTop - paddingBottom)) /
                    bandRange

            const target = log.target_band || 7.0
            const yTarget =
                height -
                paddingBottom -
                ((target - minBand) * (height - paddingTop - paddingBottom)) /
                    bandRange

            return {
                x,
                y,
                yTarget,
                date: log.generated_at
                    ? new Date(log.generated_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                      })
                    : '',
                pred,
                target,
            }
        })

        const pointsAtt = baseLogs.map((log, index) => {
            const x =
                paddingLeft +
                (index * (width - paddingLeft - paddingRight)) /
                    Math.max(1, baseLogs.length - 1)
            const att = log.attendance_rate || 0
            const y =
                height -
                paddingBottom -
                ((att - minAtt) * (height - paddingTop - paddingBottom)) /
                    attRange

            return {
                x,
                y,
                date: log.generated_at
                    ? new Date(log.generated_at).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                      })
                    : '',
                att,
            }
        })

        return {
            pointsBand,
            pointsAtt,
            width,
            height,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
        }
    }, [sortedHistory])

    const roadmapStages = useMemo(() => {
        if (!recData?.learning_path?.milestones) return []
        return recData.learning_path.milestones.map((m: any) => ({
            id: `milestone_${m.month}`,
            stage_order: m.month,
            title: `Tháng ${m.month}: Mục tiêu Band ${m.target_band} (${m.target_cefr})`,
            description: m.focus,
            focus_skills: [m.focus],
            status: (m.month === 1 ? 'in_progress' : 'pending') as
                | 'completed'
                | 'in_progress'
                | 'pending',
            rationale: m.rationale,
            tasks: m.tasks,
        })) as RoadmapStage[]
    }, [recData])

    // Render helper for Band Score Grid Lines
    const bandGridLines = useMemo(() => {
        const lines = []
        const { height, paddingTop, paddingBottom } = chartData
        for (let b = 4; b <= 9; b += 1) {
            const y =
                height -
                paddingBottom -
                ((b - 3.0) * (height - paddingTop - paddingBottom)) / 6.0
            lines.push({ val: b, y })
        }
        return lines
    }, [chartData])

    // Render helper for Attendance Grid Lines
    const attGridLines = useMemo(() => {
        const lines = []
        const { height, paddingTop, paddingBottom } = chartData
        for (let a = 50; a <= 100; a += 10) {
            const y =
                height -
                paddingBottom -
                ((a - 40) * (height - paddingTop - paddingBottom)) / 60
            lines.push({ val: `${a}%`, y })
        }
        return lines
    }, [chartData])

    return (
        <div className={s.pageWrapper}>
            {/* --- Main Content --- */}
            <main className={s.mainContent}>
                {/* Tiêu đề trang */}
                <div
                    style={{
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}
                >
                    <h1 className={s.pageTitle} style={{ margin: 0 }}>
                        Lộ trình <span className={s.gradientText}>của bạn</span>
                    </h1>
                    {expectedExamDate && (
                        <div
                            style={{
                                padding: '8px 16px',
                                background:
                                    'rgba(var(--color-brand-rgb, 99, 102, 241), 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(var(--color-brand-rgb, 99, 102, 241), 0.2)',
                                fontSize: '0.9rem',
                                color: 'var(--color-brand)',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            📅 Ngày thi dự kiến:{' '}
                            <strong>{expectedExamDate}</strong>
                        </div>
                    )}
                </div>

                {/* --- Biểu đồ xu hướng và chuyên cần --- */}
                <div className={s.chartsGrid}>
                    {/* Biểu đồ IELTS Band Progression */}
                    <Card
                        title="Xu hướng Band điểm IELTS"
                        variant="outline"
                        className={s.chartCard}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-secondary)',
                                marginBottom: '12px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '3px',
                                        background: 'var(--color-brand)',
                                        borderRadius: '2px',
                                    }}
                                ></span>
                                Điểm dự kiến
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '3px',
                                        background: '#e11d48',
                                        borderRadius: '2px',
                                        strokeDasharray: '3,3',
                                    }}
                                ></span>
                                Điểm mục tiêu
                            </div>
                        </div>
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            <svg
                                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="bandGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="var(--color-brand)"
                                            stopOpacity="0.25"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="var(--color-brand)"
                                            stopOpacity="0.0"
                                        />
                                    </linearGradient>
                                </defs>

                                {/* Y-Axis grid lines & labels */}
                                {bandGridLines.map((line) => (
                                    <g key={line.val}>
                                        <line
                                            x1={chartData.paddingLeft}
                                            y1={line.y}
                                            x2={
                                                chartData.width -
                                                chartData.paddingRight
                                            }
                                            y2={line.y}
                                            stroke="rgba(0,0,0,0.06)"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={chartData.paddingLeft - 10}
                                            y={line.y + 4}
                                            textAnchor="end"
                                            fontSize="10"
                                            fill="var(--color-text-secondary)"
                                        >
                                            {line.val.toFixed(1)}
                                        </text>
                                    </g>
                                ))}

                                {/* Target band line (dotted) */}
                                <path
                                    d={`M ${chartData.pointsBand.map((p) => `${p.x} ${p.yTarget}`).join(' L ')}`}
                                    fill="none"
                                    stroke="#e11d48"
                                    strokeWidth="2"
                                    strokeDasharray="4,4"
                                />

                                {/* Predicted band gradient fill */}
                                <path
                                    d={`
                                        M ${chartData.pointsBand[0].x} ${chartData.height - chartData.paddingBottom}
                                        L ${chartData.pointsBand.map((p) => `${p.x} ${p.y}`).join(' L ')}
                                        L ${chartData.pointsBand[chartData.pointsBand.length - 1].x} ${chartData.height - chartData.paddingBottom}
                                        Z
                                    `}
                                    fill="url(#bandGrad)"
                                />

                                {/* Predicted band line */}
                                <path
                                    d={`M ${chartData.pointsBand.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                                    fill="none"
                                    stroke="var(--color-brand)"
                                    strokeWidth="3"
                                />

                                {/* Data points & Labels */}
                                {chartData.pointsBand.map((p, idx) => (
                                    <g key={idx}>
                                        {/* Predicted Dot */}
                                        <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r="5"
                                            fill="#ffffff"
                                            stroke="var(--color-brand)"
                                            strokeWidth="2.5"
                                        />
                                        <text
                                            x={p.x}
                                            y={p.y - 10}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fontWeight="600"
                                            fill="var(--color-brand)"
                                        >
                                            {p.pred.toFixed(1)}
                                        </text>

                                        {/* Target Dot */}
                                        <circle
                                            cx={p.x}
                                            cy={p.yTarget}
                                            r="3"
                                            fill="#e11d48"
                                        />

                                        {/* X-Axis date label */}
                                        <text
                                            x={p.x}
                                            y={chartData.height - 8}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="var(--color-text-secondary)"
                                        >
                                            {p.date}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </Card>

                    {/* Biểu đồ Attendance Progress */}
                    <Card
                        title="Tỷ lệ chuyên cần lớp học"
                        variant="outline"
                        className={s.chartCard}
                    >
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                fontSize: '0.8rem',
                                color: 'var(--color-text-secondary)',
                                marginBottom: '12px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '3px',
                                        background: '#10b981',
                                        borderRadius: '2px',
                                    }}
                                ></span>
                                Chuyên cần (%)
                            </div>
                        </div>
                        <div
                            style={{
                                position: 'relative',
                                width: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            <svg
                                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block',
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="attGrad"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#10b981"
                                            stopOpacity="0.25"
                                        />
                                        <stop
                                            offset="100%"
                                            stopColor="#10b981"
                                            stopOpacity="0.0"
                                        />
                                    </linearGradient>
                                </defs>

                                {/* Y-Axis grid lines & labels */}
                                {attGridLines.map((line) => (
                                    <g key={line.val}>
                                        <line
                                            x1={chartData.paddingLeft}
                                            y1={line.y}
                                            x2={
                                                chartData.width -
                                                chartData.paddingRight
                                            }
                                            y2={line.y}
                                            stroke="rgba(0,0,0,0.06)"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={chartData.paddingLeft - 10}
                                            y={line.y + 4}
                                            textAnchor="end"
                                            fontSize="10"
                                            fill="var(--color-text-secondary)"
                                        >
                                            {line.val}
                                        </text>
                                    </g>
                                ))}

                                {/* Attendance gradient fill */}
                                <path
                                    d={`
                                        M ${chartData.pointsAtt[0].x} ${chartData.height - chartData.paddingBottom}
                                        L ${chartData.pointsAtt.map((p) => `${p.x} ${p.y}`).join(' L ')}
                                        L ${chartData.pointsAtt[chartData.pointsAtt.length - 1].x} ${chartData.height - chartData.paddingBottom}
                                        Z
                                    `}
                                    fill="url(#attGrad)"
                                />

                                {/* Attendance line */}
                                <path
                                    d={`M ${chartData.pointsAtt.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                />

                                {/* Data points & Labels */}
                                {chartData.pointsAtt.map((p, idx) => (
                                    <g key={idx}>
                                        <circle
                                            cx={p.x}
                                            cy={p.y}
                                            r="5"
                                            fill="#ffffff"
                                            stroke="#10b981"
                                            strokeWidth="2.5"
                                        />
                                        <text
                                            x={p.x}
                                            y={p.y - 10}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fontWeight="600"
                                            fill="#10b981"
                                        >
                                            {p.att.toFixed(0)}%
                                        </text>

                                        {/* X-Axis date label */}
                                        <text
                                            x={p.x}
                                            y={chartData.height - 8}
                                            textAnchor="middle"
                                            fontSize="10"
                                            fill="var(--color-text-secondary)"
                                        >
                                            {p.date}
                                        </text>
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </Card>
                </div>

                {/* --- Card Lộ trình --- */}
                <Card
                    title="Lộ trình cá nhân hóa"
                    variant="flat"
                    mode="light"
                    className={s.roadmapCard}
                >
                    <div className={s.cardIntro}>
                        {recLoading ? (
                            <Skeleton height={20} width="80%" />
                        ) : (
                            <p
                                style={{
                                    fontStyle: 'italic',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                {recData?.learning_path?.narrative ||
                                    'Dựa trên kết quả học tập và các bài thi gần đây, đây là lộ trình AI đề xuất để bạn đạt được mục tiêu.'}
                            </p>
                        )}
                    </div>

                    <ul className={s.timeline}>
                        {recLoading ? (
                            <Skeleton height={80} variant="rect" count={3} />
                        ) : roadmapStages.length > 0 ? (
                            roadmapStages.map((stage) => (
                                <RoadmapStageItem
                                    key={stage.id}
                                    stage={stage}
                                />
                            ))
                        ) : (
                            <p
                                style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Chưa có lộ trình học tập được tạo. Hãy hoàn
                                thành ít nhất một bài kiểm tra để hệ thống phân
                                tích.
                            </p>
                        )}
                    </ul>
                </Card>
            </main>
        </div>
    )
}
