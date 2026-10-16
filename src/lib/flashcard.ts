/**
 * API Client: Flashcard
 * Uses native fetch wrapper from @/lib/api — no Axios.
 */
import { api } from '@/lib/api'
import type {
    FlashcardDeck,
    Flashcard,
    FlashcardReview,
    FlashcardStats,
    BackendFlashcardDeck,
    BackendFlashcard,
    BackendFlashcardReview,
    BackendFlashcardStats,
    ReviewSubmitRequest,
    ImportFromVocabularyRequest,
    PaginatedResponse,
} from '@/types/flashcard'
import { mapDeck, mapCard, mapReview, mapStats } from '@/types/flashcard'

const BASE = '/api/v1'

// ── List params ───────────────────────────────────────────────────────────────

export interface GetDeckListParams {
    page?: number
    limit?: number
    topic_tag?: string
    level?: string
    is_public?: boolean
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * GET /flashcard-decks
 * Returns paginated list of decks (public + owned).
 */
export async function getDeckList(
    params: GetDeckListParams = {}
): Promise<{ decks: FlashcardDeck[]; total: number; totalPages: number }> {
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    if (params.topic_tag) qs.set('topic_tag', params.topic_tag)
    if (params.level) qs.set('level', params.level)
    if (params.is_public !== undefined)
        qs.set('is_public', String(params.is_public))

    const res = await api<PaginatedResponse<BackendFlashcardDeck>>(
        `${BASE}/flashcard-decks?${qs.toString()}`
    )
    return {
        decks: (res.data ?? []).map(mapDeck),
        total: res.meta?.total ?? 0,
        totalPages: res.meta?.total_pages ?? 0,
    }
}

export interface CreateDeckPayload {
    title: string
    description?: string | null
    topic_tag?: string | null
    level?: string | null
    is_public?: boolean
}

export async function createDeck(
    payload: CreateDeckPayload
): Promise<FlashcardDeck> {
    const res = await api<BackendFlashcardDeck>(`${BASE}/flashcard-decks`, {
        method: 'POST',
        body: JSON.stringify(payload),
    })
    return mapDeck(res)
}

/**
 * GET /flashcard-decks/:id
 * Returns deck detail.
 */
export async function getDeckDetail(deckId: string): Promise<FlashcardDeck> {
    const res = await api<BackendFlashcardDeck>(
        `${BASE}/flashcard-decks/${deckId}`
    )
    return mapDeck(res)
}

/**
 * PUT /flashcard-decks/:id
 * Updates deck details.
 */
export async function updateDeck(
    deckId: string,
    payload: Partial<CreateDeckPayload>
): Promise<FlashcardDeck> {
    const res = await api<BackendFlashcardDeck>(
        `${BASE}/flashcard-decks/${deckId}`,
        {
            method: 'PUT',
            body: JSON.stringify(payload),
        }
    )
    return mapDeck(res)
}

/**
 * DELETE /flashcard-decks/:id
 * Soft deletes a deck.
 */
export async function deleteDeck(deckId: string): Promise<void> {
    await api<void>(`${BASE}/flashcard-decks/${deckId}`, {
        method: 'DELETE',
    })
}

/** Kiểm duyệt: Teacher/TA/Admin ẩn deck đã publish của người khác. */
export async function hideDeck(deckId: string, reason: string): Promise<void> {
    await api<void>(`${BASE}/flashcard-decks/${deckId}/hide`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
    })
}

/**
 * GET /flashcard-decks/:id/cards
 * Returns paginated list of cards in deck.
 */
export async function getDeckCards(
    deckId: string,
    page = 1,
    limit = 50
): Promise<{ cards: Flashcard[]; total: number }> {
    const res = await api<PaginatedResponse<BackendFlashcard>>(
        `${BASE}/flashcard-decks/${deckId}/cards?page=${page}&limit=${limit}`
    )
    return {
        cards: (res.data ?? []).map(mapCard),
        total: res.meta?.total ?? 0,
    }
}

export interface CardPayload {
    word: string
    ipa?: string | null
    word_type?: string | null
    definition_en?: string | null
    definition_vi?: string | null
    example_sentence?: string | null
}

/**
 * POST /flashcard-decks/:id/cards
 * Create a new card in the deck.
 */
export async function createCard(
    deckId: string,
    payload: CardPayload
): Promise<Flashcard> {
    const res = await api<BackendFlashcard>(
        `${BASE}/flashcard-decks/${deckId}/cards`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    )
    return mapCard(res)
}

/**
 * PUT /flashcard-decks/:id/cards/:cardId
 * Update an existing card in the deck.
 */
export async function updateCard(
    deckId: string,
    cardId: string,
    payload: Partial<CardPayload>
): Promise<Flashcard> {
    const res = await api<BackendFlashcard>(
        `${BASE}/flashcard-decks/${deckId}/cards/${cardId}`,
        {
            method: 'PUT',
            body: JSON.stringify(payload),
        }
    )
    return mapCard(res)
}

/**
 * DELETE /flashcard-decks/:id/cards/:cardId
 * Soft delete a card from the deck.
 */
export async function deleteCard(
    deckId: string,
    cardId: string
): Promise<void> {
    await api<void>(`${BASE}/flashcard-decks/${deckId}/cards/${cardId}`, {
        method: 'DELETE',
    })
}

export interface AICardSuggestion {
    word: string
    ipa: string | null
    word_type: string | null
    definition_vi: string | null
    definition_en: string | null
    example_sentence: string | null
}

export type AIGenerateParams =
    | { mode: 'extract'; text: string; max_items?: number }
    | { mode: 'enrich'; words: string[] }

/**
 * POST /flashcard-decks/:id/ai/generate
 * AI suggests card content (not persisted).
 */
export async function aiGenerateCards(
    deckId: string,
    params: AIGenerateParams
): Promise<AICardSuggestion[]> {
    const res = await api<{ suggestions: AICardSuggestion[] }>(
        `${BASE}/flashcard-decks/${deckId}/ai/generate`,
        { method: 'POST', body: JSON.stringify(params) }
    )
    return res.suggestions ?? []
}

/**
 * POST /flashcard-decks/:id/cards/bulk
 * Persist many cards at once; duplicates are skipped by the server.
 */
export async function bulkCreateCards(
    deckId: string,
    cards: CardPayload[]
): Promise<{ created: number; skipped: number }> {
    return api<{ created: number; skipped: number }>(
        `${BASE}/flashcard-decks/${deckId}/cards/bulk`,
        { method: 'POST', body: JSON.stringify({ cards }) }
    )
}

/**
 * GET /flashcards/due
 * Returns cards due for review today (max `limit`, default 20).
 */
export async function getDueCards(
    deckId?: string,
    limit = 20
): Promise<Flashcard[]> {
    const qs = new URLSearchParams()
    qs.set('limit', String(limit))
    if (deckId) qs.set('deck_id', deckId)

    // /due returns ApiResponse<list> where data is a raw object array
    const res = await api<BackendFlashcard[]>(
        `${BASE}/flashcards/due?${qs.toString()}`
    )
    const rawCards = Array.isArray(res) ? res : []
    return rawCards.map(mapCard)
}

/**
 * POST /flashcards/reviews
 * Submit FSRS rating for a card.
 */
export async function submitReview(
    payload: ReviewSubmitRequest
): Promise<FlashcardReview> {
    const res = await api<BackendFlashcardReview>(
        `${BASE}/flashcards/reviews`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    )
    return mapReview(res)
}

/**
 * GET /flashcards/stats
 * Returns personal study statistics.
 */
export async function getStats(): Promise<FlashcardStats> {
    const res = await api<BackendFlashcardStats>(`${BASE}/flashcards/stats`)
    return mapStats(res)
}

/**
 * POST /flashcards/import-from-vocabulary
 * Import words from user_vocabulary into a deck.
 */
export async function importFromVocabulary(
    payload: ImportFromVocabularyRequest
): Promise<{ imported: number; skipped: number }> {
    const res = await api<{ imported: number; skipped: number }>(
        `${BASE}/flashcards/import-from-vocabulary`,
        {
            method: 'POST',
            body: JSON.stringify(payload),
        }
    )
    return res
}
