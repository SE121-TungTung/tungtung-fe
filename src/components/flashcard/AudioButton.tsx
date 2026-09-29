import { useRef, useState, useCallback, useEffect } from 'react'
import styles from './AudioButton.module.css'

interface AudioButtonProps {
    /** Cloudinary audio URL — null triggers Web Speech API fallback */
    audioUrl: string | null
    /** Text to speak if audioUrl is null or fails */
    word: string
    /** Size variant */
    size?: 'sm' | 'md' | 'lg'
    /** Auto-play on mount */
    autoPlay?: boolean
}

export function AudioButton({
    audioUrl,
    word,
    size = 'md',
    autoPlay = false,
}: AudioButtonProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [hasFailed, setHasFailed] = useState(false)

    const speakWithTTS = useCallback(() => {
        if (!('speechSynthesis' in window)) return
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.85
        utterance.pitch = 1
        utterance.onstart = () => setIsPlaying(true)
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        window.speechSynthesis.speak(utterance)
    }, [word])

    const playAudio = useCallback(() => {
        if (audioUrl && !hasFailed) {
            if (!audioRef.current) {
                audioRef.current = new Audio(audioUrl)
                audioRef.current.onplay = () => setIsPlaying(true)
                audioRef.current.onended = () => setIsPlaying(false)
                audioRef.current.onpause = () => setIsPlaying(false)
                audioRef.current.onerror = () => {
                    setHasFailed(true)
                    setIsPlaying(false)
                    speakWithTTS()
                }
            }
            if (isPlaying) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            } else {
                audioRef.current.play().catch(() => {
                    setHasFailed(true)
                    speakWithTTS()
                })
            }
        } else {
            speakWithTTS()
        }
    }, [audioUrl, hasFailed, isPlaying, speakWithTTS])

    // Auto-play on mount
    useEffect(() => {
        if (autoPlay) {
            const timer = setTimeout(() => playAudio(), 400)
            return () => clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlay, audioUrl, word])

    return (
        <button
            type="button"
            className={`${styles.btn} ${styles[size]} ${isPlaying ? styles.playing : ''}`}
            onClick={(e) => {
                e.stopPropagation()
                playAudio()
            }}
            title={isPlaying ? 'Dừng' : 'Nghe phát âm'}
            aria-label={`Phát âm từ ${word}`}
        >
            {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v14a1.5 1.5 0 0 1-3 0V5A1.5 1.5 0 0 1 5.5 3.5zm13 0A1.5 1.5 0 0 1 20 5v14a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06z" />
                    <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.061z" />
                </svg>
            )}
            {!audioUrl && !isPlaying && (
                <span className={styles.ttsLabel}>TTS</span>
            )}
        </button>
    )
}
