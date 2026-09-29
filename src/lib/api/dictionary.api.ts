import { api } from '../api'

const BASE = '/api/v1'

export interface DictionaryLookupResponse {
    word: string
    ipa: string
    word_type: string
    definition_en: string
    example_sentence: string
}

/**
 * GET /dictionary/lookup
 * Look up a word in the system dictionary or Free Dictionary API.
 */
export async function lookupDictionary(
    word: string
): Promise<DictionaryLookupResponse> {
    const res = await api<DictionaryLookupResponse>(
        `${BASE}/dictionary/lookup?word=${encodeURIComponent(word)}`,
        { method: 'GET' }
    )
    return res
}
