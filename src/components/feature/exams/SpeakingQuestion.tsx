import { useState, useRef, useEffect } from 'react'
import { testApi } from '@/lib/test'

export interface SpeakingQuestionProps {
    questionId: string
    globalNumber: number
    questionText: string
    audioUrl?: string | null
    attemptId: string
    registerRef: (id: string, element: HTMLElement) => void
    onSubmitted?: (result: any) => void
}

export function SpeakingQuestion({
    questionId,
    globalNumber,
    questionText,
    audioUrl,
    attemptId,
    registerRef,
    onSubmitted,
}: SpeakingQuestionProps) {
    const [recording, setRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    )
    const [submitted, setSubmitted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [result, setResult] = useState<any>(null)

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            })
            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                await uploadSpeaking(blob)
                stream.getTracks().forEach((track) => track.stop())
            }

            recorder.start()
            setMediaRecorder(recorder)
            setRecording(true)
            setRecordingTime(0)

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } catch (error) {
            console.error('Failed to start recording:', error)
            alert('Vui lòng cho phép truy cập microphone')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && recording) {
            mediaRecorder.stop()
            setRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const uploadSpeaking = async (audioBlob: Blob) => {
        setSubmitting(true)
        try {
            const result = await testApi.submitSpeaking(
                attemptId,
                questionId,
                audioBlob
            )

            console.log('Speaking submitted:', result)
            setResult(result)
            setSubmitted(true)
            onSubmitted?.(result)
        } catch (error: any) {
            console.error('Failed to submit speaking:', error)
            alert(error.message || 'Nộp bài nói thất bại. Vui lòng thử lại.')
        } finally {
            setSubmitting(false)
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
            style={{
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid #eee',
            }}
        >
            <p
                style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    color: 'var(--text-primary-light)',
                }}
            >
                {globalNumber}. {questionText}
            </p>

            {audioUrl && (
                <div style={{ marginBottom: '16px' }}>
                    <audio src={audioUrl} controls style={{ width: '100%' }} />
                </div>
            )}

            <div
                style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '20px',
                    textAlign: 'center',
                }}
            >
                {!submitted ? (
                    <>
                        {!recording && !submitting && (
                            <button
                                onClick={startRecording}
                                style={{
                                    padding: '12px 32px',
                                    background:
                                        'var(--status-danger-500-light)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                🎤 Bắt đầu ghi âm
                            </button>
                        )}

                        {recording && (
                            <div>
                                <div
                                    style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: 'var(--status-danger-500-light)',
                                        marginBottom: '16px',
                                    }}
                                >
                                    {formatTime(recordingTime)}
                                </div>
                                <button
                                    onClick={stopRecording}
                                    style={{
                                        padding: '12px 32px',
                                        background: '#555',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    ⏹️ Dừng ghi âm
                                </button>
                            </div>
                        )}

                        {submitting && (
                            <p
                                style={{
                                    fontSize: '15px',
                                    color: '#666',
                                }}
                            >
                                Đang xử lý và chấm điểm...
                            </p>
                        )}
                    </>
                ) : (
                    <div>
                        <p
                            style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#28a745',
                                marginBottom: '16px',
                            }}
                        >
                            ✅ Đã nộp bài nói
                        </p>

                        {result && (
                            <div
                                style={{
                                    background: '#fff',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    textAlign: 'left',
                                }}
                            >
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>Điểm AI:</strong>{' '}
                                    {result.aiScore.toFixed(1)}/9
                                </p>
                                <p style={{ marginBottom: '8px' }}>
                                    <strong>Điểm đạt được:</strong>{' '}
                                    {result.pointsEarned}/{result.maxPoints}
                                </p>
                                {result.transcript && (
                                    <details style={{ marginTop: '12px' }}>
                                        <summary
                                            style={{
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Xem transcript
                                        </summary>
                                        <p
                                            style={{
                                                marginTop: '8px',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                            }}
                                        >
                                            {result.transcript}
                                        </p>
                                    </details>
                                )}
                                {result.feedback && (
                                    <details style={{ marginTop: '12px' }}>
                                        <summary
                                            style={{
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Nhận xét
                                        </summary>
                                        <p
                                            style={{
                                                marginTop: '8px',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                            }}
                                        >
                                            {result.feedback}
                                        </p>
                                    </details>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
