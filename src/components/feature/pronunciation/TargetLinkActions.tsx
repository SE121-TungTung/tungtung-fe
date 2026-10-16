import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    addToPronunciationWordList,
    getPronunciationWordList,
    removeFromPronunciationWordList,
} from '@/lib/pronunciation'
import { createCard, getDeckList } from '@/lib/flashcard'
import { useSession } from '@/stores/session.store'
import type { TargetType } from '@/types/pronunciation.types'
import s from './TargetLinkActions.module.css'

interface TargetLinkActionsProps {
    targetText: string
    targetType: TargetType
    ipa?: string | null
}

const WORD_LIST_KEY = ['pronunciation-word-list'] as const

/**
 * Hành động liên kết Pronunciation -> Flashcard cho từ/câu đang luyện:
 *  - Lưu/bỏ khỏi danh sách luyện cá nhân.
 *  - Lưu thành thẻ Flashcard vào một bộ thẻ của học viên.
 */
export function TargetLinkActions({
    targetText,
    targetType,
    ipa,
}: TargetLinkActionsProps) {
    const queryClient = useQueryClient()
    const userId = useSession((st) => st.user?.id)
    const [showDeckPicker, setShowDeckPicker] = useState(false)
    const [deckId, setDeckId] = useState('')
    const [flashMsg, setFlashMsg] = useState<{
        ok: boolean
        text: string
    } | null>(null)

    const { data: wordList } = useQuery({
        queryKey: WORD_LIST_KEY,
        queryFn: getPronunciationWordList,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    })

    const { data: decks } = useQuery({
        queryKey: ['flashcard-decks', 'own-for-pronunciation'],
        queryFn: () => getDeckList({ limit: 100 }),
        enabled: showDeckPicker,
        staleTime: 60_000,
    })

    const ownDecks = useMemo(
        () => (decks?.decks ?? []).filter((d) => d.createdBy === userId),
        [decks, userId]
    )

    const key = targetText.trim().toLowerCase()
    const existing = wordList?.items.find(
        (i) => i.target_text.trim().toLowerCase() === key
    )

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: WORD_LIST_KEY })

    const addMutation = useMutation({
        mutationFn: () =>
            addToPronunciationWordList({
                target_text: targetText,
                target_type: targetType === 'word' ? 'word' : 'sentence',
                ipa: ipa ?? undefined,
            }),
        onSuccess: invalidate,
    })

    const removeMutation = useMutation({
        mutationFn: (id: string) => removeFromPronunciationWordList(id),
        onSuccess: invalidate,
    })

    const cardMutation = useMutation({
        mutationFn: () =>
            createCard(deckId, {
                word: targetText.trim(),
                ipa: ipa ?? null,
                word_type: targetType === 'word' ? undefined : 'phrase',
            }),
        onSuccess: () => {
            setFlashMsg({ ok: true, text: 'Đã lưu thành thẻ flashcard.' })
            setShowDeckPicker(false)
            queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] })
        },
        onError: (err: Error & { status?: number }) => {
            setFlashMsg({
                ok: err.status === 409,
                text:
                    err.status === 409
                        ? 'Từ này đã có trong bộ thẻ đã chọn.'
                        : 'Không thể lưu thẻ, vui lòng thử lại.',
            })
        },
    })

    const busy = addMutation.isPending || removeMutation.isPending

    return (
        <div className={s.wrap}>
            <div className={s.row}>
                <button
                    type="button"
                    className={`${s.btn} ${existing ? s.btnActive : ''}`}
                    disabled={busy || !targetText.trim()}
                    aria-pressed={!!existing}
                    onClick={() =>
                        existing
                            ? removeMutation.mutate(existing.id)
                            : addMutation.mutate()
                    }
                >
                    {existing
                        ? 'Trong danh sách luyện'
                        : 'Lưu vào danh sách luyện'}
                </button>

                {existing?.flashcard_id && existing.deck_id ? (
                    <Link
                        to={`/student/flashcards/${existing.deck_id}/study`}
                        className={s.btn}
                    >
                        Ôn thẻ flashcard
                    </Link>
                ) : (
                    <button
                        type="button"
                        className={s.btn}
                        onClick={() => {
                            setFlashMsg(null)
                            setShowDeckPicker((v) => !v)
                        }}
                        aria-expanded={showDeckPicker}
                    >
                        Lưu thành flashcard
                    </button>
                )}
            </div>

            {showDeckPicker && (
                <div className={s.picker}>
                    {ownDecks.length === 0 ? (
                        <span className={s.hint}>
                            Bạn chưa có bộ thẻ nào.{' '}
                            <Link to="/student/flashcards">Tạo bộ thẻ</Link>
                        </span>
                    ) : (
                        <>
                            <label
                                className={s.label}
                                htmlFor="pron-deck-select"
                            >
                                Chọn bộ thẻ
                            </label>
                            <select
                                id="pron-deck-select"
                                className={s.select}
                                value={deckId}
                                onChange={(e) => setDeckId(e.target.value)}
                            >
                                <option value="">-- Chọn bộ thẻ --</option>
                                {ownDecks.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.title}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className={`${s.btn} ${s.btnPrimary}`}
                                disabled={!deckId || cardMutation.isPending}
                                onClick={() => cardMutation.mutate()}
                            >
                                Lưu thẻ
                            </button>
                        </>
                    )}
                </div>
            )}

            {flashMsg && (
                <span
                    className={flashMsg.ok ? s.msgOk : s.msgErr}
                    role="status"
                >
                    {flashMsg.text}
                </span>
            )}
        </div>
    )
}
