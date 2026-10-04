import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getStats } from '@/lib/flashcard'
import Card from '@/components/common/card/Card'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Skeleton from '@/components/effect/Skeleton'
import { StudyHeatmap } from '@/components/flashcard/StudyHeatmap'
import { ForgettingCurveChart } from '@/components/flashcard/ForgettingCurveChart'
import { StreakBadge } from '@/components/flashcard/StreakBadge'

export default function DeckStatsPage() {
    const navigate = useNavigate()

    const { data: stats, isLoading } = useQuery({
        queryKey: ['flashcards-stats'],
        queryFn: getStats,
    })

    if (isLoading) {
        return (
            <div
                style={{
                    maxWidth: '960px',
                    margin: '0 auto',
                    padding: '24px 16px',
                }}
            >
                <Skeleton height="200px" />
            </div>
        )
    }

    return (
        <div
            style={{
                maxWidth: '960px',
                margin: '0 auto',
                padding: '24px 16px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                }}
            >
                <div>
                    <h1
                        style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}
                    >
                        Thống Kê Học Tập Flashcards
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            marginTop: '4px',
                        }}
                    >
                        Hiệu suất ghi nhớ và quá trình ôn tập ngắt quãng của
                        bạn.
                    </p>
                </div>
                <ButtonGhost onClick={() => navigate('/student/flashcards')}>
                    ← Quay lại danh sách
                </ButtonGhost>
            </div>

            {/* Overview Stats */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}
            >
                <Card variant="outline">
                    <span
                        style={{
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Tổng lượt ôn tập
                    </span>
                    <h3
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            margin: '8px 0 0',
                        }}
                    >
                        {stats?.totalReviews ?? 0}
                    </h3>
                </Card>

                <Card variant="outline">
                    <span
                        style={{
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Thẻ đã ghi nhớ sâu
                    </span>
                    <h3
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            margin: '8px 0 0',
                            color: 'var(--color-success)',
                        }}
                    >
                        {stats?.totalMastered ?? 0}
                    </h3>
                </Card>

                <Card variant="outline">
                    <span
                        style={{
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Cần ôn hôm nay
                    </span>
                    <h3
                        style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            margin: '8px 0 0',
                            color: 'var(--color-primary)',
                        }}
                    >
                        {stats?.dueToday ?? 0}
                    </h3>
                </Card>

                <Card variant="outline">
                    <span
                        style={{
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Chuỗi ngày học liên tiếp
                    </span>
                    <div style={{ marginTop: '8px' }}>
                        <StreakBadge streakDays={stats?.streakDays ?? 0} />
                    </div>
                </Card>
            </div>

            {/* Heatmap & Curve */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                }}
            >
                {stats?.heatmap && stats.heatmap.length > 0 && (
                    <Card
                        variant="outline"
                        title="Tần suất ôn tập (52 tuần gần nhất)"
                    >
                        <StudyHeatmap data={stats.heatmap} />
                    </Card>
                )}

                <Card variant="outline" title="Đường cong quên lãng dự đoán">
                    <ForgettingCurveChart
                        stability={7}
                        dueDateDaysFromNow={3}
                    />
                </Card>
            </div>
        </div>
    )
}
