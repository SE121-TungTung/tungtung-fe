import { type ReactNode } from 'react'
import s from './AuthLayout.module.css'
import { TextHorizontal } from '@/components/common/text/TextHorizontal'
import ChatSquare from '@/assets/Chat Square Exclamation.svg'
import EducationalBackground from '@/components/effect/EducationalBackground'

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
    return (
        <div className={s.container}>
            {/* Animated Background */}
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
