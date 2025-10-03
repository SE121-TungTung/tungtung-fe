import s from './Button.module.css'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost'
    loading?: boolean
}
export function Button({
    variant = 'primary',
    loading,
    children,
    ...rest
}: Props) {
    return (
        <button
            className={`${s.btn} ${s[variant]}`}
            aria-busy={loading}
            {...rest}
        >
            {children}
        </button>
    )
}
