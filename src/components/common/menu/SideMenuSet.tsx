import React, { useState, useRef } from 'react'
import s from './SideMenuSet.module.css'

type Mode = 'light' | 'dark'
type Variant = 'glass' | 'outline' | 'flat'

export type SideMenuItem = {
    id?: string
    label: React.ReactNode
    icon?: React.ReactNode
    active?: boolean
    subItems?: SideMenuItem[]
    onClick?: (e: React.MouseEvent) => void
}

export interface SideMenuProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect' | 'title'> {
    title?: React.ReactNode
    titleIcon?: React.ReactNode
    items: SideMenuItem[]
    mode?: Mode
    variant?: Variant
    width?: number | string
}

export default function SideMenu({
    title = 'Account',
    titleIcon,
    items,
    mode = 'light',
    variant = 'glass',
    width,
    className = '',
    ...rest
}: SideMenuProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseEnter = (id: string, hasSubItems: boolean) => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        if (hasSubItems) {
            hoverTimerRef.current = setTimeout(() => setExpandedId(id), 80)
        } else {
            setExpandedId(null)
        }
    }

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => setExpandedId(null), 200)
    }

    const handleSubMenuEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }

    return (
        <aside
            {...rest}
            className={[s.root, s[mode], s[variant], className].join(' ')}
            style={
                width
                    ? ({
                          '--menu-w':
                              typeof width === 'number' ? `${width}px` : width,
                      } as React.CSSProperties)
                    : undefined
            }
            onMouseLeave={handleMouseLeave}
        >
            <div className={s.header}>
                <div className={s.title}>{title}</div>
                {titleIcon && <div className={s.titleIcon}>{titleIcon}</div>}
            </div>

            <div className={s.divider} />

            <ul className={s.list}>
                {items.map((it, i) => {
                    const key = it.id ?? `item-${i}`
                    const hasSubItems = !!(
                        it.subItems && it.subItems.length > 0
                    )
                    const isExpanded = expandedId === key

                    return (
                        <li
                            key={key}
                            className={[
                                s.li,
                                hasSubItems ? s.liWithSub : '',
                            ].join(' ')}
                            onMouseEnter={() =>
                                handleMouseEnter(key, hasSubItems)
                            }
                        >
                            <div
                                role={
                                    it.onClick || hasSubItems
                                        ? 'button'
                                        : undefined
                                }
                                tabIndex={
                                    it.onClick || hasSubItems ? 0 : undefined
                                }
                                className={[
                                    s.item,
                                    it.active ? s.active : '',
                                    isExpanded ? s.itemExpanded : '',
                                ].join(' ')}
                                onClick={(e) => {
                                    if (hasSubItems) {
                                        setExpandedId(isExpanded ? null : key)
                                    } else {
                                        it.onClick?.(e)
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        (it.onClick || hasSubItems) &&
                                        (e.key === 'Enter' || e.key === ' ')
                                    ) {
                                        e.preventDefault()
                                        if (hasSubItems) {
                                            setExpandedId(
                                                isExpanded ? null : key
                                            )
                                        } else {
                                            it.onClick?.(e as any)
                                        }
                                    }
                                }}
                            >
                                <span className={s.left}>
                                    {it.icon && (
                                        <span className={s.icon}>
                                            {it.icon}
                                        </span>
                                    )}
                                    <span className={s.label}>{it.label}</span>
                                </span>
                                {hasSubItems && (
                                    <svg
                                        className={s.chevron}
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M4.5 2.5L8 6L4.5 9.5" />
                                    </svg>
                                )}
                            </div>

                            {hasSubItems && isExpanded && (
                                <div
                                    className={s.flyout}
                                    onMouseEnter={handleSubMenuEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <ul className={s.flyoutList}>
                                        {it.subItems!.map((sub, si) => {
                                            const subKey = sub.id ?? `sub-${si}`
                                            return (
                                                <li
                                                    key={subKey}
                                                    className={s.li}
                                                >
                                                    <div
                                                        role={
                                                            sub.onClick
                                                                ? 'button'
                                                                : undefined
                                                        }
                                                        tabIndex={
                                                            sub.onClick
                                                                ? 0
                                                                : undefined
                                                        }
                                                        className={[
                                                            s.item,
                                                            sub.active
                                                                ? s.active
                                                                : '',
                                                        ].join(' ')}
                                                        onClick={sub.onClick}
                                                        onKeyDown={(e) => {
                                                            if (
                                                                sub.onClick &&
                                                                (e.key ===
                                                                    'Enter' ||
                                                                    e.key ===
                                                                        ' ')
                                                            ) {
                                                                e.preventDefault()
                                                                sub.onClick(
                                                                    e as any
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        <span
                                                            className={s.left}
                                                        >
                                                            {sub.icon && (
                                                                <span
                                                                    className={
                                                                        s.icon
                                                                    }
                                                                >
                                                                    {sub.icon}
                                                                </span>
                                                            )}
                                                            <span
                                                                className={
                                                                    s.label
                                                                }
                                                            >
                                                                {sub.label}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {si !==
                                                        it.subItems!.length -
                                                            1 && (
                                                        <div
                                                            className={
                                                                s.rowDivider
                                                            }
                                                        />
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            )}

                            {i !== items.length - 1 && (
                                <div className={s.rowDivider} />
                            )}
                        </li>
                    )
                })}
            </ul>
        </aside>
    )
}
