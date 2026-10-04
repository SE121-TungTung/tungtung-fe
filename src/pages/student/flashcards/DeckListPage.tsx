import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getDeckList } from '@/lib/flashcard'
import Card from '@/components/common/card/Card'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Skeleton from '@/components/effect/Skeleton'
import type { FlashcardDeck } from '@/types/flashcard'

export default function DeckListPage() {
    const navigate = useNavigate()
    const [page] = useState(1)

    const { data, isLoading } = useQuery({
        queryKey: ['flashcard-decks', page],
        queryFn: () => getDeckList({ page, limit: 20 }),
    })

    const decks = data?.decks ?? []

    return (
        <div
            style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '24px 16px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}
            >
                <div>
                    <h1
                        style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}
                    >
                        Bộ Thẻ Ghi Nhớ (Flashcards)
                    </h1>
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            marginTop: '4px',
                        }}
                    >
                        Ôn tập từ vựng ngắt quãng thông minh với thuật toán
                        FSRS.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <ButtonGhost
                        onClick={() => navigate('/student/flashcards/stats')}
                    >
                        Thống Kê Cá Nhân
                    </ButtonGhost>
                </div>
            </div>

            {isLoading ? (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} height="160px" />
                    ))}
                </div>
            ) : decks.length === 0 ? (
                <Card
                    variant="outline"
                    style={{ textAlign: 'center', padding: '48px 16px' }}
                >
                    <p
                        style={{
                            color: 'var(--color-text-secondary)',
                            marginBottom: '16px',
                        }}
                    >
                        Hiện chưa có bộ thẻ nào.
                    </p>
                </Card>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {decks.map((deck: FlashcardDeck) => (
                        <Card
                            key={deck.id}
                            variant="outline"
                            title={deck.title}
                            subtitle={deck.topicTag || deck.level}
                            controls={
                                <ButtonPrimary
                                    onClick={() =>
                                        navigate(
                                            `/student/flashcards/${deck.id}/study`
                                        )
                                    }
                                >
                                    Học Ngay
                                </ButtonPrimary>
                            }
                        >
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: 'var(--color-text-secondary)',
                                    margin: '8px 0 16px',
                                    minHeight: '40px',
                                }}
                            >
                                {deck.description || 'Không có mô tả.'}
                            </p>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                    color: 'var(--color-text-tertiary)',
                                    borderTop:
                                        '1px solid var(--color-border-soft)',
                                    paddingTop: '10px',
                                }}
                            >
                                <span>{deck.cardCount} thẻ</span>
                                <span>{deck.dueTodayCount} cần ôn hôm nay</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
