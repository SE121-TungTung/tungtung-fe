import { useState } from 'react'
import s from '../users/UserManagementPage.module.css'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { KpiPeriodSelector } from '@/components/common/input/KpiPeriodSelector'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBulkCalculatePeriod } from '@/hooks/domain/useKpi'
import ButtonGhost from '@/components/common/button/ButtonGhost'

export default function AdminKpiCalculationPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [periodId, setPeriodId] = useState(
        () => searchParams.get('periodId') ?? ''
    )

    const bulkCalc = useBulkCalculatePeriod()
    const [result, setResult] = useState<{
        total: number
        processed: number
        errors: string[]
    } | null>(null)

    const handleCalculate = () => {
        if (!periodId) return
        setResult(null)
        bulkCalc.mutate(periodId, {
            onSuccess: (data) => setResult(data),
        })
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Tính toán KPI hàng loạt</h1>

                <div style={{ marginBottom: '16px' }}>
                    <ButtonGhost onClick={() => navigate('/admin/kpi')}>
                        ← Quay lại
                    </ButtonGhost>
                </div>

                <Card
                    variant="glass"
                    style={{ padding: '32px', maxWidth: 600 }}
                >
                    <p
                        style={{
                            margin: '0 0 24px',
                            color: 'var(--color-text-secondary)',
                            fontSize: 14,
                            lineHeight: 1.6,
                        }}
                    >
                        Hệ thống sẽ tính toán điểm KPI cho{' '}
                        <strong>tất cả bản ghi</strong> ở trạng thái Nháp và Chờ
                        duyệt trong kỳ được chọn. Các bản ghi đã duyệt sẽ không
                        bị ảnh hưởng.
                    </p>

                    <div style={{ marginBottom: 24 }}>
                        <KpiPeriodSelector
                            value={periodId}
                            onChange={setPeriodId}
                            label="Chọn kỳ cần tính"
                        />
                    </div>

                    <ButtonPrimary
                        onClick={handleCalculate}
                        disabled={!periodId || bulkCalc.isPending}
                        style={{ minWidth: 200 }}
                    >
                        {bulkCalc.isPending
                            ? 'Đang tính toán...'
                            : 'Tính toán KPI'}
                    </ButtonPrimary>

                    {/* Result */}
                    {result && (
                        <div
                            style={{
                                marginTop: 24,
                                padding: 16,
                                borderRadius: 8,
                                background:
                                    result.errors.length > 0
                                        ? '#fef2f2'
                                        : '#f0fdf4',
                                border: `1px solid ${result.errors.length > 0 ? '#fecaca' : '#bbf7d0'}`,
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: 600 }}>
                                ✅ Đã xử lý {result.processed}/{result.total}{' '}
                                bản ghi
                            </p>
                            {result.errors.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <p
                                        style={{
                                            margin: '0 0 4px',
                                            fontSize: 13,
                                            color: '#991b1b',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Lỗi ({result.errors.length}):
                                    </p>
                                    <ul
                                        style={{
                                            margin: 0,
                                            padding: '0 0 0 16px',
                                            fontSize: 12,
                                            color: '#991b1b',
                                        }}
                                    >
                                        {result.errors.map((e, i) => (
                                            <li key={i}>{e}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {bulkCalc.isError && (
                        <div
                            style={{
                                marginTop: 16,
                                padding: 12,
                                borderRadius: 8,
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                fontSize: 14,
                                color: '#991b1b',
                            }}
                        >
                            {(bulkCalc.error as Error)?.message ??
                                'Đã xảy ra lỗi khi tính toán.'}
                        </div>
                    )}
                </Card>
            </main>
        </div>
    )
}
