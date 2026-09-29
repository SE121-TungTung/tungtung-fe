import React, { useState, useEffect } from 'react'
import s from './SaveWordModal.module.css'
import { getDeckList, createCard } from '@/lib/flashcard'
import type { FlashcardDeck } from '@/types/flashcard'
import { lookupDictionary } from '@/lib/api/dictionary.api'

interface SaveWordModalProps {
    initialWord: string
    onClose: () => void
    onSuccess: () => void
}

export default function SaveWordModal({
    initialWord,
    onClose,
    onSuccess,
}: SaveWordModalProps) {
    const [word, setWord] = useState(initialWord)
    const [ipa, setIpa] = useState('')
    const [definitionEn, setDefinitionEn] = useState('')
    const [definitionVi, setDefinitionVi] = useState('')
    const [example, setExample] = useState('')
    const [wordType, setWordType] = useState('')

    const [decks, setDecks] = useState<FlashcardDeck[]>([])
    const [selectedDeckId, setSelectedDeckId] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load decks
    useEffect(() => {
        getDeckList({ limit: 100 }).then((res) => {
            setDecks(res.decks)
            if (res.decks.length > 0) {
                setSelectedDeckId(res.decks[0].id)
            }
        })
    }, [])

    const handleLookup = async (wordToLookup: string = word) => {
        if (!wordToLookup.trim()) return
        setIsLookingUp(true)
        try {
            const result = await lookupDictionary(wordToLookup.trim())
            if (result) {
                if (result.ipa) setIpa(result.ipa)
                if (result.definition_en) setDefinitionEn(result.definition_en)
                if (result.example_sentence) setExample(result.example_sentence)
                if (result.word_type) setWordType(result.word_type)
            }
        } catch (err) {
            console.log('Dictionary lookup failed')
        } finally {
            setIsLookingUp(false)
        }
    }

    // Auto lookup dictionary if initialWord is provided
    useEffect(() => {
        if (initialWord.trim()) {
            handleLookup(initialWord)
        }
    }, [initialWord])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedDeckId || !word.trim()) return

        setIsLoading(true)
        setError(null)
        try {
            await createCard(selectedDeckId, {
                word: word.trim(),
                ipa: ipa.trim(),
                word_type: wordType.trim(),
                definition_en: definitionEn.trim(),
                definition_vi: definitionVi.trim(),
                example_sentence: example.trim(),
            })
            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Lỗi khi tạo flashcard')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={s.overlay}>
            <div className={s.modal}>
                <header className={s.header}>
                    <h3>Lưu vào Flashcard</h3>
                    <button className={s.closeBtn} onClick={onClose}>
                        &times;
                    </button>
                </header>

                <form onSubmit={handleSubmit} className={s.form}>
                    <div className={s.field}>
                        <label>Từ vựng</label>
                        <div className={s.wordInputRow}>
                            <input
                                value={word}
                                onChange={(e) => setWord(e.target.value)}
                                required
                            />
                            {!initialWord && (
                                <button
                                    type="button"
                                    className={s.lookupBtn}
                                    onClick={() => handleLookup(word)}
                                    disabled={isLookingUp}
                                >
                                    Tra từ
                                </button>
                            )}
                        </div>
                    </div>

                    {isLookingUp && (
                        <p className={s.loadingText}>
                            Đang tra từ điển tự động...
                        </p>
                    )}

                    <div className={s.fieldGroup}>
                        <div className={s.field}>
                            <label>Từ loại</label>
                            <input
                                value={wordType}
                                onChange={(e) => setWordType(e.target.value)}
                                placeholder="noun, verb..."
                            />
                        </div>
                        <div className={s.field}>
                            <label>Phiên âm (IPA)</label>
                            <input
                                value={ipa}
                                onChange={(e) => setIpa(e.target.value)}
                                placeholder="ˈæb.strækt"
                            />
                        </div>
                    </div>

                    <div className={s.field}>
                        <label>Nghĩa tiếng Anh (EN)</label>
                        <textarea
                            value={definitionEn}
                            onChange={(e) => setDefinitionEn(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className={s.field}>
                        <label>Nghĩa tiếng Việt (VI) *</label>
                        <textarea
                            value={definitionVi}
                            onChange={(e) => setDefinitionVi(e.target.value)}
                            rows={2}
                            required
                            autoFocus
                        />
                    </div>

                    <div className={s.field}>
                        <label>Ví dụ minh hoạ</label>
                        <textarea
                            value={example}
                            onChange={(e) => setExample(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className={s.field}>
                        <label>Chọn bộ thẻ (Deck)</label>
                        <select
                            value={selectedDeckId}
                            onChange={(e) => setSelectedDeckId(e.target.value)}
                            required
                        >
                            {decks.length === 0 ? (
                                <option value="" disabled>
                                    Bạn chưa có bộ thẻ nào
                                </option>
                            ) : (
                                decks.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.title}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {error && <p className={s.error}>{error}</p>}

                    <footer className={s.footer}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={s.cancelBtn}
                        >
                            Huỷ
                        </button>
                        <button
                            type="submit"
                            className={s.submitBtn}
                            disabled={isLoading || decks.length === 0}
                        >
                            {isLoading ? 'Đang lưu...' : 'Lưu từ'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    )
}
