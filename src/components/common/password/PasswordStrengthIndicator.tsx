import s from './PasswordStrengthIndicator.module.css'

/**
 * PasswordStrengthIndicator Component
 *
 * Visual indicator for password strength
 * Shows strength bar and label
 */

export interface PasswordStrengthIndicatorProps {
    password: string
    className?: string
}

function getPasswordStrength(password: string) {
    if (!password) return { label: '', percent: 0, color: '' }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25

    if (strength <= 25)
        return {
            label: 'Yếu',
            percent: 25,
            color: 'var(--color-status-danger)',
        }
    if (strength <= 50)
        return {
            label: 'Trung bình',
            percent: 50,
            color: 'var(--color-status-warning)',
        }
    if (strength <= 75)
        return {
            label: 'Khá',
            percent: 75,
            color: 'var(--color-status-success)',
        }
    return { label: 'Mạnh', percent: 100, color: 'var(--color-status-success)' }
}

export default function PasswordStrengthIndicator({
    password,
    className = '',
}: PasswordStrengthIndicatorProps) {
    const strength = getPasswordStrength(password)

    if (!password) return null

    return (
        <div className={`${s.container} ${className}`}>
            <div className={s.header}>
                <span className={s.label}>Độ mạnh mật khẩu:</span>
                <span
                    className={s.strengthLabel}
                    style={{ color: strength.color }}
                >
                    {strength.label}
                </span>
            </div>
            <div className={s.barTrack}>
                <div
                    className={s.barFill}
                    style={{
                        width: `${strength.percent}%`,
                        background: strength.color,
                    }}
                />
            </div>
        </div>
    )
}
