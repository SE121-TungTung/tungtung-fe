import { useState, useMemo, useEffect } from 'react'

interface QrCodeModalProps {
    session: any
    onClose: () => void
}

export function QrCodeModal({ session, onClose }: QrCodeModalProps) {
    const [copied, setCopied] = useState(false)

    const qrToken = session.qr_token || ''
    const qrExpiresAtString = session.qr_expires_at || ''
    const qrExpiresAt = useMemo(() => {
        return qrExpiresAtString ? new Date(qrExpiresAtString) : null
    }, [qrExpiresAtString])

    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!qrExpiresAt) return
        const updateTimer = () => {
            const now = new Date()
            const diff = qrExpiresAt.getTime() - now.getTime()
            if (diff <= 0) {
                setTimeLeft('Đã hết hạn')
            } else {
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            }
        }
        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [qrExpiresAt])

    const handleCopy = () => {
        navigator.clipboard.writeText(qrToken)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrToken)}&size=250x250`

    return (
        <div style={{ textAlign: 'center', padding: '8px' }}>
            <h2
                style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: '#1e293b',
                }}
            >
                Mã QR Điểm Danh Tự Động
            </h2>
            <p
                style={{
                    fontSize: '14px',
                    color: '#64748b',
                    marginBottom: '24px',
                }}
            >
                Học viên quét mã bên dưới hoặc dùng mã token để tự điểm danh.
            </p>

            <div
                style={{
                    width: '240px',
                    height: '240px',
                    margin: '0 auto 20px',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
            >
                {qrToken ? (
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                ) : (
                    <div style={{ color: '#94a3b8' }}>Mã QR không hợp lệ</div>
                )}
            </div>

            {qrExpiresAt && (
                <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Thời gian còn lại:{' '}
                    </span>
                    <span
                        style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color:
                                timeLeft === 'Đã hết hạn'
                                    ? '#ef4444'
                                    : '#10b981',
                            backgroundColor:
                                timeLeft === 'Đã hết hạn'
                                    ? '#fef2f2'
                                    : '#ecfdf5',
                            padding: '4px 12px',
                            borderRadius: '20px',
                        }}
                    >
                        {timeLeft}
                    </span>
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#f8fafc',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '28px',
                }}
            >
                <span
                    style={{
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        textAlign: 'left',
                    }}
                >
                    {qrToken}
                </span>
                <button
                    onClick={handleCopy}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: copied ? '#10b981' : '#4f46e5',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        minWidth: '80px',
                    }}
                >
                    {copied ? 'Đã copy' : 'Copy'}
                </button>
            </div>

            <button
                onClick={onClose}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                }}
            >
                Đóng
            </button>
        </div>
    )
}

export default QrCodeModal
