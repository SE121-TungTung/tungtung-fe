import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './NavigationMenu.module.css'
import SideMenuSet, { type SideMenuItem } from './SideMenuSet'
import { Link, useNavigate } from 'react-router-dom'
import IconHamburger from '@/assets/Menu Hamburger.svg'
import IconClose from '@/assets/Close X Thin.svg'
import ButtonGhost from '../button/ButtonGhost'
import NotificationBell from '@/components/feature/notification/NotificationBell'

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

function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
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

    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [expandedMobileItems, setExpandedMobileItems] = useState<Set<number>>(
        new Set()
    )
    const navigate = useNavigate()

    const idFor = (it: NavItem, i: number) => it.id ?? `item-${i}`

    const handleMobileNavigate = (
        href?: string,
        onClick?: (e: any) => void,
        e?: any
    ) => {
        setIsMobileOpen(false)
        setExpandedMobileItems(new Set())
        if (onClick) onClick(e)
        if (href) navigate(href)
    }

    const toggleMobileExpand = (index: number) => {
        setExpandedMobileItems((prev) => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                next.add(index)
            }
            return next
        })
    }

    const updatePosition = useCallback(() => {
        if (!activeDropdown) return
        const el = triggerRefs.current[activeDropdown]
        if (!el) return
        const rect = el.getBoundingClientRect()

        // Check if dropdown would overflow viewport
        const dropdownHeight = 300 // approximate
        const isNearBottom = rect.bottom + dropdownHeight > window.innerHeight

        if (activeDropdown === 'rightSlot') {
            if (isNearBottom) {
                setMenuStyle({
                    bottom: `${window.innerHeight - rect.top + 12}px`,
                    right: `${window.innerWidth - rect.right}px`,
                })
            } else {
                setMenuStyle({
                    top: `${rect.bottom + 12}px`,
                    right: `${window.innerWidth - rect.right}px`,
                })
            }
        } else {
            if (isNearBottom) {
                setMenuStyle({
                    bottom: `${window.innerHeight - rect.top + 12}px`,
                    left: `${rect.left}px`,
                })
            } else {
                setMenuStyle({
                    top: `${rect.bottom + 12}px`,
                    left: `${rect.left}px`,
                })
            }
        }
    }, [activeDropdown])

    useEffect(() => {
        updatePosition()
    }, [updatePosition])

    useEffect(() => {
        if (!activeDropdown) return
        const debouncedUpdate = debounce(updatePosition, 100)
        window.addEventListener('resize', debouncedUpdate)
        window.addEventListener('scroll', updatePosition, {
            capture: false,
            passive: true,
        })
        return () => {
            window.removeEventListener('resize', debouncedUpdate)
            window.removeEventListener('scroll', updatePosition, {
                capture: false,
            })
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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden'
            return () => {
                document.body.style.overflow = ''
            }
        }
    }, [isMobileOpen])

    // Keyboard navigation for mobile menu
    useEffect(() => {
        if (!isMobileOpen) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileOpen(false)
                setExpandedMobileItems(new Set())
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isMobileOpen])

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
                    <NotificationBell />
                    <div className={styles.rightSlotContainer}>
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

                    <div className={styles.hamburgerBtn}>
                        <ButtonGhost
                            size="sm"
                            onClick={() => setIsMobileOpen(true)}
                            leftIcon={
                                <img
                                    src={IconHamburger}
                                    alt="Menu"
                                    style={{ width: 24, height: 24 }}
                                />
                            }
                        />
                    </div>
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

            {isMobileOpen &&
                createPortal(
                    <div className={styles.mobileMenuOverlay}>
                        <div className={styles.mobileMenuHeader}>
                            {brand}
                            <ButtonGhost
                                size="sm"
                                onClick={() => {
                                    setIsMobileOpen(false)
                                    setExpandedMobileItems(new Set())
                                }}
                                leftIcon={
                                    <img
                                        src={IconClose}
                                        alt="Close"
                                        style={{ width: 24, height: 24 }}
                                    />
                                }
                            />
                        </div>

                        <div className={styles.mobileMenuList}>
                            {items.map((item, index) => {
                                const isExpanded =
                                    expandedMobileItems.has(index)
                                const hasDropdown =
                                    item.dropdownItems &&
                                    item.dropdownItems.length > 0

                                return (
                                    <React.Fragment key={index}>
                                        <button
                                            className={`${styles.mobileMenuItem} ${item.active ? styles.mobileMenuItemActive : ''}`}
                                            onClick={(e) => {
                                                if (hasDropdown) {
                                                    toggleMobileExpand(index)
                                                } else {
                                                    handleMobileNavigate(
                                                        item.href,
                                                        item.onClick,
                                                        e
                                                    )
                                                }
                                            }}
                                            aria-expanded={
                                                hasDropdown
                                                    ? isExpanded
                                                    : undefined
                                            }
                                        >
                                            {item.leftIcon}
                                            <span style={{ flex: 1 }}>
                                                {item.label}
                                            </span>
                                            {hasDropdown && (
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    style={{
                                                        transform: isExpanded
                                                            ? 'rotate(180deg)'
                                                            : 'rotate(0deg)',
                                                        transition:
                                                            'transform 0.2s ease',
                                                    }}
                                                >
                                                    <path d="M4 6l4 4 4-4" />
                                                </svg>
                                            )}
                                        </button>

                                        {hasDropdown && isExpanded && (
                                            <div
                                                className={styles.mobileSubMenu}
                                            >
                                                {item.dropdownItems!.map(
                                                    (subItem, subIndex) => (
                                                        <button
                                                            key={`${index}-${subIndex}`}
                                                            className={
                                                                styles.mobileSubMenuItem
                                                            }
                                                            onClick={(e) =>
                                                                handleMobileNavigate(
                                                                    (
                                                                        subItem as any
                                                                    ).href,
                                                                    subItem.onClick,
                                                                    e
                                                                )
                                                            }
                                                        >
                                                            {subItem.icon}
                                                            <span>
                                                                {subItem.label}
                                                            </span>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    )
}
