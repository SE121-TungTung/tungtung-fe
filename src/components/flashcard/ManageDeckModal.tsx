import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getDeckCards,
    createCard,
    updateCard,
    deleteCard,
    updateDeck,
    deleteDeck,
    type CardPayload,
} from '@/lib/flashcard'
import type { FlashcardDeck, Flashcard } from '@/types/flashcard'
import { DeckTopic, DeckLevel, WordType } from '@/types/flashcard'
import {
    XIcon,
    LayersIcon,
    PlusIcon,
    TrashIcon,
    EditIcon,
    CheckCircleIcon,
    SettingsIcon,
    InboxIcon,
    SparklesIcon,
} from './FlashcardIcons'
import { AICardGenerator } from './AICardGenerator'
import { Tooltip } from '@/components/core/Tooltip'
import Skeleton from '@/components/effect/Skeleton'
import styles from './ManageDeckModal.module.css'

interface ManageDeckModalProps {
    deck: FlashcardDeck | null
    isOpen: boolean
    onClose: () => void
    onUpdated?: () => void
}

type ModalTab = 'cards' | 'add' | 'ai' | 'settings'

export function ManageDeckModal({
    deck,
    isOpen,
    onClose,
    onUpdated,
}: ManageDeckModalProps) {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<ModalTab>('cards')
    const [searchQuery, setSearchQuery] = useState('')

    // Form: Add / Edit Card
    const [editingCardId, setEditingCardId] = useState<string | null>(null)
    const [cardWord, setCardWord] = useState('')
    const [cardIpa, setCardIpa] = useState('')
    const [cardWordType, setCardWordType] = useState<string>('noun')
    const [cardDefVi, setCardDefVi] = useState('')
    const [cardDefEn, setCardDefEn] = useState('')
    const [cardExample, setCardExample] = useState('')
    const [cardError, setCardError] = useState<string | null>(null)
    const [cardSuccess, setCardSuccess] = useState<string | null>(null)

    // Form: Edit Deck
    const [deckTitle, setDeckTitle] = useState(deck?.title || '')
    const [deckDesc, setDeckDesc] = useState(deck?.description || '')
    const [deckTopic, setDeckTopic] = useState<string>(
        deck?.topicTag || 'ielts'
    )
    const [deckLevel, setDeckLevel] = useState<string>(
        deck?.level || 'beginner'
    )
    const [deckPublic, setDeckPublic] = useState(deck?.isPublic ?? true)
    const [deckError, setDeckError] = useState<string | null>(null)
    const [deckSuccess, setDeckSuccess] = useState<string | null>(null)

    // Đồng bộ form với bộ thẻ hiện tại mỗi khi mở modal / đổi bộ thẻ
    useEffect(() => {
        if (!isOpen || !deck) return
        setDeckTitle(deck.title || '')
        setDeckDesc(deck.description || '')
        setDeckTopic(deck.topicTag || 'ielts')
        setDeckLevel(deck.level || 'beginner')
        setDeckPublic(deck.isPublic ?? true)
        setDeckError(null)
        setDeckSuccess(null)
        setCardError(null)
        setCardSuccess(null)
        setEditingCardId(null)
        setSearchQuery('')
        setActiveTab('cards')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, deck?.id])

    // Query cards in deck
    const { data, isLoading } = useQuery({
        queryKey: ['deck-cards', deck?.id],
        queryFn: () =>
            deck ? getDeckCards(deck.id, 1, 100) : { cards: [], total: 0 },
        enabled: isOpen && !!deck?.id,
    })

    const cards = data?.cards ?? []

    const filteredCards = useMemo(() => {
        if (!searchQuery.trim()) return cards
        const q = searchQuery.toLowerCase()
        return cards.filter(
            (c) =>
                c.word.toLowerCase().includes(q) ||
                (c.definitionVi && c.definitionVi.toLowerCase().includes(q))
        )
    }, [cards, searchQuery])

    // Card Mutations
    const createCardMutation = useMutation({
        mutationFn: (payload: CardPayload) => {
            if (!deck) throw new Error('No deck selected')
            return createCard(deck.id, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['deck-cards', deck?.id],
            })
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            queryClient.invalidateQueries({
                queryKey: ['flashcards-due', deck?.id],
            })
            setCardSuccess('Đã thêm từ vựng thành công!')
            setCardError(null)
            resetCardForm()
            onUpdated?.()
        },
        onError: (err: Error) => {
            setCardError(err.message || 'Không thể thêm từ vựng.')
            setCardSuccess(null)
        },
    })

    const updateCardMutation = useMutation({
        mutationFn: ({
            cardId,
            payload,
        }: {
            cardId: string
            payload: Partial<CardPayload>
        }) => {
            if (!deck) throw new Error('No deck selected')
            return updateCard(deck.id, cardId, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['deck-cards', deck?.id],
            })
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            setCardSuccess('Đã cập nhật từ vựng thành công!')
            setCardError(null)
            setEditingCardId(null)
            resetCardForm()
            setActiveTab('cards')
            onUpdated?.()
        },
        onError: (err: Error) => {
            setCardError(err.message || 'Không thể cập nhật từ vựng.')
            setCardSuccess(null)
        },
    })

    const deleteCardMutation = useMutation({
        mutationFn: (cardId: string) => {
            if (!deck) throw new Error('No deck selected')
            return deleteCard(deck.id, cardId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['deck-cards', deck?.id],
            })
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            queryClient.invalidateQueries({
                queryKey: ['flashcards-due', deck?.id],
            })
            onUpdated?.()
        },
    })

    // Deck Mutations
    const updateDeckMutation = useMutation({
        mutationFn: (payload: {
            title: string
            description: string
            topic_tag: string
            level: string
            is_public: boolean
        }) => {
            if (!deck) throw new Error('No deck selected')
            return updateDeck(deck.id, payload)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            setDeckSuccess('Đã cập nhật thông tin bộ thẻ!')
            setDeckError(null)
            onUpdated?.()
        },
        onError: (err: Error) => {
            setDeckError(err.message || 'Không thể cập nhật bộ thẻ.')
            setDeckSuccess(null)
        },
    })

    const deleteDeckMutation = useMutation({
        mutationFn: () => {
            if (!deck) throw new Error('No deck selected')
            return deleteDeck(deck.id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
            onUpdated?.()
            onClose()
        },
    })

    const resetCardForm = () => {
        setCardWord('')
        setCardIpa('')
        setCardWordType('noun')
        setCardDefVi('')
        setCardDefEn('')
        setCardExample('')
    }

    const handleStartEditCard = (card: Flashcard) => {
        setEditingCardId(card.id)
        setCardWord(card.word)
        setCardIpa(card.ipa || '')
        setCardWordType(card.wordType || 'noun')
        setCardDefVi(card.definitionVi || '')
        setCardDefEn(card.definitionEn || '')
        setCardExample(card.exampleSentence || '')
        setCardError(null)
        setCardSuccess(null)
        setActiveTab('add')
    }

    const handleCardSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cardWord.trim()) {
            setCardError('Vui lòng nhập từ vựng.')
            return
        }
        if (!cardDefVi.trim() && !cardDefEn.trim()) {
            setCardError(
                'Vui lòng nhập ít nhất một định nghĩa (Tiếng Việt hoặc Tiếng Anh).'
            )
            return
        }

        const payload: CardPayload = {
            word: cardWord.trim(),
            ipa: cardIpa.trim() || null,
            word_type: cardWordType || null,
            definition_vi: cardDefVi.trim() || null,
            definition_en: cardDefEn.trim() || null,
            example_sentence: cardExample.trim() || null,
        }

        if (editingCardId) {
            await updateCardMutation.mutateAsync({
                cardId: editingCardId,
                payload,
            })
        } else {
            await createCardMutation.mutateAsync(payload)
        }
    }

    const handleDeckUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!deckTitle.trim()) {
            setDeckError('Tên bộ thẻ không được để trống.')
            return
        }
        await updateDeckMutation.mutateAsync({
            title: deckTitle.trim(),
            description: deckDesc.trim(),
            topic_tag: deckTopic,
            level: deckLevel,
            is_public: deckPublic,
        })
    }

    const handleDeleteDeck = () => {
        if (!deck) return
        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa bộ thẻ "${deck.title}"? Toàn bộ thẻ trong bộ này sẽ bị xóa.`
        )
        if (confirmed) {
            deleteDeckMutation.mutate()
        }
    }

    if (!isOpen || !deck) return null

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconWrapper}>
                            <LayersIcon size={20} />
                        </div>
                        <div>
                            <h2 className={styles.title}>Quản Lý Bộ Thẻ</h2>
                            <div className={styles.deckSubtitle}>
                                {deck.title}
                            </div>
                        </div>
                    </div>
                    <Tooltip content="Đóng" placement="left">
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={onClose}
                        >
                            <XIcon size={18} />
                        </button>
                    </Tooltip>
                </div>

                {/* Tabs */}
                <div className={styles.tabsRow}>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'cards' ? styles.tabBtnActive : ''}`}
                        onClick={() => {
                            setActiveTab('cards')
                            setEditingCardId(null)
                        }}
                    >
                        <span>Danh Sách Từ Vựng</span>
                        <span className={styles.tabCountBadge}>
                            {cards.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'add' ? styles.tabBtnActive : ''}`}
                        onClick={() => {
                            setActiveTab('add')
                            if (!editingCardId) resetCardForm()
                        }}
                    >
                        <PlusIcon size={15} />
                        <span>
                            {editingCardId ? 'Sửa Từ Vựng' : 'Thêm Từ Mới'}
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'ai' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('ai')}
                    >
                        <SparklesIcon size={15} />
                        <span>Tạo Bằng AI</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabBtnActive : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <SettingsIcon size={15} />
                        <span>Cài Đặt Bộ Thẻ</span>
                    </button>
                </div>

                {/* Content */}
                <div className={styles.body}>
                    {/* TAB 1: Danh sách từ */}
                    {activeTab === 'cards' && (
                        <div>
                            <div className={styles.cardsTopBar}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="Tìm từ vựng hoặc nghĩa trong bộ thẻ..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className={styles.addQuickBtn}
                                    onClick={() => {
                                        setEditingCardId(null)
                                        resetCardForm()
                                        setActiveTab('add')
                                    }}
                                >
                                    <PlusIcon size={16} />
                                    <span>Thêm Từ</span>
                                </button>
                            </div>

                            {isLoading ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}
                                >
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} height="70px" />
                                    ))}
                                </div>
                            ) : filteredCards.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <InboxIcon size={32} />
                                    <p className={styles.emptyText}>
                                        {searchQuery
                                            ? 'Không tìm thấy từ vựng phù hợp với từ khóa.'
                                            : 'Bộ thẻ này hiện chưa có từ vựng nào.'}
                                    </p>
                                    <button
                                        type="button"
                                        className={styles.addQuickBtn}
                                        onClick={() => {
                                            setEditingCardId(null)
                                            resetCardForm()
                                            setActiveTab('add')
                                        }}
                                    >
                                        <PlusIcon size={16} />
                                        <span>Thêm Từ Đầu Tiên</span>
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.cardsList}>
                                    {filteredCards.map((card) => (
                                        <div
                                            key={card.id}
                                            className={styles.cardItem}
                                        >
                                            <div className={styles.cardContent}>
                                                <div
                                                    className={
                                                        styles.cardWordRow
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.cardWord
                                                        }
                                                    >
                                                        {card.word}
                                                    </span>
                                                    {card.ipa && (
                                                        <span
                                                            className={
                                                                styles.cardIpa
                                                            }
                                                        >
                                                            /{card.ipa}/
                                                        </span>
                                                    )}
                                                    {card.wordType && (
                                                        <span
                                                            className={
                                                                styles.cardWordType
                                                            }
                                                        >
                                                            {card.wordType}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.cardDefinition
                                                    }
                                                >
                                                    {card.definitionVi ||
                                                        card.definitionEn}
                                                </div>
                                                {card.exampleSentence && (
                                                    <div
                                                        className={
                                                            styles.cardExample
                                                        }
                                                    >
                                                        "{card.exampleSentence}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.cardActions}>
                                                <Tooltip
                                                    content="Chỉnh sửa từ vựng"
                                                    placement="top"
                                                >
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.actionBtn
                                                        }
                                                        onClick={() =>
                                                            handleStartEditCard(
                                                                card
                                                            )
                                                        }
                                                    >
                                                        <EditIcon size={14} />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Xóa từ khỏi bộ thẻ"
                                                    placement="top"
                                                >
                                                    <button
                                                        type="button"
                                                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                                        onClick={() => {
                                                            if (
                                                                window.confirm(
                                                                    `Xóa từ "${card.word}" khỏi bộ thẻ?`
                                                                )
                                                            ) {
                                                                deleteCardMutation.mutate(
                                                                    card.id
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        <TrashIcon size={14} />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: Thêm / Sửa từ */}
                    {activeTab === 'add' && (
                        <form
                            onSubmit={handleCardSubmit}
                            className={styles.form}
                        >
                            {cardSuccess && (
                                <div className={styles.successMessage}>
                                    <CheckCircleIcon size={16} />
                                    <span>{cardSuccess}</span>
                                </div>
                            )}
                            {cardError && (
                                <div className={styles.errorMessage}>
                                    {cardError}
                                </div>
                            )}

                            <div className={styles.row}>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        Từ vựng{' '}
                                        <span className={styles.required}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Ví dụ: resilient"
                                        value={cardWord}
                                        onChange={(e) =>
                                            setCardWord(e.target.value)
                                        }
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        Phiên âm IPA
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Ví dụ: rɪˈzɪl.i.ənt"
                                        value={cardIpa}
                                        onChange={(e) =>
                                            setCardIpa(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Từ loại</label>
                                <select
                                    className={styles.select}
                                    value={cardWordType}
                                    onChange={(e) =>
                                        setCardWordType(e.target.value)
                                    }
                                >
                                    <option value={WordType.NOUN}>
                                        Danh từ (noun)
                                    </option>
                                    <option value={WordType.VERB}>
                                        Động từ (verb)
                                    </option>
                                    <option value={WordType.ADJECTIVE}>
                                        Tính từ (adjective)
                                    </option>
                                    <option value={WordType.ADVERB}>
                                        Trạng từ (adverb)
                                    </option>
                                    <option value={WordType.PRONOUN}>
                                        Đại từ (pronoun)
                                    </option>
                                    <option value={WordType.PREPOSITION}>
                                        Giới từ (preposition)
                                    </option>
                                    <option value={WordType.CONJUNCTION}>
                                        Liên từ (conjunction)
                                    </option>
                                    <option value={WordType.INTERJECTION}>
                                        Thán từ (interjection)
                                    </option>
                                    <option value={WordType.PHRASE}>
                                        Cụm từ / Thành ngữ (phrase)
                                    </option>
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Nghĩa Tiếng Việt{' '}
                                    <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Ví dụ: kiên cường, có khả năng phục hồi nhanh"
                                    value={cardDefVi}
                                    onChange={(e) =>
                                        setCardDefVi(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Định nghĩa Tiếng Anh (tùy chọn)
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Ví dụ: able to be happy, successful, etc. again after something difficult"
                                    value={cardDefEn}
                                    onChange={(e) =>
                                        setCardDefEn(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Câu ví dụ minh họa
                                </label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Ví dụ: He'll get over it—young people are remarkably resilient."
                                    value={cardExample}
                                    onChange={(e) =>
                                        setCardExample(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.formFooter}>
                                {editingCardId && (
                                    <button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => {
                                            setEditingCardId(null)
                                            resetCardForm()
                                            setActiveTab('cards')
                                        }}
                                    >
                                        Hủy Chỉnh Sửa
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={
                                        createCardMutation.isPending ||
                                        updateCardMutation.isPending
                                    }
                                >
                                    <PlusIcon size={16} />
                                    <span>
                                        {editingCardId
                                            ? updateCardMutation.isPending
                                                ? 'Đang lưu...'
                                                : 'Lưu Thay Đổi'
                                            : createCardMutation.isPending
                                              ? 'Đang thêm...'
                                              : 'Thêm Vào Bộ Thẻ'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB AI: Tạo thẻ bằng AI */}
                    {activeTab === 'ai' && (
                        <AICardGenerator
                            deckId={deck.id}
                            existingWords={cards.map((c) => c.word)}
                            onAdded={(created, skipped) => {
                                queryClient.invalidateQueries({
                                    queryKey: ['deck-cards', deck.id],
                                })
                                queryClient.invalidateQueries({
                                    queryKey: ['flashcard-decks'],
                                })
                                queryClient.invalidateQueries({
                                    queryKey: ['flashcards-due', deck.id],
                                })
                                setCardSuccess(
                                    `Đã thêm ${created} thẻ${skipped ? `, bỏ qua ${skipped} thẻ trùng` : ''}.`
                                )
                                setActiveTab('cards')
                                onUpdated?.()
                            }}
                        />
                    )}

                    {/* TAB 3: Cài đặt bộ thẻ */}
                    {activeTab === 'settings' && (
                        <div>
                            <form
                                onSubmit={handleDeckUpdateSubmit}
                                className={styles.form}
                            >
                                {deckSuccess && (
                                    <div className={styles.successMessage}>
                                        <CheckCircleIcon size={16} />
                                        <span>{deckSuccess}</span>
                                    </div>
                                )}
                                {deckError && (
                                    <div className={styles.errorMessage}>
                                        {deckError}
                                    </div>
                                )}

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        Tên bộ thẻ
                                    </label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={deckTitle}
                                        onChange={(e) =>
                                            setDeckTitle(e.target.value)
                                        }
                                    />
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>
                                        Mô tả
                                    </label>
                                    <textarea
                                        className={styles.textarea}
                                        value={deckDesc}
                                        onChange={(e) =>
                                            setDeckDesc(e.target.value)
                                        }
                                    />
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>
                                            Chủ đề
                                        </label>
                                        <select
                                            className={styles.select}
                                            value={deckTopic}
                                            onChange={(e) =>
                                                setDeckTopic(e.target.value)
                                            }
                                        >
                                            <option value={DeckTopic.IELTS}>
                                                IELTS
                                            </option>
                                            <option value={DeckTopic.TOEIC}>
                                                TOEIC
                                            </option>
                                            <option value={DeckTopic.ACADEMIC}>
                                                Học thuật
                                            </option>
                                            <option value={DeckTopic.BUSINESS}>
                                                Kinh doanh
                                            </option>
                                            <option value={DeckTopic.GENERAL}>
                                                Tổng quát
                                            </option>
                                            <option value={DeckTopic.OTHER}>
                                                Khác
                                            </option>
                                        </select>
                                    </div>

                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>
                                            Cấp độ
                                        </label>
                                        <select
                                            className={styles.select}
                                            value={deckLevel}
                                            onChange={(e) =>
                                                setDeckLevel(e.target.value)
                                            }
                                        >
                                            <option value={DeckLevel.BEGINNER}>
                                                Cơ bản
                                            </option>
                                            <option
                                                value={DeckLevel.INTERMEDIATE}
                                            >
                                                Trung cấp
                                            </option>
                                            <option value={DeckLevel.ADVANCED}>
                                                Nâng cao
                                            </option>
                                            <option value={DeckLevel.EXPERT}>
                                                Chuyên gia
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={deckPublic}
                                        onChange={(e) =>
                                            setDeckPublic(e.target.checked)
                                        }
                                    />
                                    <span>
                                        Công khai bộ thẻ cho các học viên khác
                                    </span>
                                </label>

                                <div className={styles.formFooter}>
                                    <button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={updateDeckMutation.isPending}
                                    >
                                        <span>
                                            {updateDeckMutation.isPending
                                                ? 'Đang lưu...'
                                                : 'Lưu Thay Đổi'}
                                        </span>
                                    </button>
                                </div>
                            </form>

                            {/* Danger Zone */}
                            <div className={styles.dangerZone}>
                                <div>
                                    <div className={styles.dangerTitle}>
                                        Xóa Bộ Thẻ Này
                                    </div>
                                    <div className={styles.dangerText}>
                                        Hành động này sẽ xóa bộ thẻ và toàn bộ
                                        từ vựng liên quan khỏi hệ thống.
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={styles.deleteDeckBtn}
                                    onClick={handleDeleteDeck}
                                    disabled={deleteDeckMutation.isPending}
                                >
                                    {deleteDeckMutation.isPending
                                        ? 'Đang xóa...'
                                        : 'Xóa Bộ Thẻ'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
