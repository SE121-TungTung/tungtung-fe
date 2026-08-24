import type { GARunStatus } from '@/types/ga-schedule.types'
import StatusBadge from './StatusBadge'

interface RunStatusCardProps {
    status: GARunStatus
    detail?: any
}

export default function RunStatusCard({ status }: RunStatusCardProps) {
    const isPolling = status === 'pending' || status === 'running'

    return (
        <div
            style={{
                padding: 32,
                borderRadius: 'var(--primitive-radius-md)',
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-soft)',
                textAlign: 'center',
                minWidth: 400,
            }}
        >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
                {status === 'pending'
                    ? '⏳'
                    : status === 'running'
                      ? '🧬'
                      : status === 'completed'
                        ? '✅'
                        : '❌'}
            </div>

            <StatusBadge status={status} />

            <div
                style={{
                    fontSize: 14,
                    color: 'var(--color-text-secondary)',
                    marginTop: 12,
                }}
            >
                {status === 'pending' && 'Đang khởi tạo GA...'}
                {status === 'running' &&
                    'Thuật toán đang tối ưu hóa thời khóa biểu...'}
                {status === 'completed' && 'GA đã hoàn tất!'}
                {status === 'failed' && 'GA thất bại.'}
            </div>

            {isPolling && (
                <div
                    style={{
                        marginTop: 16,
                        height: 4,
                        borderRadius: 2,
                        background: 'var(--color-border-soft)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: '30%',
                            background: 'var(--color-brand-primary)',
                            borderRadius: 2,
                            animation: 'shimmer 1.5s infinite',
                        }}
                    />
                </div>
            )}
        </div>
    )
}
