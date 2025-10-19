import PropTypes from 'prop-types'
import { type JSX } from 'react'
import FigmaLogo from '@/assets/react.svg'
import s from './ButtonLogo.module.css'

interface Props {
    mode: 'dark' | 'light'
    size: 'large' | 'extra-large' | 'medium' | 'small'
    style: 'glass' | 'outline' | 'flat'
    className?: string
    icon?: JSX.Element
}

export const ButtonLogo = ({
    mode = 'light',
    size = 'extra-large',
    style = 'glass',
    className = '',
    icon = <img src={FigmaLogo} alt="logo" />,
}: Props): JSX.Element => {
    return (
        <button
            className={`${s['button-logo']} ${s[style]} ${s[mode]} ${s[size]} ${className}`}
            data-spacing-mode={size}
        >
            <span className={`${s.icon} ${s[mode]}`}>{icon}</span>
        </button>
    )
}

ButtonLogo.propTypes = {
    mode: PropTypes.oneOf(['dark', 'light']),
    size: PropTypes.oneOf(['large', 'extra-large', 'medium', 'small']),
    style: PropTypes.oneOf(['glass', 'outline', 'flat']),
    polygon: PropTypes.string,
}
