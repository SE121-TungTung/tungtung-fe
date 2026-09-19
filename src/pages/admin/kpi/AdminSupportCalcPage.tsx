import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { useNavigate } from 'react-router-dom'
import { useCalculateSupportScore } from '@/hooks/domain/useKpi'
import type { SupportCalcRequest, SupportCalcResponse } from '@/types/kpi.types'

export default function AdminSupportCalcPage() {
    const navigate = useNavigate()
    const calcMutation = useCalculateSupportScore()

    const [form, setForm] = useState<SupportCalcRequest>({
        class_size: 30,
        max_score: 10,
        avg_threshold: 5,
        above_avg_count: 20,
        high_threshold: 8,
        above_high_count: 5,
        class_name: '',
    })

    const [result, setResult] = useState<SupportCalcResponse | null>(null)

    const handleCalculate = () => {
        setResult(null)
        calcMutation.mutate(form, {
            onSuccess: (data) => setResult(data),
        })
    }

    const updateField = (
        field: keyof SupportCalcRequest,
        value: string | number
    ) => {
        setForm((f) => ({ ...f, [field]: value }))
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
                    }}
                >
                    <ButtonGhost onClick={() => navigate('/admin/kpi')}>
                        ← Quay lại
                    </ButtonGhost>
                    <h1
                        className={s.pageTitle}
                        style={{ marginBottom: 0, flex: 1 }}
                    >
                        Công cụ hỗ trợ tính A1/A2
                    </h1>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 24,
                        maxWidth: 900,
                    }}
                >
                    {/* Input Form */}
                    <Card variant="glass" style={{ padding: 24 }}>
                        <h3 style={{ margin: '0 0 16px' }}>
                            Nhập dữ liệu lớp học
                        </h3>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                            }}
                        >
                            <label style={labelStyle}>
                                Tên lớp (tùy chọn)
                                <input
                                    style={inputStyle}
                                    value={form.class_name ?? ''}
                                    onChange={(e) =>
                                        updateField(
                                            'class_name',
                                            e.target.value
                                        )
                                    }
                                    placeholder="VD: IELTS 6.5 - Lớp A3"
                                />
                            </label>

                            <label style={labelStyle}>
                                Sĩ số lớp
                                <input
                                    style={inputStyle}
                                    type="number"
                                    min={1}
                                    value={form.class_size}
                                    onChange={(e) =>
                                        updateField(
                                            'class_size',
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </label>

                            <label style={labelStyle}>
                                Điểm tối đa
                                <input
                                    style={inputStyle}
                                    type="number"
                                    min={1}
                                    value={form.max_score}
                                    onChange={(e) =>
                                        updateField(
                                            'max_score',
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </label>

                            <div
                                style={{
                                    borderTop:
                                        '1px solid var(--color-border-soft)',
                                    paddingTop: 12,
                                    marginTop: 4,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#2563eb',
                                        margin: '0 0 8px',
                                    }}
                                >
                                    Tiêu chí A1 — Tỷ lệ HS đạt từ TB trở lên
                                </p>
                                <label style={labelStyle}>
                                    Ngưỡng trung bình
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        value={form.avg_threshold}
                                        onChange={(e) =>
                                            updateField(
                                                'avg_threshold',
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </label>
                                <label style={{ ...labelStyle, marginTop: 8 }}>
                                    Số HS đạt TB (không tính HS đạt cao)
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        value={form.above_avg_count}
                                        onChange={(e) =>
                                            updateField(
                                                'above_avg_count',
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div
                                style={{
                                    borderTop:
                                        '1px solid var(--color-border-soft)',
                                    paddingTop: 12,
                                    marginTop: 4,
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#16a34a',
                                        margin: '0 0 8px',
                                    }}
                                >
                                    Tiêu chí A2 — Tỷ lệ HS đạt điểm cao
                                </p>
                                <label style={labelStyle}>
                                    Ngưỡng cao
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        step="0.5"
                                        min={0}
                                        value={form.high_threshold}
                                        onChange={(e) =>
                                            updateField(
                                                'high_threshold',
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </label>
                                <label style={{ ...labelStyle, marginTop: 8 }}>
                                    Số HS đạt điểm cao
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        min={0}
                                        value={form.above_high_count}
                                        onChange={(e) =>
                                            updateField(
                                                'above_high_count',
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <ButtonPrimary
                                onClick={handleCalculate}
                                disabled={calcMutation.isPending}
                                style={{ marginTop: 8 }}
                            >
                                {calcMutation.isPending
                                    ? 'Đang tính...'
                                    : 'Tính tỉ lệ A1 / A2'}
                            </ButtonPrimary>
                        </div>
                    </Card>

                    {/* Result */}
                    <Card variant="glass" style={{ padding: 24 }}>
                        <h3 style={{ margin: '0 0 16px' }}>Kết quả</h3>

                        {result ? (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 20,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: 16,
                                            background: '#3b82f610',
                                            borderRadius: 8,
                                            border: '1px solid #3b82f630',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#2563eb',
                                                fontWeight: 600,
                                                marginBottom: 4,
                                            }}
                                        >
                                            A1 — Tỉ lệ đạt TB
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 32,
                                                fontWeight: 800,
                                                color: '#2563eb',
                                            }}
                                        >
                                            {(
                                                result.rate_above_avg * 100
                                            ).toFixed(1)}
                                            %
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            padding: 16,
                                            background: '#22c55e10',
                                            borderRadius: 8,
                                            border: '1px solid #22c55e30',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#16a34a',
                                                fontWeight: 600,
                                                marginBottom: 4,
                                            }}
                                        >
                                            A2 — Tỉ lệ điểm cao
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 32,
                                                fontWeight: 800,
                                                color: '#16a34a',
                                            }}
                                        >
                                            {(
                                                result.rate_above_high * 100
                                            ).toFixed(1)}
                                            %
                                        </div>
                                    </div>
                                </div>

                                {result.breakdown &&
                                    Object.keys(result.breakdown).length >
                                        0 && (
                                        <div>
                                            <h4
                                                style={{
                                                    margin: '0 0 8px',
                                                    fontSize: 13,
                                                }}
                                            >
                                                Chi tiết tính toán:
                                            </h4>
                                            <pre
                                                style={{
                                                    fontSize: 12,
                                                    padding: 12,
                                                    borderRadius: 6,
                                                    background:
                                                        'var(--color-surface-raised)',
                                                    overflow: 'auto',
                                                    maxHeight: 200,
                                                }}
                                            >
                                                {JSON.stringify(
                                                    result.breakdown,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    )}
                            </div>
                        ) : calcMutation.isError ? (
                            <div
                                style={{
                                    padding: 12,
                                    background: '#fef2f2',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    color: '#991b1b',
                                }}
                            >
                                {(calcMutation.error as Error)?.message ??
                                    'Lỗi tính toán'}
                            </div>
                        ) : (
                            <p
                                style={{
                                    color: 'var(--color-text-secondary)',
                                    fontSize: 14,
                                }}
                            >
                                Nhập dữ liệu bên trái và bấm "Tính" để xem kết
                                quả.
                            </p>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
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
