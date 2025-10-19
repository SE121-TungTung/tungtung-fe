import React from 'react'
import s from './ButtonGlow.module.css'

type Mode = 'light' | 'dark'
type Variant = 'glass' | 'solid' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonGlowProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    mode?: Mode
    variant?: Variant
    size?: Size
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    block?: boolean
    loading?: boolean
    glow?: boolean
}

export default function ButtonGlow({
    mode = 'light',
    variant = 'glass',
    size = 'md',
    leftIcon,
    rightIcon,
    block,
    loading,
    glow = true,
    className = '',
    children,
    disabled,
    ...rest
}: ButtonGlowProps) {
    const cls = [
        s.root,
        s[mode],
        s[variant],
        s[size],
        block ? s.block : '',
        loading ? s.loading : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button
            className={cls}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {glow && <span className={s.aura} />}
            {leftIcon && <span className={s.icon}>{leftIcon}</span>}
            <span className={s.label}>{children}</span>
            {rightIcon && <span className={s.icon}>{rightIcon}</span>}
        </button>
    )
}
