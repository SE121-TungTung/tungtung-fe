import { useState, useEffect, useRef } from 'react'
import s from './QrScannerModal.module.css'
import { useDialog } from '@/hooks/useDialog'

interface QrScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onCheckIn: (qrToken: string) => void
    isSubmitting: boolean
}

export default function QrScannerModal({
    isOpen,
    onClose,
    onCheckIn,
    isSubmitting,
}: QrScannerModalProps) {
    const { alert } = useDialog()
    const [manualQrToken, setManualQrToken] = useState('')
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [jsQrLoaded, setJsQrLoaded] = useState(false)

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // 1. Tải thư viện jsQR từ CDN khi mở modal
    useEffect(() => {
        if (!isOpen) return

        if ((window as any).jsQR) {
            setJsQrLoaded(true)
            return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
        script.async = true
        script.onload = () => setJsQrLoaded(true)
        script.onerror = () =>
            setCameraError('Không thể tải thư viện quét mã QR.')
        document.body.appendChild(script)
    }, [isOpen])

    // 2. Quản lý camera stream và vòng lặp quét mã
    useEffect(() => {
        if (!isOpen || !jsQrLoaded) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }
            setCameraActive(false)
            setCameraError(null)
            return
        }

        let active = true
        let animationFrameId: number

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                })
                if (!active) {
                    stream.getTracks().forEach((track) => track.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.setAttribute('playsinline', 'true')
                    videoRef.current.play()
                    setCameraActive(true)
                }
            } catch (err: any) {
                console.error('Error accessing camera:', err)
                setCameraError(
                    'Không thể truy cập camera. Vui lòng nhập mã thủ công.'
                )
            }
        }

        startCamera()

        const scan = () => {
            if (!active) return
            const video = videoRef.current
            const canvas = canvasRef.current
            const jsQR = (window as any).jsQR

            if (
                video &&
                canvas &&
                jsQR &&
                video.readyState === video.HAVE_ENOUGH_DATA
            ) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    canvas.width = video.videoWidth
                    canvas.height = video.videoHeight
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                    const imageData = ctx.getImageData(
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )
                    const code = jsQR(
                        imageData.data,
                        imageData.width,
                        imageData.height,
                        {
                            inversionAttempts: 'dontInvert',
                        }
                    )

                    if (code && code.data) {
                        const scannedToken = code.data.trim()

                        try {
                            const audioCtx = new (
                                window.AudioContext ||
                                (window as any).webkitAudioContext
                            )()
                            const oscillator = audioCtx.createOscillator()
                            oscillator.type = 'sine'
                            oscillator.frequency.setValueAtTime(
                                800,
                                audioCtx.currentTime
                            )
                            oscillator.connect(audioCtx.destination)
                            oscillator.start()
                            oscillator.stop(audioCtx.currentTime + 0.1)
                        } catch {
                            // ignore audio context failures
                        }

                        if (streamRef.current) {
                            streamRef.current
                                .getTracks()
                                .forEach((track) => track.stop())
                            streamRef.current = null
                        }
                        setCameraActive(false)
                        setManualQrToken(scannedToken)
                        onCheckIn(scannedToken)
                        return
                    }
                }
            }
            animationFrameId = requestAnimationFrame(scan)
        }

        const timer = setTimeout(() => {
            if (active) scan()
        }, 500)

        return () => {
            active = false
            clearTimeout(timer)
            cancelAnimationFrame(animationFrameId)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
                streamRef.current = null
            }
        }
    }, [isOpen, jsQrLoaded, onCheckIn])

    if (!isOpen) return null

    const handleManualSubmit = () => {
        if (!manualQrToken.trim()) {
            alert('Vui lòng nhập mã QR token.', 'Lỗi')
            return
        }
        onCheckIn(manualQrToken.trim())
    }

    const handleClose = () => {
        setManualQrToken('')
        onClose()
    }

    return (
        <div className={s.overlay}>
            <div className={s.modalCard}>
                <h2 className={s.title}>Quét mã QR tự điểm danh</h2>
                <p className={s.description}>
                    Vui lòng đưa camera của bạn tới mã QR do giáo viên cung cấp
                    hoặc nhập mã token vào ô bên dưới.
                </p>

                <div className={s.scannerBox}>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <video
                        ref={videoRef}
                        className={s.videoFeed}
                        style={{ display: cameraActive ? 'block' : 'none' }}
                    />
                    {!cameraActive && (
                        <div className={s.loadingFallback}>
                            {cameraError ? (
                                <span className={s.cameraError}>
                                    ⚠️ {cameraError}
                                </span>
                            ) : (
                                <>
                                    <div
                                        className="spinner"
                                        style={{
                                            borderLeftColor: '#4f46e5',
                                            width: '28px',
                                            height: '28px',
                                        }}
                                    />
                                    <span className={s.cameraLoadingText}>
                                        Đang khởi động camera...
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                    {cameraActive && (
                        <>
                            <div className={s.scanLine} />
                            <div className={s.cornerTopLeft} />
                            <div className={s.cornerTopRight} />
                            <div className={s.cornerBottomLeft} />
                            <div className={s.cornerBottomRight} />
                        </>
                    )}
                </div>

                <div className={s.inputGroup}>
                    <label className={s.inputLabel}>Nhập mã QR token:</label>
                    <input
                        type="text"
                        placeholder="Dán mã QR token từ giáo viên..."
                        value={manualQrToken}
                        onChange={(e) => setManualQrToken(e.target.value)}
                        className={s.tokenInput}
                    />
                </div>

                <div className={s.buttonRow}>
                    <button onClick={handleClose} className={s.btnCancel}>
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleManualSubmit}
                        disabled={isSubmitting}
                        className={s.btnSubmit}
                    >
                        {isSubmitting ? 'Đang gửi...' : 'Gửi mã'}
                    </button>
                </div>
            </div>
        </div>
    )
}
