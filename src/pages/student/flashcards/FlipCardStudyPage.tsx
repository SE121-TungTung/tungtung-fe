import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDueCards, getDeckCards, submitReview } from '@/lib/flashcard'
import { FlipCard } from '@/components/flashcard/FlipCard'
import { AudioButton } from '@/components/flashcard/AudioButton'
import { PronunciationLinkBar } from '@/components/flashcard/PronunciationLinkBar'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Skeleton from '@/components/effect/Skeleton'
import {
    CheckCircleIcon,
    ArrowLeftIcon,
    SparklesIcon,
    RotateCwIcon,
    BookOpenIcon,
    LayersIcon,
} from '@/components/flashcard/FlashcardIcons'
import { Tooltip } from '@/components/core/Tooltip'
import type { Flashcard, FSRSRating } from '@/types/flashcard'
import styles from './FlipCardStudyPage.module.css'

export default function FlipCardStudyPage() {
    const { deckId } = useParams<{ deckId: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const initialMode = searchParams.get('mode') === 'all' ? 'all' : 'due'
    const [studyMode, setStudyMode] = useState<'due' | 'all'>(initialMode)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showWordList, setShowWordList] = useState(false)
    const [wordSearchQuery, setWordSearchQuery] = useState('')

    // 1. Query due cards
    const { data: dueCards, isLoading: isLoadingDue } = useQuery({
        queryKey: ['flashcards-due', deckId],
        queryFn: () => getDueCards(deckId),
        refetchOnWindowFocus: false,
    })

    // 2. Query all cards in deck (for review/browse)
    const { data: allCardsData, isLoading: isLoadingAll } = useQuery({
        queryKey: ['deck-cards', deckId],
        queryFn: () =>
            deckId ? getDeckCards(deckId, 1, 200) : { cards: [], total: 0 },
        refetchOnWindowFocus: false,
    })

    const allCards = useMemo(() => allCardsData?.cards ?? [], [allCardsData])

    const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
    const [isSessionLoaded, setIsSessionLoaded] = useState(false)

    // Snapshot session cards based on active mode
    useEffect(() => {
        if (!isSessionLoaded) {
            if (studyMode === 'all') {
                if (allCards.length > 0 || !isLoadingAll) {
                    setSessionCards(allCards)
                    setIsSessionLoaded(true)
                }
            } else {
                if (dueCards !== undefined) {
                    setSessionCards(dueCards)
                    setIsSessionLoaded(true)
                }
            }
        }
    }, [studyMode, dueCards, allCards, isSessionLoaded, isLoadingAll])

    const reviewMutation = useMutation({
        mutationFn: submitReview,
    })

    const handleRate = async (cardId: string, rating: FSRSRating) => {
        await reviewMutation.mutateAsync({
            card_id: cardId,
            rating,
        })
        const nextIndex = currentIndex + 1
        setCurrentIndex(nextIndex)

        // Invalidate queries when full session finishes
        if (nextIndex >= sessionCards.length) {
            queryClient.invalidateQueries({
                queryKey: ['flashcards-due', deckId],
            })
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            queryClient.invalidateQueries({ queryKey: ['flashcards-stats'] })
        }
    }

    // Switch to Cram / All cards mode
    const handleStartCramMode = () => {
        setStudyMode('all')
        setSearchParams({ mode: 'all' })
        setSessionCards(allCards)
        setCurrentIndex(0)
        setIsSessionLoaded(true)
    }

    // Restart current session
    const handleRestartSession = () => {
        setCurrentIndex(0)
    }

    const filteredWords = useMemo(() => {
        const pool = allCards.length > 0 ? allCards : sessionCards
        if (!wordSearchQuery.trim()) return pool
        const q = wordSearchQuery.toLowerCase()
        return pool.filter(
            (c) =>
                c.word.toLowerCase().includes(q) ||
                (c.definitionVi && c.definitionVi.toLowerCase().includes(q))
        )
    }, [allCards, sessionCards, wordSearchQuery])

    const isLoading = studyMode === 'all' ? isLoadingAll : isLoadingDue

    if (isLoading || !isSessionLoaded) {
        return (
            <div className={styles.loadingContainer}>
                <Skeleton height="380px" />
            </div>
        )
    }

    const currentCard = sessionCards[currentIndex]
    const hadNoCardsInitially = sessionCards.length === 0
    const progressPercent =
        sessionCards.length > 0
            ? Math.round((currentIndex / sessionCards.length) * 100)
            : 100

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <ButtonGhost onClick={() => navigate('/student/flashcards')}>
                    <span className={styles.backBtnContent}>
                        <ArrowLeftIcon size={16} />
                        <span>Danh sách bộ thẻ</span>
                    </span>
                </ButtonGhost>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <span className={styles.modeBadge}>
                        <LayersIcon size={13} />
                        <span>
                            {studyMode === 'all'
                                ? 'Ôn tập tự do (Tất cả từ)'
                                : 'Ôn tập theo lịch FSRS'}
                        </span>
                    </span>

                    {studyMode === 'due' && allCards.length > 0 && (
                        <Tooltip
                            content="Ôn tập toàn bộ từ vựng trong bộ thẻ mà không phụ thuộc hạn"
                            placement="bottom"
                        >
                            <button
                                type="button"
                                className={styles.modeToggleBtn}
                                onClick={handleStartCramMode}
                            >
                                <SparklesIcon size={14} />
                                <span>Ôn tất cả ({allCards.length})</span>
                            </button>
                        </Tooltip>
                    )}
                </div>

                <div className={styles.progressGroup}>
                    <div className={styles.progressBarTrack}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className={styles.progressCounter}>
                        {sessionCards.length > 0 && currentCard
                            ? `${currentIndex + 1} / ${sessionCards.length}`
                            : `${sessionCards.length} / ${sessionCards.length}`}
                    </span>
                </div>
            </div>

            {!currentCard ? (
                <div className={styles.completedCard}>
                    <div className={styles.iconWrapper}>
                        {hadNoCardsInitially ? (
                            <SparklesIcon size={36} />
                        ) : (
                            <CheckCircleIcon size={36} />
                        )}
                    </div>
                    <h2 className={styles.completedTitle}>
                        {hadNoCardsInitially
                            ? 'Không có thẻ nào cần ôn hôm nay!'
                            : 'Hoàn thành lượt học!'}
                    </h2>
                    <p className={styles.completedText}>
                        {hadNoCardsInitially
                            ? 'Tất cả thẻ trong bộ này đã được ôn tập đúng chu kỳ. Bạn có thể ôn tập tự do tất cả từ vựng hoặc xem lại danh sách bên dưới.'
                            : `Bạn đã ôn tập xong toàn bộ ${sessionCards.length} thẻ trong phiên học này.`}
                    </p>
                    <div className={styles.actionGroup}>
                        {sessionCards.length > 0 && (
                            <ButtonPrimary onClick={handleRestartSession}>
                                <RotateCwIcon size={16} />
                                <span>Học Lại Lượt Này</span>
                            </ButtonPrimary>
                        )}

                        {allCards.length > 0 && (
                            <ButtonGhost onClick={handleStartCramMode}>
                                <SparklesIcon size={16} />
                                <span>
                                    Ôn Tập Tất Cả ({allCards.length} Từ)
                                </span>
                            </ButtonGhost>
                        )}

                        <ButtonGhost
                            onClick={() => setShowWordList((prev) => !prev)}
                        >
                            <BookOpenIcon size={16} />
                            <span>
                                {showWordList
                                    ? 'Ẩn Danh Sách Từ Vựng'
                                    : 'Xem Lại Toàn Bộ Từ Vựng'}
                            </span>
                        </ButtonGhost>

                        <ButtonGhost
                            onClick={() => navigate('/student/flashcards')}
                        >
                            Về Danh Sách Bộ Thẻ
                        </ButtonGhost>
                    </div>

                    {/* Word List Browser Section */}
                    {showWordList && (
                        <div className={styles.wordListSection}>
                            <div className={styles.wordListHeader}>
                                <h3 className={styles.wordListTitle}>
                                    <BookOpenIcon size={18} />
                                    <span>Từ Vựng Trong Bộ Thẻ</span>
                                    <span className={styles.wordListCount}>
                                        {filteredWords.length} từ
                                    </span>
                                </h3>
                                <input
                                    type="text"
                                    className={styles.wordSearchInput}
                                    placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
                                    value={wordSearchQuery}
                                    onChange={(e) =>
                                        setWordSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.wordTable}>
                                {filteredWords.map((card) => (
                                    <div
                                        key={card.id}
                                        className={styles.wordRow}
                                    >
                                        <div className={styles.wordMainCol}>
                                            <div
                                                className={styles.wordHeadline}
                                            >
                                                <span
                                                    className={styles.wordText}
                                                >
                                                    {card.word}
                                                </span>
                                                {card.ipa && (
                                                    <span
                                                        className={
                                                            styles.wordIpa
                                                        }
                                                    >
                                                        /
                                                        {card.ipa.replace(
                                                            /^\/|\/$/g,
                                                            ''
                                                        )}
                                                        /
                                                    </span>
                                                )}
                                                {card.wordType && (
                                                    <span
                                                        className={
                                                            styles.wordTypeTag
                                                        }
                                                    >
                                                        {card.wordType}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.wordDef}>
                                                {card.definitionVi ||
                                                    card.definitionEn}
                                            </div>
                                            {card.exampleSentence && (
                                                <div
                                                    className={
                                                        styles.wordExample
                                                    }
                                                >
                                                    "{card.exampleSentence}"
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.wordActionCol}>
                                            <AudioButton
                                                audioUrl={card.audioUrl}
                                                word={card.word}
                                                size="sm"
                                            />
                                            <PronunciationLinkBar card={card} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <FlipCard
                    card={currentCard}
                    index={currentIndex}
                    total={sessionCards.length}
                    onRate={handleRate}
                />
            )}
        </div>
    )
}
