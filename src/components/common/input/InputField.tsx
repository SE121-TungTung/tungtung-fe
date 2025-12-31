import React, { useId, useState, forwardRef } from 'react'
import s from './InputField.module.css'
import FieldMessage from '@/components/common/typography/FieldMessage'

import ActionEyeVisable from '@/assets/Action Eye Visible.svg'
import ActionEyeInvisable from '@/assets/Action Invisible.svg'

type Variant = 'glass' | 'neutral' | 'soft'
type Size = 'sm' | 'md' | 'lg'
type Mode = 'light' | 'dark'

export interface InputFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
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
    multiline?: boolean
    rows?: number
}

const InputField = forwardRef<
    HTMLInputElement | HTMLTextAreaElement,
    InputFieldProps
>(
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
            multiline = false,
            rows = 4,
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

        const isFile = type === 'file'

        // Logic cho password toggle (chỉ áp dụng nếu không phải multiline)
        const isPassword = type === 'password' && !multiline
        const inputType =
            isPassword && enablePasswordToggle
                ? reveal
                    ? 'text'
                    : 'password'
                : type

        // Class tổng hợp
        const wrapperClasses = [
            s.wrapper,
            s[`variant-${variant}`],
            s[`size-${uiSize}`],
            s[mode],
            fullWidth ? s.fullWidth : '',
            error ? s.invalid : '',
            multiline ? s.isMultiline : '',
            isFile ? s.isFile : '',
            className,
        ].join(' ')

        // Render chung cho Input hoặc Textarea
        const InputComponent = multiline ? 'textarea' : 'input'

        // Các props đặc thù cho từng loại
        const specificProps = multiline
            ? {
                  rows,
                  ...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>),
              }
            : {
                  type: inputType,
                  ...(rest as React.InputHTMLAttributes<HTMLInputElement>),
              }

        return (
            <div className={wrapperClasses}>
                {label && (
                    <label htmlFor={inputId} className={s.label}>
                        {label}
                    </label>
                )}

                <div className={s.inputContainer}>
                    {leftIcon && (
                        <span className={[s.icon, s.prefix].join(' ')}>
                            {leftIcon}
                        </span>
                    )}

                    <InputComponent
                        id={inputId}
                        // @ts-expect-error - Hỗ trợ ref cho cả 2 loại thẻ
                        ref={ref}
                        className={s.input}
                        {...specificProps}
                    />

                    {isPassword && enablePasswordToggle ? (
                        <button
                            type="button"
                            className={[s.icon, s.suffix, s.toggleBtn].join(
                                ' '
                            )}
                            onClick={() => setReveal(!reveal)}
                            tabIndex={-1}
                        >
                            <img
                                src={
                                    reveal
                                        ? ActionEyeVisable
                                        : ActionEyeInvisable
                                }
                                alt={reveal ? 'Hide password' : 'Show password'}
                            />
                        </button>
                    ) : (
                        rightIcon && (
                            <span className={[s.icon, s.suffix].join(' ')}>
                                {rightIcon}
                            </span>
                        )
                    )}
                </div>

                {error ? (
                    <FieldMessage
                        id={`${inputId}-error`}
                        variant="chip"
                        tone="error"
                    >
                        {error}
                    </FieldMessage>
                ) : (
                    hint && (
                        <FieldMessage
                            id={`${inputId}-hint`}
                            variant="chip"
                            tone="info"
                        >
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
