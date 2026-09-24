import React, { useState } from 'react'
import type { PhonemeItem, ErrorType } from '@/types/pronunciation.types'
import s from './PhonemeHighlight.module.css'

interface PhonemeHighlightProps {
    phonemes?: PhonemeItem[] | null
    targetText: string
    targetIpa?: string | null
    actualIpa?: string | null
}

export const PhonemeHighlight: React.FC<PhonemeHighlightProps> = ({
    phonemes,
    targetText,
    targetIpa,
    actualIpa,
}) => {
    const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeItem | null>(
        null
    )

    if (!phonemes || phonemes.length === 0) {
        return (
            <div className={s.emptyNotice}>
                Chưa có dữ liệu phân tích chi tiết âm vị.
            </div>
        )
    }

    const getErrorBadgeInfo = (errorType: ErrorType, isCorrect: boolean) => {
        if (isCorrect || errorType === 'correct') {
            return {
                label: 'Chính xác',
                colorClass: s.badgeCorrect,
                icon: '✓',
            }
        }
        switch (errorType) {
            case 'substitution':
                return {
                    label: 'Thay thế nhầm âm',
                    colorClass: s.badgeSubstitution,
                    icon: '≠',
                }
            case 'deletion':
                return {
                    label: 'Bị nuốt / Bỏ sót âm',
                    colorClass: s.badgeDeletion,
                    icon: '∅',
                }
            case 'insertion':
                return {
                    label: 'Thừa âm không cần thiết',
                    colorClass: s.badgeInsertion,
                    icon: '+',
                }
            case 'stress_error':
                return {
                    label: 'Sai trọng âm',
                    colorClass: s.badgeStress,
                    icon: 'ˈ',
                }
            default:
                return {
                    label: 'Cần cải thiện',
                    colorClass: s.badgeWarning,
                    icon: '!',
                }
        }
    }

    const getScoreClass = (item: PhonemeItem) => {
        if (!item.is_correct || item.error_type !== 'correct') {
            if (item.error_type === 'deletion') return s.scoreDeleted
            return s.scoreError
        }
        const score = item.score ?? Math.round(item.confidence * 100)
        if (score >= 80) return s.scoreGood
        if (score >= 60) return s.scoreWarning
        return s.scoreError
    }

    return (
        <div className={s.highlightContainer}>
            <div className={s.headerRow}>
                <div>
                    <h4 className={s.sectionTitle}>
                        Phân tích âm vị chi tiết (Phoneme Assessment)
                    </h4>
                    <p className={s.sectionSubtitle}>
                        Nhấp vào từng âm vị để xem lỗi sai và hướng dẫn sửa khẩu
                        hình
                    </p>
                </div>

                {/* Chú thích màu sắc */}
                <div className={s.legend}>
                    <span className={s.legendItem}>
                        <span className={`${s.legendDot} ${s.bgGreen}`} /> Chuẩn
                    </span>
                    <span className={s.legendItem}>
                        <span className={`${s.legendDot} ${s.bgYellow}`} /> Tạm
                        được
                    </span>
                    <span className={s.legendItem}>
                        <span className={`${s.legendDot} ${s.bgRed}`} /> Cần sửa
                    </span>
                </div>
            </div>

            {/* Dòng so sánh IPA tổng quan */}
            <div className={s.ipaComparisonBox}>
                <div className={s.ipaRow}>
                    <span className={s.ipaLabel}>Mục tiêu:</span>
                    <span className={s.ipaTarget}>
                        &ldquo;{targetText}&rdquo;
                    </span>
                </div>
                {targetIpa && (
                    <div className={s.ipaRow}>
                        <span className={s.ipaLabel}>Chuẩn bản xứ:</span>
                        <span className={s.ipaTarget}>/{targetIpa}/</span>
                    </div>
                )}
                {actualIpa && (
                    <div className={s.ipaRow}>
                        <span className={s.ipaLabel}>Bạn phát âm:</span>
                        <span className={s.ipaActual}>/{actualIpa}/</span>
                    </div>
                )}
            </div>

            {/* Dải các thẻ âm vị tương tác */}
            <div className={s.phonemeBadgesGrid}>
                {phonemes.map((item, idx) => {
                    const symbol =
                        item.phoneme_expected || item.phoneme_actual || '?'
                    const score =
                        item.score ?? Math.round(item.confidence * 100)
                    const isSelected = selectedPhoneme === item

                    return (
                        <button
                            key={idx}
                            type="button"
                            className={`${s.phonemeTile} ${getScoreClass(item)} ${isSelected ? s.tileSelected : ''}`}
                            onClick={() =>
                                setSelectedPhoneme(isSelected ? null : item)
                            }
                            title={`Âm /${symbol}/ - ${item.is_correct ? 'Đúng' : 'Có lỗi'}`}
                        >
                            <span className={s.phonemeSymbol}>/{symbol}/</span>
                            <span className={s.phonemeScore}>{score}%</span>
                            {!item.is_correct && (
                                <span className={s.errorIndicator}>•</span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Khung chi tiết âm vị đang được chọn */}
            {selectedPhoneme && (
                <div className={s.detailCard}>
                    <div className={s.detailHeader}>
                        <div className={s.detailTitleGroup}>
                            <span className={s.bigSymbol}>
                                /
                                {selectedPhoneme.phoneme_expected ||
                                    selectedPhoneme.phoneme_actual}
                                /
                            </span>
                            <div>
                                <div className={s.badgeWrapper}>
                                    {(() => {
                                        const b = getErrorBadgeInfo(
                                            selectedPhoneme.error_type,
                                            selectedPhoneme.is_correct
                                        )
                                        return (
                                            <span
                                                className={`${s.statusBadge} ${b.colorClass}`}
                                            >
                                                <span>{b.icon}</span>
                                                <span>{b.label}</span>
                                            </span>
                                        )
                                    })()}
                                </div>
                                <div className={s.detailAccuracy}>
                                    Độ chính xác:{' '}
                                    <strong>
                                        {selectedPhoneme.score ??
                                            Math.round(
                                                selectedPhoneme.confidence * 100
                                            )}
                                        %
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={s.closeBtn}
                            onClick={() => setSelectedPhoneme(null)}
                            title="Đóng chi tiết"
                        >
                            ✕
                        </button>
                    </div>

                    <div className={s.detailBody}>
                        <div className={s.comparisonGrid}>
                            <div className={s.compareCol}>
                                <span className={s.compareLabel}>
                                    Âm mong đợi:
                                </span>
                                <span className={s.compareValExpected}>
                                    {selectedPhoneme.phoneme_expected
                                        ? `/${selectedPhoneme.phoneme_expected}/`
                                        : 'Không có (Thừa âm)'}
                                </span>
                            </div>
                            <div className={s.compareCol}>
                                <span className={s.compareLabel}>
                                    Máy ghi nhận:
                                </span>
                                <span className={s.compareValActual}>
                                    {selectedPhoneme.phoneme_actual
                                        ? `/${selectedPhoneme.phoneme_actual}/`
                                        : 'Bị nuốt (Không phát hiện)'}
                                </span>
                            </div>
                        </div>

                        {/* Hướng dẫn khắc phục */}
                        <div className={s.tipBox}>
                            <span className={s.tipIcon}>💡</span>
                            <div>
                                <strong>Lời khuyên cải thiện:</strong>
                                <p className={s.tipText}>
                                    {selectedPhoneme.tip ||
                                        (selectedPhoneme.is_correct
                                            ? 'Bạn đã phát âm âm vị này rất chuẩn xác và rõ ràng. Tiếp tục duy trì phong độ!'
                                            : selectedPhoneme.error_type ===
                                                'deletion'
                                              ? 'Bạn đã bỏ sót hoặc nuốt mất âm này. Hãy chú ý mở rộng khẩu hình và bật âm rõ ràng ở cuối từ.'
                                              : selectedPhoneme.error_type ===
                                                  'substitution'
                                                ? `Bạn đã phát âm lệch sang âm /${selectedPhoneme.phoneme_actual}/. Hãy kiểm tra lại vị trí đặt lưỡi và độ căng của môi.`
                                                : 'Hãy chú ý vị trí đặt lưỡi và luồng hơi thoát ra khi phát âm.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
