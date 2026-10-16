import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    getPronunciationWordList,
    removeFromPronunciationWordList,
} from '@/lib/pronunciation'
import type { PronunciationWordListItem } from '@/types/pronunciation.types'
import { TrashIcon } from './PronunciationIcons'
import { Tooltip } from '@/components/core/Tooltip'
import { formatIpa } from './useIpaLookup'
import s from './WordListPanel.module.css'

interface WordListPanelProps {
    activeText: string
    accent?: 'US' | 'UK'
    onSelect: (item: PronunciationWordListItem) => void
}

const WORD_LIST_KEY = ['pronunciation-word-list'] as const

function scoreClass(score: number | null): string {
    if (score == null) return s.scoreNone
    if (score >= 80) return s.scoreHigh
    if (score >= 55) return s.scoreMid
    return s.scoreLow
}

/** Tab "Của tôi": danh sách luyện cá nhân, gồm cả từ thêm từ Flashcard. */
export function WordListPanel({
    activeText,
    accent = 'US',
    onSelect,
}: WordListPanelProps) {
    const queryClient = useQueryClient()
    const { data, isLoading, isError } = useQuery({
        queryKey: WORD_LIST_KEY,
        queryFn: getPronunciationWordList,
        refetchOnWindowFocus: false,
    })

    const removeMutation = useMutation({
        mutationFn: (id: string) => removeFromPronunciationWordList(id),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: WORD_LIST_KEY }),
    })

    if (isLoading) return <div className={s.state}>Đang tải danh sách...</div>
    if (isError)
        return <div className={s.state}>Không tải được danh sách luyện.</div>

    const items = data?.items ?? []

    if (items.length === 0) {
        return (
            <div className={s.state}>
                <p>Danh sách trống.</p>
                <p>
                    Thêm từ từ <Link to="/student/flashcards">Flashcard</Link>{' '}
                    hoặc bấm &ldquo;Lưu vào danh sách luyện&rdquo; khi đang
                    luyện một từ.
                </p>
            </div>
        )
    }

    return (
        <ul className={s.list}>
            {items.map((item) => {
                const isActive =
                    item.target_text.trim().toLowerCase() ===
                    activeText.trim().toLowerCase()
                return (
                    <li
                        key={item.id}
                        className={`${s.item} ${isActive ? s.itemActive : ''}`}
                    >
                        <button
                            type="button"
                            className={s.itemMain}
                            onClick={() => onSelect(item)}
                        >
                            <span className={s.itemText}>
                                {item.target_text}
                            </span>
                            <span className={s.itemIpa}>
                                {formatIpa(
                                    accent === 'US' ? item.ipa_us : item.ipa_uk
                                ) ??
                                    formatIpa(item.ipa) ??
                                    'Chưa có phiên âm'}
                            </span>
                            <span className={s.itemMeta}>
                                {item.source === 'flashcard'
                                    ? 'Từ flashcard'
                                    : 'Tự thêm'}
                                {' · '}
                                {item.practice_count > 0
                                    ? `${item.practice_count} lần luyện`
                                    : 'Chưa luyện'}
                            </span>
                        </button>
                        <Tooltip content="Điểm cao nhất">
                            <span
                                className={`${s.score} ${scoreClass(item.best_score)}`}
                            >
                                {item.best_score != null
                                    ? Math.round(item.best_score)
                                    : '—'}
                            </span>
                        </Tooltip>
                        {item.deck_id && (
                            <Tooltip content="Ôn bộ thẻ chứa từ này">
                                <Link
                                    to={`/student/flashcards/${item.deck_id}/study`}
                                    className={s.linkBtn}
                                >
                                    Thẻ
                                </Link>
                            </Tooltip>
                        )}
                        <Tooltip content="Xóa khỏi danh sách">
                            <button
                                type="button"
                                className={s.removeBtn}
                                aria-label={`Xóa ${item.target_text} khỏi danh sách`}
                                disabled={removeMutation.isPending}
                                onClick={() => removeMutation.mutate(item.id)}
                            >
                                <TrashIcon size={14} />
                            </button>
                        </Tooltip>
                    </li>
                )
            })}
        </ul>
    )
}
