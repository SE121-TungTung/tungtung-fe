import React, { useId } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import s from './SelectField.module.css'
import FieldMessage from '@/components/common/typography/FieldMessage'
import IconCaretDown from '@/assets/Caret Down.svg'

type SelectOption = {
    label: string
    value: string | number
}

type Variant = 'glass' | 'neutral' | 'soft'
type Size = 'sm' | 'md' | 'lg'
type Mode = 'light' | 'dark'

interface SelectFieldProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    registration?: Partial<UseFormRegisterReturn>
    error?: string
    options: SelectOption[]
    variant?: Variant
    uiSize?: Size
    mode?: Mode
    fullWidth?: boolean
}

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    registration,
    error,
    options,
    id,
    variant = 'glass',
    uiSize = 'md',
    mode = 'light',
    fullWidth = true,
    className = '',
    ...props
}) => {
    const autoId = useId()
    const inputId = id || registration?.name || `sel-${autoId}`

    const wrapperClasses = [
        s.wrapper,
        s[`variant-${variant}`],
        s[`size-${uiSize}`],
        s[mode],
        fullWidth ? s.fullWidth : '',
        error ? s.invalid : '',
        className,
    ].join(' ')

    return (
        <div className={wrapperClasses}>
            <div className={s.labelRow}>
                {label && (
                    <label htmlFor={inputId} className={s.label}>
                        {label}
                    </label>
                )}
            </div>
            <div className={s.inputContainer}>
                <select
                    id={inputId}
                    className={s.select}
                    {...registration}
                    {...props}
                    aria-invalid={!!error}
                >
                    <option value="" disabled>
                        -- Chọn --
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className={s.icon}>
                    <img src={IconCaretDown} alt="Caret Down" />
                </div>
            </div>
            {error && (
                <FieldMessage variant="chip" tone="error">
                    {error}
                </FieldMessage>
            )}
        </div>
    )
}
