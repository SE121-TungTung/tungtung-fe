// src/components/common/button/ButtonPrimary.tsx
import React from 'react'
import s from './ButtonPrimary.module.css'

type Variant = 'solid' | 'subtle' | 'outline' | 'ghost' | 'gradient' | 'glass'
type Tone = 'brand' | 'neutral' | 'success' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'xl'
type Shape = 'rounded' | 'pill'

export interface ButtonPrimaryProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    tone?: Tone
    size?: Size
    shape?: Shape
    block?: boolean
    iconOnly?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    loading?: boolean
}

export function ButtonPrimary({
    variant = 'solid',
    tone = 'brand',
    size = 'md',
    shape,
    block,
    iconOnly,
    leftIcon,
    rightIcon,
    loading = false,
    className = '',
    children,
    ...rest
}: ButtonPrimaryProps) {
    const classes = [
        s.btn,
        s[size],
        s[variant],
        s[`tone${(tone[0].toUpperCase() + tone.slice(1)) as Capitalize<Tone>}`],
        shape === 'pill' ? s.pill : shape === 'rounded' ? s.rounded : '',
        block ? s.block : '',
        iconOnly ? s.iconOnly : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button className={classes} aria-busy={loading || undefined} {...rest}>
            {leftIcon && <span className={s.icon}>{leftIcon}</span>}
            {children && <span className={s.label}>{children}</span>}
            {rightIcon && <span className={s.icon}>{rightIcon}</span>}
        </button>
    )
}
