import React, { useEffect, useRef } from 'react'
import s from './WaveformCanvas.module.css'

interface WaveformCanvasProps {
    stream: MediaStream | null
    isRecording: boolean
    height?: number
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
    stream,
    isRecording,
    height = 96,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const animationFrameIdRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Thiết lập kích thước canvas theo DPR để vẽ sắc nét
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        canvas.width = (rect.width || 600) * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        const width = rect.width || 600

        // Khi đang ghi âm và có stream
        if (isRecording && stream) {
            try {
                const AudioCtxClass =
                    window.AudioContext ||
                    (
                        window as unknown as {
                            webkitAudioContext: typeof AudioContext
                        }
                    ).webkitAudioContext
                const audioCtx = new AudioCtxClass()
                const analyser = audioCtx.createAnalyser()
                analyser.fftSize = 128
                analyser.smoothingTimeConstant = 0.8

                const source = audioCtx.createMediaStreamSource(stream)
                source.connect(analyser)

                audioContextRef.current = audioCtx
                analyserRef.current = analyser
                sourceRef.current = source

                const bufferLength = analyser.frequencyBinCount
                const dataArray = new Uint8Array(bufferLength)

                const drawLive = () => {
                    animationFrameIdRef.current =
                        requestAnimationFrame(drawLive)
                    analyser.getByteFrequencyData(dataArray)

                    ctx.clearRect(0, 0, width, height)

                    // Vẽ các cột sóng đối xứng hai chiều từ tâm trục
                    const barCount = 48
                    const barWidth = Math.max(3, width / barCount - 3)
                    const centerY = height / 2

                    for (let i = 0; i < barCount; i++) {
                        // Lấy mẫu dữ liệu tần số
                        const dataIndex = Math.floor(
                            (i / barCount) * bufferLength
                        )
                        const rawVal = dataArray[dataIndex] || 0
                        // Tối thiểu có một độ cao nhỏ cho hiệu ứng sống động
                        const normalizedHeight = Math.max(
                            4,
                            (rawVal / 255) * (height * 0.85)
                        )

                        const x = i * (barWidth + 3) + 2
                        const halfH = normalizedHeight / 2

                        // Gradient màu sóng (Lapis blue sang Cyan rực rỡ)
                        const gradient = ctx.createLinearGradient(
                            0,
                            centerY - halfH,
                            0,
                            centerY + halfH
                        )
                        gradient.addColorStop(0, '#38bdf8')
                        gradient.addColorStop(0.5, '#0ea5e9')
                        gradient.addColorStop(1, '#0284c7')

                        ctx.fillStyle = gradient
                        ctx.beginPath()
                        ctx.roundRect(
                            x,
                            centerY - halfH,
                            barWidth,
                            normalizedHeight,
                            3
                        )
                        ctx.fill()
                    }
                }

                drawLive()
            } catch (err) {
                console.error('Lỗi khởi tạo AudioContext cho Waveform:', err)
            }
        } else {
            // Khi ở trạng thái chờ (Idle) - Vẽ đường thẳng tĩnh nhẹ nhàng
            let offset = 0
            const drawIdle = () => {
                animationFrameIdRef.current = requestAnimationFrame(drawIdle)
                ctx.clearRect(0, 0, width, height)

                const centerY = height / 2
                offset += 0.03

                ctx.beginPath()
                ctx.moveTo(0, centerY)

                for (let x = 0; x < width; x += 4) {
                    const y = centerY + Math.sin(x * 0.02 + offset) * 3
                    ctx.lineTo(x, y)
                }

                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
                ctx.lineWidth = 2
                ctx.stroke()
            }

            drawIdle()
        }

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current)
                animationFrameIdRef.current = null
            }
            if (sourceRef.current) {
                sourceRef.current.disconnect()
                sourceRef.current = null
            }
            if (
                audioContextRef.current &&
                audioContextRef.current.state !== 'closed'
            ) {
                audioContextRef.current.close().catch(() => {})
                audioContextRef.current = null
            }
        }
    }, [stream, isRecording, height])

    return (
        <div className={s.canvasContainer} style={{ height }}>
            <canvas ref={canvasRef} className={s.canvasElement} />
            {isRecording && (
                <div className={s.recordingBadge}>
                    <span className={s.pulsingDot} />
                    <span>Đang thu âm...</span>
                </div>
            )}
        </div>
    )
}
