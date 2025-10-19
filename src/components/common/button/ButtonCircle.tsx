import React from 'react'
import s from './ButtonCircle.module.css'

type Mode = 'light' | 'dark'
type Variant = 'glass' | 'solid' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonCircleProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    mode?: Mode
    variant?: Variant
    size?: Size
    glow?: boolean
    loading?: boolean
    selected?: boolean
    /** icon nằm bên trong nút; nếu không có text hãy truyền aria-label */
    children?: React.ReactNode
}

export default function ButtonCircle({
    mode = 'light',
    variant = 'glass',
    size = 'md',
    glow = true,
    loading,
    selected,
    className = '',
    children,
    disabled,
    ...rest
}: ButtonCircleProps) {
    const cls = [
        s.root,
        s[mode],
        s[variant],
        s[size],
        selected ? s.selected : '',
        loading ? s.loading : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            type="button"
            className={cls}
            disabled={disabled || loading}
            aria-pressed={selected || undefined}
            aria-busy={loading || undefined}
            {...rest}
        >
            {glow && <span className={s.aura} aria-hidden="true" />}
            <span className={s.icon}>
                {loading ? <span className={s.spinner} /> : children}
            </span>
        </button>
    )
}
