import React, {
    useCallback,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
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

    const containerRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

    const setActive = useCallback(
        (val: string) => {
            if (value === undefined) setInternal(val)
            const i = items.findIndex((x) => x.value === val)
            onChange?.(val, i)
        },
        [value, items, onChange]
    )

    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container) return

        const activeTab = container.querySelector(
            `button[data-value="${active}"]`
        ) as HTMLElement

        if (activeTab) {
            setIndicatorStyle({
                left: activeTab.offsetLeft,
                width: activeTab.offsetWidth,
            })
        }
    }, [active, items, size, fullWidth])

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
        fullWidth ? s.fullWidth : s.autoWidth,
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
            <div className={s.row} ref={containerRef}>
                <span
                    className={s.indicator}
                    style={{
                        width: `${indicatorStyle.width}px`,
                        transform: `translateX(${indicatorStyle.left}px)`,
                    }}
                    aria-hidden="true"
                />

                {items.map((it) => {
                    const isActive = it.value === active
                    return (
                        <button
                            key={it.value}
                            data-value={it.value} // Thêm data attribute để querySelector tìm được
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
        </div>
    )
}
