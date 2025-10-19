import React from 'react'
import s from './FormCard.module.css'

export interface FormCardProps
    extends React.FormHTMLAttributes<HTMLFormElement> {
    actionsAlign?: 'left' | 'center' | 'right' | 'stretch'
    hideActions?: boolean
    actions?: React.ReactNode
}

export default function FormCard({
    className = '',
    actionsAlign = 'stretch',
    hideActions,
    actions,
    children,
    ...rest
}: FormCardProps) {
    return (
        <form {...rest} className={[s.card, s.grid, className].join(' ')}>
            {children}
            {!hideActions && (
                <div
                    className={[s.actions, s[`actions-${actionsAlign}`]].join(
                        ' '
                    )}
                >
                    {actions}
                </div>
            )}
        </form>
    )
}

/* helper rows */
export function FormRow({
    compact,
    className = '',
    children,
    ...rest
}: React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }) {
    return (
        <div
            {...rest}
            className={[s.row, compact ? s.rowCompact : '', className].join(
                ' '
            )}
        >
            {children}
        </div>
    )
}
