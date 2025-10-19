import React from 'react'
import s from './Card.module.css'

type Variant = 'glass' | 'outline' | 'flat'
type Mode = 'light' | 'dark'

export interface CardProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    variant?: Variant
    mode?: Mode
    title?: React.ReactNode
    subtitle?: React.ReactNode
    footer?: React.ReactNode
    direction?: 'vertical' | 'horizontal'
}

export default function Card({
    variant = 'glass',
    mode = 'light',
    title,
    subtitle,
    footer,
    direction = 'vertical',
    className = '',
    children,
    ...rest
}: CardProps) {
    return (
        <section
            {...rest}
            className={[
                s.root,
                s[variant],
                s[mode],
                s[direction],
                className,
            ].join(' ')}
        >
            {title && (
                <header className={s.header}>
                    <h3 className={s.h}>{title}</h3>
                    {subtitle && <p className={s.subtitle}>{subtitle}</p>}
                    <span className={s.underline} />
                </header>
            )}
            <div className={s.body}>{children}</div>
            {footer && <div className={s.footer}>{footer}</div>}
        </section>
    )
}
