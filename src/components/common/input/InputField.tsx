import React, { useId, useState, forwardRef } from 'react'
import s from './InputField.module.css'
import FieldMessage from '@/components/common/typography/FieldMessage'

// Import SVG URLs directly
import ActionEyeVisable from '@/assets/Action Eye Visible.svg'
import ActionEyeInvisable from '@/assets/Action Invisible.svg'

type Variant = 'glass' | 'neutral' | 'soft'
type Size = 'sm' | 'md' | 'lg'
type Mode = 'light' | 'dark'

export interface InputFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    hint?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    variant?: Variant
    uiSize?: Size
    mode?: Mode
    fullWidth?: boolean
    enablePasswordToggle?: boolean
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    (
        {
            label,
            hint,
            error,
            leftIcon,
            rightIcon,
            variant = 'glass',
            uiSize = 'md',
            mode = 'light',
            fullWidth,
            enablePasswordToggle,
            type = 'text',
            className = '',
            id,
            ...rest
        },
        ref
    ) => {
        const autoId = useId()
        const inputId = id ?? `in-${autoId}`

        const [reveal, setReveal] = useState(false)
        const isPassword = type === 'password'
        const inputType =
            isPassword && enablePasswordToggle
                ? reveal
                    ? 'text'
                    : 'password'
                : type

        const hasLeftIcon = Boolean(leftIcon)
        const hasRightIcon =
            Boolean(rightIcon) || (isPassword && enablePasswordToggle)

        const wrapCls = [
            s.wrapper,
            s[mode],
            s[`size-${uiSize}`],
            error ? s.invalid : '',
            fullWidth ? s.block : '',
            className,
        ]
            .filter(Boolean)
            .join(' ')

        const inputCls = [
            s.input,
            s[`variant-${variant}`],
            hasLeftIcon ? s.withPrefix : '',
            hasRightIcon ? s.withSuffix : '',
        ]
            .filter(Boolean)
            .join(' ')

        return (
            <div className={wrapCls} data-testid="input-field-wrapper">
                {label && (
                    <label htmlFor={inputId} className={s.label}>
                        {label}
                    </label>
                )}
                {/* Icons are positioned absolutely relative to the wrapper */}
                {leftIcon && (
                    <span className={[s.icon, s.prefix].join(' ')}>
                        {leftIcon}
                    </span>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={inputType}
                    className={inputCls}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...rest}
                />
                {isPassword && enablePasswordToggle ? (
                    <button
                        type="button"
                        className={[s.icon, s.suffix, s.toggle].join(' ')}
                        onClick={() => setReveal(!reveal)}
                        aria-label={reveal ? 'Hide password' : 'Show password'}
                        title={reveal ? 'Hide password' : 'Show password'}
                    >
                        {/* Render SVGs inside an <img> tag */}
                        {reveal ? (
                            <img src={ActionEyeVisable} alt="Hide password" />
                        ) : (
                            <img src={ActionEyeInvisable} alt="Show password" />
                        )}
                    </button>
                ) : (
                    rightIcon && (
                        <span className={[s.icon, s.suffix].join(' ')}>
                            {rightIcon}
                        </span>
                    )
                )}
                {/* Field Messages */}
                {error ? (
                    <FieldMessage id={`${inputId}-error`} variant="chip">
                        {error}
                    </FieldMessage>
                ) : (
                    hint && (
                        <FieldMessage id={`${inputId}-hint`} variant="chip">
                            {hint}
                        </FieldMessage>
                    )
                )}
            </div>
        )
    }
)

InputField.displayName = 'InputField'
export default InputField
