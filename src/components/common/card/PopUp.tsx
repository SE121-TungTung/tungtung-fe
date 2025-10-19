import React, { useEffect, useRef } from 'react'
import s from './PopUp.module.css'

type Mode = 'light' | 'dark'
type Variant = 'glass' | 'flat' | 'outline'
type Size = 'sm' | 'md' | 'lg'

export interface PopUpProps extends React.HTMLAttributes<HTMLDivElement> {
    open: boolean
    onClose: () => void
    head?: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
    mode?: Mode
    variant?: Variant
    size?: Size
    dismissible?: boolean
    showClose?: boolean
}

export default function PopUp({
    open,
    onClose,
    head,
    description,
    actions,
    mode = 'light',
    variant = 'glass',
    size = 'md',
    dismissible = true,
    showClose = true,
    className = '',
    children,
    ...rest
}: PopUpProps) {
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open || !dismissible) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, dismissible, onClose])

    if (!open) return null

    return (
        <div
            className={s.overlay}
            onMouseDown={dismissible ? onClose : undefined}
        >
            <div
                {...rest}
                role="dialog"
                aria-modal="true"
                className={[
                    s.root,
                    s[mode],
                    s[variant],
                    s[size],
                    className,
                ].join(' ')}
                onMouseDown={(e) => e.stopPropagation()}
                ref={dialogRef}
            >
                {showClose && (
                    <button
                        className={s.close}
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path
                                d="M18 6L6 18M6 6l12 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                )}

                {(head || description) && (
                    <header className={s.header}>
                        {head && <h3 className={s.title}>{head}</h3>}
                        {description && <p className={s.desc}>{description}</p>}
                    </header>
                )}

                <div className={s.body}>{children}</div>

                {actions && <footer className={s.footer}>{actions}</footer>}
            </div>
        </div>
    )
}
