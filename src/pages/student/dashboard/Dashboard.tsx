import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import s from './Dashboard.module.css'

import Card from '@/components/common/card/Card'
import ButtonGlow from '@/components/common/button/ButtonGlow'
import SegmentedControl from '@/components/common/menu/SegmentedControl'
import TextType from '@/components/common/text/TextType'
import Skeleton from '@/components/effect/Skeleton'
import { useUIStore } from '@/stores/ui.store'

import BookOpenIcon from '@/assets/Book Open.svg'
import ChartBarIcon from '@/assets/Chart Bar.svg'
import CheckBadgeIcon from '@/assets/Check Badge.svg'
import RobotIcon from '@/assets/Robot.svg'

import { getMe, getUserOverview, getMyClasses } from '@/lib/users'
import { getTodayRecommendation, type Milestone } from '@/lib/recommendations'
import type { StudentOverviewStats } from '@/types/user.types'
import type { Lesson } from '@/components/common/typography/LessonItem'

type SkillKey = 'reading' | 'listening' | 'writing' | 'speaking'

const SKILL_CONFIG: {
    key: SkillKey
    label: string
    shortLabel: string
    practicePath: string
}[] = [
    {
        key: 'reading',
        label: 'Đọc hiểu (Reading)',
        shortLabel: 'Reading',
        practicePath: '/student/tests?skill=reading',
    },
    {
        key: 'listening',
        label: 'Nghe hiểu (Listening)',
        shortLabel: 'Listening',
        practicePath: '/student/tests?skill=listening',
    },
    {
        key: 'writing',
        label: 'Viết luận (Writing)',
        shortLabel: 'Writing',
        practicePath: '/student/tests?skill=writing',
    },
    {
        key: 'speaking',
        label: 'Nói & Phát âm (Speaking)',
        shortLabel: 'Speaking',
        practicePath: '/student/pronunciation',
    },
]

const QUICK_ACTIONS = [
    {
        id: 'exam-practice',
        title: 'Luyện đề IELTS',
        path: '/student/tests',
        tone: 'primary' as const,
    },
    {
        id: 'flashcards',
        title: 'Ôn từ vựng Flashcards',
        path: '/student/flashcards',
        tone: 'cyan' as const,
    },
    {
        id: 'pronunciation',
        title: 'Luyện phát âm AI',
        path: '/student/pronunciation',
        tone: 'secondary' as const,
    },
    {
        id: 'adaptive-quiz',
        title: 'Trắc nghiệm thích ứng',
        path: '/student/adaptive-quiz',
        tone: 'primary' as const,
    },
    {
        id: 'roadmap',
        title: 'Lộ trình học AI',
        path: '/student/roadmap',
        tone: 'cyan' as const,
    },
    {
        id: 'classes',
        title: 'Lớp học của tôi',
        path: '/student/class',
        tone: 'secondary' as const,
    },
]

export default function StudentDashboard() {
    const navigate = useNavigate()
    const theme = useUIStore((state) => state.theme)
    const cardMode: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light'
    const [selectedSkillTab, setSelectedSkillTab] =
        useState<SkillKey>('reading')

    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ['me'],
        queryFn: () => getMe(),
    })

    const { data: overviewData, isLoading: statsLoading } = useQuery({
        queryKey: ['user-overview'],
        queryFn: () => getUserOverview<StudentOverviewStats>(),
    })

    const { data: myClasses, isLoading: classesLoading } = useQuery({
        queryKey: ['my-classes'],
        queryFn: () => getMyClasses(),
    })

    const { data: recData, isLoading: recLoading } = useQuery({
        queryKey: ['today-recommendation'],
        queryFn: () => getTodayRecommendation(),
    })

    const fullName = userData
        ? `${userData.firstName} ${userData.lastName}`.trim()
        : ''

    const greetingTexts = useMemo(() => {
        if (!userData) return ['Đang tải dữ liệu...']
        return [
            `Xin chào, ${fullName}!`,
            'Hôm nay bạn muốn học kỹ năng gì?',
            'Cùng hoàn thành mục tiêu ngày hôm nay nhé!',
        ]
    }, [userData, fullName])

    const { todaySessions, upcomingSessionsCount } = useMemo(() => {
        if (!myClasses)
            return {
                todaySessions: [] as Lesson[],
                upcomingSessionsCount: 0,
            }
        const now = new Date()
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

        const formattedSessions: Lesson[] = []
        let upcomingCount = 0

        myClasses.forEach((myClass) => {
            ;(myClass.sessions || []).forEach((session) => {
                if (session.session_date === today) {
                    formattedSessions.push({
                        id: session.id,
                        className: myClass.name,
                        sessionDate: session.session_date,
                        startTime: session.start_time,
                        endTime: session.end_time,
                        status: session.status as Lesson['status'],
                        roomName: myClass.room_name || 'Phòng học',
                    })
                } else if (session.session_date > today) {
                    upcomingCount += 1
                }
            })
        })

        return {
            todaySessions: formattedSessions,
            upcomingSessionsCount: upcomingCount,
        }
    }, [myClasses])

    const weakestSkillInfo = useMemo(() => {
        const wKey = (recData?.weakest_skill?.toLowerCase() ||
            'speaking') as SkillKey
        return (
            SKILL_CONFIG.find((sk) => sk.key === wKey) ||
            SKILL_CONFIG[SKILL_CONFIG.length - 1]
        )
    }, [recData?.weakest_skill])

    const activeTips = useMemo(() => {
        const rawTips = recData?.recommendation_data?.tips
        if (!rawTips) {
            return [
                'Luyện tập đề theo chuẩn thời gian thực để cải thiện phản xạ.',
                'Ghi chú từ khóa học thuật vào bộ Flashcards cá nhân mỗi ngày.',
            ]
        }
        if (typeof rawTips === 'object' && !Array.isArray(rawTips)) {
            const list = (rawTips as Record<string, string[]>)[selectedSkillTab]
            if (Array.isArray(list) && list.length > 0) {
                return list.slice(0, 2)
            }
        }
        if (Array.isArray(rawTips) && rawTips.length > 0) {
            return rawTips.slice(0, 2)
        }
        return [
            'Hoàn thành bài kiểm tra định kỳ để AI cập nhật gợi ý sát nhất.',
        ]
    }, [recData?.recommendation_data?.tips, selectedSkillTab])

    const weakestSkillTip = useMemo(() => {
        const rawTips = recData?.recommendation_data?.tips
        if (rawTips && typeof rawTips === 'object' && !Array.isArray(rawTips)) {
            const wTips = (rawTips as Record<string, string[]>)[
                weakestSkillInfo.key
            ]
            if (Array.isArray(wTips) && wTips.length > 0) return wTips[0]
        }
        return 'Tập trung cải thiện kỹ năng này mỗi ngày để nâng nhanh điểm tổng.'
    }, [recData?.recommendation_data?.tips, weakestSkillInfo.key])

    const skillScoreRows = useMemo(() => {
        const scores: Record<string, number> = recData?.skill_scores || {}
        const tones: ('primary' | 'secondary' | 'cyan' | 'rose')[] = [
            'primary',
            'secondary',
            'cyan',
            'rose',
        ]
        return SKILL_CONFIG.map((sk, index) => {
            const rawVal = scores[sk.key]
            const val =
                typeof rawVal === 'number' && !Number.isNaN(rawVal) ? rawVal : 0
            const pct = Math.min(100, Math.max(0, (val / 9) * 100))
            return {
                ...sk,
                score: val,
                pct,
                tone: tones[index % tones.length],
            }
        })
    }, [recData?.skill_scores])

    const milestones: Milestone[] = useMemo(() => {
        const list = recData?.learning_path?.milestones
        if (Array.isArray(list) && list.length > 0) return list.slice(0, 3)
        return []
    }, [recData?.learning_path?.milestones])

    const suggestedCourse = recData?.recommendation_data?.suggested_course

    const segmentedItems = useMemo(
        () =>
            SKILL_CONFIG.map((sk) => ({
                label: sk.shortLabel,
                value: sk.key,
            })),
        []
    )

    return (
        <div className={s.dashboard}>
            <div className={s.ambientBackdrop} aria-hidden="true">
                <span className={`${s.ambientOrb} ${s.orbPrimary}`} />
                <span className={`${s.ambientOrb} ${s.orbSecondary}`} />
                <span className={`${s.ambientOrb} ${s.orbCyan}`} />
            </div>

            <main className={s.mainContent}>
                {/* 1. TYPING WELCOME MESSAGE AS ORIGINAL */}
                <h1 className={s.welcomeMessage}>
                    {userLoading ? (
                        <Skeleton
                            width="55%"
                            height="3rem"
                            style={{ margin: '0 auto' }}
                        />
                    ) : (
                        <TextType
                            text={greetingTexts}
                            typingSpeed={60}
                            pauseDuration={3000}
                            renderText={(text) => (
                                <>
                                    {fullName
                                        ? text
                                              .split(fullName)
                                              .map((part, i, arr) => (
                                                  <React.Fragment key={i}>
                                                      {part}
                                                      {i < arr.length - 1 && (
                                                          <span
                                                              className={
                                                                  s.gradientText
                                                              }
                                                          >
                                                              {fullName}
                                                          </span>
                                                      )}
                                                  </React.Fragment>
                                              ))
                                        : text}
                                </>
                            )}
                        />
                    )}
                </h1>

                <div className={s.dashboardLayout}>
                    {/* LEFT MAIN COLUMN */}
                    <div className={s.leftColumn}>
                        {/* TOP SUMMARY ROW (4 KPI Cards with clean icons) */}
                        <section
                            className={s.topSummaryRow}
                            aria-label="Tổng quan"
                        >
                            {/* KPI 1: Active Courses */}
                            <Card
                                variant="glass"
                                mode={cardMode}
                                className={s.summaryCard}
                            >
                                {statsLoading ? (
                                    <Skeleton height={92} variant="rect" />
                                ) : (
                                    <div className={s.kpiCardInner}>
                                        <div className={s.kpiTopRow}>
                                            <span className={s.sectionLabel}>
                                                KHÓA HỌC ĐANG HỌC
                                            </span>
                                            <img
                                                src={BookOpenIcon}
                                                alt=""
                                                className={s.kpiHeaderIcon}
                                            />
                                        </div>
                                        <div className={s.kpiValue}>
                                            {overviewData?.active_courses ?? 0}
                                        </div>
                                        <div className={s.kpiFootRow}>
                                            <span className={s.kpiFootText}>
                                                Chuyên cần lớp học
                                            </span>
                                            <span
                                                className={`${s.kpiTrend} ${s.trendPrimary}`}
                                            >
                                                {recData?.attendance_rate !==
                                                    undefined &&
                                                recData?.attendance_rate !==
                                                    null
                                                    ? `${Math.round(recData.attendance_rate)}%`
                                                    : '90%'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* KPI 2: Average Score */}
                            <Card
                                variant="glass"
                                mode={cardMode}
                                className={s.summaryCard}
                            >
                                {statsLoading ? (
                                    <Skeleton height={92} variant="rect" />
                                ) : (
                                    <div className={s.kpiCardInner}>
                                        <div className={s.kpiTopRow}>
                                            <span className={s.sectionLabel}>
                                                ĐIỂM TRUNG BÌNH
                                            </span>
                                            <img
                                                src={ChartBarIcon}
                                                alt=""
                                                className={s.kpiHeaderIcon}
                                            />
                                        </div>
                                        <div className={s.kpiValue}>
                                            {overviewData?.average_test_score !==
                                                undefined &&
                                            overviewData?.average_test_score !==
                                                null
                                                ? Number(
                                                      overviewData.average_test_score
                                                  ).toFixed(2)
                                                : '0.00'}
                                            <span className={s.kpiUnit}>
                                                /10
                                            </span>
                                        </div>
                                        <div className={s.kpiFootRow}>
                                            <span className={s.kpiFootText}>
                                                Mục tiêu đặt ra
                                            </span>
                                            <span
                                                className={`${s.kpiTrend} ${s.trendPrimary}`}
                                            >
                                                Band{' '}
                                                {recData?.target_band
                                                    ? recData.target_band.toFixed(
                                                          1
                                                      )
                                                    : '6.5'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* KPI 3: Tests Taken */}
                            <Card
                                variant="glass"
                                mode={cardMode}
                                className={s.summaryCard}
                            >
                                {statsLoading ? (
                                    <Skeleton height={92} variant="rect" />
                                ) : (
                                    <div className={s.kpiCardInner}>
                                        <div className={s.kpiTopRow}>
                                            <span className={s.sectionLabel}>
                                                BÀI THI ĐÃ LÀM
                                            </span>
                                            <img
                                                src={CheckBadgeIcon}
                                                alt=""
                                                className={s.kpiHeaderIcon}
                                            />
                                        </div>
                                        <div className={s.kpiValue}>
                                            {overviewData?.tests_taken ?? 0}
                                        </div>
                                        <div className={s.kpiFootRow}>
                                            <span className={s.kpiFootText}>
                                                Kỹ năng ưu tiên
                                            </span>
                                            <span
                                                className={`${s.kpiTrend} ${s.trendSecondary}`}
                                            >
                                                {weakestSkillInfo.shortLabel}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* KPI 4: Predicted Band (AI) */}
                            <Card
                                variant="glass"
                                mode={cardMode}
                                className={s.summaryCard}
                            >
                                {recLoading ? (
                                    <Skeleton height={92} variant="rect" />
                                ) : (
                                    <div className={s.kpiCardInner}>
                                        <div className={s.kpiTopRow}>
                                            <span className={s.sectionLabel}>
                                                DỰ ĐOÁN BAND (AI)
                                            </span>
                                            <img
                                                src={RobotIcon}
                                                alt=""
                                                className={s.kpiHeaderIcon}
                                            />
                                        </div>
                                        <div className={s.kpiValue}>
                                            {recData?.predicted_band !==
                                                undefined &&
                                            recData?.predicted_band !== null
                                                ? recData.predicted_band.toFixed(
                                                      1
                                                  )
                                                : '--'}
                                            {recData?.predicted_cefr && (
                                                <span className={s.kpiUnit}>
                                                    ({recData.predicted_cefr})
                                                </span>
                                            )}
                                        </div>
                                        <div className={s.kpiFootRow}>
                                            <span className={s.kpiFootText}>
                                                Lộ trình dự kiến
                                            </span>
                                            <span
                                                className={`${s.kpiTrend} ${s.trendSecondary}`}
                                            >
                                                {recData?.estimated_weeks
                                                    ? `${recData.estimated_weeks} tuần`
                                                    : '4 tuần'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </section>

                        {/* 2. AI SUGGESTED LEARNING */}
                        <Card
                            variant="glass"
                            mode={cardMode}
                            className={s.glassSection}
                        >
                            <div className={s.sectionHeader}>
                                <h2 className={s.sectionLabel}>
                                    GỢI Ý HỌC TẬP TỪ AI
                                </h2>
                                <SegmentedControl
                                    items={segmentedItems}
                                    value={selectedSkillTab}
                                    onChange={(val) =>
                                        setSelectedSkillTab(val as SkillKey)
                                    }
                                    mode={cardMode}
                                    variant="glass"
                                    size="sm"
                                />
                            </div>

                            {recLoading ? (
                                <div className={s.aiGrid}>
                                    <Skeleton
                                        height={160}
                                        variant="rect"
                                        count={3}
                                    />
                                </div>
                            ) : (
                                <div className={s.aiGrid}>
                                    {/* Subcard 1: Priority Skill */}
                                    <article className={s.aiSubCard}>
                                        <h3 className={s.itemTitle}>
                                            {weakestSkillInfo.label}
                                        </h3>
                                        <p className={s.itemText}>
                                            {weakestSkillTip}
                                        </p>
                                        <div className={s.aiProgressWrap}>
                                            <div className={s.aiProgressLabels}>
                                                <span>
                                                    Band{' '}
                                                    {recData?.skill_scores?.[
                                                        weakestSkillInfo.key
                                                    ]
                                                        ? Number(
                                                              recData
                                                                  .skill_scores[
                                                                  weakestSkillInfo
                                                                      .key
                                                              ]
                                                          ).toFixed(1)
                                                        : '--'}
                                                </span>
                                                <span>
                                                    Mục tiêu{' '}
                                                    {recData?.target_band?.toFixed(
                                                        1
                                                    ) || '6.5'}
                                                </span>
                                            </div>
                                            <div className={s.thinTrack}>
                                                <div
                                                    className={`${s.thinFill} ${s.fillSecondary}`}
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            Math.max(
                                                                18,
                                                                ((recData
                                                                    ?.skill_scores?.[
                                                                    weakestSkillInfo
                                                                        .key
                                                                ] || 4.0) /
                                                                    9) *
                                                                    100
                                                            )
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className={s.cardActionRow}>
                                            <ButtonGlow
                                                size="sm"
                                                variant="glass"
                                                mode={cardMode}
                                                glow={false}
                                                onClick={() =>
                                                    navigate(
                                                        weakestSkillInfo.practicePath
                                                    )
                                                }
                                            >
                                                Luyện tập
                                            </ButtonGlow>
                                        </div>
                                    </article>

                                    {/* Subcard 2: Selected Skill Tips (Featured Middle Card) */}
                                    <article
                                        className={`${s.aiSubCard} ${s.aiSubCardFeatured}`}
                                    >
                                        <h3 className={s.itemTitle}>
                                            Mẹo làm bài{' '}
                                            {
                                                SKILL_CONFIG.find(
                                                    (sk) =>
                                                        sk.key ===
                                                        selectedSkillTab
                                                )?.shortLabel
                                            }
                                        </h3>
                                        <ul className={s.cleanTipList}>
                                            {activeTips.map((tip, idx) => (
                                                <li
                                                    key={idx}
                                                    className={s.cleanTipItem}
                                                >
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className={s.cardActionRow}>
                                            <ButtonGlow
                                                size="sm"
                                                variant="glass"
                                                mode={cardMode}
                                                glow={false}
                                                className={s.featuredCtaBtn}
                                                onClick={() =>
                                                    navigate(
                                                        SKILL_CONFIG.find(
                                                            (sk) =>
                                                                sk.key ===
                                                                selectedSkillTab
                                                        )?.practicePath ||
                                                            '/student/tests'
                                                    )
                                                }
                                            >
                                                Mở bài luyện
                                            </ButtonGlow>
                                        </div>
                                    </article>

                                    {/* Subcard 3: Suggested Course */}
                                    <article className={s.aiSubCard}>
                                        <h3 className={s.itemTitle}>
                                            {suggestedCourse
                                                ? suggestedCourse.name
                                                : 'Lộ trình cá nhân hóa'}
                                        </h3>
                                        <p className={s.itemText}>
                                            {suggestedCourse?.description ||
                                                recData?.learning_path
                                                    ?.narrative ||
                                                'Lộ trình học tập điều chỉnh tự động theo kết quả kiểm tra.'}
                                        </p>
                                        <div className={s.tagGroup}>
                                            <span className={s.softBadge}>
                                                Band{' '}
                                                {recData?.target_band?.toFixed(
                                                    1
                                                ) || '6.5'}
                                            </span>
                                            {recData?.estimated_weeks && (
                                                <span className={s.softBadge}>
                                                    {recData.estimated_weeks}{' '}
                                                    tuần
                                                </span>
                                            )}
                                        </div>
                                        <div className={s.cardActionRow}>
                                            <ButtonGlow
                                                size="sm"
                                                variant="glass"
                                                mode={cardMode}
                                                glow={false}
                                                onClick={() =>
                                                    navigate('/student/roadmap')
                                                }
                                            >
                                                Xem lộ trình
                                            </ButtonGlow>
                                        </div>
                                    </article>
                                </div>
                            )}
                        </Card>

                        {/* 3. BOTTOM SPLIT: 4-SKILL BREAKDOWN & AI MILESTONES */}
                        <div className={s.bottomSplit}>
                            {/* Left: 4-Skill Breakdown */}
                            <Card
                                variant="glass"
                                mode={cardMode}
                                className={s.glassSection}
                            >
                                <div className={s.sectionHeader}>
                                    <h2 className={s.sectionLabel}>
                                        TIẾN ĐỘ 4 KỸ NĂNG
                                    </h2>
                                    <button
                                        type="button"
                                        className={s.textLinkBtn}
                                        onClick={() =>
                                            navigate('/student/tests')
                                        }
                                    >
                                        Làm bài kiểm tra ›
                                    </button>
                                </div>

                                {recLoading ? (
                                    <Skeleton height={160} variant="rect" />
                                ) : (
                                    <div className={s.skillBreakdownWrap}>
                                        <div className={s.verticalChart}>
                                            <div className={s.yAxisLabels}>
                                                <span>9.0</span>
                                                <span>6.0</span>
                                                <span>3.0</span>
                                                <span>0</span>
                                            </div>
                                            <div className={s.verticalBars}>
                                                {skillScoreRows.map((sk) => (
                                                    <div
                                                        key={sk.key}
                                                        className={s.vBarCol}
                                                    >
                                                        <div
                                                            className={
                                                                s.vBarTrack
                                                            }
                                                        >
                                                            <div
                                                                className={`${s.vBarFill} ${s[`tone_${sk.tone}`]}`}
                                                                style={{
                                                                    height: `${sk.score > 0 ? Math.max(12, sk.pct) : 6}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className={
                                                                s.vBarLabel
                                                            }
                                                        >
                                                            {sk.shortLabel.slice(
                                                                0,
                                                                1
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <ul className={s.skillLegendList}>
                                            {skillScoreRows.map((sk) => (
                                                <li
                                                    key={sk.key}
                                                    className={s.skillLegendRow}
                                                >
                                                    <span
                                                        className={`${s.dot} ${s[`tone_${sk.tone}`]}`}
                                                    />
                                                    <span
                                                        className={
                                                            s.skillLegendName
                                                        }
                                                    >
                                                        {sk.shortLabel}
                                                    </span>
                                                    <span
                                                        className={
                                                            s.skillLegendVal
                                                        }
                                                    >
                                                        {sk.score > 0
                                                            ? sk.score.toFixed(
                                                                  1
                                                              )
                                                            : '--'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>

                            {/* Right: AI Roadmap Milestones */}
                            <Card
                                variant="glass"
                                mode={cardMode}
                                className={s.glassSection}
                            >
                                <div className={s.sectionHeader}>
                                    <h2 className={s.sectionLabel}>
                                        CỘT MỐC LỘ TRÌNH AI
                                    </h2>
                                    <button
                                        type="button"
                                        className={s.textLinkBtn}
                                        onClick={() =>
                                            navigate('/student/roadmap')
                                        }
                                    >
                                        Xem tất cả ›
                                    </button>
                                </div>

                                {recLoading ? (
                                    <Skeleton height={160} variant="rect" />
                                ) : (
                                    <div className={s.milestoneTable}>
                                        <div className={s.milestoneHead}>
                                            <span>Giai đoạn</span>
                                            <span>Trọng tâm</span>
                                            <span>Mục tiêu</span>
                                        </div>

                                        <div className={s.milestoneRow}>
                                            <span className={s.milestoneStage}>
                                                Hiện tại
                                            </span>
                                            <span className={s.milestoneFocus}>
                                                {weakestSkillInfo.shortLabel}
                                            </span>
                                            <span
                                                className={`${s.milestoneTarget} ${s.trendPrimary}`}
                                            >
                                                Band{' '}
                                                {recData?.predicted_band?.toFixed(
                                                    1
                                                ) || '5.5'}
                                            </span>
                                        </div>

                                        {milestones.map((ms) => (
                                            <div
                                                key={ms.month}
                                                className={s.milestoneRow}
                                            >
                                                <span
                                                    className={s.milestoneStage}
                                                >
                                                    Tháng {ms.month}
                                                </span>
                                                <span
                                                    className={s.milestoneFocus}
                                                >
                                                    {ms.focus}
                                                </span>
                                                <span
                                                    className={`${s.milestoneTarget} ${s.trendPrimary}`}
                                                >
                                                    Band{' '}
                                                    {ms.target_band.toFixed(1)}
                                                </span>
                                            </div>
                                        ))}

                                        <div className={s.milestoneRow}>
                                            <span className={s.milestoneStage}>
                                                Đích đến
                                            </span>
                                            <span className={s.milestoneFocus}>
                                                {suggestedCourse?.name ||
                                                    'Tổng ôn 4 kỹ năng'}
                                            </span>
                                            <span
                                                className={`${s.milestoneTarget} ${s.trendSecondary}`}
                                            >
                                                Band{' '}
                                                {recData?.target_band?.toFixed(
                                                    1
                                                ) || '6.5'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR COLUMN */}
                    <aside className={s.rightColumn}>
                        {/* 1. COMPACT TODAY SCHEDULE */}
                        <Card
                            variant="glass"
                            mode={cardMode}
                            className={s.glassSection}
                        >
                            <div className={s.sectionHeader}>
                                <h2 className={s.sectionLabel}>
                                    LỊCH HỌC HÔM NAY
                                </h2>
                                <button
                                    type="button"
                                    className={s.textLinkBtn}
                                    onClick={() => navigate('/student/class')}
                                >
                                    Xem lớp ›
                                </button>
                            </div>

                            {classesLoading ? (
                                <Skeleton height={90} variant="rect" />
                            ) : todaySessions.length === 0 ? (
                                <div className={s.scheduleEmpty}>
                                    <p className={s.scheduleEmptyText}>
                                        Hôm nay không có ca học trên lớp.
                                        {upcomingSessionsCount > 0
                                            ? ` Có ${upcomingSessionsCount} buổi sắp tới.`
                                            : ''}
                                    </p>
                                    <ButtonGlow
                                        size="sm"
                                        variant="glass"
                                        mode={cardMode}
                                        glow={false}
                                        onClick={() =>
                                            navigate('/student/tests')
                                        }
                                    >
                                        Tự luyện tập
                                    </ButtonGlow>
                                </div>
                            ) : (
                                <ul className={s.calendarList}>
                                    {todaySessions
                                        .slice(0, 3)
                                        .map((session, i) => (
                                            <li
                                                key={session.id}
                                                className={s.calendarItem}
                                                onClick={() =>
                                                    navigate('/student/class')
                                                }
                                            >
                                                <span
                                                    className={s.calendarTime}
                                                >
                                                    {session.startTime?.slice(
                                                        0,
                                                        5
                                                    )}
                                                </span>
                                                <span
                                                    className={`${s.calendarBar} ${
                                                        i % 2 === 0
                                                            ? s.tone_primary
                                                            : s.tone_secondary
                                                    }`}
                                                />
                                                <div className={s.calendarInfo}>
                                                    <span
                                                        className={
                                                            s.calendarName
                                                        }
                                                    >
                                                        {session.className}
                                                    </span>
                                                    <span
                                                        className={
                                                            s.calendarSub
                                                        }
                                                    >
                                                        {session.startTime?.slice(
                                                            0,
                                                            5
                                                        )}{' '}
                                                        -{' '}
                                                        {session.endTime?.slice(
                                                            0,
                                                            5
                                                        )}{' '}
                                                        • {session.roomName}
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            )}
                        </Card>

                        {/* 2. QUICK ACTIONS WITHOUT DESCRIPTION */}
                        <Card
                            variant="glass"
                            mode={cardMode}
                            className={s.glassSection}
                        >
                            <div className={s.sectionHeader}>
                                <h2 className={s.sectionLabel}>
                                    THAO TÁC NHANH
                                </h2>
                            </div>

                            <ul className={s.quickList}>
                                {QUICK_ACTIONS.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            className={s.quickRow}
                                            onClick={() => navigate(item.path)}
                                        >
                                            <span
                                                className={`${s.dot} ${s[`tone_${item.tone}`]}`}
                                            />
                                            <span className={s.quickRowTitle}>
                                                {item.title}
                                            </span>
                                            <span
                                                className={s.quickRowArrow}
                                                aria-hidden="true"
                                            >
                                                ›
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* 3. PLACEMENT TEST CARD */}
                        <Card
                            variant="glass"
                            mode={cardMode}
                            className={s.glassSection}
                        >
                            <div className={s.sectionHeader}>
                                <h2 className={s.sectionLabel}>
                                    KIỂM TRA ĐẦU VÀO
                                </h2>
                            </div>
                            <div className={s.placementBox}>
                                <p className={s.scheduleEmptyText}>
                                    Đánh giá lại năng lực 4 kỹ năng để cập nhật
                                    lộ trình AI.
                                </p>
                                <ButtonGlow
                                    size="sm"
                                    variant="glass"
                                    mode={cardMode}
                                    glow={false}
                                    onClick={() =>
                                        navigate('/student/placement-test')
                                    }
                                >
                                    Kiểm tra trình độ
                                </ButtonGlow>
                            </div>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    )
}

