import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDueCards, submitReview } from '@/lib/flashcard'
import { FlipCard } from '@/components/flashcard/FlipCard'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Skeleton from '@/components/effect/Skeleton'
import {
    CheckCircleIcon,
    ArrowLeftIcon,
    SparklesIcon,
} from '@/components/flashcard/FlashcardIcons'
import type { Flashcard, FSRSRating } from '@/types/flashcard'

export default function FlipCardStudyPage() {
    const { deckId } = useParams<{ deckId: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [currentIndex, setCurrentIndex] = useState(0)

    const { data: dueCards, isLoading } = useQuery({
        queryKey: ['flashcards-due', deckId],
        queryFn: () => getDueCards(deckId),
        refetchOnWindowFocus: false,
    })

    const [sessionCards, setSessionCards] = useState<Flashcard[]>([])
    const [isSessionLoaded, setIsSessionLoaded] = useState(false)

    // Snapshot session cards to freeze the queue during study
    useEffect(() => {
        if (!isSessionLoaded && dueCards) {
            setSessionCards(dueCards)
            setIsSessionLoaded(true)
        }
    }, [dueCards, isSessionLoaded])

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

        // Only invalidate queries when the full session is completed
        if (nextIndex >= sessionCards.length) {
            queryClient.invalidateQueries({
                queryKey: ['flashcards-due', deckId],
            })
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            queryClient.invalidateQueries({ queryKey: ['flashcards-stats'] })
        }
    }

    if (isLoading || !isSessionLoaded) {
        return (
            <div
                style={{
                    maxWidth: '640px',
                    margin: '40px auto',
                    padding: '0 16px',
                }}
            >
                <Skeleton height="360px" />
            </div>
        )
    }

    const currentCard = sessionCards[currentIndex]
    const hadNoCardsInitially = sessionCards.length === 0

    return (
        <div
            style={{
                maxWidth: '720px',
                margin: '0 auto',
                padding: '24px 16px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <ButtonGhost onClick={() => navigate('/student/flashcards')}>
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <ArrowLeftIcon size={14} />
                        <span>Quay lại danh sách bộ thẻ</span>
                    </span>
                </ButtonGhost>
                <span
                    style={{
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    {sessionCards.length > 0 && currentCard
                        ? `${currentIndex + 1} / ${sessionCards.length}`
                        : `${sessionCards.length} / ${sessionCards.length}`}
                </span>
            </div>

            {!currentCard ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'var(--color-surface-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--color-border-soft)',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(22, 163, 74, 0.1)',
                            color: '#16a34a',
                            marginBottom: '16px',
                        }}
                    >
                        {hadNoCardsInitially ? (
                            <SparklesIcon size={36} />
                        ) : (
                            <CheckCircleIcon size={36} />
                        )}
                    </div>
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            marginBottom: '8px',
                        }}
                    >
                        {hadNoCardsInitially
                            ? 'Không có thẻ nào cần ôn hôm nay!'
                            : 'Hoàn thành lượt học!'}
                    </h2>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: '24px',
                        }}
                    >
                        {hadNoCardsInitially
                            ? 'Tất cả thẻ trong bộ này đã được ôn tập đúng chu kỳ. Hãy quay lại vào ngày mai!'
                            : `Bạn đã ôn tập xong toàn bộ ${sessionCards.length} thẻ trong phiên học này.`}
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                        }}
                    >
                        <ButtonPrimary
                            onClick={() => navigate('/student/flashcards')}
                        >
                            Về Danh Sách Thẻ
                        </ButtonPrimary>
                        <ButtonGhost
                            onClick={() =>
                                navigate('/student/flashcards/stats')
                            }
                        >
                            Xem Thống Kê
                        </ButtonGhost>
                    </div>
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
