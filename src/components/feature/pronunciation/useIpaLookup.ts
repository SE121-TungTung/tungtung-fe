import { useQuery } from '@tanstack/react-query'
import { lookupIpaBatch } from '@/lib/pronunciation'

export interface IpaLookupResult {
    us: string | null
    uk: string | null
    isLoading: boolean
    isError: boolean
}

/** Bọc IPA trong dấu gạch chéo; không bao giờ trả lại chính văn bản gốc. */
export function formatIpa(ipa: string | null | undefined): string | null {
    if (!ipa) return null
    const clean = ipa.replace(/^\/|\/$/g, '').trim()
    return clean ? `/${clean}/` : null
}

/**
 * Tra phiên âm US/UK thật qua API từ điển (Free Dictionary + AI bù thiếu).
 * Kết quả được lưu cache nên chỉ tra một lần cho mỗi từ/câu.
 */
export function useIpaLookup(text: string): IpaLookupResult {
    const normalized = text.trim()
    const query = useQuery({
        queryKey: ['ipa-lookup', normalized.toLowerCase()],
        queryFn: async () => {
            const items = await lookupIpaBatch([normalized])
            return items[0] ?? null
        },
        enabled: normalized.length > 0,
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
    })

    return {
        us: query.data?.ipa_us ?? null,
        uk: query.data?.ipa_uk ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
    }
}
