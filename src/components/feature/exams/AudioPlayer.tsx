import { useRef, useState, useEffect } from 'react'
import s from './AudioPlayer.module.css'

interface AudioPlayerProps {
    audioUrl: string | null
    onTimeUpdate?: (currentTime: number) => void
    showTranscript?: boolean
    transcript?: string | null
}

export function AudioPlayer({
    audioUrl,
    onTimeUpdate,
    showTranscript = false,
    transcript,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showTranscriptText, setShowTranscriptText] = useState(false)

    const progressPercent = duration ? (currentTime / duration) * 100 : 0

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleLoadedMetadata = () => {
            setDuration(audio.duration)
        }

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
            onTimeUpdate?.(audio.currentTime)
        }

        const handleEnded = () => {
            setIsPlaying(false)
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [onTimeUpdate])

    const togglePlay = () => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current
        if (!audio) return

        const newTime = parseFloat(e.target.value)
        audio.currentTime = newTime
        setCurrentTime(newTime)
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current
        if (!audio) return

        const newVolume = parseFloat(e.target.value)
        audio.volume = newVolume
        setVolume(newVolume)
        if (newVolume > 0 && isMuted) {
            setIsMuted(false)
            audio.muted = false
        }
    }

    const toggleMute = () => {
        const audio = audioRef.current
        if (!audio) return

        const nextMuted = !isMuted
        audio.muted = nextMuted
        setIsMuted(nextMuted)
    }

    const handleSpeedChange = (speed: number) => {
        const audio = audioRef.current
        if (!audio) return

        audio.playbackRate = speed
        setPlaybackRate(speed)
    }

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '00:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (!audioUrl) {
        return (
            <div className={s.audioContainer}>
                <div className={s.noAudio}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                    <span>Không có audio cho phần thi này</span>
                </div>
            </div>
        )
    }

    return (
        <div className={s.audioContainer}>
            <div className={s.audioCard}>
                <audio ref={audioRef} src={audioUrl} preload="metadata" />

                {/* Header with Visualizer */}
                <div className={s.audioStatusRow}>
                    <div className={s.statusBadge}>
                        <span
                            className={`${s.statusDot} ${isPlaying ? s.playing : ''}`}
                        />
                        <span>
                            {isPlaying ? 'Đang phát âm thanh' : 'Sẵn sàng nghe'}
                        </span>
                    </div>

                    {/* Animated sound wave */}
                    <div
                        className={`${s.waveContainer} ${isPlaying ? s.waveActive : ''}`}
                    >
                        <span className={s.waveBar} />
                        <span className={s.waveBar} />
                        <span className={s.waveBar} />
                        <span className={s.waveBar} />
                        <span className={s.waveBar} />
                    </div>
                </div>

                {/* Progress Bar & Timing */}
                <div className={s.progressSection}>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className={s.progressBar}
                        style={{
                            backgroundSize: `${progressPercent}% 100%`,
                        }}
                        disabled={!duration}
                        aria-label="Audio progress"
                    />
                    <div className={s.timeRow}>
                        <span className={s.currentTime}>
                            {formatTime(currentTime)}
                        </span>
                        <span className={s.durationTime}>
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Controls Area */}
                <div className={s.controls}>
                    {/* Play/Pause Button */}
                    <button
                        type="button"
                        onClick={togglePlay}
                        className={s.playButton}
                        aria-label={isPlaying ? 'Tạm dừng audio' : 'Phát audio'}
                    >
                        {isPlaying ? (
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <rect
                                    x="6"
                                    y="4"
                                    width="4"
                                    height="16"
                                    rx="1"
                                />
                                <rect
                                    x="14"
                                    y="4"
                                    width="4"
                                    height="16"
                                    rx="1"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                style={{ marginLeft: '2px' }}
                            >
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        )}
                    </button>

                    {/* Speed Controls */}
                    <div className={s.speedControl}>
                        {[0.75, 1, 1.25, 1.5].map((speed) => (
                            <button
                                key={speed}
                                type="button"
                                onClick={() => handleSpeedChange(speed)}
                                className={`${s.speedButton} ${
                                    playbackRate === speed ? s.activeSpeed : ''
                                }`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>

                    {/* Volume Control */}
                    <div className={s.volumeControl}>
                        <button
                            type="button"
                            onClick={toggleMute}
                            className={s.volumeBtn}
                            aria-label={
                                isMuted || volume === 0
                                    ? 'Bật âm thanh'
                                    : 'Tắt tiếng'
                            }
                        >
                            {isMuted || volume === 0 ? (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <line x1="23" y1="9" x2="17" y2="15" />
                                    <line x1="17" y1="9" x2="23" y2="15" />
                                </svg>
                            ) : (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className={s.volumeSlider}
                            style={{
                                backgroundSize: `${(isMuted ? 0 : volume) * 100}% 100%`,
                            }}
                            aria-label="Âm lượng"
                        />
                    </div>
                </div>

                {/* Transcript Toggle (Optional) */}
                {showTranscript && transcript && (
                    <div className={s.transcriptBox}>
                        <button
                            type="button"
                            onClick={() =>
                                setShowTranscriptText(!showTranscriptText)
                            }
                            className={s.transcriptToggle}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            {showTranscriptText
                                ? 'Ẩn Transcript'
                                : 'Hiện Transcript'}
                        </button>
                        {showTranscriptText && (
                            <div className={s.transcriptText}>{transcript}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
