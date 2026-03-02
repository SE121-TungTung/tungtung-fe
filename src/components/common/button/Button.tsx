import React from 'react'
import s from './Button.module.css'

export type ButtonVariant =
    | 'solid' // Filled button with background
    | 'subtle' // Soft background fill
    | 'outline' // Border with transparent bg
    | 'ghost' // No border, transparent bg
    | 'gradient' // Gradient background
    | 'glass' // Frosted glass effect

export type ButtonTone =
    | 'brand' // Primary brand color
    | 'neutral' // Neutral gray
    | 'success' // Success green
    | 'danger' // Danger red
    | 'accent' // Accent cyan

export type ButtonSize =
    | 'xs' // Extra small
    | 'sm' // Small
    | 'md' // Medium (default)
    | 'lg' // Large
    | 'xl' // Extra large

export type ButtonShape =
    | 'default' // Normal radius
    | 'rounded' // More rounded
    | 'pill' // Fully rounded (9999px)
    | 'square' // No radius

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual style variant */
    variant?: ButtonVariant

    /** Color tone */
    tone?: ButtonTone

    /** Button size */
    size?: ButtonSize

    /** Border radius style */
    shape?: ButtonShape

    /** Full width button */
    block?: boolean

    /** Icon-only button (square) */
    iconOnly?: boolean

    /** Selected/active state (for ghost buttons) */
    selected?: boolean

    /** Show glow effect (for glass/gradient variants) */
    glow?: boolean

    /** Loading state with spinner */
    loading?: boolean

    /** Left icon element */
    leftIcon?: React.ReactNode

    /** Right icon element */
    rightIcon?: React.ReactNode

    /** Elevated shadow */
    elevated?: boolean

    /** Flat (no shadow) */
    flat?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'solid',
            tone = 'brand',
            size = 'md',
            shape = 'default',
            block = false,
            iconOnly = false,
            selected = false,
            glow = false,
            loading = false,
            leftIcon,
            rightIcon,
            elevated = false,
            flat = false,
            className = '',
            children,
            disabled,
            ...rest
        },
        ref
    ) => {
        // Build class names
        const classes = [
            s.btn,
            s[`variant-${variant}`],
            s[`tone-${tone}`],
            s[`size-${size}`],
            shape !== 'default' && s[`shape-${shape}`],
            block && s.block,
            iconOnly && s.iconOnly,
            selected && s.selected,
            elevated && s.elevated,
            flat && s.flat,
            loading && s.loading,
            className,
        ]
            .filter(Boolean)
            .join(' ')

        // Show glow for gradient/glass variants by default, or if explicitly enabled
        const shouldShowGlow =
            glow || variant === 'gradient' || (variant === 'glass' && glow)

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
                aria-pressed={selected || undefined}
                {...rest}
            >
                {shouldShowGlow && (
                    <span className={s.glow} aria-hidden="true" />
                )}

                {leftIcon && (
                    <span className={s.icon} aria-hidden="true">
                        {leftIcon}
                    </span>
                )}

                {children && <span className={s.label}>{children}</span>}

                {rightIcon && (
                    <span className={s.icon} aria-hidden="true">
                        {rightIcon}
                    </span>
                )}

                {loading && (
                    <span
                        className={s.spinner}
                        aria-label="Loading"
                        role="status"
                    />
                )}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
