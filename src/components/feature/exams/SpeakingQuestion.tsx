import { useState, useRef, useEffect } from 'react'
import { testApi } from '@/lib/test'
import s from './SpeakingQuestion.module.css'

export interface SpeakingQuestionProps {
    questionId: string
    globalNumber: number
    questionText: string
    audioUrl?: string | null
    attemptId: string
    registerRef: (id: string, element: HTMLElement) => void
    onSubmitted?: (result: any) => void
    partNumber?: 1 | 2 | 3
}

type RecordingState =
    | 'idle'
    | 'preparing'
    | 'recording'
    | 'preview'
    | 'submitting'
    | 'submitted'

export function SpeakingQuestion({
    questionId,
    globalNumber,
    questionText,
    audioUrl,
    attemptId,
    registerRef,
    onSubmitted,
    partNumber = 1,
}: SpeakingQuestionProps) {
    const [state, setState] = useState<RecordingState>('idle')
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [prepTime, setPrepTime] = useState(0)
    const [result, setResult] = useState<any>(null)

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    const PREP_TIME = partNumber === 2 ? 60 : 0
    const MAX_RECORDING_TIME = partNumber === 2 ? 120 : 180

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const startPreparation = async () => {
        if (partNumber !== 2) {
            startRecording()
            return
        }

        setState('preparing')
        setPrepTime(PREP_TIME)

        timerRef.current = setInterval(() => {
            setPrepTime((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    startRecording()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            })
            streamRef.current = stream

            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data)
            }

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                setRecordedBlob(blob)
                setPreviewUrl(URL.createObjectURL(blob))
                setState('preview')
                stream.getTracks().forEach((track) => track.stop())
            }

            recorder.start()
            setMediaRecorder(recorder)
            setState('recording')
            setRecordingTime(0)

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= MAX_RECORDING_TIME) {
                        stopRecording()
                        return prev
                    }
                    return prev + 1
                })
            }, 1000)
        } catch (error) {
            console.error('Failed to start recording:', error)
            alert('Vui lòng cho phép truy cập microphone')
            setState('idle')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && state === 'recording') {
            mediaRecorder.stop()
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    const reRecord = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        setRecordedBlob(null)
        setRecordingTime(0)
        setState('idle')
    }

    const submitRecording = async () => {
        if (!recordedBlob) return

        setState('submitting')
        try {
            const result = await testApi.submitSpeaking(
                attemptId,
                questionId,
                recordedBlob
            )
            setResult(result)
            setState('submitted')
            onSubmitted?.(result)
        } catch (error: any) {
            console.error('Failed to submit speaking:', error)
            alert(error.message || 'Nộp bài nói thất bại. Vui lòng thử lại.')
            setState('preview')
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div
            ref={(el) => {
                if (el) registerRef(questionId, el)
            }}
            className={s.container}
        >
            <p className={s.questionText}>
                {globalNumber}. {questionText}
            </p>

            {audioUrl && (
                <div className={s.audioWrapper}>
                    <audio src={audioUrl} controls className={s.audio} />
                </div>
            )}

            <div className={s.recordingBox}>
                {/* IDLE STATE */}
                {state === 'idle' && (
                    <button onClick={startPreparation} className={s.btnStart}>
                        🎤{' '}
                        {partNumber === 2
                            ? 'Bắt đầu (1 phút chuẩn bị)'
                            : 'Bắt đầu ghi âm'}
                    </button>
                )}

                {/* PREPARING STATE (Part 2 only) */}
                {state === 'preparing' && (
                    <div className={s.preparingState}>
                        <div className={s.bigTimer}>{formatTime(prepTime)}</div>
                        <p className={s.statusText}>⏳ Thời gian chuẩn bị...</p>
                        <p className={s.hint}>Bạn có thể ghi chú ý tưởng</p>
                    </div>
                )}

                {/* RECORDING STATE */}
                {state === 'recording' && (
                    <div className={s.recordingState}>
                        <div
                            className={s.bigTimer}
                            style={{ color: '#ef4444' }}
                        >
                            {formatTime(recordingTime)}
                        </div>
                        <div className={s.recordingIndicator}>
                            <span className={s.redDot}></span>
                            Đang ghi âm...
                        </div>
                        <button onClick={stopRecording} className={s.btnStop}>
                            ⏹️ Dừng ghi âm
                        </button>
                    </div>
                )}

                {/* PREVIEW STATE */}
                {state === 'preview' && previewUrl && (
                    <div className={s.previewState}>
                        <p className={s.statusText}>
                            ✅ Đã ghi xong ({formatTime(recordingTime)})
                        </p>

                        <audio
                            ref={audioRef}
                            src={previewUrl}
                            controls
                            className={s.previewAudio}
                        />

                        <div className={s.previewActions}>
                            <button
                                onClick={reRecord}
                                className={s.btnRerecord}
                            >
                                🔄 Ghi lại
                            </button>
                            <button
                                onClick={submitRecording}
                                className={s.btnSubmit}
                            >
                                ✅ Nộp bài
                            </button>
                        </div>
                    </div>
                )}

                {/* SUBMITTING STATE */}
                {state === 'submitting' && (
                    <div className={s.submittingState}>
                        <div className={s.spinner}></div>
                        <p className={s.statusText}>
                            Đang xử lý và chấm điểm...
                        </p>
                    </div>
                )}

                {/* SUBMITTED STATE */}
                {state === 'submitted' && result && (
                    <div className={s.submittedState}>
                        <p className={s.successText}>✅ Đã nộp bài nói</p>

                        <div className={s.resultBox}>
                            <div className={s.scoreRow}>
                                <strong>Điểm AI:</strong>
                                <span className={s.scoreValue}>
                                    {result.aiScore.toFixed(1)}/9
                                </span>
                            </div>
                            <div className={s.scoreRow}>
                                <strong>Điểm đạt được:</strong>
                                <span>
                                    {result.pointsEarned}/{result.maxPoints}
                                </span>
                            </div>

                            {result.transcript && (
                                <details className={s.details}>
                                    <summary>Xem transcript</summary>
                                    <p className={s.detailContent}>
                                        {result.transcript}
                                    </p>
                                </details>
                            )}

                            {result.feedback && (
                                <details className={s.details}>
                                    <summary>Nhận xét</summary>
                                    <p className={s.detailContent}>
                                        {result.feedback}
                                    </p>
                                </details>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
