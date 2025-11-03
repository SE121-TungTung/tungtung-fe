import React, { useId, useMemo, useState, useCallback } from 'react'
import s from './TabMenu.module.css'

export type Mode = 'light' | 'dark'
export type Variant = 'glass' | 'flat'
export type Size = 'sm' | 'md' | 'lg'
export type ActiveStyle = 'underline' | 'filled'

export type TabItem = {
    label: React.ReactNode
    value: string
    disabled?: boolean
}

export interface TabMenuProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
    items: TabItem[]
    value?: string
    defaultValue?: string
    onChange?: (value: string, index: number) => void
    mode?: Mode
    variant?: Variant
    size?: Size
    fullWidth?: boolean
    accentColor?: string
    activeStyle?: ActiveStyle
}

export default function TabMenu({
    items,
    value,
    defaultValue,
    onChange,
    mode = 'light',
    variant = 'glass',
    size = 'md',
    fullWidth,
    accentColor,
    activeStyle = 'underline',
    className = '',
    ...rest
}: TabMenuProps) {
    const firstEnabled = useMemo(
        () => items.find((x) => !x.disabled)?.value ?? items[0]?.value,
        [items]
    )
    const [internal, setInternal] = useState<string>(
        defaultValue ?? firstEnabled
    )
    const active = value ?? internal
    const setActive = useCallback(
        (val: string) => {
            if (value === undefined) setInternal(val)
            const idx = items.findIndex((x) => x.value === val)
            onChange?.(val, idx)
        },
        [value, items, onChange]
    )

    const listId = useId()

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
        e.preventDefault()
        const enabled = items.filter((x) => !x.disabled)
        const idx = Math.max(
            0,
            enabled.findIndex((x) => x.value === active)
        )
        const next =
            e.key === 'ArrowRight'
                ? enabled[(idx + 1) % enabled.length]
                : enabled[(idx - 1 + enabled.length) % enabled.length]
        if (next) setActive(next.value)
    }

    const cls = [
        s.root,
        s[mode],
        s[variant],
        s[size],
        fullWidth ? s.block : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const style: React.CSSProperties = accentColor
        ? { ['--accent' as any]: accentColor }
        : {}

    return (
        <div {...rest} className={cls} style={style}>
            <div
                role="tablist"
                aria-labelledby={listId}
                className={s.row}
                onKeyDown={onKey}
            >
                {items.map((it, i) => {
                    const isActive = active === it.value
                    return (
                        <button
                            key={it.value}
                            role="tab"
                            type="button"
                            className={[
                                s.tab,
                                isActive ? s[`active-${activeStyle}`] : '',
                                it.disabled ? s.disabled : '',
                            ].join(' ')}
                            aria-selected={isActive}
                            aria-controls={`${listId}-panel-${i}`}
                            tabIndex={it.disabled ? -1 : isActive ? 0 : -1}
                            disabled={it.disabled}
                            onClick={() => !it.disabled && setActive(it.value)}
                        >
                            <span className={s.label}>{it.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
