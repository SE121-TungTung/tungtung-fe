import React from 'react'
import s from './TextCheck.module.css'
import { ButtonCheck } from '@/components/common/button/ButtonCheck'

export type TextCheckMode = 'light' | 'dark'
export type TextCheckVariant = 'glass' | 'outline' | 'flat'
export type TextCheckSize = 'sm' | 'md' | 'lg'

export interface TextCheckProps
    extends React.LabelHTMLAttributes<HTMLLabelElement> {
    mode?: TextCheckMode
    variant?: TextCheckVariant
    size?: TextCheckSize
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
    disabled?: boolean
    icon?: React.ReactNode
}

export default function TextCheck({
    mode = 'light',
    variant = 'glass',
    size = 'md',
    checked,
    defaultChecked,
    onCheckedChange,
    inputProps,
    disabled,
    icon,
    className = '',
    children,
    ...rest
}: TextCheckProps) {
    // map size to ButtonCheck size
    const btnSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'

    return (
        <label
            {...rest}
            className={[s.root, className].filter(Boolean).join(' ')}
            data-mode={mode}
            data-variant={variant}
            data-size={size}
            aria-disabled={disabled || undefined}
        >
            {/* native checkbox để form submit/rhf đọc được */}
            <input
                type="checkbox"
                className={s.native}
                disabled={disabled}
                checked={checked}
                defaultChecked={defaultChecked}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                {...inputProps}
            />

            <ButtonCheck
                mode={mode}
                variant={variant}
                size={btnSize as 'small' | 'medium' | 'large'}
                checked={checked}
                defaultChecked={defaultChecked}
                onChange={onCheckedChange}
                disabled={disabled}
                icon={icon}
                className={s.control}
                aria-hidden="true"
                tabIndex={-1}
            />

            <span className={s.text}>{children}</span>
        </label>
    )
}
