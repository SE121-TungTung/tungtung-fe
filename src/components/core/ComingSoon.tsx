import { useNavigate } from 'react-router-dom'
import LiquidEther from '@/components/effect/LiquidEther'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import s from './ComingSoon.module.css'

interface ComingSoonProps {
    title?: string
    description?: string
    showBackButton?: boolean
}

export default function ComingSoon({
    title = 'Tính năng đang phát triển',
    description = 'Chúng tôi đang nỗ lực hoàn thiện tính năng này. Vui lòng quay lại sau!',
    showBackButton = true,
}: ComingSoonProps) {
    const navigate = useNavigate()

    return (
        <div className={s.root}>
            <div className={s.bg} aria-hidden="true">
                <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={true}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={1000}
                    autoRampDuration={0.6}
                />
            </div>

            <div className={s.content}>
                <div className={s.card}>
                    {/* Icon */}
                    <div className={s.iconWrapper}>
                        <svg
                            className={s.icon}
                            viewBox="0 0 64 64"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                opacity="0.3"
                            />
                            <path
                                d="M32 16V32L40 40"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle cx="32" cy="32" r="3" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Text */}
                    <h1 className={s.title}>{title}</h1>
                    <p className={s.description}>{description}</p>

                    {/* Actions */}
                    {showBackButton && (
                        <div className={s.actions}>
                            <ButtonPrimary
                                variant="gradient"
                                shape="rounded"
                                onClick={() => navigate(-1)}
                            >
                                Quay lại
                            </ButtonPrimary>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
