import React, { useState } from 'react'
import s from './RoadmapStageItem.module.css'
// import type { RoadmapStage } from '@/types/roadmap.types'

// Icons
import CheckIcon from '@/assets/Check.svg'
import PendingIcon from '@/assets/History.svg'
import CurrentIcon from '@/assets/Action Eye Tracking.svg'

// Định nghĩa kiểu tạm thời (Sẽ chuyển vào /types/roadmap.types.ts sau)
export interface RoadmapStage {
    id: string
    stage_order: number
    title: string
    description: string
    focus_skills: string[] // ['grammar', 'writing_task_2']
    status: 'completed' | 'in_progress' | 'pending'
    rationale?: string
    tasks?: string[]
}

interface RoadmapStageItemProps {
    stage: RoadmapStage
}

const getStatusProps = (status: RoadmapStage['status']) => {
    switch (status) {
        case 'completed':
            return {
                icon: <img src={CheckIcon} alt="Hoàn thành" />,
                className: s.completed,
            }
        case 'in_progress':
            return {
                icon: <img src={CurrentIcon} alt="Đang học" />,
                className: s.inProgress,
            }
        case 'pending':
            return {
                icon: <img src={PendingIcon} alt="Chưa bắt đầu" />,
                className: s.pending,
            }
    }
}

export const RoadmapStageItem: React.FC<RoadmapStageItemProps> = ({
    stage,
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const { icon, className } = getStatusProps(stage.status)

    return (
        <li className={`${s.item} ${className}`}>
            <div className={s.iconWrapper}>{icon}</div>
            <div className={s.content} style={{ flex: 1 }}>
                <span className={s.order}>Giai đoạn {stage.stage_order}</span>
                <h4 className={s.title}>{stage.title}</h4>
                <p className={s.description}>{stage.description}</p>
                <div className={s.skills}>
                    {stage.focus_skills.map((skill) => (
                        <span key={skill} className={s.skillTag}>
                            {skill.replace('_', ' ')}
                        </span>
                    ))}
                </div>

                {(stage.rationale ||
                    (stage.tasks && stage.tasks.length > 0)) && (
                    <>
                        <button
                            className={s.expandButton}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <span>
                                {isExpanded
                                    ? 'Thu gọn chi tiết'
                                    : 'Xem chi tiết tuần & lý do'}
                            </span>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`${s.chevron} ${
                                    isExpanded ? s.expanded : ''
                                }`}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        {isExpanded && (
                            <div className={s.expandedContent}>
                                {stage.rationale && (
                                    <div>
                                        <h5 className={s.sectionTitle}>
                                            Lý do & định hướng cải thiện
                                        </h5>
                                        <p className={s.rationaleText}>
                                            {stage.rationale}
                                        </p>
                                    </div>
                                )}
                                {stage.tasks && stage.tasks.length > 0 && (
                                    <div>
                                        <h5 className={s.sectionTitle}>
                                            Đầu việc cần làm chi tiết
                                        </h5>
                                        <ul className={s.taskList}>
                                            {stage.tasks.map((task, idx) => (
                                                <li
                                                    key={idx}
                                                    className={s.taskItem}
                                                >
                                                    <span
                                                        className={s.taskBullet}
                                                    />
                                                    <span>{task}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </li>
    )
}
