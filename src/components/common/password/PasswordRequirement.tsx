import s from './PasswordRequirements.module.css'

/**
 * PasswordRequirements Component
 *
 * Shows password validation rules with visual feedback
 * Highlights requirements that are met
 */

export interface PasswordRequirementsProps {
    password: string
    className?: string
}

interface Requirement {
    label: string
    test: (pwd: string) => boolean
}

const requirements: Requirement[] = [
    {
        label: 'Tối thiểu 8 ký tự',
        test: (pwd) => pwd.length >= 8,
    },
    {
        label: 'Ít nhất 1 chữ hoa (A-Z)',
        test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
        label: 'Ít nhất 1 chữ thường (a-z)',
        test: (pwd) => /[a-z]/.test(pwd),
    },
    {
        label: 'Ít nhất 1 chữ số (0-9)',
        test: (pwd) => /[0-9]/.test(pwd),
    },
]

export default function PasswordRequirements({
    password,
    className = '',
}: PasswordRequirementsProps) {
    return (
        <div className={`${s.container} ${className}`}>
            <div className={s.title}>Yêu cầu mật khẩu:</div>
            <ul className={s.list}>
                {requirements.map((req, index) => {
                    const isMet = password && req.test(password)
                    return (
                        <li
                            key={index}
                            className={`${s.item} ${isMet ? s.itemMet : ''}`}
                        >
                            <span className={s.icon}>{isMet ? '✓' : '○'}</span>
                            {req.label}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
