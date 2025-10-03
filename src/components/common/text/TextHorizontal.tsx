import PropTypes from 'prop-types'
import { type JSX } from 'react'
import ArrowRight from '@/assets/Arrow Right.svg'
import { ButtonLogo } from '@/components/common/button/ButtonLogo'
import ChatSquareDoubleText from '@/assets/Chat Square Double Text.svg'
import s from '@/components/common/text/TextHorizontal.module.css'

interface Props {
    className?: string
    buttonLogoIcon?: JSX.Element
    buttonLogoStyle?: 'outline' | 'flat' | 'glass'
    text?: string
    buttonPrimaryClassName?: string
    text1?: string
}

export const TextHorizontal = ({
    className = '',
    buttonLogoIcon = (
        <img
            src={ChatSquareDoubleText}
            className={s['chat-square-double']}
            alt="chat icon"
        />
    ),
    buttonLogoStyle = 'outline',
    text = 'TungTung - Website quản lý trung tâm Anh ngữ số 1 Việt Nam, cung cấp hệ sinh thái đa dạng cho người dạy lẫn người học',
    buttonPrimaryClassName = '',
    text1 = 'Tìm hiểu thêm',
}: Props): JSX.Element => {
    return (
        <div
            className={`${s['text-horizontal']} ${className}`}
            data-colors-mode="dark"
        >
            <ButtonLogo
                className={s['button-logo-instance']}
                icon={buttonLogoIcon}
                mode="light"
                size="extra-large"
                style={buttonLogoStyle}
            />
            <p className={s['part-of-a-team-of']}>{text}</p>

            <div className={`${s['button-primary']} ${buttonPrimaryClassName}`}>
                <span className={s.primary}>{text1}</span>
                <img
                    src={ArrowRight}
                    className={s['arrow-right']}
                    alt="arrow"
                />
            </div>
        </div>
    )
}

TextHorizontal.propTypes = {
    buttonLogoStyle: PropTypes.oneOf(['glass', 'outline', 'flat']),
    buttonLogoPolygon: PropTypes.string,
    text: PropTypes.string,
    text1: PropTypes.string,
}
