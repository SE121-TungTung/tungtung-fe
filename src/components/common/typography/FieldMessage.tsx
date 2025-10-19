import React, { useId } from 'react'
import s from './FieldMessage.module.css'

type Tone = 'error' | 'warning' | 'success' | 'info'
type Variant = 'chip' | 'text'
type Sz = 'sm' | 'md'

export interface FieldMessageProps
    extends React.HTMLAttributes<HTMLDivElement> {
    tone?: Tone
    variant?: Variant
    size?: Sz
    /** Nếu muốn dùng icon riêng */
    icon?: React.ReactNode
    /** Tự truyền id để nối với input; nếu không, component tự tạo */
    messageId?: string
}

export default function FieldMessage({
    tone = 'error',
    variant = 'chip',
    size = 'sm',
    icon,
    className = '',
    children,
    messageId,
    ...rest
}: FieldMessageProps) {
    const autoId = useId()
    const id = messageId ?? `fm-${autoId}`
    return (
        <div
            id={id}
            role="status"
            aria-live="polite"
            className={[s.root, className].join(' ')}
            data-tone={tone}
            data-variant={variant}
            data-size={size}
            {...rest}
        >
            <span className={s.icon} aria-hidden="true">
                {icon ??
                    (tone === 'success' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path
                                d="M5 12.5l4 4 10-10"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path
                                d="M12 7v7m0 3h.01M12 2 2 22h20L12 2Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    ))}
            </span>
            <span className={s.text}>{children}</span>
        </div>
    )
}
