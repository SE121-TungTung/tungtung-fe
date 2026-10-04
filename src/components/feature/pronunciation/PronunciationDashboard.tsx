import React, { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Card from '@/components/common/card/Card'
import {
    getDailyMissions,
    getMasteryMap,
    getMasterySummary,
    getLatestAssessment,
    getPronunciationStreak,
    type MissionItem,
} from '@/lib/pronunciation'
import { MasteryRadarChart } from './MasteryRadarChart'
import { PhonemeGrid } from './PhonemeGrid'
import { MissionBoard } from './MissionBoard'
import {
    SparklesIcon,
    TargetIcon,
    FlameIcon,
    CheckCircleIcon,
    ZapIcon,
} from './PronunciationIcons'
import s from './PronunciationDashboard.module.css'

interface PronunciationDashboardProps {
    onStartPractice: (text: string, type: string) => void
}

/**
 * PronunciationDashboard — Trang chính Guided mode.
 * Hiển thị: Assessment status, Daily Missions, Radar Chart, Phoneme Grid, Streak.
 */
export const PronunciationDashboard: React.FC<PronunciationDashboardProps> = ({
    onStartPractice,
}) => {
    // ── Queries ──
    const { data: assessment, isLoading: loadingAssessment } = useQuery({
        queryKey: ['pronunciation-assessment-latest'],
        queryFn: getLatestAssessment,
        staleTime: 5 * 60 * 1000,
    })

    const { data: missions, isLoading: loadingMissions } = useQuery({
        queryKey: ['pronunciation-daily-missions'],
        queryFn: getDailyMissions,
        staleTime: 2 * 60 * 1000,
        enabled: !!assessment, // only fetch missions if assessed
    })

    const { data: masterySummary } = useQuery({
        queryKey: ['pronunciation-mastery-summary'],
        queryFn: getMasterySummary,
        staleTime: 5 * 60 * 1000,
        enabled: !!assessment,
    })

    const { data: masteryMap } = useQuery({
        queryKey: ['pronunciation-mastery-map'],
        queryFn: getMasteryMap,
        staleTime: 5 * 60 * 1000,
        enabled: !!assessment,
    })

    const { data: streak } = useQuery({
        queryKey: ['pronunciation-streak'],
        queryFn: getPronunciationStreak,
        staleTime: 60 * 1000,
    })

    // ── Handlers ──
    const handleMissionClick = useCallback(
        (mission: MissionItem) => {
            onStartPractice(mission.target_text, mission.target_type)
        },
        [onStartPractice]
    )

    const handlePhonemeClick = useCallback(
        (phoneme: string) => {
            const sampleWords: Record<string, string> = {
                θ: 'think',
                ð: 'the',
                ʃ: 'she',
                ʒ: 'vision',
                tʃ: 'church',
                dʒ: 'judge',
                ŋ: 'sing',
                æ: 'cat',
                ʌ: 'cup',
                ə: 'about',
                ɜː: 'bird',
                ɪ: 'sit',
                iː: 'see',
                ʊ: 'put',
                uː: 'too',
            }
            onStartPractice(sampleWords[phoneme] || phoneme, 'word')
        },
        [onStartPractice]
    )

    // XP level calculation
    const totalAttempts =
        masteryMap?.phonemes?.reduce((sum, p) => sum + p.total_attempts, 0) || 0
    const xpTotal = totalAttempts * 10 + (streak?.current_streak || 0) * 5
    const currentLevel = Math.floor(xpTotal / 100) + 1
    const xpInLevel = xpTotal % 100
    const xpForNextLevel = 100

    // ── NOT ASSESSED → Show CTA Card ──
    if (!loadingAssessment && !assessment) {
        return (
            <div className={s.dashboard}>
                <Card variant="outline" className={s.ctaCard}>
                    <div className={s.ctaIcon}>
                        <TargetIcon size={38} />
                    </div>
                    <h2 className={s.ctaTitle}>
                        Chào mừng đến{' '}
                        <span className={s.ctaHighlight}>
                            Phòng Luyện Phát Âm!
                        </span>
                    </h2>
                    <p className={s.ctaDesc}>
                        Làm bài <strong>Placement Test</strong> (2 phút) để AI
                        xác định trình độ và tạo lộ trình luyện tập cá nhân hóa
                        cho bạn.
                    </p>
                    <Link
                        to="/student/pronunciation/assessment"
                        className={s.ctaBtn}
                    >
                        <SparklesIcon size={18} />
                        <span>Bắt Đầu Đánh Giá</span>
                    </Link>
                </Card>
            </div>
        )
    }

    const isLoading = loadingAssessment || loadingMissions

    return (
        <div className={s.dashboard}>
            {/* Row 1: Level + Streak + Assessment Badge */}
            <div className={s.topBar}>
                <div className={s.levelCard}>
                    <ZapIcon size={16} />
                    <span className={s.levelText}>Level {currentLevel}</span>
                    <div className={s.xpBar}>
                        <div
                            className={s.xpFill}
                            style={{
                                width: `${(xpInLevel / xpForNextLevel) * 100}%`,
                            }}
                        />
                    </div>
                    <span className={s.xpLabel}>
                        {xpInLevel}/{xpForNextLevel} XP
                    </span>
                </div>

                <div className={s.streakMini}>
                    <FlameIcon size={16} color="var(--color-status-warning)" />
                    <span className={s.streakNum}>
                        {streak?.current_streak || 0}
                    </span>
                    {streak?.today_practiced ? (
                        <CheckCircleIcon size={14} />
                    ) : null}
                </div>

                {assessment && (
                    <div className={s.cefrBadge}>
                        <span className={s.cefrLabel}>CEFR</span>
                        <span className={s.cefrValue}>
                            {(assessment as { cefr_level?: string })
                                ?.cefr_level || '—'}
                        </span>
                    </div>
                )}
            </div>

            {/* Row 2: Missions + Radar Chart */}
            <div className={s.mainGrid}>
                <Card variant="outline" className={s.missionsPanel}>
                    {isLoading ? (
                        <div className={s.skeleton}>
                            <div className={s.skeletonLine} />
                            <div className={s.skeletonLine} />
                            <div className={s.skeletonLine} />
                        </div>
                    ) : (
                        <MissionBoard
                            missions={missions?.missions || []}
                            completedCount={missions?.completed_count || 0}
                            totalMissions={missions?.total_missions || 0}
                            streakBonus={missions?.streak_bonus || false}
                            onMissionClick={handleMissionClick}
                        />
                    )}
                </Card>

                <Card variant="outline" className={s.radarPanel}>
                    <h3 className={s.panelTitle}>Mastery Radar</h3>
                    {masterySummary?.categories ? (
                        <MasteryRadarChart
                            categories={masterySummary.categories}
                        />
                    ) : (
                        <div className={s.radarPlaceholder}>
                            <p>Luyện tập để mở khóa Radar Chart</p>
                        </div>
                    )}
                    {masterySummary && (
                        <div className={s.masteryStat}>
                            <span className={s.masteryStatItem}>
                                <CheckCircleIcon size={12} />
                                {masterySummary.total_mastered} mastered
                            </span>
                            <span className={s.masteryStatItem}>
                                <SparklesIcon size={12} />
                                {masterySummary.total_learning} learning
                            </span>
                            <span className={s.masteryStatItem}>
                                {masterySummary.total_unseen} unseen
                            </span>
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 3: Phoneme Grid */}
            <Card variant="outline" className={s.gridPanel}>
                <h3 className={s.panelTitle}>Bản Đồ 44 Phoneme IPA</h3>
                {masteryMap?.phonemes ? (
                    <PhonemeGrid
                        phonemes={masteryMap.phonemes}
                        onPhonemeClick={handlePhonemeClick}
                    />
                ) : (
                    <div className={s.radarPlaceholder}>
                        <p>Hoàn thành Placement Test để xem bản đồ phoneme</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
