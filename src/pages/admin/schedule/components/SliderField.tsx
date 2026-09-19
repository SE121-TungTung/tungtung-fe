import TooltipIcon from './TooltipIcon'

interface SliderFieldProps {
    label: string
    value: number
    min: number
    max: number
    step: number
    onChange: (v: number) => void
    tooltip?: string
}

export default function SliderField({
    label,
    value,
    min,
    max,
    step,
    onChange,
    tooltip,
}: SliderFieldProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    alignItems: 'center',
                }}
            >
                <span
                    style={{
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}
                >
                    {label}
                    {tooltip && <TooltipIcon text={tooltip} />}
                </span>

                <span
                    style={{
                        fontWeight: 600,
                        color: 'var(--color-brand-primary)',
                    }}
                >
                    {value}
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{
                    width: '100%',
                    accentColor: 'var(--color-brand-primary)',
                }}
            />
        </div>
    )
}
