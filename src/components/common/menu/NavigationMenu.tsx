import React from 'react'
import s from './NavigationMenu.module.css'

type Mode = 'light' | 'dark'
type Variant = 'glass' | 'outline' | 'flat'
type Size = 'desktop' | 'tablet' | 'mobile'

export type NavItem = {
    id?: string
    label: string
    href?: string
    onClick?: (e: React.MouseEvent) => void
    active?: boolean
    leftIcon?: React.ReactNode
    ref?: React.RefObject<HTMLLIElement>
}

export interface NavigationMenuProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
    brand?: React.ReactNode
    items?: NavItem[]
    mode?: Mode
    variant?: Variant
    size?: Size
    rightSlot?: React.ReactNode
    onItemSelect?: (index: number, item: NavItem, e: React.MouseEvent) => void
    block?: boolean
}

export default function NavigationMenu({
    brand = <span className={s.brand}>TungTung</span>,
    items = [],
    mode = 'light',
    variant = 'glass',
    size = 'desktop',
    rightSlot,
    block,
    className = '',
    onItemSelect,
    ...rest
}: NavigationMenuProps) {
    return (
        <nav
            role="navigation"
            {...rest}
            className={[
                s.root,
                s[mode],
                s[variant],
                s[size],
                block ? s.block : '',
                className,
            ].join(' ')}
        >
            <div className={s.left}>
                {brand}
                {(size === 'desktop' || size === 'tablet') && (
                    <ul className={s.menu}>
                        {items.map((it, i) => {
                            const cls = [
                                s.item,
                                it.active ? s.active : '',
                            ].join(' ')
                            const handle = (e: React.MouseEvent) => {
                                if (onItemSelect) onItemSelect(i, it, e)
                                else it.onClick?.(e)
                            }

                            const content = (
                                <>
                                    {it.leftIcon && (
                                        <span className={s.icon}>
                                            {it.leftIcon}
                                        </span>
                                    )}
                                    <span className={s.text}>{it.label}</span>
                                </>
                            )

                            return (
                                <li
                                    key={it.id ?? i}
                                    className={s.li}
                                    ref={it.ref}
                                >
                                    {it.href ? (
                                        <a
                                            href={it.href}
                                            onClick={handle}
                                            className={cls}
                                            aria-current={
                                                it.active ? 'page' : undefined
                                            }
                                        >
                                            {content}
                                        </a>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handle}
                                            className={cls}
                                            aria-current={
                                                it.active ? 'page' : undefined
                                            }
                                        >
                                            {content}
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            <div className={s.right}>{rightSlot}</div>
        </nav>
    )
}
