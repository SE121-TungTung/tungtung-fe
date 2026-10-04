// ============================================================
// FLASHCARD — Strict TypeScript Types
// No `any` allowed. All backend response types defined explicitly.
// ============================================================

// ── Enums ────────────────────────────────────────────────────────────────────

export enum FSRSState {
    NEW = 'new',
    LEARNING = 'learning',
    REVIEW = 'review',
    RELEARNING = 'relearning',
}

export enum FSRSRating {
    AGAIN = 1,
    HARD = 2,
    GOOD = 3,
    EASY = 4,
}

export enum DeckLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert',
}

export enum DeckTopic {
    IELTS = 'ielts',
    TOEIC = 'toeic',
    GENERAL = 'general',
    BUSINESS = 'business',
    ACADEMIC = 'academic',
    OTHER = 'other',
}

export enum WordType {
    NOUN = 'noun',
    VERB = 'verb',
    ADJECTIVE = 'adjective',
    ADVERB = 'adverb',
    PHRASE = 'phrase',
    IDIOM = 'idiom',
    OTHER = 'other',
}

// ── Backend Response Types ────────────────────────────────────────────────────

/** Raw deck response from backend */
export interface BackendFlashcardDeck {
    id: string
    title: string
    description: string | null
    topic_tag: string | null
    level: string | null
    is_public: boolean
    card_count: number
    cover_image_url: string | null
    created_by: string | null
    created_at: string
    updated_at: string | null
    due_today_count: number
}

/** Raw card response from backend */
export interface BackendFlashcard {
    id: string
    deck_id: string
    word: string
    ipa: string | null
    word_type: string | null
    definition_en: string | null
    definition_vi: string | null
    example_sentence: string | null
    audio_url: string | null
    source_vocabulary_id: string | null
    created_at: string
    updated_at: string | null
    // FSRS state fields (injected by /due endpoint)
    review_state: string | null
    due_date: string | null
    stability: number | null
    difficulty: number | null
}

/** Raw review response from backend */
export interface BackendFlashcardReview {
    card_id: string
    state: string
    stability: number
    difficulty: number
    retrievability: number | null
    repetition_count: number
    lapses: number
    interval_days: number
    due_date: string
    last_rating: string
}

/** Raw stats response from backend */
export interface BackendFlashcardStats {
    total_reviews: number
    total_mastered: number
    streak_days: number
    due_today: number
    heatmap: BackendDailyActivity[]
}

export interface BackendDailyActivity {
    date: string
    count: number
}

// ── Frontend Types (camelCase) ─────────────────────────────────────────────────

export interface FlashcardDeck {
    id: string
    title: string
    description: string | null
    topicTag: DeckTopic | null
    level: DeckLevel | null
    isPublic: boolean
    cardCount: number
    coverImageUrl: string | null
    createdBy: string | null
    createdAt: string
    updatedAt: string | null
    dueTodayCount: number
}

export interface Flashcard {
    id: string
    deckId: string
    word: string
    ipa: string | null
    wordType: WordType | null
    definitionEn: string | null
    definitionVi: string | null
    exampleSentence: string | null
    audioUrl: string | null
    sourceVocabularyId: string | null
    createdAt: string
    updatedAt: string | null
    // FSRS state (present on /due results)
    reviewState: FSRSState | null
    dueDate: string | null
    stability: number | null
    difficulty: number | null
}

export interface FlashcardReview {
    cardId: string
    state: FSRSState
    stability: number
    difficulty: number
    retrievability: number | null
    repetitionCount: number
    lapses: number
    intervalDays: number
    dueDate: string
    lastRating: string
}

export interface DailyActivity {
    date: string
    count: number
}

export interface FlashcardStats {
    totalReviews: number
    totalMastered: number
    streakDays: number
    dueToday: number
    heatmap: DailyActivity[]
}

// ── Request Types ─────────────────────────────────────────────────────────────

export interface ReviewSubmitRequest {
    card_id: string
    rating: FSRSRating
}

export interface ImportFromVocabularyRequest {
    deck_id: string
    vocabulary_ids: string[]
}

// ── Paginated Response Wrapper ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    message: string | null
    meta: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
}

// ── Mapper Functions ──────────────────────────────────────────────────────────

export function mapDeck(raw: BackendFlashcardDeck): FlashcardDeck {
    return {
        id: raw.id,
        title: raw.title,
        description: raw.description,
        topicTag: (raw.topic_tag as DeckTopic) ?? null,
        level: (raw.level as DeckLevel) ?? null,
        isPublic: raw.is_public,
        cardCount: raw.card_count,
        coverImageUrl: raw.cover_image_url,
        createdBy: raw.created_by,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        dueTodayCount: raw.due_today_count ?? 0,
    }
}

export function mapCard(raw: BackendFlashcard): Flashcard {
    return {
        id: raw.id,
        deckId: raw.deck_id,
        word: raw.word,
        ipa: raw.ipa,
        wordType: (raw.word_type as WordType) ?? null,
        definitionEn: raw.definition_en,
        definitionVi: raw.definition_vi,
        exampleSentence: raw.example_sentence,
        audioUrl: raw.audio_url,
        sourceVocabularyId: raw.source_vocabulary_id,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        reviewState: (raw.review_state as FSRSState) ?? null,
        dueDate: raw.due_date,
        stability: raw.stability,
        difficulty: raw.difficulty,
    }
}

export function mapReview(raw: BackendFlashcardReview): FlashcardReview {
    return {
        cardId: raw.card_id,
        state: raw.state as FSRSState,
        stability: raw.stability,
        difficulty: raw.difficulty,
        retrievability: raw.retrievability,
        repetitionCount: raw.repetition_count,
        lapses: raw.lapses,
        intervalDays: raw.interval_days,
        dueDate: raw.due_date,
        lastRating: raw.last_rating,
    }
}

export function mapStats(raw: BackendFlashcardStats): FlashcardStats {
    return {
        totalReviews: raw.total_reviews,
        totalMastered: raw.total_mastered,
        streakDays: raw.streak_days,
        dueToday: raw.due_today,
        heatmap: raw.heatmap.map((h) => ({ date: h.date, count: h.count })),
    }
}

// ── Label Helpers ─────────────────────────────────────────────────────────────

export const DECK_LEVEL_LABELS: Record<DeckLevel, string> = {
    [DeckLevel.BEGINNER]: 'Cơ bản',
    [DeckLevel.INTERMEDIATE]: 'Trung cấp',
    [DeckLevel.ADVANCED]: 'Nâng cao',
    [DeckLevel.EXPERT]: 'Chuyên gia',
}

export const DECK_TOPIC_LABELS: Record<DeckTopic, string> = {
    [DeckTopic.IELTS]: 'IELTS',
    [DeckTopic.TOEIC]: 'TOEIC',
    [DeckTopic.GENERAL]: 'Tổng quát',
    [DeckTopic.BUSINESS]: 'Kinh doanh',
    [DeckTopic.ACADEMIC]: 'Học thuật',
    [DeckTopic.OTHER]: 'Khác',
}

export const RATING_LABELS: Record<FSRSRating, string> = {
    [FSRSRating.AGAIN]: 'Again',
    [FSRSRating.HARD]: 'Hard',
    [FSRSRating.GOOD]: 'Good',
    [FSRSRating.EASY]: 'Easy',
}

export const RATING_DESCRIPTIONS: Record<FSRSRating, string> = {
    [FSRSRating.AGAIN]: 'Quên hoàn toàn',
    [FSRSRating.HARD]: 'Nhớ mang máng',
    [FSRSRating.GOOD]: 'Nhớ được',
    [FSRSRating.EASY]: 'Nhớ ngay',
}
