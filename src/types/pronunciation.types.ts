export type TargetType = 'word' | 'sentence' | 'paragraph'

export type ErrorType =
    'correct' | 'substitution' | 'deletion' | 'insertion' | 'stress_error'

export interface ComponentScores {
    accuracy?: number
    fluency?: number
    completeness?: number
    prosody?: number
    stress?: number
    intonation?: number
    rhythm?: number
}

export interface PhonemeItem {
    phoneme_expected: string | null
    phoneme_actual: string | null
    is_correct: boolean
    error_type: ErrorType
    confidence: number
    score?: number
    status?: string
    start_time?: number
    end_time?: number
    tip?: string
}

export interface ErrorSummary {
    total_phonemes: number
    correct_phonemes: number
    substitutions: number
    deletions: number
    insertions: number
    stress_errors: number
    accuracy_rate?: number
}

export interface PronunciationPracticeResponse {
    id: string
    student_id: string
    target_text: string
    target_type: TargetType
    target_ipa?: string | null
    actual_ipa?: string | null
    overall_score: number
    component_scores?: ComponentScores | null
    phoneme_results?: PhonemeItem[] | null
    error_summary?: ErrorSummary | null
    feedback_text?: string | null
    processing_time_ms?: number | null
    audio_url?: string | null
    created_at: string
    updated_at?: string | null
}

export interface PronunciationPracticeListItem {
    id: string
    target_text: string
    target_type: TargetType
    target_ipa?: string | null
    actual_ipa?: string | null
    overall_score: number
    component_scores?: ComponentScores | null
    created_at: string
}

export interface WeakPhonemeItem {
    phoneme: string
    error_count: number
    total_count: number
    accuracy_rate: number
}

export interface RecentTrendItem {
    date: string
    avg_score: number
    count: number
}

export interface PronunciationStatsResponse {
    total_practices: number
    average_score: number
    practice_by_type: Record<string, number>
    weak_phonemes: WeakPhonemeItem[]
    recent_trend: RecentTrendItem[]
}

export interface PronunciationStreakResponse {
    current_streak: number
    longest_streak: number
    last_practice_date: string | null
    today_practiced: boolean
}

export interface IPAPhonemeInfo {
    symbol: string
    ipa: string
    category:
        'monophthong' | 'diphthong' | 'voiced_consonant' | 'voiceless_consonant'
    name: string
    sampleWord: string
    sampleTranscription: string
    voicing: 'voiced' | 'voiceless' | 'vowel'
    mouthGuide: {
        lips: string
        tongue: string
        jaw: string
        technique: string
    }
    mouthDiagramType:
        | 'open_front'
        | 'close_front'
        | 'open_back'
        | 'close_back'
        | 'mid_central'
        | 'bilabial'
        | 'labiodental'
        | 'dental'
        | 'alveolar'
        | 'postalveolar'
        | 'palatal'
        | 'velar'
        | 'glottal'
    commonMistakes?: string
}
