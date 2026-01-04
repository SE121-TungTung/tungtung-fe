import { useRef, useState, useEffect } from 'react'

import PlayIcon from '@/assets/Media Play.svg'
import PauseIcon from '@/assets/Media Pause.svg'
import VolumnIcon from '@/assets/Media Volume Up.svg'

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
    }

    const handleSpeedChange = (speed: number) => {
        const audio = audioRef.current
        if (!audio) return

        audio.playbackRate = speed
        setPlaybackRate(speed)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (!audioUrl) {
        return (
            <div className={s.audioContainer}>
                <div className={s.noAudio}>
                    No audio available for this section
                </div>
            </div>
        )
    }

    return (
        <div className={s.audioContainer}>
            <div className={s.audioCard}>
                <audio ref={audioRef} src={audioUrl} preload="metadata" />

                {/* Progress Bar */}
                <div className={s.progressSection}>
                    <span className={s.timeLabel}>
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className={s.progressBar}
                        style={{
                            backgroundSize: `${progressPercent}% 100%`,
                        }}
                        disabled={!duration}
                    />
                    <span className={s.timeLabel}>{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className={s.controls}>
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className={s.playButton}>
                        {isPlaying ? (
                            <img src={PauseIcon} alt="Pause"></img>
                        ) : (
                            <img src={PlayIcon} alt="Pause"></img>
                        )}
                    </button>

                    {/* Speed Control */}
                    <div className={s.speedControl}>
                        <label>Speed:</label>
                        {[0.75, 1, 1.25, 1.5].map((speed) => (
                            <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={`${s.speedButton} ${
                                    playbackRate === speed ? s.active : ''
                                }`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>

                    {/* Volume Control */}
                    <div className={s.volumeControl}>
                        <img src={VolumnIcon} alt="Volume" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className={s.volumeSlider}
                            style={{
                                backgroundSize: `${volume * 100}% 100%`,
                            }}
                        />
                    </div>
                </div>

                {/* Transcript Toggle */}
                {showTranscript && transcript && (
                    <>
                        <button
                            onClick={() =>
                                setShowTranscriptText(!showTranscriptText)
                            }
                            className={s.transcriptToggle}
                        >
                            {showTranscriptText ? 'Hide' : 'Show'} Transcript
                        </button>
                        {showTranscriptText && (
                            <div className={s.transcript}>{transcript}</div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
