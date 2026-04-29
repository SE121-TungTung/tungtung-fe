import React from 'react'
import { SelectField } from './SelectField'
import { useKpiPeriods } from '@/hooks/domain/useKpi'

interface KpiPeriodSelectorProps {
    value: string
    onChange: (periodId: string) => void
    disabled?: boolean
    label?: string
    allowAll?: boolean
}

/**
 * Dropdown that fetches KPI periods from the backend and lets the user pick one.
 * `value` and `onChange` operate on period UUIDs.
 */
export const KpiPeriodSelector: React.FC<KpiPeriodSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    label = 'Chọn kỳ đánh giá',
    allowAll = false,
}) => {
    const { data: periods, isLoading } = useKpiPeriods()

    const options = React.useMemo(() => {
        if (!periods || periods.length === 0) {
            return [{ label: 'Chưa có kỳ KPI', value: '' }]
        }
        const opts = periods.map((p) => ({
            label: `${p.name} ${p.is_active ? '' : '(Đã đóng)'}`.trim(),
            value: p.id,
        }))
        if (allowAll) {
            opts.unshift({ label: 'Tất cả kì', value: '' })
        }
        return opts
    }, [periods, allowAll])

    // Auto-select the first active period if value is empty and allowAll is false
    React.useEffect(() => {
        if (!value && !allowAll && periods && periods.length > 0) {
            const activePeriod = periods.find((p) => p.is_active)
            onChange(activePeriod?.id ?? periods[0].id)
        }
    }, [periods, value, onChange, allowAll])

    return (
        <div style={{ width: '260px' }}>
            <SelectField
                label={label}
                id="kpi-period-selector"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                options={options}
                disabled={disabled || isLoading}
            />
        </div>
    )
}
