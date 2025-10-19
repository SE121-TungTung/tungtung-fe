import React, { type JSX } from 'react'
import Card, { type CardProps } from './Card'
import s from './StatCard.module.css'
import { ButtonLogo } from '../button/ButtonLogo'

export interface StatCardProps extends Omit<CardProps, 'children' | 'title'> {
    icon?: JSX.Element
    title: React.ReactNode
    subtitle?: React.ReactNode
    value: React.ReactNode
    unit?: React.ReactNode
    active?: boolean
    mode?: 'light' | 'dark'
}

export default function StatCard({
    icon,
    title,
    subtitle,
    value,
    unit,
    active,
    mode = 'light',
    ...card
}: StatCardProps) {
    return (
        <Card
            {...card}
            mode={mode}
            className={[
                s.stat,
                s[mode],
                active ? s.active : '',
                card.className || '',
            ].join(' ')}
        >
            <div className={s.row}>
                <div className={s.meta}>
                    <ButtonLogo
                        className={s['button-logo-instance']}
                        icon={icon}
                        mode={mode}
                        size="small"
                        style="flat"
                    />
                    <h4 className={s.title}>{title}</h4>
                    <hr className={s.divider} />
                    {subtitle && <p className={s.sub}>{subtitle}</p>}
                    <div className={s.bar}></div>
                </div>
                <div className={s.value}>
                    <strong className={s.num}>{value}</strong>
                    {unit && <span className={s.unit}>{unit}</span>}
                </div>
            </div>
        </Card>
    )
}
