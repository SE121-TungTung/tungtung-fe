import type { GARunStatus } from '@/types/ga-schedule.types'

const STATUS_MAP: Record<
    GARunStatus,
    { bg: string; color: string; label: string }
> = {
    pending: {
        bg: 'var(--color-status-warning-bg)',
        color: 'var(--color-status-warning)',
        label: 'Chờ',
    },
    running: {
        bg: 'var(--color-status-info-bg)',
        color: 'var(--color-status-info)',
        label: 'Đang chạy',
    },
    completed: {
        bg: 'var(--color-status-success-bg)',
        color: 'var(--color-status-success)',
        label: 'Hoàn tất',
    },
    failed: {
        bg: 'var(--color-status-danger-bg)',
        color: 'var(--color-status-danger)',
        label: 'Lỗi',
    },
    applied: {
        bg: 'var(--color-brand-primary)',
        color: '#fff',
        label: 'Đã áp dụng',
    },
}

export default function StatusBadge({ status }: { status: GARunStatus }) {
    const s = STATUS_MAP[status] || STATUS_MAP.pending

    return (
        <span
            style={{
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
                background: s.bg,
                color: s.color,
            }}
        >
            {s.label}
        </span>
    )
}
