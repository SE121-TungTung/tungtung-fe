import { useState, type ReactNode } from 'react'
import s from './CollapsibleCard.module.css'

interface CollapsibleCardProps {
    title: ReactNode
    children: ReactNode
    defaultOpen?: boolean
    level?: 'section' | 'part' | 'group'
    actions?: ReactNode
}

export default function CollapsibleCard({
    title,
    children,
    defaultOpen = true,
    level = 'section',
    actions,
}: CollapsibleCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={`${s.container} ${s[level]}`}>
            <div className={s.header} onClick={() => setIsOpen(!isOpen)}>
                <div className={s.titleRow}>
                    <span className={s.chevron}>{isOpen ? '▼' : '▶'}</span>
                    <div className={s.title}>{title}</div>
                </div>
                {actions && (
                    <div
                        className={s.actions}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {actions}
                    </div>
                )}
            </div>

            {isOpen && <div className={s.content}>{children}</div>}
        </div>
    )
}
