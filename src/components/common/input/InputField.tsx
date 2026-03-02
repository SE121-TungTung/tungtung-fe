import React, { useId, useState, forwardRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
    enableMarkdown?: boolean // Thuộc tính mới
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
            enableMarkdown = false,
            fullWidth,
            enablePasswordToggle,
            multiline = false,
            rows = 4,
            type = 'text',
            className = '',
            value,
            id,
            ...rest
        },
        ref
    ) => {
        const autoId = useId()
        const inputId = id ?? `in-${autoId}`

        const [reveal, setReveal] = useState(false)
        const [isPreview, setIsPreview] = useState(false)

        const isPassword = type === 'password' && !multiline
        const isFile = type === 'file'

        const inputType =
            isPassword && enablePasswordToggle
                ? reveal
                    ? 'text'
                    : 'password'
                : type

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

        const InputComponent = multiline ? 'textarea' : 'input'

        return (
            <div className={wrapperClasses}>
                <div className={s.labelRow}>
                    {label && (
                        <label htmlFor={inputId} className={s.label}>
                            {label}
                        </label>
                    )}

                    {enableMarkdown && multiline && (
                        <div className={s.mdTabs}>
                            <button
                                type="button"
                                className={!isPreview ? s.activeTab : ''}
                                onClick={() => setIsPreview(false)}
                            >
                                Soạn thảo
                            </button>
                            <button
                                type="button"
                                className={isPreview ? s.activeTab : ''}
                                onClick={() => setIsPreview(true)}
                            >
                                Xem trước
                            </button>
                        </div>
                    )}
                </div>

                <div className={s.inputContainer}>
                    {leftIcon && !isPreview && (
                        <span className={[s.icon, s.prefix].join(' ')}>
                            {leftIcon}
                        </span>
                    )}

                    {isPreview && enableMarkdown && multiline ? (
                        <div
                            className={`${s.input} ${s.previewArea}`}
                            style={{ minHeight: `${rows * 24}px` }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {String(value || '')}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <InputComponent
                            id={inputId}
                            // @ts-expect-error - TS doesn't recognize dynamic component with ref
                            ref={ref}
                            className={s.input}
                            type={multiline ? undefined : inputType}
                            rows={multiline ? rows : undefined}
                            value={value}
                            {...rest}
                        />
                    )}

                    {/* Toggle Password Icon */}
                    {isPassword && enablePasswordToggle && !multiline ? (
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
                        rightIcon &&
                        !isPreview && (
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
