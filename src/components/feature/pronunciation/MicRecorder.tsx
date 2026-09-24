import React, { useState, useRef, useEffect, useCallback } from 'react'
import { WaveformCanvas } from './WaveformCanvas'
import s from './MicRecorder.module.css'

interface MicRecorderProps {
    onRecordingComplete: (blob: Blob, durationSeconds: number) => void
    isAnalyzing?: boolean
    maxDurationSeconds?: number
    onReset?: () => void
}

export const MicRecorder: React.FC<MicRecorderProps> = ({
    onRecordingComplete,
    isAnalyzing = false,
    maxDurationSeconds = 30,
    onReset,
}) => {
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlayingPreview, setIsPlayingPreview] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const timerRef = useRef<number | null>(null)
    const previewAudioRef = useRef<HTMLAudioElement | null>(null)

    // Dọn dẹp object URL và stream khi component unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (audioUrl) URL.revokeObjectURL(audioUrl)
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [audioUrl, mediaStream])

    // Lựa chọn MIME type phù hợp nhất với trình duyệt
    const getSupportedMimeType = (): string => {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/aac',
            'audio/ogg;codecs=opus',
        ]
        for (const type of types) {
            if (
                typeof MediaRecorder !== 'undefined' &&
                MediaRecorder.isTypeSupported(type)
            ) {
                return type
            }
        }
        return ''
    }

    const startRecording = async () => {
        setErrorMsg(null)
        setAudioBlob(null)
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
            setAudioUrl(null)
        }
        setDuration(0)
        audioChunksRef.current = []

        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    'Trình duyệt không hỗ trợ truy cập micro (MediaDevices API).'
                )
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            })
            setMediaStream(stream)

            const mimeType = getSupportedMimeType()
            const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
            const recorder = new MediaRecorder(stream, options)
            mediaRecorderRef.current = recorder

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            recorder.onstop = () => {
                const mime = mimeType || 'audio/webm'
                const finalBlob = new Blob(audioChunksRef.current, {
                    type: mime,
                })
                setAudioBlob(finalBlob)
                const url = URL.createObjectURL(finalBlob)
                setAudioUrl(url)

                // Dừng các track của micro để giải phóng thiết bị
                stream.getTracks().forEach((track) => track.stop())
                setMediaStream(null)
            }

            recorder.start(100)
            setIsRecording(true)

            // Bắt đầu đếm thời gian
            const startTime = Date.now()
            timerRef.current = window.setInterval(() => {
                const elapsedSeconds = Math.floor(
                    (Date.now() - startTime) / 1000
                )
                setDuration(elapsedSeconds)

                if (elapsedSeconds >= maxDurationSeconds) {
                    stopRecording()
                }
            }, 250)
        } catch (err: unknown) {
            console.error('Không thể truy cập microphone:', err)
            const error = err as Error
            if (
                error.name === 'NotAllowedError' ||
                error.name === 'PermissionDeniedError'
            ) {
                setErrorMsg(
                    'Vui lòng cấp quyền truy cập micro trong cài đặt trình duyệt để tiếp tục luyện phát âm.'
                )
            } else {
                setErrorMsg(
                    error.message || 'Không thể mở micro. Vui lòng thử lại.'
                )
            }
            setIsRecording(false)
        }
    }

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
        ) {
            mediaRecorderRef.current.stop()
        }

        setIsRecording(false)
    }, [])

    const handleReset = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
        ) {
            mediaRecorderRef.current.stop()
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach((t) => t.stop())
            setMediaStream(null)
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
            setAudioUrl(null)
        }
        setAudioBlob(null)
        setDuration(0)
        setIsRecording(false)
        setIsPlayingPreview(false)
        setErrorMsg(null)
        if (onReset) onReset()
    }

    const togglePlayPreview = () => {
        if (!audioUrl) return
        if (!previewAudioRef.current) {
            previewAudioRef.current = new Audio(audioUrl)
            previewAudioRef.current.onended = () => setIsPlayingPreview(false)
        }

        if (isPlayingPreview) {
            previewAudioRef.current.pause()
            setIsPlayingPreview(false)
        } else {
            previewAudioRef.current.currentTime = 0
            previewAudioRef.current
                .play()
                .then(() => setIsPlayingPreview(true))
                .catch((e) => console.error('Lỗi phát lại audio:', e))
        }
    }

    const handleSubmit = () => {
        if (!audioBlob) return
        onRecordingComplete(audioBlob, duration)
    }

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, '0')
        const s = (secs % 60).toString().padStart(2, '0')
        return `${m}:${s}`
    }

    return (
        <div className={s.recorderCard}>
            {/* Hiển thị sóng âm thời gian thực */}
            <WaveformCanvas stream={mediaStream} isRecording={isRecording} />

            {/* Thông báo lỗi nếu bị chặn quyền micro */}
            {errorMsg && (
                <div className={s.errorBox}>
                    <span className={s.errorIcon}>⚠️</span>
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Thanh điều khiển Ghi âm / Nghe lại / Gửi chấm */}
            <div className={s.controlBar}>
                {/* Thời gian ghi âm */}
                <div className={s.timerDisplay}>
                    <span
                        className={`${s.timerText} ${isRecording ? s.recordingTimer : ''}`}
                    >
                        {formatTime(duration)}
                    </span>
                    <span className={s.timerMax}>
                        / {formatTime(maxDurationSeconds)}
                    </span>
                </div>

                {/* Các nút bấm thao tác */}
                <div className={s.buttonGroup}>
                    {!isRecording && !audioBlob && (
                        <button
                            type="button"
                            className={s.btnRecord}
                            onClick={startRecording}
                            disabled={isAnalyzing}
                            title="Bắt đầu ghi âm"
                        >
                            <span className={s.recordIcon} />
                            <span>🎙️ Bắt đầu nói</span>
                        </button>
                    )}

                    {isRecording && (
                        <button
                            type="button"
                            className={s.btnStop}
                            onClick={stopRecording}
                            title="Dừng ghi âm"
                        >
                            <span className={s.stopIcon} />
                            <span>⏹️ Dừng & Hoàn tất</span>
                        </button>
                    )}

                    {audioBlob && !isRecording && (
                        <>
                            {/* Nút nghe lại bản thu */}
                            <button
                                type="button"
                                className={s.btnSecondary}
                                onClick={togglePlayPreview}
                                disabled={isAnalyzing}
                                title={
                                    isPlayingPreview ? 'Tạm dừng' : 'Nghe lại'
                                }
                            >
                                <span>
                                    {isPlayingPreview
                                        ? '⏸️ Dừng'
                                        : '▶️ Nghe lại'}
                                </span>
                            </button>

                            {/* Nút thu âm lại */}
                            <button
                                type="button"
                                className={s.btnSecondary}
                                onClick={handleReset}
                                disabled={isAnalyzing}
                                title="Thu âm lại từ đầu"
                            >
                                <span>⟳ Thu lại</span>
                            </button>

                            {/* Nút gửi chấm điểm */}
                            <button
                                type="button"
                                className={s.btnPrimary}
                                onClick={handleSubmit}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className={s.spinner} />
                                        <span>AI đang phân tích...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>✓ Chấm điểm ngay</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
