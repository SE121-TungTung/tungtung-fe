import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './FlipCard.module.css'
import { AudioButton } from './AudioButton'
import { RatingBar } from './RatingBar'
import { PronunciationLinkBar } from './PronunciationLinkBar'
import {
    BookOpenIcon,
    RotateCwIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    XIcon,
    CheckCircleIcon,
} from './FlashcardIcons'
import { type Flashcard, FSRSRating } from '@/types/flashcard'

import { Tooltip } from '@/components/core/Tooltip'

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

const SWIPE_THRESHOLD = 75 // px drag required to trigger swipe rating

export function FlipCard({
    card,
    onRate,
    index,
    total,
    estimatedIntervals,
}: FlipCardProps) {
    const [phase, setPhase] = useState<CardPhase>('idle')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [swipeExit, setSwipeExit] = useState<'left' | 'right' | null>(null)
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
        setSwipeExit(null)
    }, [card.id])

    const handleFlip = useCallback(() => {
        if (isDragging || isSubmitting) return
        setPhase((prev) => (prev === 'idle' ? 'flipped' : 'idle'))
    }, [isDragging, isSubmitting])

    const handleRate = useCallback(
        async (rating: FSRSRating) => {
            if (isSubmitting) return
            setIsSubmitting(true)
            setPhase('rated')
            try {
                await onRate(card.id, rating)
            } finally {
                setIsSubmitting(false)
            }
        },
        [isSubmitting, onRate, card.id]
    )

    // ── Gesture / Pointer Handlers ────────────────────────────────────────────
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Do not intercept interactive controls
        if (
            (e.target as HTMLElement).closest(
                'button, a, input, [role="button"]:not([tabIndex="0"])'
            )
        )
            return
        dragStartRef.current = { x: e.clientX, y: e.clientY }
        hasDraggedPastClickRef.current = false
        setIsDragging(true)
        try {
            ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
        } catch {
            // Ignore capture error if unsupported
        }
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

        // Check if swipe threshold was reached to rate
        if (dx < -SWIPE_THRESHOLD) {
            // Swiped Left = Quên rồi (Again)
            setSwipeExit('left')
            setTimeout(() => {
                void handleRate(FSRSRating.AGAIN)
            }, 180)
        } else if (dx > SWIPE_THRESHOLD) {
            // Swiped Right = Nhớ tốt (Good)
            setSwipeExit('right')
            setTimeout(() => {
                void handleRate(FSRSRating.GOOD)
            }, 180)
        } else {
            // Snap back
            setDragOffset({ x: 0, y: 0 })
            // Tap without significant drag flips card
            if (!hasDraggedPastClickRef.current || Math.abs(dx) < 12) {
                handleFlip()
            }
        }
    }

    // ── Global Keyboard Navigation (Always active) ───────────────────────────
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const activeElem = document.activeElement as HTMLElement | null
            if (
                activeElem &&
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElem.tagName)
            ) {
                return
            }
            if (isSubmitting) return

            // Space to flip
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault()
                handleFlip()
                return
            }

            // Quick rating keys (1: Again, 2: Hard, 3: Good, 4: Easy)
            const ratingMap: Record<string, FSRSRating> = {
                '1': FSRSRating.AGAIN,
                '2': FSRSRating.HARD,
                '3': FSRSRating.GOOD,
                '4': FSRSRating.EASY,
                ArrowLeft: FSRSRating.AGAIN,
                ArrowDown: FSRSRating.HARD,
                ArrowRight: FSRSRating.GOOD,
                ArrowUp: FSRSRating.EASY,
            }

            if (e.key in ratingMap) {
                e.preventDefault()
                const rating = ratingMap[e.key]
                if (rating === FSRSRating.AGAIN) {
                    setSwipeExit('left')
                    setTimeout(() => void handleRate(rating), 160)
                } else if (
                    rating === FSRSRating.GOOD ||
                    rating === FSRSRating.EASY
                ) {
                    setSwipeExit('right')
                    setTimeout(() => void handleRate(rating), 160)
                } else {
                    void handleRate(rating)
                }
            }
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [handleFlip, handleRate, isSubmitting])

    const isFlipped = phase === 'flipped' || phase === 'rated'

    // Compute dynamic transform while dragging
    const cardTransform = isDragging
        ? `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.25}px, 0) rotate(${dragOffset.x * 0.06}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
        : isFlipped
          ? 'rotateY(180deg)'
          : 'none'

    // Stamp Opacity (Visible when dragging or exiting)
    const stampAgainOpacity =
        swipeExit === 'left' ? 1 : Math.min(1, Math.max(0, -dragOffset.x / 60))
    const stampGoodOpacity =
        swipeExit === 'right' ? 1 : Math.min(1, Math.max(0, dragOffset.x / 60))

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
            >
                {/* Floating Stamps during swipe */}
                <div
                    className={`${styles.swipeStamp} ${styles.swipeStampAgain}`}
                    style={{ opacity: stampAgainOpacity }}
                >
                    <XIcon size={18} />
                    <span>QUÊN RỒI</span>
                </div>
                <div
                    className={`${styles.swipeStamp} ${styles.swipeStampGood}`}
                    style={{ opacity: stampGoodOpacity }}
                >
                    <CheckCircleIcon size={18} />
                    <span>ĐÃ NHỚ</span>
                </div>

                <div
                    className={`${styles.card} ${isDragging ? styles.noTransition : ''} ${
                        swipeExit === 'left'
                            ? styles.cardSwipingLeft
                            : swipeExit === 'right'
                              ? styles.cardSwipingRight
                              : ''
                    }`}
                    style={{ transform: swipeExit ? undefined : cardTransform }}
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
                                <span>Nhấn để lật xem đáp án (Space)</span>
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

                        {isFlipped && <PronunciationLinkBar card={card} />}
                    </div>
                </div>
            </div>

            {/* ── Gesture Guidance / Quick Swipe Actions ──────────────────── */}
            <div className={styles.gestureBar}>
                <Tooltip
                    content="Vuốt trái hoặc bấm số 1 để đánh dấu Quên rồi"
                    placement="top"
                >
                    <button
                        type="button"
                        className={`${styles.swipeActionBtn} ${styles.swipeBtnAgain}`}
                        onClick={() => {
                            setSwipeExit('left')
                            setTimeout(
                                () => void handleRate(FSRSRating.AGAIN),
                                160
                            )
                        }}
                    >
                        <ArrowLeftIcon size={14} />
                        <span>Vuốt trái: Quên (1)</span>
                    </button>
                </Tooltip>

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

                <Tooltip
                    content="Vuốt phải hoặc bấm số 3 để đánh dấu Đã nhớ"
                    placement="top"
                >
                    <button
                        type="button"
                        className={`${styles.swipeActionBtn} ${styles.swipeBtnGood}`}
                        onClick={() => {
                            setSwipeExit('right')
                            setTimeout(
                                () => void handleRate(FSRSRating.GOOD),
                                160
                            )
                        }}
                    >
                        <span>Vuốt phải: Đã nhớ (3)</span>
                        <ArrowRightIcon size={14} />
                    </button>
                </Tooltip>
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
