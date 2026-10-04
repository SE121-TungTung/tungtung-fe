import React, { useState, useRef, useEffect, useCallback } from 'react'
import { WaveformCanvas } from './WaveformCanvas'
import {
    MicIcon,
    StopIcon,
    PlayIcon,
    ResetIcon,
    CheckIcon,
    AlertTriangleIcon,
} from './PronunciationIcons'
import s from './MicRecorder.module.css'

interface MicRecorderProps {
    onRecordingComplete: (blob: Blob, durationSeconds: number) => void
    isAnalyzing?: boolean
    maxDurationSeconds?: number
    onReset?: () => void
    resetKey?: string | number
}

export const MicRecorder: React.FC<MicRecorderProps> = ({
    onRecordingComplete,
    isAnalyzing = false,
    maxDurationSeconds = 30,
    onReset,
    resetKey,
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
    const startTimeRef = useRef<number | null>(null)
    const previewAudioRef = useRef<HTMLAudioElement | null>(null)

    // Tự động dọn dẹp và reset khi resetKey thay đổi (ví dụ chuyển từ/câu)
    useEffect(() => {
        if (resetKey !== undefined) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            startTimeRef.current = null
            if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !== 'inactive'
            ) {
                mediaRecorderRef.current.stop()
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl)
                setAudioUrl(null)
            }
            setAudioBlob(null)
            setDuration(0)
            audioChunksRef.current = []
            setIsRecording(false)
            setIsPlayingPreview(false)
            setErrorMsg(null)
        }
    }, [resetKey])

    // Dọn dẹp timer và preview audio khi component unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (previewAudioRef.current) {
                previewAudioRef.current.pause()
                previewAudioRef.current = null
            }
        }
    }, [])

    // Dọn dẹp stream microphone
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop())
            }
        }
    }, [mediaStream])

    // Dọn dẹp Object URL khi audioUrl thay đổi hoặc unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl)
        }
    }, [audioUrl])

    // Lựa chọn MIME type: ưu tiên lossless (WAV/PCM) để AI nhận diện IPA chính xác hơn
    const getSupportedMimeType = (): string => {
        const types = [
            'audio/wav', // Lossless — tốt nhất cho Wav2Vec2
            'audio/webm;codecs=pcm', // PCM trong WebM (Chrome 130+)
            'audio/ogg;codecs=pcm', // PCM trong OGG (Firefox)
            'audio/webm;codecs=opus', // Fallback lossy — chấp nhận được
            'audio/webm',
            'audio/mp4',
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

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (startTimeRef.current) {
            const finalSecs = Math.max(
                1,
                Math.round((Date.now() - startTimeRef.current) / 1000)
            )
            setDuration(finalSecs)
        }

        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== 'inactive'
        ) {
            mediaRecorderRef.current.stop()
        }

        setIsRecording(false)
    }, [])

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

            // Bắt đầu đếm thời gian bằng startTimeRef
            const now = Date.now()
            startTimeRef.current = now

            if (timerRef.current) clearInterval(timerRef.current)
            timerRef.current = window.setInterval(() => {
                if (startTimeRef.current) {
                    const elapsedSeconds = Math.floor(
                        (Date.now() - startTimeRef.current) / 1000
                    )
                    setDuration(elapsedSeconds)

                    if (elapsedSeconds >= maxDurationSeconds) {
                        stopRecording()
                    }
                }
            }, 200)
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
                    <AlertTriangleIcon size={18} className={s.errorIcon} />
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
                            <MicIcon size={18} />
                            <span>Bắt đầu nói</span>
                        </button>
                    )}

                    {isRecording && (
                        <button
                            type="button"
                            className={s.btnStop}
                            onClick={stopRecording}
                            title="Dừng ghi âm"
                        >
                            <StopIcon size={16} />
                            <span>Dừng & Hoàn tất</span>
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
                                {isPlayingPreview ? (
                                    <>
                                        <StopIcon size={14} />
                                        <span>Dừng</span>
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon size={14} />
                                        <span>Nghe lại</span>
                                    </>
                                )}
                            </button>

                            {/* Nút thu âm lại */}
                            <button
                                type="button"
                                className={s.btnSecondary}
                                onClick={handleReset}
                                disabled={isAnalyzing}
                                title="Thu âm lại từ đầu"
                            >
                                <ResetIcon size={14} />
                                <span>Thu lại</span>
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
                                        <CheckIcon size={16} />
                                        <span>Chấm điểm ngay</span>
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
