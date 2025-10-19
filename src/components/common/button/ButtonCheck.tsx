import PropTypes from 'prop-types'
import React, { useId, useState } from 'react'
import s from './ButtonCheck.module.css'

interface Props
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    mode?: 'dark' | 'light'
    size?: 'large' | 'extra-large' | 'medium' | 'small'
    variant?: 'glass' | 'outline' | 'flat'
    checked?: boolean
    defaultChecked?: boolean
    onChange?: (checked: boolean) => void
    icon?: React.ReactNode
    disabled?: boolean
}

export const ButtonCheck = ({
    mode = 'light',
    size = 'medium',
    variant = 'glass',
    checked: checkedProp,
    defaultChecked,
    onChange,
    icon,
    disabled,
    className = '',
    ...rest
}: Props) => {
    const isControlled = typeof checkedProp === 'boolean'
    const [uncontrolled, setUncontrolled] = useState<boolean>(!!defaultChecked)
    const checked = isControlled ? checkedProp : uncontrolled

    const id = useId()

    const handleClick = () => {
        if (disabled) return
        const next = !checked
        if (!isControlled) setUncontrolled(next)
        onChange?.(next)
    }

    return (
        <button
            {...rest}
            id={id}
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            onClick={handleClick}
            className={[
                s['button-check'],
                s[variant],
                s[mode],
                s[size],
                checked ? s.checked : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            data-spacing-mode={size}
        >
            <span className={s.icon} aria-hidden="true">
                {icon ?? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M5 12.5l4 4 10-10"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </span>
        </button>
    )
}

ButtonCheck.propTypes = {
    mode: PropTypes.oneOf(['dark', 'light']),
    size: PropTypes.oneOf(['large', 'extra-large', 'medium', 'small']),
    style: PropTypes.oneOf(['glass', 'outline', 'flat']),
}
export default ButtonCheck
