import React from 'react'
import s from './SideMenuSet.module.css'

type Mode = 'light' | 'dark'
type Variant = 'glass' | 'outline' | 'flat'

export type SideMenuItem = {
    id?: string
    label: React.ReactNode
    icon?: React.ReactNode
    active?: boolean
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
        >
            <div className={s.header}>
                <div className={s.title}>{title}</div>
                {titleIcon && <div className={s.titleIcon}>{titleIcon}</div>}
            </div>

            <div className={s.divider} />

            <ul className={s.list}>
                {items.map((it, i) => {
                    const key = it.id ?? i
                    const Cmp = 'button'
                    return (
                        <li key={key} className={s.li}>
                            <Cmp
                                type="button"
                                className={[
                                    s.item,
                                    it.active ? s.active : '',
                                ].join(' ')}
                                onClick={it.onClick}
                            >
                                <span className={s.left}>
                                    {it.icon && (
                                        <span className={s.icon}>
                                            {it.icon}
                                        </span>
                                    )}
                                    <span className={s.label}>{it.label}</span>
                                </span>
                            </Cmp>
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
