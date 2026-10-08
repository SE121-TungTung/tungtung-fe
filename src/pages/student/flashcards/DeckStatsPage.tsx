import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getStats } from '@/lib/flashcard'
import Skeleton from '@/components/effect/Skeleton'
import { StudyHeatmap } from '@/components/flashcard/StudyHeatmap'
import { ForgettingCurveChart } from '@/components/flashcard/ForgettingCurveChart'
import { StreakBadge } from '@/components/flashcard/StreakBadge'
import {
    SparklesIcon,
    RotateCwIcon,
    CheckCircleIcon,
    FlameIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    LayersIcon,
} from '@/components/flashcard/FlashcardIcons'
import styles from './DeckStatsPage.module.css'

export default function DeckStatsPage() {
    const navigate = useNavigate()

    const { data: stats, isLoading } = useQuery({
        queryKey: ['flashcards-stats'],
        queryFn: getStats,
    })

    if (isLoading) {
        return (
            <div className={styles.container}>
                <Skeleton height="140px" />
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '16px',
                    }}
                >
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} height="120px" />
                    ))}
                </div>
                <Skeleton height="260px" />
            </div>
        )
    }

    const totalReviews = stats?.totalReviews ?? 0
    const totalMastered = stats?.totalMastered ?? 0
    const dueToday = stats?.dueToday ?? 0
    const streakDays = stats?.streakDays ?? 0

    return (
        <div className={styles.container}>
            {/* ── Centered Hero Header ─────────────────────────────────────── */}
            <div className={styles.pageHeaderCentered}>
                <div className={styles.badgeLabel}>
                    <SparklesIcon size={14} />
                    <span>Phân Tích Tiến Độ Học Tập</span>
                </div>
                <h1 className={styles.pageTitle}>
                    <span>Thống Kê Tiến Độ </span>
                    <span className={styles.gradientText}>
                        Ghi Nhớ Flashcard
                    </span>
                </h1>
                <p className={styles.pageDescription}>
                    Phân tích hiệu suất ghi nhớ, biểu đồ đường cong quên lãng và
                    chuỗi ngày rèn luyện từ vựng liên tục.
                </p>

                {/* Toolbar */}
                <div className={styles.toolbar}>
                    <button
                        type="button"
                        className={styles.backBtn}
                        onClick={() => navigate('/student/flashcards')}
                    >
                        <ArrowLeftIcon size={15} />
                        <span>Danh Sách Bộ Thẻ</span>
                    </button>
                    <button
                        type="button"
                        className={styles.studyBtn}
                        onClick={() => navigate('/student/flashcards')}
                    >
                        <span>Ôn Tập Ngay</span>
                        <ArrowRightIcon size={15} />
                    </button>
                </div>
            </div>

            {/* ── KPI Bento Grid ──────────────────────────────────────────── */}
            <div className={styles.kpiGrid}>
                {/* 1. Total Reviews */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div
                            className={`${styles.kpiIconWrapper} ${styles.iconReviews}`}
                        >
                            <RotateCwIcon size={20} />
                        </div>
                        <span className={styles.kpiBadgePill}>
                            Toàn thời gian
                        </span>
                    </div>
                    <div className={styles.kpiBody}>
                        <span className={styles.kpiLabel}>
                            Tổng Lượt Ôn Tập
                        </span>
                        <span className={styles.kpiValue}>{totalReviews}</span>
                        <p className={styles.kpiSubtext}>
                            Lượt đánh giá mức độ nhớ từ vựng
                        </p>
                    </div>
                </div>

                {/* 2. Mastered Words */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div
                            className={`${styles.kpiIconWrapper} ${styles.iconMastered}`}
                        >
                            <CheckCircleIcon size={20} />
                        </div>
                        <span className={styles.kpiBadgePill}>
                            Độ ổn định cao
                        </span>
                    </div>
                    <div className={styles.kpiBody}>
                        <span className={styles.kpiLabel}>Đã Ghi Nhớ Sâu</span>
                        <span
                            className={`${styles.kpiValue} ${styles.kpiValueMastered}`}
                        >
                            {totalMastered}
                        </span>
                        <p className={styles.kpiSubtext}>
                            Từ vựng đạt ngưỡng nhớ trên 21 ngày
                        </p>
                    </div>
                </div>

                {/* 3. Due Today */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div
                            className={`${styles.kpiIconWrapper} ${styles.iconDue}`}
                        >
                            <FlameIcon size={20} />
                        </div>
                        <span className={styles.kpiBadgePill}>Hôm nay</span>
                    </div>
                    <div className={styles.kpiBody}>
                        <span className={styles.kpiLabel}>Cần Ôn Hôm Nay</span>
                        <span
                            className={`${styles.kpiValue} ${styles.kpiValueDue}`}
                        >
                            {dueToday}
                        </span>
                        <p className={styles.kpiSubtext}>
                            {dueToday > 0
                                ? 'Cần ôn để duy trì khả năng nhớ trên 90%'
                                : 'Đã hoàn thành toàn bộ thẻ cần ôn hôm nay'}
                        </p>
                    </div>
                </div>

                {/* 4. Streak Days */}
                <div className={styles.kpiCard}>
                    <div className={styles.kpiHeader}>
                        <div
                            className={`${styles.kpiIconWrapper} ${styles.iconStreak}`}
                        >
                            <SparklesIcon size={20} />
                        </div>
                        <span className={styles.kpiBadgePill}>Kỷ luật học</span>
                    </div>
                    <div className={styles.kpiBody}>
                        <span className={styles.kpiLabel}>Chuỗi Ngày Học</span>
                        <div style={{ marginTop: '6px' }}>
                            <StreakBadge streakDays={streakDays} />
                        </div>
                        <p
                            className={styles.kpiSubtext}
                            style={{ marginTop: '8px' }}
                        >
                            Duy trì học mỗi ngày để củng cố phản xạ
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Learning Insights Callout Banner ─────────────────────────── */}
            <div className={styles.insightBanner}>
                <div className={styles.insightLeft}>
                    <div className={styles.insightIcon}>
                        <LayersIcon size={22} />
                    </div>
                    <div className={styles.insightTextGroup}>
                        <h4 className={styles.insightTitle}>
                            Phương Pháp Ôn Tập Ngắt Quãng Thông Minh
                        </h4>
                        <p className={styles.insightDesc}>
                            Hệ thống tự động tính toán thời điểm bạn sắp quên từ
                            vựng để nhắc ôn lại đúng lúc, giúp bạn ghi nhớ sâu
                            và lâu hơn gấp 3 lần mà không phải học dồn dập.
                        </p>
                    </div>
                </div>

                <div className={styles.insightMetrics}>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Mục Tiêu Nhớ</span>
                        <span className={styles.metricValue}>90.0%</span>
                    </div>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>
                            Chu Kỳ Tối Ưu
                        </span>
                        <span className={styles.metricValue}>
                            Tự động tối ưu
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Deep Dive Visualizations ─────────────────────────────────── */}
            <div className={styles.chartsGrid}>
                {stats?.heatmap && stats.heatmap.length > 0 && (
                    <StudyHeatmap data={stats.heatmap} />
                )}

                <ForgettingCurveChart
                    stability={7}
                    dueDateDaysFromNow={dueToday > 0 ? 0 : 3}
                />
            </div>
        </div>
    )
}
