import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './NavigationMenu.module.css'
import SideMenuSet, { type SideMenuItem } from './SideMenuSet'
import { Link } from 'react-router-dom'

export type NavItem = {
    id?: string
    label: string
    href?: string
    onClick?: (e: React.MouseEvent) => void
    active?: boolean
    leftIcon?: React.ReactNode
    dropdownItems?: SideMenuItem[]
}

export interface NavigationMenuProps {
    brand?: React.ReactNode
    items?: NavItem[]
    rightSlot?: React.ReactNode
    rightSlotDropdownItems?: SideMenuItem[]
    onItemSelect?: (index: number, item: NavItem, e: React.MouseEvent) => void
    className?: string
}

export default function NavigationMenu({
    brand = <span className={styles.brand}>TungTung</span>,
    items = [],
    rightSlot,
    rightSlotDropdownItems = [],
    onItemSelect,
    className = '',
}: NavigationMenuProps) {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
    const triggerRefs = useRef<Record<string, HTMLElement | null>>({})

    const idFor = (it: NavItem, i: number) => it.id ?? `item-${i}`

    const updatePosition = useCallback(() => {
        if (!activeDropdown) return
        const el = triggerRefs.current[activeDropdown]
        if (!el) return
        const rect = el.getBoundingClientRect()
        if (activeDropdown === 'rightSlot') {
            setMenuStyle({
                top: `${rect.bottom + 12}px`,
                right: `${window.innerWidth - rect.right}px`,
            })
        } else {
            setMenuStyle({
                top: `${rect.bottom + 12}px`,
                left: `${rect.left}px`,
            })
        }
    }, [activeDropdown])

    useEffect(() => {
        updatePosition()
    }, [updatePosition])

    useEffect(() => {
        if (!activeDropdown) return
        const onWin = () => updatePosition()
        window.addEventListener('resize', onWin)
        window.addEventListener('scroll', onWin, {
            capture: false,
            passive: true,
        })
        return () => {
            window.removeEventListener('resize', onWin)
            window.removeEventListener('scroll', onWin, { capture: false })
        }
    }, [activeDropdown, updatePosition])

    useEffect(() => {
        if (!activeDropdown) return
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('[data-dropdown-trigger]'))
                setActiveDropdown(null)
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [activeDropdown])

    const handleItemClick =
        (item: NavItem, index: number) => (e: React.MouseEvent) => {
            if (item.dropdownItems?.length) {
                e.preventDefault()
                const id = idFor(item, index)
                setActiveDropdown(activeDropdown === id ? null : id)
            }
            item.onClick?.(e)
            onItemSelect?.(index, item, e)
        }

    const getDropdownTitle = (id: string) => {
        if (id === 'rightSlot') return 'Tài khoản'
        const idx = items.findIndex((it, i) => idFor(it, i) === id)
        return idx >= 0 ? items[idx].label : 'Menu'
    }

    return (
        <>
            <nav className={`${styles.root} ${className}`}>
                <div className={styles.left}>
                    {brand}
                    <ul className={styles.menu} role="menubar">
                        {items.map((it, i) => {
                            const id = idFor(it, i)
                            const hasDropdown = !!(
                                it.dropdownItems && it.dropdownItems.length
                            )
                            const isLink = !!it.href
                            const commonProps = {
                                ref: (el: HTMLElement | null) => {
                                    triggerRefs.current[id] = el
                                },
                                'data-dropdown-trigger':
                                    hasDropdown || undefined,
                                className: `${styles.item} ${it.active ? styles.itemActive : ''}`,
                                onClick: handleItemClick(it, i),
                                'aria-haspopup': hasDropdown
                                    ? 'menu'
                                    : undefined,
                                'aria-expanded':
                                    activeDropdown === id || undefined,
                            }

                            return (
                                <li key={id} role="none">
                                    {isLink ? (
                                        <Link
                                            {...(commonProps as any)}
                                            to={it.href!}
                                            role="menuitem"
                                        >
                                            {it.leftIcon && (
                                                <span className={styles.icon}>
                                                    {it.leftIcon}
                                                </span>
                                            )}
                                            <span>{it.label}</span>
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            {...(commonProps as any)}
                                            role="menuitem"
                                        >
                                            {it.leftIcon && (
                                                <span className={styles.icon}>
                                                    {it.leftIcon}
                                                </span>
                                            )}
                                            <span>{it.label}</span>
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>

                <div className={styles.right}>
                    {rightSlotDropdownItems.length > 0 ? (
                        <button
                            type="button"
                            ref={(el) => {
                                triggerRefs.current['rightSlot'] = el
                            }}
                            data-dropdown-trigger
                            className={styles.avatarBtn}
                            data-active={activeDropdown === 'rightSlot'}
                            aria-haspopup="menu"
                            aria-expanded={
                                activeDropdown === 'rightSlot' || undefined
                            }
                            onClick={() =>
                                setActiveDropdown(
                                    activeDropdown === 'rightSlot'
                                        ? null
                                        : 'rightSlot'
                                )
                            }
                        >
                            {rightSlot}
                        </button>
                    ) : (
                        rightSlot
                    )}
                </div>
            </nav>

            {activeDropdown &&
                createPortal(
                    <div
                        style={{
                            position: 'fixed',
                            zIndex: 1000,
                            ...menuStyle,
                        }}
                    >
                        <SideMenuSet
                            title={getDropdownTitle(activeDropdown)}
                            items={(activeDropdown === 'rightSlot'
                                ? rightSlotDropdownItems
                                : (items.find(
                                      (it, i) => idFor(it, i) === activeDropdown
                                  )?.dropdownItems ?? [])
                            ).map((it) => ({
                                ...it,
                                onClick: (e) => {
                                    setActiveDropdown(null)
                                    requestAnimationFrame(() => it.onClick?.(e))
                                },
                            }))}
                        />
                    </div>,
                    document.body
                )}
        </>
    )
}
