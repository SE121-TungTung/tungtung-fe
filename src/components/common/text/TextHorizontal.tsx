import React, { type JSX } from 'react'
import ArrowRight from '@/assets/Arrow Right.svg'
import { ButtonLogo } from '@/components/common/button/ButtonLogo'
import s from './TextHorizontal.module.css'

interface Props {
    className?: string
    icon?: JSX.Element
    iconStyle?: 'outline' | 'flat' | 'glass'
    title?: React.ReactNode
    description?: React.ReactNode
    ctaText?: string
    onClick?: () => void
    mode?: 'light' | 'dark'
}

export const TextHorizontal = ({
    className = '',
    icon,
    iconStyle = 'outline',
    title,
    description,
    ctaText,
    onClick,
    mode = 'dark',
}: Props): JSX.Element => {
    const isClickable = !!onClick
    const clickableClass = isClickable ? s.clickable : ''

    return (
        <div
            className={`${s.textHorizontal} ${s[mode]} ${clickableClass} ${className}`}
            data-colors-mode="dark"
            onClick={onClick}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            {icon && (
                <ButtonLogo
                    className={s.buttonLogo}
                    icon={icon}
                    mode={mode}
                    size="extra-large"
                    style={iconStyle}
                />
            )}

            <div className={s.content}>
                {title && <h4 className={s.title}>{title}</h4>}
                {description && <p className={s.description}>{description}</p>}
            </div>

            {ctaText && (
                <div className={s.ctaButton}>
                    <span className={s.ctaText}>{ctaText}</span>
                    <img
                        src={ArrowRight}
                        className={s.arrowRight}
                        alt="arrow"
                    />
                </div>
            )}

            {!ctaText && onClick && (
                <img
                    src={ArrowRight}
                    className={s.arrowRightBase}
                    alt="arrow"
                />
            )}
        </div>
    )
}
