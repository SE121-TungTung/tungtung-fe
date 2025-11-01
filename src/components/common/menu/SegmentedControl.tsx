import React, { useCallback, useId, useMemo, useState } from 'react'
import s from './SegmentedControl.module.css'

export type Mode = 'light' | 'dark'
export type Variant = 'glass' | 'flat'
export type Size = 'xs' | 'sm' | 'md' | 'lg'

export type SegItem = {
    label: React.ReactNode
    value: string
    disabled?: boolean
}

export interface SegmentedControlProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    items: SegItem[]
    value?: string
    defaultValue?: string
    onChange?: (value: string, index: number) => void
    mode?: Mode
    variant?: Variant
    size?: Size
    fullWidth?: boolean
    accentColor?: string
    disabled?: boolean
}

export default function SegmentedControl({
    items,
    value,
    defaultValue,
    onChange,
    mode = 'light',
    variant = 'glass',
    size = 'md',
    fullWidth,
    accentColor,
    disabled,
    className = '',
    ...rest
}: SegmentedControlProps) {
    const firstEnabled = useMemo(
        () => items.find((x) => !x.disabled)?.value ?? items[0]?.value,
        [items]
    )
    const [internal, setInternal] = useState<string>(
        defaultValue ?? firstEnabled ?? ''
    )
    const active = value ?? internal

    const index = Math.max(
        0,
        items.findIndex((x) => x.value === active && !x.disabled)
    )
    const count = Math.max(items.length, 1)

    const setActive = useCallback(
        (val: string) => {
            if (value === undefined) setInternal(val)
            const i = items.findIndex((x) => x.value === val)
            onChange?.(val, i)
        },
        [value, items, onChange]
    )

    const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        e.preventDefault()
        const enabled = items.filter((x) => !x.disabled)
        const cur = enabled.findIndex((x) => x.value === active)
        const nxt =
            e.key === 'ArrowRight'
                ? enabled[(cur + 1) % enabled.length]
                : enabled[(cur - 1 + enabled.length) % enabled.length]
        if (nxt) setActive(nxt.value)
    }

    const cls = [
        s.root,
        s[mode],
        s[variant],
        s[size],
        fullWidth ? s.block : '',
        disabled ? s.isDisabled : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const style: React.CSSProperties = {
        ...(accentColor
            ? ({ ['--accent' as any]: accentColor } as React.CSSProperties)
            : null),
    }

    const listId = useId()

    return (
        <div
            {...rest}
            className={cls}
            style={style}
            role="tablist"
            aria-disabled={disabled || undefined}
            onKeyDown={onKey}
        >
            <div className={s.row}>
                <span
                    className={s.indicator}
                    style={{
                        width: `${100 / count}%`,
                        transform: `translateX(${index * 100}%)`,
                    }}
                    aria-hidden="true"
                />
                {items.map((it) => {
                    const isActive = it.value === active
                    return (
                        <button
                            key={it.value}
                            role="tab"
                            type="button"
                            className={[
                                s.tab,
                                isActive ? s.active : '',
                                it.disabled ? s.disabled : '',
                            ].join(' ')}
                            aria-selected={isActive}
                            aria-controls={`${listId}-panel-${it.value}`}
                            tabIndex={it.disabled ? -1 : isActive ? 0 : -1}
                            disabled={it.disabled}
                            onClick={() => !it.disabled && setActive(it.value)}
                        >
                            <span className={s.label}>{it.label}</span>
                        </button>
                    )
                })}
            </div>
            {/* <div className={s.divider} /> */}
        </div>
    )
}
