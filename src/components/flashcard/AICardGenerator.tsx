import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
    aiGenerateCards,
    bulkCreateCards,
    type AICardSuggestion,
    type CardPayload,
} from '@/lib/flashcard'
import { CheckCircleIcon, PlusIcon, SparklesIcon } from './FlashcardIcons'
import styles from './AICardGenerator.module.css'

interface AICardGeneratorProps {
    deckId: string
    existingWords: string[]
    onAdded: (created: number, skipped: number) => void
}

type Mode = 'extract' | 'enrich'

interface Row extends AICardSuggestion {
    key: string
    selected: boolean
    duplicate: boolean
}

const ERROR_MESSAGES: Record<string, string> = {
    AI_NOT_CONFIGURED: 'Tính năng AI chưa được cấu hình trên máy chủ.',
    AI_UNAVAILABLE: 'Dịch vụ AI đang không khả dụng, vui lòng thử lại sau.',
    AI_FAILED: 'AI không thể xử lý yêu cầu, vui lòng thử lại.',
    AI_BAD_FORMAT: 'AI trả về kết quả không hợp lệ, vui lòng thử lại.',
}

function friendlyError(err: unknown, fallback: string): string {
    const e = err as { code?: string; message?: string }
    if (e?.code && ERROR_MESSAGES[e.code]) return ERROR_MESSAGES[e.code]
    return e?.message || fallback
}

export function AICardGenerator({
    deckId,
    existingWords,
    onAdded,
}: AICardGeneratorProps) {
    const [mode, setMode] = useState<Mode>('extract')
    const [text, setText] = useState('')
    const [wordsText, setWordsText] = useState('')
    const [maxItems, setMaxItems] = useState(10)
    const [rows, setRows] = useState<Row[]>([])
    const [error, setError] = useState<string | null>(null)

    const existing = useMemo(
        () => new Set(existingWords.map((w) => w.trim().toLowerCase())),
        [existingWords]
    )

    const generate = useMutation({
        mutationFn: () => {
            if (mode === 'extract') {
                return aiGenerateCards(deckId, {
                    mode: 'extract',
                    text: text.trim(),
                    max_items: maxItems,
                })
            }
            const words = wordsText
                .split(/[\n,;]+/)
                .map((w) => w.trim())
                .filter(Boolean)
            return aiGenerateCards(deckId, { mode: 'enrich', words })
        },
        onSuccess: (res) => {
            const list = res ?? []
            setRows(
                list.map((s, i) => {
                    const duplicate = existing.has(s.word.trim().toLowerCase())
                    return {
                        ...s,
                        key: `${s.word}-${i}`,
                        duplicate,
                        selected: !duplicate,
                    }
                })
            )
            setError(
                list.length === 0 ? 'AI không tìm thấy từ vựng phù hợp.' : null
            )
        },
        onError: (err) =>
            setError(friendlyError(err, 'Không thể tạo gợi ý từ AI.')),
    })

    const save = useMutation({
        mutationFn: () => {
            const cards: CardPayload[] = rows
                .filter((r) => r.selected && !r.duplicate)
                .map((r) => ({
                    word: r.word,
                    ipa: r.ipa || null,
                    word_type: r.word_type || null,
                    definition_vi: r.definition_vi || null,
                    definition_en: r.definition_en || null,
                    example_sentence: r.example_sentence || null,
                }))
            return bulkCreateCards(deckId, cards)
        },
        onSuccess: (res) => {
            setRows([])
            setText('')
            setWordsText('')
            setError(null)
            onAdded(res.created, res.skipped)
        },
        onError: (err) =>
            setError(friendlyError(err, 'Không thể thêm các thẻ đã chọn.')),
    })

    const canGenerate =
        mode === 'extract'
            ? text.trim().length >= 20
            : wordsText.trim().length > 0
    const selectedCount = rows.filter((r) => r.selected && !r.duplicate).length

    const patch = (key: string, p: Partial<Row>) =>
        setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...p } : r)))

    const toggleAll = (value: boolean) =>
        setRows((prev) =>
            prev.map((r) => ({ ...r, selected: r.duplicate ? false : value }))
        )

    return (
        <div className={styles.wrap}>
            <div className={styles.modeRow} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'extract'}
                    className={`${styles.modeBtn} ${mode === 'extract' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('extract')}
                >
                    Trích xuất từ văn bản
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'enrich'}
                    className={`${styles.modeBtn} ${mode === 'enrich' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('enrich')}
                >
                    Tạo nghĩa cho danh sách từ
                </button>
            </div>

            {mode === 'extract' ? (
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="ai-text">
                        Dán đoạn văn tiếng Anh (tối thiểu 20 ký tự)
                    </label>
                    <textarea
                        id="ai-text"
                        className={styles.textarea}
                        rows={6}
                        maxLength={8000}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Dán bài đọc, đoạn hội thoại hoặc ghi chú để AI chọn ra từ vựng đáng học..."
                    />
                    <div className={styles.inlineRow}>
                        <label className={styles.label} htmlFor="ai-max">
                            Số từ tối đa
                        </label>
                        <input
                            id="ai-max"
                            type="number"
                            min={1}
                            max={30}
                            className={styles.numberInput}
                            value={maxItems}
                            onChange={(e) =>
                                setMaxItems(
                                    Math.min(
                                        30,
                                        Math.max(1, Number(e.target.value) || 1)
                                    )
                                )
                            }
                        />
                    </div>
                </div>
            ) : (
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="ai-words">
                        Danh sách từ (mỗi từ một dòng hoặc cách nhau bằng dấu
                        phẩy, tối đa 30)
                    </label>
                    <textarea
                        id="ai-words"
                        className={styles.textarea}
                        rows={6}
                        value={wordsText}
                        onChange={(e) => setWordsText(e.target.value)}
                        placeholder={'resilient\nmitigate\nsustainable'}
                    />
                </div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            <button
                type="button"
                className={styles.generateBtn}
                disabled={!canGenerate || generate.isPending}
                onClick={() => {
                    setError(null)
                    generate.mutate()
                }}
            >
                <SparklesIcon size={16} />
                <span>
                    {generate.isPending
                        ? 'AI đang xử lý...'
                        : 'Tạo gợi ý bằng AI'}
                </span>
            </button>

            {rows.length > 0 && (
                <div className={styles.results}>
                    <div className={styles.resultsHeader}>
                        <span className={styles.resultsTitle}>
                            {rows.length} gợi ý - đã chọn {selectedCount}
                        </span>
                        <div className={styles.linkGroup}>
                            <button
                                type="button"
                                className={styles.linkBtn}
                                onClick={() => toggleAll(true)}
                            >
                                Chọn tất cả
                            </button>
                            <button
                                type="button"
                                className={styles.linkBtn}
                                onClick={() => toggleAll(false)}
                            >
                                Bỏ chọn
                            </button>
                        </div>
                    </div>

                    <ul className={styles.list}>
                        {rows.map((r) => (
                            <li
                                key={r.key}
                                className={`${styles.item} ${r.duplicate ? styles.itemDisabled : ''}`}
                            >
                                <label className={styles.itemHead}>
                                    <input
                                        type="checkbox"
                                        checked={r.selected}
                                        disabled={r.duplicate}
                                        onChange={(e) =>
                                            patch(r.key, {
                                                selected: e.target.checked,
                                            })
                                        }
                                    />
                                    <span className={styles.word}>
                                        {r.word}
                                    </span>
                                    {r.ipa && (
                                        <span className={styles.ipa}>
                                            /{r.ipa.replace(/^\/|\/$/g, '')}/
                                        </span>
                                    )}
                                    {r.word_type && (
                                        <span className={styles.badge}>
                                            {r.word_type}
                                        </span>
                                    )}
                                    {r.duplicate && (
                                        <span className={styles.badgeMuted}>
                                            Đã có trong bộ thẻ
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    aria-label={`Nghĩa tiếng Việt của ${r.word}`}
                                    value={r.definition_vi ?? ''}
                                    disabled={r.duplicate}
                                    onChange={(e) =>
                                        patch(r.key, {
                                            definition_vi: e.target.value,
                                        })
                                    }
                                />
                                <input
                                    type="text"
                                    className={styles.input}
                                    aria-label={`Câu ví dụ của ${r.word}`}
                                    value={r.example_sentence ?? ''}
                                    disabled={r.duplicate}
                                    onChange={(e) =>
                                        patch(r.key, {
                                            example_sentence: e.target.value,
                                        })
                                    }
                                />
                            </li>
                        ))}
                    </ul>

                    <button
                        type="button"
                        className={styles.saveBtn}
                        disabled={selectedCount === 0 || save.isPending}
                        onClick={() => save.mutate()}
                    >
                        {save.isPending ? (
                            <CheckCircleIcon size={16} />
                        ) : (
                            <PlusIcon size={16} />
                        )}
                        <span>
                            {save.isPending
                                ? 'Đang thêm...'
                                : `Thêm ${selectedCount} thẻ đã chọn`}
                        </span>
                    </button>
                </div>
            )}
        </div>
    )
}
