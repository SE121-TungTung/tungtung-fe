import React from 'react'
import ButtonGlow from '@/components/common/button/ButtonGlow'
import s from './ScheduleToday.module.css'
import LessonItem, {
    type Lesson,
} from '@/components/common/typography/LessonItem'
import Icon from '@/assets/Escape Top Right.svg'

export interface ScheduleTodayCardProps {
    title?: React.ReactNode
    sessions: Lesson[]
    onCheckIn?: () => void
    mode?: 'light' | 'dark'
    controls?: React.ReactNode
}

export default function ScheduleTodayCard({
    title = 'Lịch học hôm nay',
    sessions,
    onCheckIn,
    mode = 'light',
    controls,
}: ScheduleTodayCardProps) {
    return (
        <section className={`${s.root} ${s[mode]}`}>
            <header className={s.header}>
                <div>
                    <h3 className={s.h}>{title}</h3>
                    <span className={s.underline} />
                </div>
                <div className={s.controls}>
                    {controls}
                    {onCheckIn && (
                        <ButtonGlow
                            size="sm"
                            variant="outline"
                            mode={mode}
                            onClick={onCheckIn}
                            rightIcon={<img src={Icon} alt="refresh icon" />}
                        >
                            Điểm danh ngay
                        </ButtonGlow>
                    )}
                </div>
            </header>

            <div className={s.panel}>
                {sessions.length === 0 ? (
                    <div className={s.empty}>
                        Hôm nay bạn không có lịch học.
                    </div>
                ) : (
                    <div className={s.grid}>
                        {sessions.map((x) => (
                            <LessonItem key={x.id} {...x} mode={mode} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
