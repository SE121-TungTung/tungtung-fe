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
    onCtaClick?: () => void
    mode?: 'light' | 'dark'
}

export const TextHorizontal = ({
    className = '',
    icon,
    iconStyle = 'outline',
    title,
    description,
    ctaText,
    onCtaClick,
    mode = 'dark',
}: Props): JSX.Element => {
    return (
        <div
            className={`${s.textHorizontal} ${s[mode]} ${className}`}
            data-colors-mode="dark"
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
                <button className={s.ctaButton} onClick={onCtaClick}>
                    <span className={s.ctaText}>{ctaText}</span>
                    <img
                        src={ArrowRight}
                        className={s.arrowRight}
                        alt="arrow"
                    />
                </button>
            )}
        </div>
    )
}
