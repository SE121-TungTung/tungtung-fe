import React from 'react'
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
    const { icon, className } = getStatusProps(stage.status)

    return (
        <li className={`${s.item} ${className}`}>
            <div className={s.iconWrapper}>{icon}</div>
            <div className={s.content}>
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
            </div>
        </li>
    )
}
