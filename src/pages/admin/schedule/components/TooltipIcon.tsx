import { useState } from 'react'

export default function TooltipIcon({ text }: { text: string }) {
    const [show, setShow] = useState(false)

    return (
        <span
            style={{
                position: 'relative',
                display: 'inline-flex',
                marginLeft: 6,
                flexShrink: 0,
            }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: show
                        ? 'var(--color-brand-primary)'
                        : 'var(--color-border-soft)',
                    color: show ? '#fff' : 'var(--color-text-muted)',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'help',
                    transition: 'all 0.15s ease',
                }}
            >
                ?
            </span>

            {show && (
                <span
                    style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 8px)',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 260,
                        padding: '10px 14px',
                        borderRadius: 'var(--primitive-radius-sm)',
                        background: 'var(--color-surface-raised)',
                        color: 'var(--color-text-primary)',
                        fontSize: 12,
                        lineHeight: 1.55,
                        fontWeight: 400,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                        border: '1px solid var(--color-border-soft)',
                        zIndex: 100,
                        pointerEvents: 'none',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                >
                    {text}
                    {/* Arrow */}
                    <span
                        style={{
                            position: 'absolute',
                            bottom: -5,
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: 8,
                            height: 8,
                            background: 'var(--color-surface-raised)',
                            borderRight: '1px solid var(--color-border-soft)',
                            borderBottom: '1px solid var(--color-border-soft)',
                        }}
                    />
                </span>
            )}
        </span>
    )
}
