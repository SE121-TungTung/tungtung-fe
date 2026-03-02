import { useEffect } from 'react'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

interface SuccessModalProps {
    title: string
    message: string
    onClose: () => void
    buttonText?: string
}

export default function SuccessModal({
    title,
    message,
    onClose,
    buttonText = 'Đóng',
}: SuccessModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                }}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    maxWidth: '440px',
                    width: '100%',
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                    animation: 'modalSlideIn 0.3s ease-out',
                }}
                role="dialog"
                aria-labelledby="modal-title"
                aria-modal="true"
            >
                {/* Success Icon */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '24px',
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background:
                                'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(82, 196, 26, 0.3)',
                        }}
                    >
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M20 6L9 17L4 12"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2
                    id="modal-title"
                    style={{
                        margin: '0 0 12px 0',
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#fff',
                        textAlign: 'center',
                        letterSpacing: '-0.5px',
                    }}
                >
                    {title}
                </h2>

                {/* Message */}
                <p
                    style={{
                        margin: '0 0 32px 0',
                        fontSize: '15px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        textAlign: 'center',
                        lineHeight: 1.6,
                    }}
                >
                    {message}
                </p>

                {/* Action Button */}
                <ButtonPrimary
                    onClick={onClose}
                    variant="glass"
                    shape="rounded"
                    style={{ width: '100%' }}
                >
                    {buttonText}
                </ButtonPrimary>
            </div>

            {/* Animation keyframes */}
            <style>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    )
}
