import { useUIStore, type Theme } from '@/stores/ui.store'
import styles from './ThemeSwitcher.module.css'
import React from 'react'
import { Tooltip } from '@/components/core/Tooltip'

const SunIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
)

const MoonIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
)

const DropIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
)

export function ThemeSwitcher() {
    const { theme, setTheme } = useUIStore()

    const themes: { id: Theme; icon: React.ReactNode; label: string }[] = [
        { id: 'light', icon: <SunIcon />, label: 'Sáng' },
        { id: 'dark', icon: <MoonIcon />, label: 'Tối' },
        { id: 'monochrome', icon: <DropIcon />, label: 'Xám' },
    ]

    return (
        <div className={styles.switcher}>
            {themes.map((t) => (
                <Tooltip key={t.id} content={t.label}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setTheme(t.id)
                        }}
                        className={`${styles.button} ${
                            theme === t.id ? styles.active : ''
                        }`}
                        aria-label={t.label}
                    >
                        {t.icon}
                    </button>
                </Tooltip>
            ))}
        </div>
    )
}
