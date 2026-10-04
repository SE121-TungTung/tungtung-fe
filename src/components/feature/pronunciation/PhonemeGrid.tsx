import React from 'react'
import type { PhonemeMasteryItem } from '@/lib/pronunciation'
import s from './PhonemeGrid.module.css'

interface PhonemeGridProps {
    phonemes: PhonemeMasteryItem[]
    onPhonemeClick?: (phoneme: string) => void
}

const STATUS_COLORS: Record<string, string> = {
    mastered: '#10b981',
    practiced: '#0284c7',
    familiar: '#8b5cf6',
    learning: '#f59e0b',
    unseen: '#94a3b8',
}

const STATUS_LABELS: Record<string, string> = {
    mastered: 'Thành thạo',
    practiced: 'Đã luyện',
    familiar: 'Quen thuộc',
    learning: 'Đang học',
    unseen: 'Chưa luyện',
}

/**
 * Bản đồ 44 phoneme IPA dạng grid, color-coded theo mastery status.
 * Mỗi ô hiển thị ký hiệu IPA + score nếu có.
 */
export const PhonemeGrid: React.FC<PhonemeGridProps> = ({
    phonemes,
    onPhonemeClick,
}) => {
    const consonants = phonemes.filter((p) =>
        [
            'p',
            'b',
            't',
            'd',
            'k',
            'g',
            'ʔ',
            'f',
            'v',
            'θ',
            'ð',
            's',
            'z',
            'ʃ',
            'ʒ',
            'h',
            'tʃ',
            'dʒ',
            'm',
            'n',
            'ŋ',
            'l',
            'r',
            'j',
            'w',
        ].includes(p.phoneme)
    )

    const vowels = phonemes.filter(
        (p) => !consonants.find((c) => c.phoneme === p.phoneme)
    )

    return (
        <div className={s.container}>
            {/* Legend */}
            <div className={s.legend}>
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <div key={status} className={s.legendItem}>
                        <span
                            className={s.legendDot}
                            style={{ background: STATUS_COLORS[status] }}
                        />
                        <span className={s.legendLabel}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Consonants */}
            <h4 className={s.sectionTitle}>Phụ âm (Consonants)</h4>
            <div className={s.grid}>
                {consonants.map((p) => (
                    <button
                        key={p.phoneme}
                        type="button"
                        className={s.cell}
                        style={{
                            borderColor:
                                STATUS_COLORS[p.status] || STATUS_COLORS.unseen,
                            background: `${STATUS_COLORS[p.status] || STATUS_COLORS.unseen}15`,
                        }}
                        onClick={() => onPhonemeClick?.(p.phoneme)}
                        title={`/${p.phoneme}/ — ${STATUS_LABELS[p.status]} ${p.avg_score != null ? `(${Math.round(p.avg_score)}%)` : ''}`}
                    >
                        <span className={s.ipa}>/{p.phoneme}/</span>
                        {p.avg_score != null && (
                            <span
                                className={s.score}
                                style={{ color: STATUS_COLORS[p.status] }}
                            >
                                {Math.round(p.avg_score)}
                            </span>
                        )}
                        {p.total_attempts === 0 && (
                            <span className={s.unseenDot} />
                        )}
                    </button>
                ))}
            </div>

            {/* Vowels */}
            <h4 className={s.sectionTitle}>Nguyên âm (Vowels)</h4>
            <div className={s.grid}>
                {vowels.map((p) => (
                    <button
                        key={p.phoneme}
                        type="button"
                        className={s.cell}
                        style={{
                            borderColor:
                                STATUS_COLORS[p.status] || STATUS_COLORS.unseen,
                            background: `${STATUS_COLORS[p.status] || STATUS_COLORS.unseen}15`,
                        }}
                        onClick={() => onPhonemeClick?.(p.phoneme)}
                        title={`/${p.phoneme}/ — ${STATUS_LABELS[p.status]} ${p.avg_score != null ? `(${Math.round(p.avg_score)}%)` : ''}`}
                    >
                        <span className={s.ipa}>/{p.phoneme}/</span>
                        {p.avg_score != null && (
                            <span
                                className={s.score}
                                style={{ color: STATUS_COLORS[p.status] }}
                            >
                                {Math.round(p.avg_score)}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
