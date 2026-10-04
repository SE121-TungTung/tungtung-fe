import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './FlipCard.module.css'
import { AudioButton } from './AudioButton'
import { RatingBar } from './RatingBar'
import { type Flashcard, FSRSRating } from '@/types/flashcard'

// ── State Machine ─────────────────────────────────────────────────────────────
// idle → (Space/click) → flipped → (1/2/3/4 or click rating) → rated
type CardPhase = 'idle' | 'flipped' | 'rated'

interface FlipCardProps {
    card: Flashcard
    onRate: (cardId: string, rating: FSRSRating) => void | Promise<void>
    /** Progress: current card index (0-based) */
    index: number
    /** Total cards in session */
    total: number
    /** Estimated intervals from backend for next review */
    estimatedIntervals?: Partial<Record<FSRSRating, number>>
}

export function FlipCard({
    card,
    onRate,
    index,
    total,
    estimatedIntervals,
}: FlipCardProps) {
    const [phase, setPhase] = useState<CardPhase>('idle')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    // Reset state when card changes
    useEffect(() => {
        setPhase('idle')
        setIsSubmitting(false)
    }, [card.id])

    // Focus card for keyboard handling
    useEffect(() => {
        cardRef.current?.focus()
    }, [card.id])

    const handleFlip = useCallback(() => {
        if (phase === 'idle') {
            setPhase('flipped')
        } else if (phase === 'flipped') {
            setPhase('idle')
        }
    }, [phase])

    const handleRate = useCallback(
        async (rating: FSRSRating) => {
            if (phase !== 'flipped' || isSubmitting) return
            setIsSubmitting(true)
            setPhase('rated')
            try {
                await onRate(card.id, rating)
            } finally {
                setIsSubmitting(false)
            }
        },
        [phase, isSubmitting, onRate, card.id]
    )

    // ── Keyboard Handler ──────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.target !== cardRef.current) return // don't intercept button clicks

            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                handleFlip()
                return
            }

            // Rating keys only available after flip
            if (phase === 'flipped') {
                const ratingMap: Record<string, FSRSRating> = {
                    '1': FSRSRating.AGAIN,
                    '2': FSRSRating.HARD,
                    '3': FSRSRating.GOOD,
                    '4': FSRSRating.EASY,
                }
                if (e.key in ratingMap) {
                    e.preventDefault()
                    void handleRate(ratingMap[e.key])
                }
            }
        },
        [phase, handleFlip, handleRate]
    )

    const isFlipped = phase === 'flipped' || phase === 'rated'

    return (
        <div className={styles.wrapper}>
            {/* Progress bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(index / total) * 100}%` }}
                />
            </div>
            <div className={styles.progressText}>
                <span>{index}</span>/<span>{total}</span> thẻ
            </div>

            {/* 3D Flip Card */}
            <div
                ref={cardRef}
                className={`${styles.scene} ${isFlipped ? styles.flipped : ''}`}
                role="button"
                tabIndex={0}
                aria-label={
                    phase === 'idle'
                        ? 'Nhấn Space hoặc click để lật thẻ'
                        : 'Thẻ đã lật — chọn mức độ nhớ'
                }
                onClick={handleFlip}
                onKeyDown={handleKeyDown}
            >
                <div className={styles.card}>
                    {/* ── FRONT ─────────────────────────────────────────── */}
                    <div
                        className={`${styles.face} ${styles.front}`}
                        aria-hidden={isFlipped}
                    >
                        <div className={styles.stateHint}>
                            <span className={styles.hintIcon}>↑</span>
                            <span>
                                Nhấn phím [Space] hoặc click chuột vào thẻ để
                                xem đáp án
                            </span>
                        </div>

                        <div className={styles.wordSection}>
                            {card.wordType && (
                                <span className={styles.wordTypeBadge}>
                                    {card.wordType}
                                </span>
                            )}
                            <h2 className={styles.word}>{card.word}</h2>
                            {card.ipa && (
                                <p className={styles.ipa}>{card.ipa}</p>
                            )}
                        </div>

                        <div className={styles.audioRow}>
                            <AudioButton
                                audioUrl={card.audioUrl}
                                word={card.word}
                                size="md"
                            />
                            <span className={styles.audioHint}>Phát âm</span>
                        </div>
                    </div>

                    {/* ── BACK ──────────────────────────────────────────── */}
                    <div
                        className={`${styles.face} ${styles.back}`}
                        aria-hidden={!isFlipped}
                    >
                        <div className={styles.backHeader}>
                            <div className={styles.wordMini}>
                                <strong>{card.word}</strong>
                                {card.ipa && (
                                    <span className={styles.ipaMini}>
                                        {card.ipa}
                                    </span>
                                )}
                            </div>
                            <AudioButton
                                audioUrl={card.audioUrl}
                                word={card.word}
                                size="sm"
                                autoPlay={isFlipped}
                            />
                        </div>

                        <div className={styles.definitions}>
                            {card.definitionEn && (
                                <div className={styles.defBlock}>
                                    <span className={styles.defLabel}>EN</span>
                                    <p className={styles.defText}>
                                        {card.definitionEn}
                                    </p>
                                </div>
                            )}
                            {card.definitionVi && (
                                <div className={styles.defBlock}>
                                    <span className={styles.defLabel}>VI</span>
                                    <p className={styles.defText}>
                                        {card.definitionVi}
                                    </p>
                                </div>
                            )}
                        </div>

                        {card.exampleSentence && (
                            <div className={styles.example}>
                                <span className={styles.exampleLabel}>
                                    Ví dụ
                                </span>
                                <p className={styles.exampleText}>
                                    <em>{card.exampleSentence}</em>
                                </p>
                            </div>
                        )}

                        {/* Keyboard hint */}
                        <div className={styles.keyboardHint}>
                            <span className={styles.kbKey}>1</span>Học
                            lại&nbsp;&nbsp;
                            <span className={styles.kbKey}>2</span>Khó
                            nhớ&nbsp;&nbsp;
                            <span className={styles.kbKey}>3</span>Nhớ
                            tốt&nbsp;&nbsp;
                            <span className={styles.kbKey}>4</span>Quá dễ
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Rating Bar (only visible after flip) ────────────────────── */}
            <div
                className={`${styles.ratingSection} ${isFlipped && phase !== 'rated' ? styles.ratingVisible : ''}`}
                aria-hidden={!isFlipped || phase === 'rated'}
            >
                <RatingBar
                    onRate={handleRate}
                    disabled={phase !== 'flipped' || isSubmitting}
                    estimatedIntervals={estimatedIntervals}
                />
            </div>

            {phase === 'rated' && (
                <div className={styles.submittingOverlay}>
                    <div className={styles.spinner} />
                    <span>Đang lưu...</span>
                </div>
            )}
        </div>
    )
}
