import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './FlipCard.module.css'
import { AudioButton } from './AudioButton'
import { RatingBar } from './RatingBar'
import {
    BookOpenIcon,
    RotateCwIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    XIcon,
    CheckCircleIcon,
} from './FlashcardIcons'
import { type Flashcard, FSRSRating } from '@/types/flashcard'

// ── State Machine ─────────────────────────────────────────────────────────────
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

const SWIPE_THRESHOLD = 80 // px drag required to trigger swipe rating

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

    // Gesture & Drag state
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStartRef = useRef<{ x: number; y: number } | null>(null)
    const hasDraggedPastClickRef = useRef(false)

    // Reset state when card changes
    useEffect(() => {
        setPhase('idle')
        setIsSubmitting(false)
        setDragOffset({ x: 0, y: 0 })
        setIsDragging(false)
    }, [card.id])

    // Focus card for keyboard handling
    useEffect(() => {
        cardRef.current?.focus()
    }, [card.id])

    const handleFlip = useCallback(() => {
        if (isDragging) return
        if (phase === 'idle') {
            setPhase('flipped')
        } else if (phase === 'flipped') {
            setPhase('idle')
        }
    }, [phase, isDragging])

    const handleRate = useCallback(
        async (rating: FSRSRating) => {
            if (isSubmitting) return
            // Must flip to back face first so user can check meaning and example
            if (phase === 'idle') {
                setPhase('flipped')
                return
            }
            setIsSubmitting(true)
            setPhase('rated')
            try {
                await onRate(card.id, rating)
            } finally {
                setIsSubmitting(false)
            }
        },
        [isSubmitting, onRate, card.id, phase]
    )

    // ── Gesture / Pointer Handlers ────────────────────────────────────────────
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Do not intercept audio button, flip button or other interactive controls
        if ((e.target as HTMLElement).closest('button, a, input')) return
        dragStartRef.current = { x: e.clientX, y: e.clientY }
        hasDraggedPastClickRef.current = false
        setIsDragging(true)
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragStartRef.current || !isDragging) return
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
            hasDraggedPastClickRef.current = true
        }
        setDragOffset({ x: dx, y: dy })
    }

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return
        try {
            ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
        } catch {
            // ignore if not captured
        }

        const dx = dragOffset.x
        setIsDragging(false)
        dragStartRef.current = null

        // If card is on front face (idle), any swipe or click MUST flip the card to show definition
        if (phase === 'idle') {
            setDragOffset({ x: 0, y: 0 })
            handleFlip()
            return
        }

        // On flipped face: check if swipe threshold was reached to rate
        if (dx < -SWIPE_THRESHOLD) {
            // Swiped Left = Quên rồi (Again)
            void handleRate(FSRSRating.AGAIN)
        } else if (dx > SWIPE_THRESHOLD) {
            // Swiped Right = Nhớ tốt (Good)
            void handleRate(FSRSRating.GOOD)
        } else {
            // Snap back
            setDragOffset({ x: 0, y: 0 })
            // If it was just a tap without significant movement, flip back to front
            if (!hasDraggedPastClickRef.current) {
                handleFlip()
            }
        }
    }

    // ── Keyboard Navigation ───────────────────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.target !== cardRef.current) return

            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                handleFlip()
                return
            }

            // If front face, pressing any key flips the card to reveal answer first
            if (phase !== 'flipped') {
                if (
                    [
                        'ArrowLeft',
                        'ArrowRight',
                        'ArrowDown',
                        'ArrowUp',
                        '1',
                        '2',
                        '3',
                        '4',
                    ].includes(e.key)
                ) {
                    e.preventDefault()
                    handleFlip()
                }
                return
            }

            // ArrowLeft / ArrowRight quick rating when flipped
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                void handleRate(FSRSRating.AGAIN)
                return
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault()
                void handleRate(FSRSRating.GOOD)
                return
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                void handleRate(FSRSRating.HARD)
                return
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                void handleRate(FSRSRating.EASY)
                return
            }

            // Rating keys 1 - 4
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
        },
        [handleFlip, handleRate, phase]
    )

    const isFlipped = phase === 'flipped' || phase === 'rated'

    // Compute dynamic transform while dragging
    const cardTransform = isDragging
        ? `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.25}px, 0) rotate(${dragOffset.x * 0.06}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
        : isFlipped
          ? 'rotateY(180deg)'
          : 'none'

    // Stamp Opacity
    const stampAgainOpacity = Math.min(1, Math.max(0, -dragOffset.x / 70))
    const stampGoodOpacity = Math.min(1, Math.max(0, dragOffset.x / 70))

    return (
        <div className={styles.wrapper}>
            {/* ── Top Header & Progress ────────────────────────────────────── */}
            <div className={styles.topBar}>
                <div className={styles.topInfo}>
                    <span className={styles.deckBadge}>
                        <BookOpenIcon size={13} />
                        <span>Flashcard Thông Minh</span>
                    </span>
                    <span className={styles.progressCounter}>
                        Thẻ <strong>{index + 1}</strong> / {total}
                    </span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{
                            width: `${Math.min(100, ((index + 1) / total) * 100)}%`,
                        }}
                    />
                </div>
            </div>

            {/* ── 3D Scene with Touch & Mouse Swipe ────────────────────────── */}
            <div
                ref={cardRef}
                className={`${styles.scene} ${isFlipped ? styles.flipped : ''} ${isDragging ? styles.dragging : ''}`}
                role="button"
                tabIndex={0}
                aria-label={
                    phase === 'idle'
                        ? 'Nhấn Space, click hoặc vuốt để xem đáp án'
                        : 'Thẻ đã lật — chọn mức độ nhớ'
                }
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
            >
                {/* Floating Stamps during swipe (only active when flipped) */}
                <div
                    className={`${styles.swipeStamp} ${styles.swipeStampAgain}`}
                    style={{ opacity: isFlipped ? stampAgainOpacity : 0 }}
                >
                    <XIcon size={18} />
                    <span>QUÊN RỒI</span>
                </div>
                <div
                    className={`${styles.swipeStamp} ${styles.swipeStampGood}`}
                    style={{ opacity: isFlipped ? stampGoodOpacity : 0 }}
                >
                    <CheckCircleIcon size={18} />
                    <span>ĐÃ NHỚ</span>
                </div>

                <div
                    className={`${styles.card} ${isDragging ? styles.noTransition : ''}`}
                    style={{ transform: cardTransform }}
                >
                    {/* ── FRONT FACE ──────────────────────────────────────── */}
                    <div
                        className={`${styles.face} ${styles.front}`}
                        aria-hidden={isFlipped}
                    >
                        <div className={styles.frontHeader}>
                            {card.wordType ? (
                                <span className={styles.wordTypeTag}>
                                    {card.wordType}
                                </span>
                            ) : (
                                <span />
                            )}
                            <AudioButton
                                audioUrl={card.audioUrl}
                                word={card.word}
                                size="md"
                            />
                        </div>

                        <div className={styles.frontCenter}>
                            <h2 className={styles.word}>{card.word}</h2>
                            {card.ipa && (
                                <div className={styles.ipaBadge}>
                                    <span>
                                        /{card.ipa.replace(/^\/|\/$/g, '')}/
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className={styles.frontFooter}>
                            <button
                                type="button"
                                className={styles.flipCta}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleFlip()
                                }}
                            >
                                <RotateCwIcon
                                    size={14}
                                    className={styles.flipIcon}
                                />
                                <span>Nhấn để lật xem đáp án</span>
                            </button>
                        </div>
                    </div>

                    {/* ── BACK FACE ───────────────────────────────────────── */}
                    <div
                        className={`${styles.face} ${styles.back}`}
                        aria-hidden={!isFlipped}
                    >
                        <div className={styles.backHeader}>
                            <div className={styles.backWordInfo}>
                                <span className={styles.backWord}>
                                    {card.word}
                                </span>
                                {card.ipa && (
                                    <span className={styles.backIpa}>
                                        /{card.ipa.replace(/^\/|\/$/g, '')}/
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

                        <div className={styles.backDefinitions}>
                            {card.definitionVi && (
                                <div className={styles.defCard}>
                                    <div className={styles.defTagRow}>
                                        <span
                                            className={`${styles.defLangBadge} ${styles.defLangBadgeVi}`}
                                        >
                                            VI
                                        </span>
                                        <span className={styles.defLabel}>
                                            Nghĩa Tiếng Việt
                                        </span>
                                    </div>
                                    <p className={styles.defText}>
                                        {card.definitionVi}
                                    </p>
                                </div>
                            )}

                            {card.definitionEn && (
                                <div className={styles.defCard}>
                                    <div className={styles.defTagRow}>
                                        <span className={styles.defLangBadge}>
                                            EN
                                        </span>
                                        <span className={styles.defLabel}>
                                            English Definition
                                        </span>
                                    </div>
                                    <p className={styles.defText}>
                                        {card.definitionEn}
                                    </p>
                                </div>
                            )}
                        </div>

                        {card.exampleSentence && (
                            <div className={styles.exampleCard}>
                                <span className={styles.exampleTag}>
                                    Câu Ví Dụ Minh Họa
                                </span>
                                <p className={styles.exampleSentence}>
                                    "{card.exampleSentence}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Gesture Guidance / Quick Swipe Actions ──────────────────── */}
            <div className={styles.gestureBar}>
                <button
                    type="button"
                    className={`${styles.swipeActionBtn} ${styles.swipeBtnAgain}`}
                    onClick={() => {
                        if (phase === 'flipped') {
                            void handleRate(FSRSRating.AGAIN)
                        } else {
                            handleFlip()
                        }
                    }}
                    title={
                        phase === 'flipped'
                            ? 'Vuốt trái hoặc bấm để đánh dấu chưa nhớ'
                            : 'Lật xem đáp án'
                    }
                >
                    <ArrowLeftIcon size={14} />
                    <span>
                        {phase === 'flipped'
                            ? 'Vuốt trái: Quên'
                            : 'Lật xem nghĩa'}
                    </span>
                </button>

                <div
                    className={styles.flipPill}
                    onClick={handleFlip}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                >
                    <span className={styles.kbKey}>Space</span>{' '}
                    {isFlipped ? 'quay lại từ vựng' : 'lật xem đáp án'}
                </div>

                <button
                    type="button"
                    className={`${styles.swipeActionBtn} ${styles.swipeBtnGood}`}
                    onClick={() => {
                        if (phase === 'flipped') {
                            void handleRate(FSRSRating.GOOD)
                        } else {
                            handleFlip()
                        }
                    }}
                    title={
                        phase === 'flipped'
                            ? 'Vuốt phải hoặc bấm để đánh dấu đã nhớ'
                            : 'Lật xem đáp án'
                    }
                >
                    <span>
                        {phase === 'flipped'
                            ? 'Vuốt phải: Đã nhớ'
                            : 'Lật xem nghĩa'}
                    </span>
                    <ArrowRightIcon size={14} />
                </button>
            </div>

            {/* ── Rating Bar (Visible after flip) ─────────────────────────── */}
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
                    <span>Đang lưu kết quả ôn tập...</span>
                </div>
            )}
        </div>
    )
}
