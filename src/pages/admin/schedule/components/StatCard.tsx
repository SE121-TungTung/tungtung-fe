interface StatCardProps {
    label: string
    value: string | number
    color?: string
}

export default function StatCard({ label, value, color }: StatCardProps) {
    return (
        <div
            style={{
                padding: '16px 12px',
                borderRadius: 'var(--primitive-radius-sm)',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-soft)',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: color || 'var(--color-text-primary)',
                }}
            >
                {value}
            </div>

            <div
                style={{
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    marginTop: 4,
                }}
            >
                {label}
            </div>
        </div>
    )
}
