import React, { useEffect } from 'react'
import { useLoadingStore } from '@/stores/loading.store'
import { useSession } from '@/stores/session.store'
import s from './LoadingPage.module.css'

export type LoadingPageProps = {
    title?: string
    subtitle?: string
    /** Optional exact progress (0-100). */
    progress?: number
}

interface RoleConfig {
    subtitle: string
    steps: { threshold: number; text: string }[]
    completedText: string
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
    teacher: {
        subtitle: 'Không gian quản lý giảng dạy & theo dõi lớp học',
        steps: [
            { threshold: 0, text: 'Khởi tạo hệ thống giảng dạy TungTung…' },
            { threshold: 25, text: 'Đang nạp danh sách lớp học và giáo án…' },
            {
                threshold: 50,
                text: 'Đồng bộ tiến độ học viên và bài cần chấm…',
            },
            {
                threshold: 75,
                text: 'Tối ưu hóa không gian làm việc giảng viên…',
            },
            { threshold: 92, text: 'Hoàn tất chuẩn bị dữ liệu lớp học…' },
            {
                threshold: 100,
                text: 'Hoàn tất! Sẵn sàng đồng hành cùng học viên…',
            },
        ],
        completedText: 'Hoàn tất! Sẵn sàng đồng hành cùng học viên…',
    },
    admin: {
        subtitle: 'Trung tâm quản trị & điều hành hệ thống TungTung',
        steps: [
            { threshold: 0, text: 'Khởi tạo cổng quản trị hệ thống TungTung…' },
            {
                threshold: 25,
                text: 'Xác thực đặc quyền và bảo mật phiên quản trị…',
            },
            {
                threshold: 50,
                text: 'Tải cơ sở dữ liệu người dùng, cơ sở và lớp học…',
            },
            {
                threshold: 75,
                text: 'Kiểm tra phân quyền và cấu hình hệ thống…',
            },
            { threshold: 92, text: 'Hoàn tất nạp dữ liệu quản trị…' },
            {
                threshold: 100,
                text: 'Hoàn tất! Hệ thống quản trị đã sẵn sàng…',
            },
        ],
        completedText: 'Hoàn tất! Hệ thống quản trị đã sẵn sàng…',
    },
    student: {
        subtitle: 'Nền tảng luyện thi IELTS thông minh',
        steps: [
            { threshold: 0, text: 'Khởi tạo kết nối hệ thống TungTung…' },
            {
                threshold: 25,
                text: 'Đang đồng bộ lộ trình học tập và kết quả luyện thi…',
            },
            {
                threshold: 50,
                text: 'Tải bài học, flashcard và tài nguyên tương tác…',
            },
            { threshold: 75, text: 'Tối ưu hóa không gian luyện thi IELTS…' },
            { threshold: 92, text: 'Đang hoàn tất bài học của bạn…' },
            {
                threshold: 100,
                text: 'Hoàn tất! Sẵn sàng đưa bạn vào học ngay…',
            },
        ],
        completedText: 'Hoàn tất! Sẵn sàng đưa bạn vào học ngay…',
    },
    default: {
        subtitle: 'Hệ thống học tập & khảo thí IELTS thông minh',
        steps: [
            { threshold: 0, text: 'Khởi tạo kết nối hệ thống TungTung…' },
            { threshold: 25, text: 'Đang tải tài nguyên giao diện…' },
            { threshold: 50, text: 'Đồng bộ cấu hình và phiên làm việc…' },
            { threshold: 75, text: 'Tối ưu hóa hiệu năng trải nghiệm…' },
            { threshold: 92, text: 'Sắp hoàn tất trong giây lát…' },
            {
                threshold: 100,
                text: 'Hoàn tất! Chào mừng bạn đến với TungTung…',
            },
        ],
        completedText: 'Hoàn tất! Chào mừng bạn đến với TungTung…',
    },
}

const SparkleIcon: React.FC = () => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={s.sparkleIcon}
        aria-hidden="true"
    >
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
)

/**
 * GlobalLoadingOverlay:
 * Persistent top-level overlay that runs the loading progress up to 100%,
 * freezes briefly at 100%, and blurs out smoothly into the new screen.
 * Automatically adapts subtitles and status dialogues to the user's role.
 */
export const GlobalLoadingOverlay: React.FC = () => {
    const { status, progress, title, subtitle } = useLoadingStore()
    const userRole = useSession((s) => s.user?.role)?.toLowerCase()

    if (status === 'idle') {
        return null
    }

    let roleKey = 'default'
    if (userRole === 'teacher' || userRole === 'ta') {
        roleKey = 'teacher'
    } else if (
        userRole === 'system_admin' ||
        userRole === 'center_admin' ||
        userRole === 'office_admin'
    ) {
        roleKey = 'admin'
    } else if (userRole === 'student' || userRole === 'guest_student') {
        roleKey = 'student'
    }

    const currentConfig = ROLE_CONFIGS[roleKey]
    const effectiveSubtitle = subtitle ?? currentConfig.subtitle

    const displayProgress = Math.min(100, Math.max(0, Math.round(progress)))
    const isCompleted = displayProgress >= 100
    const isFreezing = status === 'freezing'
    const isExiting = status === 'exiting'

    // Status step matching percentage and role
    const currentStep = isCompleted
        ? currentConfig.completedText
        : ([...currentConfig.steps]
              .reverse()
              .find((step) => displayProgress >= step.threshold)?.text ??
          currentConfig.steps[0].text)

    const rootClasses = [
        s.root,
        isFreezing ? s.freezing : '',
        isExiting ? s.exiting : '',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={rootClasses} role="status" aria-live="polite">
            {/* Ambient Animated Glowing Orbs */}
            <div className={s.orbWrapper} aria-hidden="true">
                <div className={s.orbCrimson} />
                <div className={s.orbLapis} />
                <div className={s.orbCyan} />
            </div>

            {/* Central Glassmorphic Card */}
            <div className={s.card}>
                {/* Brand Orbital Emblem */}
                <div className={s.emblemWrapper} aria-hidden="true">
                    <div className={s.outerRing} />
                    <div className={s.innerRing} />
                    <div className={s.pulseCore}>
                        <SparkleIcon />
                    </div>
                </div>

                {/* Percentage Display */}
                <div
                    className={s.percentWrapper}
                    aria-label={`Tiến trình ${displayProgress}%`}
                >
                    <span className={s.percentNumber}>{displayProgress}</span>
                    <span className={s.percentSign}>%</span>
                </div>

                {/* Shimmering Brand Progress Bar */}
                <div className={s.progressTrack} aria-hidden="true">
                    <div
                        className={s.progressBar}
                        style={{ width: `${displayProgress}%` }}
                    />
                </div>

                {/* Title & Subtitle */}
                <h2 className={s.title}>{title}</h2>
                <p className={s.subtitle}>{effectiveSubtitle}</p>

                {/* Contextual Status Step */}
                <div className={s.statusBadge}>
                    <span
                        className={`${s.statusDot} ${isCompleted ? s.statusDotSuccess : ''}`}
                        aria-hidden="true"
                    />
                    <span className={s.statusText}>{currentStep}</span>
                </div>
            </div>
        </div>
    )
}

/**
 * LoadingPage:
 * Drop-in component for Suspense fallbacks and async route guards.
 * Automatically signals the persistent overlay to load to 100%, freeze, and blur exit.
 */
export default function LoadingPage({
    title = 'Đang nạp dữ liệu…',
    subtitle,
    progress: controlledProgress,
}: LoadingPageProps) {
    const startLoading = useLoadingStore((s) => s.startLoading)
    const finishLoading = useLoadingStore((s) => s.finishLoading)
    const setProgress = useLoadingStore((s) => s.setProgress)

    useEffect(() => {
        startLoading(title, subtitle)
        return () => {
            finishLoading()
        }
    }, [title, subtitle, startLoading, finishLoading])

    useEffect(() => {
        if (typeof controlledProgress === 'number') {
            setProgress(controlledProgress)
        }
    }, [controlledProgress, setProgress])

    return <div className={s.suspenseFallbackBackdrop} aria-hidden="true" />
}

export { LoadingPage }
