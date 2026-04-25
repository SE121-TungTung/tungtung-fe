import { useUIStore, type Theme } from '@/stores/ui.store'
import styles from './SettingsPage.module.css'
import React from 'react'

const SunIcon = () => (
    <svg
        width="24"
        height="24"
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
        width="24"
        height="24"
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
        width="24"
        height="24"
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

export default function SettingsPage() {
    const { theme, setTheme } = useUIStore()

    const themes: {
        id: Theme
        icon: React.ReactNode
        label: string
        description: string
    }[] = [
        {
            id: 'light',
            icon: <SunIcon />,
            label: 'Sáng (Light)',
            description: 'Giao diện sáng sủa mặc định với màu sắc nguyên bản.',
        },
        {
            id: 'dark',
            icon: <MoonIcon />,
            label: 'Tối (Dark)',
            description: 'Giao diện tối giúp dịu mắt khi sử dụng về đêm.',
        },
        {
            id: 'monochrome',
            icon: <DropIcon />,
            label: 'Đơn sắc (Monochrome)',
            description:
                'Giữ nguyên tông màu thương hiệu đỏ-xanh nhưng dưới dạng siêu phẳng (không gradient, không bóng mờ), dễ nhìn tập trung.',
        },
    ]

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Cài đặt hệ thống</h1>
                <p className={styles.subtitle}>
                    Tuỳ chỉnh trải nghiệm ứng dụng của bạn
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Giao diện hiển thị (Theme)
                </h2>
                <div className={styles.themeGrid}>
                    {themes.map((t) => (
                        <div
                            key={t.id}
                            className={`${styles.themeCard} ${
                                theme === t.id ? styles.themeCardActive : ''
                            }`}
                            onClick={() => setTheme(t.id)}
                        >
                            <div className={styles.themeCardIcon}>{t.icon}</div>
                            <div className={styles.themeCardContent}>
                                <h3>{t.label}</h3>
                                <p>{t.description}</p>
                            </div>
                            {theme === t.id && (
                                <div className={styles.checkIcon}>✓</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
