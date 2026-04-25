import React, { useMemo } from 'react'
import { SelectField } from './SelectField'

interface PeriodSelectorProps {
    value: string
    onChange: (val: string) => void
    disabled?: boolean
    label?: string
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    value,
    onChange,
    disabled = false,
    label = 'Kỳ (Tháng/Năm)',
}) => {
    const periodOptions = useMemo(() => {
        const options = []
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1 // 1-12

        // Generate from current month back to Jan last year
        for (let y = year; y >= year - 1; y--) {
            const startMonth = y === year ? month : 12
            const endMonth = y === year - 1 ? 1 : 1

            for (let m = startMonth; m >= endMonth; m--) {
                const mm = m.toString().padStart(2, '0')
                const period = `${y}-${mm}`
                options.push({ label: `Tháng ${m}/${y}`, value: period })
            }
        }
        return options
    }, [])

    return (
        <div style={{ width: '200px' }}>
            <SelectField
                label={label}
                id="period-selector"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                options={periodOptions}
                disabled={disabled}
            />
        </div>
    )
}
