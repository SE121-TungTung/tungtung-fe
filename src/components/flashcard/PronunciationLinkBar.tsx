import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    addToPronunciationWordList,
    buildPracticeLink,
    getPronunciationWordList,
    removeFromPronunciationWordList,
} from '@/lib/pronunciation'
import { MicIcon, PlusIcon, CheckIcon } from './PronunciationLinkIcons'
import { Tooltip } from '@/components/core/Tooltip'
import type { Flashcard } from '@/types/flashcard'
import styles from './PronunciationLinkBar.module.css'

interface PronunciationLinkBarProps {
    card: Flashcard
}

export const PRONUNCIATION_WORD_LIST_KEY = ['pronunciation-word-list'] as const

/**
 * Thanh liên kết Flashcard -> Pronunciation:
 *  - "Luyện phát âm": mở trang luyện với từ của thẻ.
 *  - "Thêm vào danh sách luyện": lưu thẻ vào danh sách luyện phát âm cá nhân (toggle).
 */
export function PronunciationLinkBar({ card }: PronunciationLinkBarProps) {
    const queryClient = useQueryClient()

    const { data } = useQuery({
        queryKey: PRONUNCIATION_WORD_LIST_KEY,
        queryFn: getPronunciationWordList,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })

    const existing = useMemo(() => {
        const key = card.word.trim().toLowerCase()
        return data?.items.find(
            (i) =>
                i.flashcard_id === card.id ||
                i.target_text.trim().toLowerCase() === key
        )
    }, [data, card.id, card.word])

    const addMutation = useMutation({
        mutationFn: () =>
            addToPronunciationWordList({
                flashcard_id: card.id,
                target_text: card.word,
                ipa: card.ipa,
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: PRONUNCIATION_WORD_LIST_KEY,
            }),
    })

    const removeMutation = useMutation({
        mutationFn: (id: string) => removeFromPronunciationWordList(id),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: PRONUNCIATION_WORD_LIST_KEY,
            }),
    })

    const isBusy = addMutation.isPending || removeMutation.isPending

    const handleToggle = () => {
        if (isBusy) return
        if (existing) removeMutation.mutate(existing.id)
        else addMutation.mutate()
    }

    return (
        <div className={styles.bar}>
            <Tooltip
                content="Mở trang luyện phát âm trực tiếp với từ này"
                placement="top"
            >
                <Link
                    to={buildPracticeLink(card.word, 'word')}
                    className={styles.practiceLink}
                >
                    <MicIcon size={14} />
                    <span>Luyện phát âm</span>
                </Link>
            </Tooltip>

            <Tooltip
                content={
                    existing
                        ? 'Bỏ khỏi danh sách luyện phát âm'
                        : 'Thêm từ này vào danh sách luyện phát âm cá nhân'
                }
                placement="top"
            >
                <button
                    type="button"
                    className={`${styles.listBtn} ${existing ? styles.listBtnActive : ''}`}
                    onClick={handleToggle}
                    disabled={isBusy}
                    aria-pressed={!!existing}
                >
                    {existing ? (
                        <CheckIcon size={14} />
                    ) : (
                        <PlusIcon size={14} />
                    )}
                    <span>
                        {existing
                            ? 'Trong danh sách luyện'
                            : 'Thêm vào danh sách luyện'}
                    </span>
                </button>
            </Tooltip>
            {addMutation.isError && (
                <span className={styles.errorText} role="alert">
                    Không thể thêm, vui lòng thử lại.
                </span>
            )}
        </div>
    )
}
