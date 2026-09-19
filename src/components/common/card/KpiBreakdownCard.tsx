import React, { useState, useEffect } from 'react'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import type {
    KPIRecordDetail,
    ApprovalStatus,
    MetricActualValueInput,
} from '@/types/kpi.types'

interface KpiBreakdownCardProps {
    data?: KPIRecordDetail | null
    readOnly?: boolean
    onSaveMetrics?: (metrics: MetricActualValueInput[]) => void
    isSaving?: boolean
    onSaveTeachingHours?: (hours: number) => void
    isSavingTeachingHours?: boolean
}

function getApprovalBadge(status: ApprovalStatus) {
    const map: Record<
        ApprovalStatus,
        { bg: string; fg: string; label: string }
    > = {
        DRAFT: { bg: '#64748b18', fg: '#64748b', label: 'Nháp' },
        SUBMITTED: { bg: '#3b82f618', fg: '#2563eb', label: 'Chờ duyệt' },
        APPROVED: { bg: '#22c55e18', fg: '#16a34a', label: 'Đã duyệt' },
        REJECTED: { bg: '#ef444418', fg: '#dc2626', label: 'Từ chối' },
    }
    const c = map[status] ?? map.DRAFT
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: c.bg,
                color: c.fg,
            }}
        >
            {c.label}
        </span>
    )
}

function formatScore(v: number | null | undefined): string {
    if (v == null) return '—'
    // If score is between 0 and 1 (weight-based), show as percentage
    if (v <= 1) return (v * 100).toFixed(1) + '%'
    return v.toFixed(2)
}

function formatCurrency(v: number | null | undefined): string {
    if (v == null) return '—'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(v)
}

export const KpiBreakdownCard: React.FC<KpiBreakdownCardProps> = ({
    data,
    readOnly = true,
    onSaveMetrics,
    isSaving = false,
    onSaveTeachingHours,
    isSavingTeachingHours = false,
}) => {
    const [edits, setEdits] = useState<Record<string, string>>({})
    const [hoursEdit, setHoursEdit] = useState<string>('')

    useEffect(() => {
        setEdits({})
        setHoursEdit(data?.teaching_hours?.toString() ?? '')
    }, [data])

    if (!data) return null

    const handleEditChange = (metricCode: string, value: string) => {
        setEdits((prev) => ({ ...prev, [metricCode]: value }))
    }

    const handleSave = () => {
        if (!onSaveMetrics) return
        const metricList = Object.entries(edits)
            .map(([metric_code, val]) => ({
                metric_code,
                actual_value: parseFloat(val),
            }))
            .filter((m) => !isNaN(m.actual_value))

        if (metricList.length > 0) {
            onSaveMetrics(metricList)
        }
    }

    const hasEdits = Object.keys(edits).length > 0

    return (
        <Card variant="glass" style={{ padding: '24px' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                }}
            >
                <h3 style={{ margin: 0 }}>
                    Chi tiết KPI — {data.period?.name ?? ''}
                </h3>
                {getApprovalBadge(data.approval_status)}
            </div>

            {data.staff_name && (
                <p
                    style={{
                        margin: '0 0 4px',
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    Nhân viên: <strong>{data.staff_name}</strong>
                    {data.staff_contract && (
                        <span style={{ marginLeft: 8, opacity: 0.7 }}>
                            ({data.staff_contract})
                        </span>
                    )}
                </p>
            )}
            {data.template && (
                <p
                    style={{
                        margin: '0 0 16px',
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                        opacity: 0.7,
                    }}
                >
                    Template: {data.template.name} (v{data.template.version})
                </p>
            )}

            {/* Metric Table */}
            <div style={{ marginTop: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Mã</th>
                            <th style={{ ...thStyle, textAlign: 'left' }}>
                                Tiêu chí
                            </th>
                            <th style={thStyle}>Đơn vị</th>
                            <th style={thStyle}>Trọng số</th>
                            <th style={thStyle}>Giá trị thực</th>
                            <th style={thStyle}>Điểm quy đổi</th>
                            <th style={thStyle}>Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.metrics.map((m) => {
                            const isGroup = m.is_group_header
                            return (
                                <tr
                                    key={m.id}
                                    style={{
                                        background: isGroup
                                            ? 'var(--color-surface-raised)'
                                            : undefined,
                                        fontWeight: isGroup ? 700 : 400,
                                    }}
                                >
                                    <td style={tdStyle}>
                                        <code
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: isGroup
                                                    ? 'var(--color-brand-primary)'
                                                    : 'var(--color-text-secondary)',
                                            }}
                                        >
                                            {m.metric_code}
                                        </code>
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'left',
                                            paddingLeft: isGroup ? 12 : 24,
                                        }}
                                    >
                                        {m.metric_name}
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            textAlign: 'center',
                                            color: 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {isGroup ? '' : m.unit || '—'}
                                    </td>
                                    <td style={tdStyle}>
                                        {isGroup
                                            ? m.group_weight != null
                                                ? `${(m.group_weight * 100).toFixed(0)}%`
                                                : '—'
                                            : m.weight != null
                                              ? `${(m.weight * 100).toFixed(0)}%`
                                              : '—'}
                                    </td>
                                    <td style={tdStyle}>
                                        {isGroup ? (
                                            ''
                                        ) : !readOnly ? (
                                            <input
                                                type="number"
                                                step={
                                                    m.unit === '%'
                                                        ? '0.01'
                                                        : '0.1'
                                                }
                                                style={{
                                                    width: '80px',
                                                    textAlign: 'right',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--color-border-soft)',
                                                }}
                                                value={
                                                    edits[m.metric_code] ??
                                                    m.actual_value ??
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        m.metric_code,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : m.actual_value != null ? (
                                            m.unit === '%' ? (
                                                `${(m.actual_value * 100).toFixed(1)}%`
                                            ) : (
                                                m.actual_value.toFixed(2)
                                            )
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            fontWeight: isGroup ? 700 : 600,
                                            color: isGroup
                                                ? 'var(--color-brand-primary)'
                                                : undefined,
                                        }}
                                    >
                                        {m.converted_score != null
                                            ? formatScore(m.converted_score)
                                            : '—'}
                                    </td>
                                    <td
                                        style={{
                                            ...tdStyle,
                                            fontSize: 12,
                                            color: m.note
                                                ? '#ef4444'
                                                : 'var(--color-text-secondary)',
                                        }}
                                    >
                                        {m.note ?? ''}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div
                style={{
                    marginTop: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--color-surface-raised)',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '16px',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--color-text-secondary)',
                            marginBottom: 4,
                        }}
                    >
                        Tổng điểm
                    </div>
                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: 'var(--color-brand-primary)',
                        }}
                    >
                        {data.total_score != null
                            ? formatScore(data.total_score)
                            : '—'}
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--color-text-secondary)',
                            marginBottom: 4,
                        }}
                    >
                        Thưởng KPI
                    </div>
                    <div
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#16a34a',
                        }}
                    >
                        {formatCurrency(data.bonus_amount)}
                    </div>
                </div>
                {data.staff_contract === 'PART_TIME' && !readOnly ? (
                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 4,
                            }}
                        >
                            Số giờ dạy
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="number"
                                step="0.5"
                                value={hoursEdit}
                                onChange={(e) => setHoursEdit(e.target.value)}
                                style={{
                                    width: '80px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--color-border-soft)',
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            />
                            {hoursEdit !== data.teaching_hours?.toString() &&
                                onSaveTeachingHours && (
                                    <ButtonPrimary
                                        size="sm"
                                        disabled={isSavingTeachingHours}
                                        onClick={() =>
                                            onSaveTeachingHours(
                                                parseFloat(hoursEdit || '0')
                                            )
                                        }
                                        style={{
                                            padding: '4px 8px',
                                            height: 'auto',
                                            minHeight: 0,
                                        }}
                                    >
                                        Lưu
                                    </ButtonPrimary>
                                )}
                        </div>
                    </div>
                ) : data.teaching_hours != null ? (
                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--color-text-secondary)',
                                marginBottom: 4,
                            }}
                        >
                            Số giờ dạy
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700 }}>
                            {data.teaching_hours}h
                        </div>
                    </div>
                ) : null}
            </div>

            {data.rejection_note && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: '#fef2f2',
                        borderRadius: 8,
                        border: '1px solid #fecaca',
                        fontSize: 14,
                        color: '#991b1b',
                    }}
                >
                    <strong>Lý do từ chối:</strong> {data.rejection_note}
                </div>
            )}

            {!readOnly && (
                <div
                    style={{
                        marginTop: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        * Quản trị viên nhập giá trị thực cho các tiêu chí thủ
                        công hoặc ghi đè các tiêu chí tự động và nhấn Lưu thay
                        đổi trước khi tính lại điểm.
                    </p>
                    {onSaveMetrics && (
                        <ButtonPrimary
                            disabled={!hasEdits || isSaving}
                            onClick={handleSave}
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu lại các thay đổi'}
                        </ButtonPrimary>
                    )}
                </div>
            )}
        </Card>
    )
}

const thStyle: React.CSSProperties = {
    textAlign: 'right',
    padding: '10px 12px',
    borderBottom: '2px solid var(--color-border-soft)',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
    textAlign: 'right',
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-border-soft)',
    fontSize: 14,
    verticalAlign: 'middle',
}
