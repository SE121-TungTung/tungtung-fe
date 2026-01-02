import React from 'react'
import s from './TextHeader.module.css'
import ClockIcon from '@/assets/History.svg'

interface TestHeaderProps {
    skillName: string
    icon?: string
    timeLeft: number
    formattedTime: string
    isLowTime: boolean
}

export const TestHeader = React.memo(
    ({
        skillName,
        icon,
        // timeLeft,
        formattedTime,
        isLowTime,
    }: TestHeaderProps) => {
        const timerStyle = isLowTime
            ? { color: '#ef4444', animation: 'pulse 1s infinite' }
            : {}

        return (
            <header className={s.header}>
                <span className={s.headerInfo}>
                    {icon && <span>{icon}</span>}
                    {skillName}
                </span>
                <div
                    className={s.timer}
                    title="Time remaining"
                    style={timerStyle}
                >
                    <img src={ClockIcon} alt="time left" />
                    {formattedTime}
                </div>
            </header>
        )
    }
)
