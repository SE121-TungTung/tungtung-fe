import React from 'react'
import s from './TextHeader.module.css'
import ClockIcon from '@/assets/History.svg'

interface TestHeaderProps {
    skillName: string
    icon?: React.ReactNode
    timeLeft: number
    formattedTime: string
    isLowTime: boolean
    onPauseExit?: () => void
}

export const TestHeader = React.memo(
    ({
        skillName,
        icon,
        formattedTime,
        isLowTime,
        onPauseExit,
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
                <div className={s.rightActions}>
                    <div
                        className={s.timer}
                        title="Thời gian còn lại"
                        style={timerStyle}
                    >
                        <img src={ClockIcon} alt="time left" />
                        {formattedTime}
                    </div>

                    {onPauseExit && (
                        <button
                            type="button"
                            onClick={onPauseExit}
                            className={s.pauseBtn}
                            title="Tạm dừng bài thi và lưu tiến trình"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <rect
                                    x="6"
                                    y="4"
                                    width="4"
                                    height="16"
                                    rx="1"
                                />
                                <rect
                                    x="14"
                                    y="4"
                                    width="4"
                                    height="16"
                                    rx="1"
                                />
                            </svg>
                            <span>Tạm dừng</span>
                        </button>
                    )}
                </div>
            </header>
        )
    }
)
