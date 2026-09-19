import { type ReactNode } from 'react'
import s from './AuthLayout.module.css'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import EducationalBackground from '@/components/effect/EducationalBackground'
import { useUIStore } from '@/stores/ui.store'
import { Tooltip } from '@/components/core/Tooltip'

const SunIcon = () => (
    <svg
        width="18"
        height="18"
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
        width="18"
        height="18"
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

export interface AuthLayoutProps {
    /** Main heading text (e.g., "Đăng nhập") */
    headingPrimary: string

    /** Secondary heading text (e.g., "để truy cập") - will be styled differently */
    headingSecondary?: string

    /** Final heading text (e.g., "TungTung") */
    headingTertiary?: string

    /** Description for the info card (optional, uses default if not provided) */
    infoDescription?: string

    /** CTA button text for info card (optional) */
    infoCtaText?: string

    /** CTA button handler for info card (optional) */
    onInfoCtaClick?: () => void

    /** Form content (FormCard component) */
    children: ReactNode

    /** Optional: Hide info section on mobile */
    hideInfoOnMobile?: boolean

    /** Optional: Custom background component */
    customBackground?: ReactNode
}

export default function AuthLayout({
    headingPrimary,
    headingSecondary,
    headingTertiary,
    infoDescription = 'Website quản lý trung tâm Anh ngữ số 1 Việt Nam, cung cấp hệ sinh thái đa dạng cho người dạy lẫn người học.',
    infoCtaText = 'Tìm hiểu thêm',
    onInfoCtaClick = () =>
        window.open('https://tungtung-fe.vercel.app', '_blank'),
    children,
    hideInfoOnMobile = false,
    customBackground,
}: AuthLayoutProps) {
    const { theme, setTheme } = useUIStore()
    const isDark = theme === 'dark'

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark')
    }

    return (
        <div className={s.container}>
            {/* Theme Toggle Button (Top Right) */}
            <div className={s.themeToggleWrapper}>
                <Tooltip
                    placement="bottom-end"
                    content={
                        isDark
                            ? 'Chuyển sang giao diện Sáng'
                            : 'Chuyển sang giao diện Tối'
                    }
                >
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className={s.themeToggleBtn}
                        aria-label={
                            isDark
                                ? 'Chuyển sang giao diện Sáng'
                                : 'Chuyển sang giao diện Tối'
                        }
                    >
                        <span className={s.themeIconWrapper}>
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </span>
                        <span className={s.themeToggleText}>
                            {isDark ? 'Sáng' : 'Tối'}
                        </span>
                    </button>
                </Tooltip>
            </div>

            {/* Background */}
            <div className={s.background} aria-hidden="true">
                {customBackground || <EducationalBackground />}
            </div>

            {/* Main Content Wrapper */}
            <div className={s.wrapper}>
                {/* Info Section */}
                <div
                    className={`${s.infoSection} ${hideInfoOnMobile ? s.hideOnMobile : ''}`}
                >
                    <div className={s.headingContainer}>
                        <h1 className={s.heading}>
                            {headingPrimary}
                            {headingSecondary && (
                                <>
                                    {' '}
                                    <span className={s.headingSecondary}>
                                        {headingSecondary}
                                    </span>
                                </>
                            )}
                            {headingTertiary && <> {headingTertiary}</>}
                        </h1>
                    </div>

                    <div className={s.infoCard}>
                        <TextHorizontal
                            icon={
                                <img
                                    src={ChatSquare}
                                    className={s.infoIcon}
                                    alt="Info icon"
                                />
                            }
                            iconStyle="glass"
                            mode={isDark ? 'dark' : 'light'}
                            description={infoDescription}
                            ctaText={infoCtaText}
                            onCtaClick={onInfoCtaClick}
                        />
                    </div>
                </div>

                {/* Form Section */}
                <div className={s.formSection}>{children}</div>
            </div>
        </div>
    )
}
