import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPronunciationStreak } from '@/lib/pronunciation'
import {
    FlameIcon,
    CheckIcon,
    CalendarIcon,
    TrophyIcon,
    BarChartIcon,
    AwardIcon,
    SparklesIcon,
} from './PronunciationIcons'
import type { PronunciationStreakResponse } from '@/types/pronunciation.types'
import s from './StreakCard.module.css'

interface StreakCardProps {
    streakData?: PronunciationStreakResponse | null
}

export const StreakCard: React.FC<StreakCardProps> = ({ streakData }) => {
    const { data: fetchedStreak, isLoading } = useQuery({
        queryKey: ['pronunciation-streak'],
        queryFn: () => getPronunciationStreak(),
        enabled: streakData === undefined,
    })

    const streak = streakData || fetchedStreak
    const currentStreak = streak?.current_streak ?? 0
    const longestStreak = streak?.longest_streak ?? 0
    const todayPracticed = streak?.today_practiced ?? false
    const activeDaysThisMonth = streak?.active_days_this_month ?? 0

    const isWarrior = currentStreak >= 7

    return (
        <div className={s.streakCard}>
            <div className={s.header}>
                <div className={s.titleRow}>
                    <span className={s.headerIcon}>
                        <FlameIcon size={20} color="#f59e0b" />
                    </span>
                    <h3 className={s.title}>Chuỗi Luyện Tập (Streak)</h3>
                </div>
                {todayPracticed ? (
                    <span className={s.todayBadgeDone}>
                        <CheckIcon size={12} />
                        <span>Hôm nay đã luyện</span>
                    </span>
                ) : (
                    <span className={s.todayBadgePending}>
                        <CalendarIcon size={12} />
                        <span>Chưa luyện hôm nay</span>
                    </span>
                )}
            </div>

            {/* Khối đếm streak chính */}
            <div className={s.mainStreak}>
                <div className={s.flameWrapper}>
                    <span
                        className={`${s.flameIconWrapper} ${currentStreak > 0 ? s.flameActive : ''}`}
                    >
                        <FlameIcon
                            size={32}
                            color={currentStreak > 0 ? '#ef4444' : '#94a3b8'}
                        />
                    </span>
                </div>
                <div className={s.streakCountWrapper}>
                    <div className={s.streakNumberRow}>
                        <span className={s.currentStreakNumber}>
                            {isLoading ? '...' : currentStreak}
                        </span>
                        <span className={s.streakUnit}>ngày liên tiếp</span>
                    </div>
                    <p className={s.streakEncourage}>
                        {currentStreak === 0
                            ? 'Bắt đầu luyện phát âm hôm nay để tạo chuỗi streak mới!'
                            : todayPracticed
                              ? 'Tuyệt vời! Bạn đã duy trì được chuỗi ngày luyện tập.'
                              : 'Luyện 1 bài bất kỳ hôm nay để giữ vững chuỗi phong độ!'}
                    </p>
                </div>
            </div>

            {/* Các chỉ số phụ */}
            <div className={s.statsGrid}>
                <div className={s.statBox}>
                    <span className={s.statIcon}>
                        <TrophyIcon size={18} color="#f59e0b" />
                    </span>
                    <div className={s.statTextGroup}>
                        <span className={s.statLabel}>Kỷ lục dài nhất</span>
                        <strong className={s.statValue}>
                            {longestStreak} ngày
                        </strong>
                    </div>
                </div>

                <div className={s.statBox}>
                    <span className={s.statIcon}>
                        <BarChartIcon size={18} color="#0284c7" />
                    </span>
                    <div className={s.statTextGroup}>
                        <span className={s.statLabel}>Tháng này</span>
                        <strong className={s.statValue}>
                            {activeDaysThisMonth} ngày active
                        </strong>
                    </div>
                </div>
            </div>

            {/* Danh hiệu Pronunciation Warrior (≥ 7 ngày) */}
            {isWarrior ? (
                <div className={s.warriorBadgeActive}>
                    <span className={s.badgeIcon}>
                        <AwardIcon size={22} color="#f59e0b" />
                    </span>
                    <div className={s.badgeContent}>
                        <div className={s.badgeTitleRow}>
                            <strong>Pronunciation Warrior</strong>
                            <span className={s.sparkle}>
                                <SparklesIcon size={14} color="#f59e0b" />
                            </span>
                        </div>
                        <p className={s.badgeDesc}>
                            Chiến binh phát âm bền bỉ! Đạt chuỗi 7+ ngày luyện
                            tập liên tục.
                        </p>
                    </div>
                </div>
            ) : (
                <div className={s.warriorBadgeLocked}>
                    <span className={s.badgeIconLocked}>
                        <AwardIcon size={20} color="#94a3b8" />
                    </span>
                    <div className={s.badgeContent}>
                        <strong>Mở khóa Pronunciation Warrior</strong>
                        <p className={s.badgeDesc}>
                            Cần thêm {Math.max(1, 7 - currentStreak)} ngày luyện
                            tập liên tục nữa để mở khóa huy hiệu chiến binh!
                        </p>
                        <div className={s.progressBarTrack}>
                            <div
                                className={s.progressBarFill}
                                style={{
                                    width: `${Math.min(100, Math.round((currentStreak / 7) * 100))}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
