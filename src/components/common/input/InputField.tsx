import React, { useId, useState, forwardRef } from 'react'
import s from './InputField.module.css'
import ActionEyeVisable from '@/assets/Action Eye Visible.svg'
import ActionEyeInvisable from '@/assets/Action Invisible.svg'

type Variant = 'glass' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

export interface InputFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    hint?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    variant?: Variant
    uiSize?: Size
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

        const wrapCls = [
            s.wrapper,
            s[`size-${uiSize}`],
            s[`variant-${variant}`],
            fullWidth ? s.block : '',
            leftIcon ? s.withPrefix : '',
            rightIcon || (isPassword && enablePasswordToggle)
                ? s.withSuffix
                : '',
            error ? s.invalid : '',
            !error && rest['aria-invalid'] === false ? s.valid : '',
            className,
        ]
            .filter(Boolean)
            .join(' ')

        const describedBy =
            [hint ? `${inputId}-hint` : '', error ? `${inputId}-err` : '']
                .filter(Boolean)
                .join(' ') || undefined

        return (
            <div
                className={wrapCls}
                data-invalid={!!error}
                data-variant={variant}
            >
                {label && (
                    <label htmlFor={inputId} className={s.label}>
                        {label}
                    </label>
                )}

                <div className={s.fieldRow}>
                    {leftIcon && <span className={s.prefix}>{leftIcon}</span>}

                    <input
                        id={inputId}
                        ref={ref}
                        type={inputType}
                        className={s.input}
                        aria-invalid={!!error}
                        aria-describedby={describedBy}
                        {...rest}
                    />

                    {enablePasswordToggle && isPassword ? (
                        <button
                            type="button"
                            className={s.suffixBtn}
                            aria-label={
                                reveal ? 'Hide password' : 'Show password'
                            }
                            onClick={() => setReveal((v) => !v)}
                            tabIndex={-1}
                        >
                            {reveal ? (
                                <span className={s.icon}>
                                    <img src={ActionEyeVisable}></img>
                                </span>
                            ) : (
                                <span className={s.icon}>
                                    <img src={ActionEyeInvisable}></img>
                                </span>
                            )}
                            {/* <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                {reveal ? (
                                    <path
                                        fill="currentColor"
                                        d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0-3c6.5 0 10.5 6 10.5 6s-4 6-10.5 6S1.5 10 1.5 10 5.5 4 12 4Z"
                                    />
                                ) : (
                                    <path
                                        fill="currentColor"
                                        d="M2 3.3 3.3 2l18.7 18.7-1.3 1.3-3-3A15.6 15.6 0 0 1 12 18C5.5 18 1.5 12 1.5 12a26 26 0 0 1 5.2-5.4L2 3.3Zm8.8 3.6 6.3 6.2A5 5 0 0 0 10.8 6.9ZM12 8a4 4 0 0 0-4 4c0 .5.1 1 .3 1.4l5.1 5.1a4 4 0 0 0-1.4.1C5.5 18 1.5 12 1.5 12a26 26 0 0 1 5.2-5.4C8.1 6 10 5.5 12 5.5V8Z"
                                    />
                                )}
                            </svg> */}
                        </button>
                    ) : (
                        rightIcon && (
                            <span className={s.suffix}>{rightIcon}</span>
                        )
                    )}
                </div>

                {hint && !error && (
                    <div id={`${inputId}-hint`} className={s.hint}>
                        {hint}
                    </div>
                )}
                {error && (
                    <div id={`${inputId}-err`} className={s.error}>
                        {error}
                    </div>
                )}
            </div>
        )
    }
)

InputField.displayName = 'InputField'
export default InputField
