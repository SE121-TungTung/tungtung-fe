import { useState, useRef, useCallback } from 'react'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './SpeakingQuestion.module.css'

interface SpeakingQuestionProps {
    questionId: string
    globalNumber: number
    questionText: string
    audioUrl?: string
    onUpload?: (
        questionId: string,
        audioBlob: Blob,
        duration: number
    ) => Promise<void>
    uploadStatus?: 'idle' | 'uploading' | 'uploaded' | 'error'
    uploadError?: string
    uploadedAudioUrl?: string
    registerRef: (id: string, el: HTMLElement | null) => void
}

export const SpeakingQuestion = ({
    questionId,
    globalNumber,
    questionText,
    audioUrl,
    onUpload,
    uploadStatus = 'idle',
    uploadError,
    uploadedAudioUrl,
    registerRef,
}: SpeakingQuestionProps) => {
    // Recording state
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null)

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)

    // ============================================
    // START RECORDING
    // ============================================
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            })

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            })

            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                const url = URL.createObjectURL(blob)
                setLocalAudioUrl(url)

                // Upload to backend
                const duration = Math.floor(recordingTime / 1000)
                if (onUpload) {
                    try {
                        await onUpload(questionId, blob, duration)
                    } catch (error) {
                        console.error('Upload failed:', error)
                    }
                }
                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop())
            }

            // Start recording
            mediaRecorder.start()
            setIsRecording(true)
            startTimeRef.current = Date.now()

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(Date.now() - startTimeRef.current)
            }, 100)
        } catch (error) {
            console.error('Failed to start recording:', error)
            alert('Could not access microphone. Please check permissions.')
        }
    }, [questionId, onUpload, recordingTime])

    // ============================================
    // STOP RECORDING
    // ============================================
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)

            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [isRecording])

    // ============================================
    // RE-RECORD
    // ============================================
    const reRecord = useCallback(() => {
        setLocalAudioUrl(null)
        setRecordingTime(0)
    }, [])

    // ============================================
    // FORMAT TIME
    // ============================================
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    // ============================================
    // RENDER
    // ============================================
    const audioToPlay = uploadedAudioUrl || localAudioUrl || audioUrl

    return (
        <div
            ref={(el) => registerRef(questionId, el)}
            className={s.questionCard}
        >
            {/* Question Header */}
            <div className={s.questionHeader}>
                <span className={s.questionNumber}>
                    Question {globalNumber}
                </span>
                <span className={s.uploadStatus}>
                    {uploadStatus === 'uploading' && '⏳ Uploading...'}
                    {uploadStatus === 'uploaded' && '✅ Uploaded'}
                    {uploadStatus === 'error' && '❌ Failed'}
                </span>
            </div>

            {/* Question Text */}
            <div className={s.questionText}>{questionText}</div>

            {/* Recording Controls */}
            <div className={s.recordingControls}>
                {!isRecording &&
                    !localAudioUrl &&
                    uploadStatus !== 'uploaded' && (
                        <ButtonPrimary onClick={startRecording}>
                            🎤 Start Recording
                        </ButtonPrimary>
                    )}

                {isRecording && (
                    <>
                        <div className={s.recordingIndicator}>
                            <span className={s.recordingDot}>●</span>
                            Recording... {formatTime(recordingTime)}
                        </div>
                        <ButtonPrimary
                            onClick={stopRecording}
                            variant="gradient"
                        >
                            ⏹ Stop
                        </ButtonPrimary>
                    </>
                )}

                {(localAudioUrl || uploadedAudioUrl) && !isRecording && (
                    <div className={s.playbackSection}>
                        <audio
                            controls
                            src={audioToPlay || undefined}
                            className={s.audioPlayer}
                        />

                        {uploadStatus !== 'uploaded' && (
                            <ButtonGhost onClick={reRecord} size="sm">
                                🔄 Re-record
                            </ButtonGhost>
                        )}
                    </div>
                )}
            </div>

            {/* Upload Status Messages */}
            {uploadStatus === 'uploading' && (
                <div className={s.uploadingMessage}>
                    Uploading your audio...
                </div>
            )}

            {uploadStatus === 'uploaded' && (
                <div className={s.successMessage}>
                    ✅ Audio uploaded successfully! You can move to the next
                    question.
                </div>
            )}

            {uploadStatus === 'error' && uploadError && (
                <div className={s.errorMessage}>
                    ❌ Upload failed: {uploadError}
                    <ButtonGhost onClick={reRecord} size="sm">
                        Try Again
                    </ButtonGhost>
                </div>
            )}
        </div>
    )
}
