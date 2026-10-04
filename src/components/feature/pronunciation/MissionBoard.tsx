import React from 'react'
import type { MissionItem } from '@/lib/pronunciation'
import {
    TargetIcon,
    ZapIcon,
    SparklesIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    BookOpenIcon,
} from './PronunciationIcons'
import s from './MissionBoard.module.css'

interface MissionBoardProps {
    missions: MissionItem[]
    completedCount: number
    totalMissions: number
    streakBonus: boolean
    onMissionClick: (mission: MissionItem) => void
}

const MISSION_ICONS: Record<string, React.ReactNode> = {
    review: <TargetIcon size={16} />,
    weak_practice: <AlertTriangleIcon size={16} />,
    new_phoneme: <SparklesIcon size={16} />,
    sentence: <BookOpenIcon size={16} />,
}

const MISSION_COLORS: Record<string, string> = {
    review: 'var(--color-brand-primary, #175676)',
    weak_practice: 'var(--color-status-warning, #d97706)',
    new_phoneme: 'var(--color-brand-accent, #4ba3c3)',
    sentence: 'var(--color-status-success, #02bc2a)',
}

/**
 * MissionBoard — Bảng nhiệm vụ luyện tập hôm nay.
 * Hiển thị progress ring + danh sách missions theo priority.
 */
export const MissionBoard: React.FC<MissionBoardProps> = ({
    missions,
    completedCount,
    totalMissions,
    streakBonus,
    onMissionClick,
}) => {
    const progress =
        totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0

    // XP calculation: 10 XP per mission completed + 5 streak bonus
    const xpEarned = completedCount * 10 + (streakBonus ? 5 : 0)

    // SVG ring
    const ringR = 32
    const ringCirc = 2 * Math.PI * ringR
    const ringOffset = ringCirc * (1 - progress / 100)

    return (
        <div className={s.board}>
            {/* Header: progress ring + XP */}
            <div className={s.header}>
                <div className={s.progressRing}>
                    <svg viewBox="0 0 80 80" className={s.ringSvg}>
                        <circle
                            cx="40"
                            cy="40"
                            r={ringR}
                            fill="none"
                            stroke="rgba(148,163,184,0.1)"
                            strokeWidth="5"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r={ringR}
                            fill="none"
                            stroke="url(#ringGrad)"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={ringCirc}
                            strokeDashoffset={ringOffset}
                            style={{
                                transition: 'stroke-dashoffset 0.6s ease',
                            }}
                            transform="rotate(-90 40 40)"
                        />
                        <defs>
                            <linearGradient
                                id="ringGrad"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="1"
                            >
                                <stop offset="0%" stopColor="#175676" />
                                <stop offset="100%" stopColor="#4ba3c3" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className={s.ringLabel}>
                        {completedCount}/{totalMissions}
                    </span>
                </div>

                <div className={s.headerInfo}>
                    <h3 className={s.title}>Nhiệm Vụ Hôm Nay</h3>
                    <div className={s.xpRow}>
                        <ZapIcon size={14} />
                        <span className={s.xpText}>{xpEarned} XP earned</span>
                        {streakBonus && (
                            <span className={s.streakBadge}>🔥 Streak ×3</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Missions list */}
            <div className={s.list}>
                {missions.map((mission) => (
                    <button
                        key={mission.mission_id}
                        type="button"
                        className={`${s.missionItem} ${mission.completed ? s.missionDone : ''}`}
                        onClick={() => onMissionClick(mission)}
                    >
                        <span
                            className={s.missionIcon}
                            style={{
                                color:
                                    MISSION_COLORS[mission.type] || '#94a3b8',
                            }}
                        >
                            {mission.completed ? (
                                <CheckCircleIcon size={16} />
                            ) : (
                                MISSION_ICONS[mission.type] || (
                                    <TargetIcon size={16} />
                                )
                            )}
                        </span>
                        <div className={s.missionContent}>
                            <span className={s.missionLabel}>
                                {mission.label}
                            </span>
                            <span className={s.missionDesc}>
                                {mission.description}
                            </span>
                        </div>
                        <span
                            className={s.missionTag}
                            style={{
                                background: `${MISSION_COLORS[mission.type] || '#334155'}20`,
                                color:
                                    MISSION_COLORS[mission.type] || '#94a3b8',
                            }}
                        >
                            {mission.target_text.length > 20
                                ? mission.target_text.slice(0, 18) + '…'
                                : mission.target_text}
                        </span>
                    </button>
                ))}
            </div>

            {missions.length === 0 && (
                <div className={s.empty}>
                    <SparklesIcon size={24} />
                    <p>Hãy làm Placement Test để nhận nhiệm vụ cá nhân hóa!</p>
                </div>
            )}
        </div>
    )
}
