import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import kpiS from './AdminKpiOverviewPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/common/state/EmptyState'
import {
    useKpiTemplates,
    useKpiTemplate,
    useCreateKpiTemplate,
    useUpdateKpiTemplate,
} from '@/hooks/domain/useKpi'
import { Modal } from '@/components/core/Modal'
import type {
    KPITemplateListItem,
    KPITemplateCreate,
    KPITemplateMetricCreate,
    BonusType,
    ContractType,
    MetricUnit,
} from '@/types/kpi.types'

function ContractBadge({ type }: { type: ContractType }) {
    const m: Record<ContractType, string> = {
        FULL_TIME: 'Giáo viên',
        PART_TIME: 'TA (Part-time)',
        NATIVE: 'Giáo viên bản xứ',
    }
    return (
        <span
            className={kpiS.statusChip}
            style={{
                background: '#3b82f618',
                color: '#2563eb',
            }}
        >
            {m[type] ?? type}
        </span>
    )
}

function formatCurrency(v: number | null | undefined): string {
    if (v == null) return '—'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(v)
}

const defaultMetric: KPITemplateMetricCreate = {
    metric_code: '',
    metric_name: '',
    is_group_header: false,
    unit: 'score',
    target_min: 0,
    target_max: 1,
    weight: 0,
    group_weight: null,
    sort_order: 0,
    description: null,
}

export default function AdminKpiTemplatePage() {
    const navigate = useNavigate()
    const { data: templates, isLoading } = useKpiTemplates()
    const createMutation = useCreateKpiTemplate()
    const updateMutation = useUpdateKpiTemplate()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [viewingId, setViewingId] = useState<string | null>(null)

    // Create form state
    const [form, setForm] = useState<{
        name: string
        contract_type: ContractType
        max_bonus_amount: number
        bonus_type: BonusType
        description: string
        metrics: KPITemplateMetricCreate[]
    }>({
        name: '',
        contract_type: 'FULL_TIME',
        max_bonus_amount: 0,
        bonus_type: 'FIXED_PER_PERIOD',
        description: '',
        metrics: [],
    })

    const { data: viewingTemplate } = useKpiTemplate(viewingId ?? undefined)

    const handleCreateSubmit = () => {
        const payload: KPITemplateCreate = {
            name: form.name,
            contract_type: form.contract_type,
            max_bonus_amount: form.max_bonus_amount,
            bonus_type: form.bonus_type,
            description: form.description || null,
            metrics: form.metrics,
        }
        createMutation.mutate(payload, {
            onSuccess: () => {
                setIsCreateOpen(false)
                resetForm()
            },
        })
    }

    const resetForm = () => {
        setForm({
            name: '',
            contract_type: 'FULL_TIME',
            max_bonus_amount: 0,
            bonus_type: 'FIXED_PER_PERIOD',
            description: '',
            metrics: [],
        })
    }

    const addMetric = () => {
        setForm((prev) => ({
            ...prev,
            metrics: [
                ...prev.metrics,
                { ...defaultMetric, sort_order: prev.metrics.length },
            ],
        }))
    }

    const updateMetric = (
        idx: number,
        field: string,
        value: string | number | boolean | null
    ) => {
        setForm((prev) => ({
            ...prev,
            metrics: prev.metrics.map((m, i) =>
                i === idx ? { ...m, [field]: value } : m
            ),
        }))
    }

    const removeMetric = (idx: number) => {
        setForm((prev) => ({
            ...prev,
            metrics: prev.metrics.filter((_, i) => i !== idx),
        }))
    }

    const handleToggleActive = (tpl: KPITemplateListItem) => {
        updateMutation.mutate({
            id: tpl.id,
            payload: { is_active: !tpl.is_active },
        })
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 24,
                        flexWrap: 'wrap',
                    }}
                >
                    <ButtonGhost onClick={() => navigate('/admin/kpi')}>
                        ← Quay lại
                    </ButtonGhost>
                    <h1
                        className={s.pageTitle}
                        style={{ marginBottom: 0, flex: 1 }}
                    >
                        Quản lý Template KPI
                    </h1>
                    <ButtonPrimary onClick={() => setIsCreateOpen(true)}>
                        + Tạo Template mới
                    </ButtonPrimary>
                </div>

                {isLoading ? (
                    <div>Đang tải...</div>
                ) : !templates || templates.length === 0 ? (
                    <EmptyState
                        title="Chưa có template"
                        description='Bấm "Tạo Template mới" để bắt đầu cấu hình bộ tiêu chí KPI.'
                    />
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(360px, 1fr))',
                            gap: 16,
                        }}
                    >
                        {templates.map((tpl) => (
                            <Card
                                key={tpl.id}
                                variant="outline"
                                style={{
                                    padding: 20,
                                    opacity: tpl.is_active ? 1 : 0.5,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setViewingId(tpl.id)}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 8,
                                    }}
                                >
                                    <h3 style={{ margin: 0, fontSize: 16 }}>
                                        {tpl.name}
                                    </h3>
                                    <ContractBadge type={tpl.contract_type} />
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 16,
                                        fontSize: 13,
                                        color: 'var(--color-text-secondary)',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <span>v{tpl.version}</span>
                                    <span>
                                        Thưởng tối đa:{' '}
                                        {formatCurrency(tpl.max_bonus_amount)}
                                    </span>
                                    <span>
                                        Loại:{' '}
                                        {tpl.bonus_type === 'FIXED_PER_PERIOD'
                                            ? 'Cố định/kỳ'
                                            : 'Theo giờ'}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        marginTop: 12,
                                        display: 'flex',
                                        gap: 8,
                                    }}
                                >
                                    <button
                                        className={kpiS.detailBtn}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleToggleActive(tpl)
                                        }}
                                    >
                                        {tpl.is_active ? 'Tắt' : 'Bật'}
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* View Template Detail */}
            <Modal
                isOpen={!!viewingId}
                onClose={() => setViewingId(null)}
                title={viewingTemplate?.name ?? 'Chi tiết Template'}
            >
                {viewingTemplate && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                            }}
                        >
                            <p>
                                Loại HĐ:{' '}
                                <strong>{viewingTemplate.contract_type}</strong>
                            </p>
                            <p>
                                Phiên bản:{' '}
                                <strong>v{viewingTemplate.version}</strong>
                            </p>
                            <p>
                                Thưởng tối đa:{' '}
                                <strong>
                                    {formatCurrency(
                                        viewingTemplate.max_bonus_amount
                                    )}
                                </strong>
                            </p>
                            {viewingTemplate.description && (
                                <p>Mô tả: {viewingTemplate.description}</p>
                            )}
                        </div>

                        <h4 style={{ margin: '8px 0 0' }}>
                            Các tiêu chí ({viewingTemplate.metrics.length})
                        </h4>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 13,
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={modalThStyle}>Mã</th>
                                    <th
                                        style={{
                                            ...modalThStyle,
                                            textAlign: 'left',
                                        }}
                                    >
                                        Tên
                                    </th>
                                    <th style={modalThStyle}>Đơn vị</th>
                                    <th style={modalThStyle}>Min</th>
                                    <th style={modalThStyle}>Max</th>
                                    <th style={modalThStyle}>Trọng số</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viewingTemplate.metrics.map((m) => (
                                    <tr
                                        key={m.id}
                                        style={{
                                            background: m.is_group_header
                                                ? 'var(--color-surface-raised)'
                                                : undefined,
                                            fontWeight: m.is_group_header
                                                ? 700
                                                : 400,
                                        }}
                                    >
                                        <td style={modalTdStyle}>
                                            {m.metric_code}
                                        </td>
                                        <td
                                            style={{
                                                ...modalTdStyle,
                                                textAlign: 'left',
                                                paddingLeft: m.is_group_header
                                                    ? 8
                                                    : 20,
                                            }}
                                        >
                                            {m.metric_name}
                                        </td>
                                        <td style={modalTdStyle}>
                                            {m.unit ?? '—'}
                                        </td>
                                        <td style={modalTdStyle}>
                                            {m.target_min ?? '—'}
                                        </td>
                                        <td style={modalTdStyle}>
                                            {m.target_max ?? '—'}
                                        </td>
                                        <td style={modalTdStyle}>
                                            {m.is_group_header
                                                ? m.group_weight != null
                                                    ? `${(m.group_weight * 100).toFixed(0)}%`
                                                    : '—'
                                                : m.weight != null
                                                  ? `${(m.weight * 100).toFixed(0)}%`
                                                  : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal>

            {/* Create Template Modal */}
            <Modal
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false)
                    resetForm()
                }}
                title="Tạo Template KPI mới"
                footer={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 12,
                            width: '100%',
                        }}
                    >
                        <ButtonGhost
                            onClick={() => {
                                setIsCreateOpen(false)
                                resetForm()
                            }}
                        >
                            Hủy
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleCreateSubmit}
                            disabled={
                                createMutation.isPending || !form.name.trim()
                            }
                        >
                            {createMutation.isPending
                                ? 'Đang tạo...'
                                : 'Tạo Template'}
                        </ButtonPrimary>
                    </div>
                }
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        maxHeight: '60vh',
                        overflowY: 'auto',
                    }}
                >
                    <label style={labelStyle}>
                        Tên template
                        <input
                            style={inputStyle}
                            value={form.name}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="VD: Bảng KPI Giáo viên kỳ 1/2025"
                        />
                    </label>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <label style={{ ...labelStyle, flex: 1 }}>
                            Loại hợp đồng
                            <select
                                style={inputStyle}
                                value={form.contract_type}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        contract_type: e.target
                                            .value as ContractType,
                                    }))
                                }
                            >
                                <option value="FULL_TIME">Giáo viên</option>
                                <option value="PART_TIME">
                                    TA (Part-time)
                                </option>
                                <option value="NATIVE">Bản xứ</option>
                            </select>
                        </label>
                        <label style={{ ...labelStyle, flex: 1 }}>
                            Loại thưởng
                            <select
                                style={inputStyle}
                                value={form.bonus_type}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        bonus_type: e.target.value as BonusType,
                                    }))
                                }
                            >
                                <option value="FIXED_PER_PERIOD">
                                    Cố định / kỳ
                                </option>
                                <option value="PER_HOUR">Theo giờ dạy</option>
                            </select>
                        </label>
                    </div>

                    <label style={labelStyle}>
                        Thưởng tối đa (VNĐ)
                        <input
                            style={inputStyle}
                            type="number"
                            min={0}
                            value={form.max_bonus_amount}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    max_bonus_amount: Number(e.target.value),
                                }))
                            }
                        />
                    </label>

                    <label style={labelStyle}>
                        Mô tả
                        <textarea
                            style={{ ...inputStyle, resize: 'vertical' }}
                            rows={2}
                            value={form.description}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </label>

                    {/* Metrics */}
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 8,
                            }}
                        >
                            <h4 style={{ margin: 0 }}>
                                Tiêu chí ({form.metrics.length})
                            </h4>
                            <ButtonGhost onClick={addMetric}>
                                + Thêm tiêu chí
                            </ButtonGhost>
                        </div>
                        {form.metrics.map((m, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: 12,
                                    border: '1px solid var(--color-border-soft)',
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    background: m.is_group_header
                                        ? 'var(--color-surface-raised)'
                                        : undefined,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                    }}
                                >
                                    <input
                                        style={{ ...inputStyle, width: 60 }}
                                        placeholder="Mã"
                                        value={m.metric_code}
                                        onChange={(e) =>
                                            updateMetric(
                                                idx,
                                                'metric_code',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <input
                                        style={{ ...inputStyle, flex: 1 }}
                                        placeholder="Tên tiêu chí"
                                        value={m.metric_name}
                                        onChange={(e) =>
                                            updateMetric(
                                                idx,
                                                'metric_name',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <label
                                        style={{
                                            display: 'flex',
                                            gap: 4,
                                            alignItems: 'center',
                                            fontSize: 12,
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={m.is_group_header}
                                            onChange={(e) =>
                                                updateMetric(
                                                    idx,
                                                    'is_group_header',
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        Nhóm
                                    </label>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            fontSize: 16,
                                        }}
                                        onClick={() => removeMetric(idx)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                {!m.is_group_header && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 8,
                                            marginTop: 8,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <label style={{ fontSize: 11 }}>
                                            Đơn vị
                                            <select
                                                style={{
                                                    ...inputStyle,
                                                    width: 80,
                                                }}
                                                value={m.unit ?? 'score'}
                                                onChange={(e) =>
                                                    updateMetric(
                                                        idx,
                                                        'unit',
                                                        e.target
                                                            .value as MetricUnit
                                                    )
                                                }
                                            >
                                                <option value="%">%</option>
                                                <option value="score">
                                                    score
                                                </option>
                                                <option value="count">
                                                    count
                                                </option>
                                                <option value="student">
                                                    student
                                                </option>
                                            </select>
                                        </label>
                                        <label style={{ fontSize: 11 }}>
                                            Min
                                            <input
                                                style={{
                                                    ...inputStyle,
                                                    width: 60,
                                                }}
                                                type="number"
                                                step="0.01"
                                                value={m.target_min ?? 0}
                                                onChange={(e) =>
                                                    updateMetric(
                                                        idx,
                                                        'target_min',
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </label>
                                        <label style={{ fontSize: 11 }}>
                                            Max
                                            <input
                                                style={{
                                                    ...inputStyle,
                                                    width: 60,
                                                }}
                                                type="number"
                                                step="0.01"
                                                value={m.target_max ?? 1}
                                                onChange={(e) =>
                                                    updateMetric(
                                                        idx,
                                                        'target_max',
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </label>
                                        <label style={{ fontSize: 11 }}>
                                            Trọng số
                                            <input
                                                style={{
                                                    ...inputStyle,
                                                    width: 60,
                                                }}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={m.weight ?? 0}
                                                onChange={(e) =>
                                                    updateMetric(
                                                        idx,
                                                        'weight',
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                )}
                                {m.is_group_header && (
                                    <div style={{ marginTop: 8 }}>
                                        <label style={{ fontSize: 11 }}>
                                            Trọng số nhóm
                                            <input
                                                style={{
                                                    ...inputStyle,
                                                    width: 80,
                                                }}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={m.group_weight ?? 0}
                                                onChange={(e) =>
                                                    updateMetric(
                                                        idx,
                                                        'group_weight',
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {createMutation.isError && (
                        <div
                            style={{
                                padding: 12,
                                background: '#fef2f2',
                                borderRadius: 8,
                                fontSize: 14,
                                color: '#991b1b',
                            }}
                        >
                            {(createMutation.error as Error)?.message ??
                                'Lỗi tạo template'}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}

const modalThStyle: React.CSSProperties = {
    textAlign: 'right',
    padding: '6px 8px',
    borderBottom: '1px solid var(--color-border-soft)',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
}

const modalTdStyle: React.CSSProperties = {
    textAlign: 'right',
    padding: '6px 8px',
    borderBottom: '1px solid var(--color-border-soft)',
    fontSize: 13,
}

const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
}

const inputStyle: React.CSSProperties = {
    padding: '8px 10px',
    borderRadius: 6,
    border: '1.5px solid var(--color-border-soft)',
    fontSize: 14,
    fontFamily: 'inherit',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
}
