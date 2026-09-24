import React, { useState } from 'react'
import { IPA_PHONEMES } from './ipaData'
import { MouthDiagram } from './MouthDiagram'
import type { IPAPhonemeInfo } from '@/types/pronunciation.types'
import s from './IPABoard.module.css'

interface IPABoardProps {
    onSelectPhoneme?: (phoneme: IPAPhonemeInfo) => void
    onSelectWord?: (word: string) => void
}

type TabCategory = 'all' | 'monophthong' | 'diphthong' | 'consonant'

export const IPABoard: React.FC<IPABoardProps> = ({
    onSelectPhoneme,
    onSelectWord,
}) => {
    const [selectedTab, setSelectedTab] = useState<TabCategory>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeDetailPhoneme, setActiveDetailPhoneme] =
        useState<IPAPhonemeInfo | null>(null)
    const [playingSymbol, setPlayingSymbol] = useState<string | null>(null)

    // Phát âm thanh mẫu (thử audio file trước, fallback sang SpeechSynthesis)
    const playPhonemeSound = (
        phoneme: IPAPhonemeInfo,
        e?: React.MouseEvent
    ) => {
        if (e) e.stopPropagation()
        setPlayingSymbol(phoneme.symbol)

        const cleanSymbol = encodeURIComponent(phoneme.symbol)
        const audioPath = `/ipa-sounds/${cleanSymbol}.mp3`
        const audio = new Audio(audioPath)

        audio.onended = () => setPlayingSymbol(null)
        audio.onerror = () => {
            // Fallback sang Web Speech API
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                    phoneme.sampleWord
                )
                utterance.lang = 'en-US'
                utterance.rate = 0.85
                utterance.onend = () => setPlayingSymbol(null)
                utterance.onerror = () => setPlayingSymbol(null)
                window.speechSynthesis.speak(utterance)
            } else {
                setPlayingSymbol(null)
            }
        }

        audio.play().catch(() => {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                    phoneme.sampleWord
                )
                utterance.lang = 'en-US'
                utterance.rate = 0.85
                utterance.onend = () => setPlayingSymbol(null)
                utterance.onerror = () => setPlayingSymbol(null)
                window.speechSynthesis.speak(utterance)
            } else {
                setPlayingSymbol(null)
            }
        })
    }

    const filteredPhonemes = IPA_PHONEMES.filter((item) => {
        // Lọc theo tab
        if (selectedTab === 'monophthong' && item.category !== 'monophthong')
            return false
        if (selectedTab === 'diphthong' && item.category !== 'diphthong')
            return false
        if (
            selectedTab === 'consonant' &&
            item.category !== 'voiced_consonant' &&
            item.category !== 'voiceless_consonant'
        )
            return false

        // Tìm kiếm theo từ khóa hoặc ký hiệu
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            return (
                item.symbol.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q) ||
                item.sampleWord.toLowerCase().includes(q)
            )
        }
        return true
    })

    const handleSelectForPractice = (phoneme: IPAPhonemeInfo) => {
        if (onSelectWord) {
            onSelectWord(phoneme.sampleWord)
        }
        if (onSelectPhoneme) {
            onSelectPhoneme(phoneme)
        }
        setActiveDetailPhoneme(null)
    }

    return (
        <div className={s.ipaCard}>
            <div className={s.header}>
                <div>
                    <h3 className={s.title}>Bảng 44 Âm Vị IPA Chuẩn Quốc Tế</h3>
                    <p className={s.subtitle}>
                        Tra cứu cách đặt môi, răng, lưỡi và nghe phát âm mẫu
                    </p>
                </div>

                {/* Ô tìm kiếm nhanh */}
                <div className={s.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Tìm âm vị hoặc từ ví dụ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={s.searchInput}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className={s.clearBtn}
                            onClick={() => setSearchQuery('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Bộ lọc theo nhóm âm */}
            <div className={s.tabBar}>
                <button
                    type="button"
                    className={`${s.tabBtn} ${selectedTab === 'all' ? s.tabActive : ''}`}
                    onClick={() => setSelectedTab('all')}
                >
                    Tất cả (44)
                </button>
                <button
                    type="button"
                    className={`${s.tabBtn} ${selectedTab === 'monophthong' ? s.tabActive : ''}`}
                    onClick={() => setSelectedTab('monophthong')}
                >
                    Nguyên âm đơn (12)
                </button>
                <button
                    type="button"
                    className={`${s.tabBtn} ${selectedTab === 'diphthong' ? s.tabActive : ''}`}
                    onClick={() => setSelectedTab('diphthong')}
                >
                    Nguyên âm đôi (8)
                </button>
                <button
                    type="button"
                    className={`${s.tabBtn} ${selectedTab === 'consonant' ? s.tabActive : ''}`}
                    onClick={() => setSelectedTab('consonant')}
                >
                    Phụ âm (24)
                </button>
            </div>

            {/* Lưới các ô ký tự IPA */}
            <div className={s.gridContainer}>
                {filteredPhonemes.map((phoneme) => {
                    const isPlaying = playingSymbol === phoneme.symbol
                    const isSelected =
                        activeDetailPhoneme?.symbol === phoneme.symbol

                    return (
                        <div
                            key={phoneme.symbol}
                            className={`${s.phonemeCard} ${isSelected ? s.cardSelected : ''}`}
                            onClick={() => setActiveDetailPhoneme(phoneme)}
                        >
                            <div className={s.cardTop}>
                                <span className={s.symbolText}>
                                    {phoneme.ipa}
                                </span>
                                <button
                                    type="button"
                                    className={`${s.audioBtn} ${isPlaying ? s.audioPlaying : ''}`}
                                    onClick={(e) =>
                                        playPhonemeSound(phoneme, e)
                                    }
                                    title="Nghe phát âm mẫu"
                                >
                                    {isPlaying ? (
                                        <span className={s.audioWave}>♪</span>
                                    ) : (
                                        <span>🔊</span>
                                    )}
                                </button>
                            </div>

                            <div className={s.cardBottom}>
                                <span className={s.sampleWord}>
                                    {phoneme.sampleWord}
                                </span>
                                <span className={s.sampleTranscription}>
                                    {phoneme.sampleTranscription}
                                </span>
                            </div>

                            <span className={s.viewGuideHint}>
                                Xem khẩu hình
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Modal / Card chi tiết hướng dẫn khẩu hình miệng */}
            {activeDetailPhoneme && (
                <div
                    className={s.modalOverlay}
                    onClick={() => setActiveDetailPhoneme(null)}
                >
                    <div
                        className={s.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={s.modalHeader}>
                            <div className={s.modalTitleGroup}>
                                <span className={s.modalSymbol}>
                                    {activeDetailPhoneme.ipa}
                                </span>
                                <div>
                                    <h4 className={s.modalTitle}>
                                        {activeDetailPhoneme.name}
                                    </h4>
                                    <span className={s.modalCategoryBadge}>
                                        {activeDetailPhoneme.category ===
                                        'monophthong'
                                            ? 'Nguyên âm đơn'
                                            : activeDetailPhoneme.category ===
                                                'diphthong'
                                              ? 'Nguyên âm đôi'
                                              : activeDetailPhoneme.voicing ===
                                                  'voiced'
                                                ? 'Phụ âm hữu thanh'
                                                : 'Phụ âm vô thanh'}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={s.modalClose}
                                onClick={() => setActiveDetailPhoneme(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={s.modalBody}>
                            {/* Cột trái: Sơ đồ mặt cắt giải phẫu khẩu hình */}
                            <div className={s.diagramCol}>
                                <div className={s.diagramFrame}>
                                    <MouthDiagram
                                        phoneme={activeDetailPhoneme}
                                        size={220}
                                    />
                                </div>
                                <div className={s.wordSampleBox}>
                                    <span className={s.wordSampleLabel}>
                                        Từ mẫu:
                                    </span>
                                    <strong className={s.wordSampleValue}>
                                        {activeDetailPhoneme.sampleWord}
                                    </strong>
                                    <span className={s.transcriptionValue}>
                                        {
                                            activeDetailPhoneme.sampleTranscription
                                        }
                                    </span>
                                    <button
                                        type="button"
                                        className={s.btnPlayWord}
                                        onClick={(e) =>
                                            playPhonemeSound(
                                                activeDetailPhoneme,
                                                e
                                            )
                                        }
                                    >
                                        🔊 Nghe mẫu
                                    </button>
                                </div>
                            </div>

                            {/* Cột phải: Hướng dẫn chi tiết môi, răng, lưỡi */}
                            <div className={s.guideCol}>
                                <h5 className={s.guideSectionHeader}>
                                    👄 Hướng dẫn cấu âm & Khẩu hình
                                </h5>

                                <div className={s.guideGrid}>
                                    <div className={s.guideItem}>
                                        <strong className={s.guideKey}>
                                            Vị trí Môi (Lips):
                                        </strong>
                                        <p className={s.guideVal}>
                                            {
                                                activeDetailPhoneme.mouthGuide
                                                    .lips
                                            }
                                        </p>
                                    </div>
                                    <div className={s.guideItem}>
                                        <strong className={s.guideKey}>
                                            Vị trí Lưỡi (Tongue):
                                        </strong>
                                        <p className={s.guideVal}>
                                            {
                                                activeDetailPhoneme.mouthGuide
                                                    .tongue
                                            }
                                        </p>
                                    </div>
                                    <div className={s.guideItem}>
                                        <strong className={s.guideKey}>
                                            Độ mở hàm (Jaw):
                                        </strong>
                                        <p className={s.guideVal}>
                                            {activeDetailPhoneme.mouthGuide.jaw}
                                        </p>
                                    </div>
                                    <div className={s.guideItem}>
                                        <strong className={s.guideKey}>
                                            Kỹ thuật tạo âm:
                                        </strong>
                                        <p className={s.guideVal}>
                                            {
                                                activeDetailPhoneme.mouthGuide
                                                    .technique
                                            }
                                        </p>
                                    </div>
                                </div>

                                {activeDetailPhoneme.commonMistakes && (
                                    <div className={s.mistakeAlert}>
                                        <span className={s.alertIcon}>⚠️</span>
                                        <div>
                                            <strong>
                                                Lỗi người Việt hay mắc:
                                            </strong>
                                            <p className={s.alertText}>
                                                {
                                                    activeDetailPhoneme.commonMistakes
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nút hành động đưa vào luyện tập */}
                        <div className={s.modalFooter}>
                            <button
                                type="button"
                                className={s.btnSelectPractice}
                                onClick={() =>
                                    handleSelectForPractice(activeDetailPhoneme)
                                }
                            >
                                <span>
                                    🎙️ Chọn từ &quot;
                                    {activeDetailPhoneme.sampleWord}&quot; để
                                    luyện phát âm ngay
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
