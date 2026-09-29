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

/**
 * POST /flashcard-decks/:id/cards
 * Create a new card in the deck.
 */
export async function createCard(
    deckId: string,
    payload: {
        word: string
        ipa?: string | null
        word_type?: string | null
        definition_en?: string | null
        definition_vi?: string | null
        example_sentence?: string | null
    }
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
