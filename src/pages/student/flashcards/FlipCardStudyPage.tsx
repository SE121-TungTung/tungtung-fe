import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDueCards, submitReview } from '@/lib/flashcard'
import { FlipCard } from '@/components/flashcard/FlipCard'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Skeleton from '@/components/effect/Skeleton'
import type { FSRSRating } from '@/types/flashcard'

export default function FlipCardStudyPage() {
    const { deckId } = useParams<{ deckId: string }>()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [currentIndex, setCurrentIndex] = useState(0)

    const { data: cards = [], isLoading } = useQuery({
        queryKey: ['flashcards-due', deckId],
        queryFn: () => getDueCards(deckId),
    })

    const reviewMutation = useMutation({
        mutationFn: submitReview,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['flashcards-due', deckId],
            })
            queryClient.invalidateQueries({ queryKey: ['flashcards-stats'] })
        },
    })

    const handleRate = async (cardId: string, rating: FSRSRating) => {
        await reviewMutation.mutateAsync({
            card_id: cardId,
            rating,
        })
        setCurrentIndex((prev) => prev + 1)
    }

    if (isLoading) {
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

    const currentCard = cards[currentIndex]

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
                    ← Quay lại danh sách
                </ButtonGhost>
                <span
                    style={{
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    {cards.length > 0
                        ? `${currentIndex + 1} / ${cards.length}`
                        : '0 / 0'}
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
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🎉
                    </div>
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            marginBottom: '8px',
                        }}
                    >
                        Hoàn thành lượt học!
                    </h2>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: '24px',
                        }}
                    >
                        Bạn đã hoàn thành tất cả thẻ cần ôn tập trong phiên này.
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
                    total={cards.length}
                    onRate={handleRate}
                />
            )}
        </div>
    )
}
