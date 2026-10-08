import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
    getDeckList,
    getStats,
    createDeck,
    type CreateDeckPayload,
} from '@/lib/flashcard'
import Skeleton from '@/components/effect/Skeleton'
import type { FlashcardDeck } from '@/types/flashcard'
import { DECK_LEVEL_LABELS, DECK_TOPIC_LABELS } from '@/types/flashcard'
import {
    SparklesIcon,
    LayersIcon,
    FlameIcon,
    CheckCircleIcon,
    BookOpenIcon,
    PlusIcon,
    BarChartIcon,
    ArrowRightIcon,
    InboxIcon,
} from '@/components/flashcard/FlashcardIcons'
import { CreateDeckModal } from '@/components/flashcard/CreateDeckModal'
import styles from './DeckListPage.module.css'

export default function DeckListPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [page] = useState(1)
    const [selectedTopic, setSelectedTopic] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['flashcard-decks', page],
        queryFn: () => getDeckList({ page, limit: 20 }),
    })

    const { data: stats } = useQuery({
        queryKey: ['flashcards-stats'],
        queryFn: getStats,
    })

    const createMutation = useMutation({
        mutationFn: (payload: CreateDeckPayload) => createDeck(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            queryClient.invalidateQueries({ queryKey: ['flashcards-stats'] })
        },
    })

    const handleCreateDeck = async (payload: CreateDeckPayload) => {
        await createMutation.mutateAsync(payload)
    }

    const decks = data?.decks ?? []

    // Filter decks by topic
    const filteredDecks = useMemo(() => {
        if (selectedTopic === 'all') return decks
        return decks.filter(
            (d) =>
                d.topicTag?.toLowerCase() === selectedTopic.toLowerCase() ||
                d.level?.toLowerCase() === selectedTopic.toLowerCase()
        )
    }, [decks, selectedTopic])

    // Total due cards across decks
    const totalDue = decks.reduce((sum, d) => sum + (d.dueTodayCount || 0), 0)

    const topics = [
        { id: 'all', label: 'Tất cả' },
        { id: 'ielts', label: 'IELTS' },
        { id: 'toeic', label: 'TOEIC' },
        { id: 'academic', label: 'Học thuật' },
        { id: 'general', label: 'Tổng quát' },
    ]

    return (
        <div className={styles.container}>
            {/* ── Centered Hero Header (Chuẩn Template Pronunciation) ────────── */}
            <div className={styles.pageHeaderCentered}>
                <div className={styles.badgeLabel}>
                    <SparklesIcon size={14} />
                    <span>Phương Pháp Ôn Tập Ngắt Quãng</span>
                </div>
                <h1 className={styles.pageTitle}>
                    <span>Bộ Thẻ Ghi Nhớ </span>
                    <span className={styles.gradientText}>
                        Flashcard Thông Minh
                    </span>
                </h1>
                <p className={styles.pageDescription}>
                    Ứng dụng phương pháp ôn tập ngắt quãng thông minh giúp tối
                    ưu hóa đường cong trí nhớ, ghi nhớ từ vựng sâu sắc và bền
                    vững theo thời gian.
                </p>

                {/* Toolbar cân đối */}
                <div className={styles.toolbar}>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <PlusIcon size={18} />
                        <span>Tạo Bộ Thẻ Mới</span>
                    </button>
                    <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => navigate('/student/flashcards/stats')}
                    >
                        <BarChartIcon size={18} />
                        <span>Thống Kê Cá Nhân</span>
                    </button>
                </div>
            </div>

            {/* ── Overview Stats Banner ─────────────────────────────────────── */}
            <div className={styles.statsBanner}>
                <div className={styles.statItem}>
                    <div className={styles.statIcon}>
                        <LayersIcon size={22} />
                    </div>
                    <div className={styles.statMeta}>
                        <span className={styles.statLabel}>Tổng số bộ thẻ</span>
                        <span className={styles.statValue}>{decks.length}</span>
                    </div>
                </div>

                <div className={styles.statItem}>
                    <div className={`${styles.statIcon} ${styles.statIconDue}`}>
                        <FlameIcon size={22} />
                    </div>
                    <div className={styles.statMeta}>
                        <span className={styles.statLabel}>Cần ôn hôm nay</span>
                        <span className={styles.statValue}>
                            {stats?.dueToday ?? totalDue}
                        </span>
                    </div>
                </div>

                <div className={styles.statItem}>
                    <div
                        className={`${styles.statIcon} ${styles.statIconMastered}`}
                    >
                        <CheckCircleIcon size={22} />
                    </div>
                    <div className={styles.statMeta}>
                        <span className={styles.statLabel}>Đã ghi nhớ sâu</span>
                        <span className={styles.statValue}>
                            {stats?.totalMastered ?? 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Filter Pills ───────────────────────────────────────────── */}
            <div className={styles.filterRow}>
                {topics.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        className={`${styles.filterPill} ${selectedTopic === t.id ? styles.filterPillActive : ''}`}
                        onClick={() => setSelectedTopic(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Decks Grid ─────────────────────────────────────────────── */}
            {isLoading ? (
                <div className={styles.grid}>
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} height="230px" />
                    ))}
                </div>
            ) : filteredDecks.length === 0 ? (
                <div className={styles.emptyCard}>
                    <div className={styles.emptyIconWrapper}>
                        <InboxIcon size={32} />
                    </div>
                    <h3 className={styles.emptyTitle}>
                        Chưa tìm thấy bộ thẻ nào
                    </h3>
                    <p className={styles.emptyText}>
                        Hiện chưa có bộ thẻ ghi nhớ nào trong danh mục này. Hãy
                        tạo một bộ thẻ mới để bắt đầu học tập ngay bây giờ.
                    </p>
                    <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ marginTop: '8px' }}
                    >
                        <PlusIcon size={16} />
                        <span>Tạo Bộ Thẻ Đầu Tiên</span>
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredDecks.map((deck: FlashcardDeck) => {
                        const topicLabel = deck.topicTag
                            ? DECK_TOPIC_LABELS[deck.topicTag] || deck.topicTag
                            : 'Tổng quát'
                        const levelLabel = deck.level
                            ? DECK_LEVEL_LABELS[deck.level] || deck.level
                            : null

                        return (
                            <div key={deck.id} className={styles.deckCard}>
                                <div className={styles.deckCardAccent} />
                                <div className={styles.deckCardBody}>
                                    <div className={styles.badgeRow}>
                                        <span className={styles.topicBadge}>
                                            {topicLabel}
                                        </span>
                                        {levelLabel && (
                                            <span className={styles.levelBadge}>
                                                {levelLabel}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={styles.deckTitle}>
                                        {deck.title}
                                    </h3>

                                    <p className={styles.deckDescription}>
                                        {deck.description ||
                                            'Bộ từ vựng ôn tập thông minh với các ví dụ thực tế.'}
                                    </p>

                                    <div className={styles.deckFooter}>
                                        <div className={styles.deckStats}>
                                            <span
                                                className={
                                                    styles.cardCountBadge
                                                }
                                            >
                                                <BookOpenIcon size={14} />
                                                <span>
                                                    {deck.cardCount} thẻ
                                                </span>
                                            </span>
                                            <span
                                                className={`${styles.dueBadge} ${deck.dueTodayCount > 0 ? styles.dueBadgeActive : ''}`}
                                            >
                                                <FlameIcon size={13} />
                                                <span>
                                                    {deck.dueTodayCount > 0
                                                        ? `${deck.dueTodayCount} cần ôn hôm nay`
                                                        : 'Đã hoàn thành hôm nay'}
                                                </span>
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className={styles.studyBtn}
                                            onClick={() =>
                                                navigate(
                                                    `/student/flashcards/${deck.id}/study`
                                                )
                                            }
                                        >
                                            <span>Học Ngay</span>
                                            <ArrowRightIcon size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* ── Create Deck Modal ───────────────────────────────────────── */}
            <CreateDeckModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateDeck}
            />
        </div>
    )
}
