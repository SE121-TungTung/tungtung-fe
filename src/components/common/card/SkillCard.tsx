import React from 'react'
import s from './SkillCard.module.css'

interface SkillCardProps {
    skillName: string
    icon: React.ReactNode
    onClick?: () => void
    className?: string
}

export default function SkillCard({
    skillName,
    icon,
    onClick,
    className = '',
}: SkillCardProps) {
    return (
        <div
            className={`${s.card} ${className}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
        >
            <div className={s.iconWrapper}>{icon}</div>
            <h4 className={s.skillName}>{skillName}</h4>
        </div>
    )
}
