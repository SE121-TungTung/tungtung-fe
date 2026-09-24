import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { MicRecorder } from '@/components/feature/pronunciation/MicRecorder'
import { PhonemeHighlight } from '@/components/feature/pronunciation/PhonemeHighlight'
import { IPABoard } from '@/components/feature/pronunciation/IPABoard'
import {
    submitPronunciationPractice,
    getDrillSuggestions,
} from '@/lib/pronunciation'
import type {
    TargetType,
    PronunciationPracticeResponse,
} from '@/types/pronunciation.types'
import s from './PronunciationPracticePage.module.css'

// Danh sách các từ/câu gợi ý luyện tập theo nhóm
const SUGGESTED_TARGETS: Record<
    TargetType,
    { title: string; items: string[] }[]
> = {
    word: [
        {
            title: 'Cặp âm dễ nhầm lẫn (Minimal Pairs)',
            items: [
                'sheep',
                'ship',
                'think',
                'sink',
                'bed',
                'bad',
                'pull',
                'pool',
                'vet',
                'wet',
                'three',
                'tree',
            ],
        },
        {
            title: 'Từ vựng IELTS học thuật (Academic Words)',
            items: [
                'architecture',
                'comfortable',
                'environment',
                'phenomenon',
                'development',
                'technology',
                'pronunciation',
                'vocabulary',
            ],
        },
        {
            title: 'Âm đuôi khó (Ending Sounds)',
            items: [
                'months',
                'clothes',
                'breathes',
                'sixth',
                'strengths',
                'crisps',
                'glimpsed',
            ],
        },
    ],
    sentence: [
        {
            title: 'Giao tiếp hàng ngày & Speaking Part 1',
            items: [
                'Could you please tell me how to get to the station?',
                'I usually spend my free time listening to acoustic music.',
                'The weather today is much warmer than yesterday.',
            ],
        },
        {
            title: 'IELTS Speaking Cụm diễn đạt điểm cao',
            items: [
                'To be perfectly honest, I have always had a strong passion for art.',
                'From my perspective, technological advancement plays a crucial role in modern life.',
                'I am firmly convinced that regular exercise brings tremendous health benefits.',
            ],
        },
    ],
    paragraph: [
        {
            title: 'IELTS Speaking Part 2 Monologue',
            items: [
                'I would like to talk about a memorable journey that I took two years ago. It was a trip to Da Lat with my closest friends. The magnificent scenery and cool atmosphere made it truly unforgettable.',
                'Learning a foreign language requires consistent dedication and regular practice. Not only does it broaden your horizons, but it also opens up numerous global career opportunities.',
            ],
        },
    ],
}

// 6 chủ đề Drill Mode chuẩn IELTS
const DRILL_TOPICS = [
    { key: 'environment', label: '🌿 Môi trường' },
    { key: 'technology', label: '💻 Công nghệ' },
    { key: 'health', label: '🩺 Sức khỏe' },
    { key: 'education', label: '🎓 Giáo dục' },
    { key: 'travel', label: '✈️ Du lịch' },
    { key: 'culture', label: '🎭 Văn hóa' },
]

export default function PronunciationPracticePage() {
    const [targetType, setTargetType] = useState<TargetType>('word')
    const [targetText, setTargetText] = useState('architecture')
    const [customInput, setCustomInput] = useState('')
    const [isCustomMode, setIsCustomMode] = useState(false)

    // Drill Mode state
    const [activeSidebarTab, setActiveSidebarTab] = useState<
        'presets' | 'drill'
    >('presets')
    const [selectedDrillTopic, setSelectedDrillTopic] = useState('environment')
    const [drillItems, setDrillItems] = useState<string[]>([])
    const [isLoadingDrill, setIsLoadingDrill] = useState(false)

    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] =
        useState<PronunciationPracticeResponse | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [showIpaModal, setShowIpaModal] = useState(false)

    // Load drill suggestions khi chọn topic hoặc bấm đổi từ
    const loadDrillSuggestions = useCallback(async (topic: string) => {
        setIsLoadingDrill(true)
        try {
            const data = await getDrillSuggestions(topic)
            setDrillItems(data.items || [])
        } catch (err) {
            console.error('Lỗi khi tải gợi ý drill:', err)
        } finally {
            setIsLoadingDrill(false)
        }
    }, [])

    useEffect(() => {
        if (activeSidebarTab === 'drill') {
            loadDrillSuggestions(selectedDrillTopic)
        }
    }, [activeSidebarTab, selectedDrillTopic, loadDrillSuggestions])

    // Phát âm mẫu câu/từ đang chọn bằng Web Speech API
    const speakTargetText = () => {
        if ('speechSynthesis' in window && targetText) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(targetText)
            utterance.lang = 'en-US'
            utterance.rate = 0.85
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleSelectPreset = (text: string) => {
        setTargetText(text)
        setIsCustomMode(false)
        setAnalysisResult(null)
        setErrorMsg(null)
    }

    const handleSelectDrillItem = (text: string) => {
        setTargetText(text)
        // Tự động phân loại targetType theo độ dài
        if (text.split(' ').length > 4) {
            setTargetType('sentence')
        } else {
            setTargetType('word')
        }
        setIsCustomMode(false)
        setAnalysisResult(null)
        setErrorMsg(null)
    }

    const handleApplyCustom = (e: React.FormEvent) => {
        e.preventDefault()
        if (!customInput.trim()) return
        setTargetText(customInput.trim())
        setIsCustomMode(false)
        setAnalysisResult(null)
        setErrorMsg(null)
    }

    // Nhận blob ghi âm từ MicRecorder và gửi lên API Backend
    const handleRecordingComplete = async (blob: Blob) => {
        setIsAnalyzing(true)
        setErrorMsg(null)

        try {
            const res = await submitPronunciationPractice(
                blob,
                targetText,
                targetType
            )
            setAnalysisResult(res)
        } catch (err: unknown) {
            console.error('Lỗi khi chấm điểm phát âm:', err)
            const error = err as Error
            setErrorMsg(
                error.message ||
                    'Đã có lỗi xảy ra khi phân tích phát âm. Vui lòng thử lại.'
            )
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleNextWord = () => {
        if (activeSidebarTab === 'drill' && drillItems.length > 0) {
            const currentIndex = drillItems.indexOf(targetText)
            const nextIndex = (currentIndex + 1) % drillItems.length
            handleSelectDrillItem(drillItems[nextIndex])
            return
        }

        const currentGroup = SUGGESTED_TARGETS[targetType]
        const allItems = currentGroup.flatMap((g) => g.items)
        const currentIndex = allItems.indexOf(targetText)
        const nextIndex = (currentIndex + 1) % allItems.length
        setTargetText(allItems[nextIndex] || allItems[0])
        setAnalysisResult(null)
        setErrorMsg(null)
    }

    // Tính toán ước tính IELTS Band và nhãn CEFR tương ứng
    const getBandEstimate = (score: number) => {
        if (score >= 90) return { band: '8.5 - 9.0', cefr: 'C2 Proficient' }
        if (score >= 80) return { band: '7.5 - 8.0', cefr: 'C1 Advanced' }
        if (score >= 70) return { band: '6.5 - 7.0', cefr: 'B2 Upper-Int' }
        if (score >= 55) return { band: '5.5 - 6.0', cefr: 'B1 Intermediate' }
        return { band: '4.0 - 5.0', cefr: 'A2 Elementary' }
    }

    return (
        <div className={s.pageWrapper}>
            {/* Header trang */}
            <div className={s.pageHeader}>
                <div className={s.headerContent}>
                    <div className={s.badgeLabel}>
                        <span>AI IELTS Speech Lab</span>
                    </div>
                    <h1 className={s.pageTitle}>
                        Phòng Luyện Phát Âm Trực Quan
                    </h1>
                    <p className={s.pageDescription}>
                        Luyện khẩu hình chuẩn xác, ghi âm và nhận đánh giá ngữ
                        âm chi tiết từng âm vị IPA theo thời gian thực.
                    </p>
                </div>

                <div className={s.headerActions}>
                    <Link
                        to="/student/pronunciation/history"
                        className={s.btnHistoryLink}
                        title="Xem chuỗi streak và lịch sử luyện tập"
                    >
                        <span>📜 Lịch sử & Streak</span>
                    </Link>

                    <button
                        type="button"
                        className={s.btnOpenIpa}
                        onClick={() => setShowIpaModal(!showIpaModal)}
                    >
                        <span>
                            {showIpaModal
                                ? '📖 Ẩn Bảng IPA'
                                : '📖 Bảng 44 Âm IPA'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Layout chính: 2 cột */}
            <div className={s.mainLayout}>
                {/* Cột trái: Lựa chọn chế độ & Từ vựng luyện tập */}
                <aside className={s.sidebar}>
                    <div className={s.sidebarCard}>
                        {/* Tab chuyển đổi giữa Gợi ý tiêu chuẩn và Drill Mode theo chủ đề */}
                        <div className={s.tabSwitcher}>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'presets' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('presets')}
                            >
                                🎯 Tiêu chuẩn
                            </button>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'drill' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('drill')}
                            >
                                ⚡ Drill IELTS Topics
                            </button>
                        </div>

                        {activeSidebarTab === 'presets' ? (
                            <>
                                <h3 className={s.sidebarTitle}>
                                    Chế độ luyện tập
                                </h3>
                                <div className={s.modeSelector}>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'word' ? s.modeActive : ''}`}
                                        onClick={() => {
                                            setTargetType('word')
                                            setTargetText('architecture')
                                            setAnalysisResult(null)
                                        }}
                                    >
                                        Từ đơn
                                    </button>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'sentence' ? s.modeActive : ''}`}
                                        onClick={() => {
                                            setTargetType('sentence')
                                            setTargetText(
                                                'Could you please tell me how to get to the station?'
                                            )
                                            setAnalysisResult(null)
                                        }}
                                    >
                                        Câu ngắn
                                    </button>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'paragraph' ? s.modeActive : ''}`}
                                        onClick={() => {
                                            setTargetType('paragraph')
                                            setTargetText(
                                                SUGGESTED_TARGETS.paragraph[0]
                                                    .items[0]
                                            )
                                            setAnalysisResult(null)
                                        }}
                                    >
                                        Đoạn văn
                                    </button>
                                </div>

                                {/* Tự nhập nội dung tùy thích */}
                                <div className={s.customInputSection}>
                                    {!isCustomMode ? (
                                        <button
                                            type="button"
                                            className={s.btnToggleCustom}
                                            onClick={() => {
                                                setIsCustomMode(true)
                                                setCustomInput(targetText)
                                            }}
                                        >
                                            ✏️ Tự nhập nội dung khác
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={handleApplyCustom}
                                            className={s.customForm}
                                        >
                                            <textarea
                                                rows={
                                                    targetType === 'paragraph'
                                                        ? 4
                                                        : 2
                                                }
                                                value={customInput}
                                                onChange={(e) =>
                                                    setCustomInput(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder={`Nhập ${targetType === 'word' ? 'từ' : targetType === 'sentence' ? 'câu' : 'đoạn'} tiếng Anh bạn muốn luyện...`}
                                                className={s.customTextarea}
                                                autoFocus
                                            />
                                            <div
                                                className={s.customFormActions}
                                            >
                                                <button
                                                    type="button"
                                                    className={
                                                        s.btnCancelCustom
                                                    }
                                                    onClick={() =>
                                                        setIsCustomMode(false)
                                                    }
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="submit"
                                                    className={s.btnApplyCustom}
                                                >
                                                    Áp dụng
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                {/* Danh sách gợi ý theo chủ đề */}
                                <div className={s.presetsList}>
                                    {SUGGESTED_TARGETS[targetType].map(
                                        (group, gIdx) => (
                                            <div
                                                key={gIdx}
                                                className={s.presetGroup}
                                            >
                                                <span className={s.groupHeader}>
                                                    {group.title}
                                                </span>
                                                <div
                                                    className={
                                                        s.itemsPillContainer
                                                    }
                                                >
                                                    {group.items.map(
                                                        (item, iIdx) => (
                                                            <button
                                                                key={iIdx}
                                                                type="button"
                                                                className={`${s.presetPill} ${targetText === item ? s.pillActive : ''}`}
                                                                onClick={() =>
                                                                    handleSelectPreset(
                                                                        item
                                                                    )
                                                                }
                                                            >
                                                                {item}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        ) : (
                            /* DRILL MODE - 6 IELTS TOPICS */
                            <div className={s.drillModeSection}>
                                <div className={s.drillHeader}>
                                    <h3 className={s.sidebarTitle}>
                                        Chọn chủ đề IELTS
                                    </h3>
                                    <span className={s.drillBadge}>
                                        5 từ/câu ngẫu nhiên
                                    </span>
                                </div>

                                <div className={s.topicsGrid}>
                                    {DRILL_TOPICS.map((topic) => (
                                        <button
                                            key={topic.key}
                                            type="button"
                                            className={`${s.topicBtn} ${selectedDrillTopic === topic.key ? s.topicActive : ''}`}
                                            onClick={() =>
                                                setSelectedDrillTopic(topic.key)
                                            }
                                        >
                                            {topic.label}
                                        </button>
                                    ))}
                                </div>

                                <div className={s.drillItemsBox}>
                                    <div className={s.drillItemsHeader}>
                                        <span className={s.drillItemsTitle}>
                                            Từ vựng chủ đề ({selectedDrillTopic}
                                            ):
                                        </span>
                                        <button
                                            type="button"
                                            className={s.btnRefreshDrill}
                                            onClick={() =>
                                                loadDrillSuggestions(
                                                    selectedDrillTopic
                                                )
                                            }
                                            disabled={isLoadingDrill}
                                            title="Tải 5 từ khác ngẫu nhiên"
                                        >
                                            🔄 Đổi 5 từ khác
                                        </button>
                                    </div>

                                    {isLoadingDrill ? (
                                        <div className={s.loadingDrill}>
                                            <span>⏳ Đang tải từ vựng...</span>
                                        </div>
                                    ) : (
                                        <div className={s.drillList}>
                                            {drillItems.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`${s.drillPill} ${targetText === item ? s.pillActive : ''}`}
                                                    onClick={() =>
                                                        handleSelectDrillItem(
                                                            item
                                                        )
                                                    }
                                                >
                                                    <span
                                                        className={s.drillNum}
                                                    >
                                                        {idx + 1}.
                                                    </span>
                                                    <span>{item}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Khu vực trung tâm: Bảng thực hành & Chấm điểm */}
                <main className={s.practiceArea}>
                    {/* Thẻ hiển thị mục tiêu luyện tập */}
                    <div className={s.targetCard}>
                        <div className={s.targetHeaderRow}>
                            <span className={s.targetTypeBadge}>
                                {targetType === 'word'
                                    ? 'Target Word'
                                    : targetType === 'sentence'
                                      ? 'Target Sentence'
                                      : 'Target Paragraph'}
                            </span>
                            <button
                                type="button"
                                className={s.btnListenNative}
                                onClick={speakTargetText}
                                title="Nghe giọng đọc bản xứ"
                            >
                                <span>🔊 Nghe mẫu</span>
                            </button>
                        </div>

                        <div className={s.targetTextDisplay}>
                            &ldquo;{targetText}&rdquo;
                        </div>

                        {analysisResult?.target_ipa && (
                            <div className={s.ipaSubtitle}>
                                Phiên âm IPA chuẩn:{' '}
                                <strong>/{analysisResult.target_ipa}/</strong>
                            </div>
                        )}
                    </div>

                    {/* Bộ ghi âm tích hợp Waveform */}
                    <MicRecorder
                        onRecordingComplete={handleRecordingComplete}
                        isAnalyzing={isAnalyzing}
                        maxDurationSeconds={
                            targetType === 'paragraph'
                                ? 90
                                : targetType === 'sentence'
                                  ? 30
                                  : 15
                        }
                        onReset={() => {
                            setAnalysisResult(null)
                            setErrorMsg(null)
                        }}
                    />

                    {/* Lỗi nếu có */}
                    {errorMsg && (
                        <div className={s.errorAlert}>
                            <span>⚠️ {errorMsg}</span>
                        </div>
                    )}

                    {/* Khung kết quả phân tích AI */}
                    {analysisResult && (
                        <div className={s.resultSection}>
                            {/* Score Overview Card */}
                            <div className={s.scoreOverviewCard}>
                                <div className={s.scoreGaugeCol}>
                                    <div className={s.circularScore}>
                                        <span className={s.scoreNumber}>
                                            {Math.round(
                                                analysisResult.overall_score
                                            )}
                                        </span>
                                        <span className={s.scoreMax}>/100</span>
                                    </div>
                                    <div className={s.scoreVerdict}>
                                        <span className={s.verdictLevel}>
                                            {
                                                getBandEstimate(
                                                    analysisResult.overall_score
                                                ).cefr
                                            }
                                        </span>
                                        <span className={s.verdictBand}>
                                            IELTS Speaking Band ~{' '}
                                            {
                                                getBandEstimate(
                                                    analysisResult.overall_score
                                                ).band
                                            }
                                        </span>
                                    </div>
                                </div>

                                {/* 4 chỉ số chi tiết */}
                                <div className={s.subScoresGrid}>
                                    <div className={s.subScoreItem}>
                                        <span className={s.subScoreLabel}>
                                            Phát âm (Accuracy)
                                        </span>
                                        <strong className={s.subScoreVal}>
                                            {Math.round(
                                                analysisResult.component_scores
                                                    ?.accuracy ??
                                                    analysisResult.overall_score
                                            )}
                                            %
                                        </strong>
                                    </div>
                                    <div className={s.subScoreItem}>
                                        <span className={s.subScoreLabel}>
                                            Lưu loát (Fluency)
                                        </span>
                                        <strong className={s.subScoreVal}>
                                            {Math.round(
                                                analysisResult.component_scores
                                                    ?.fluency ?? 85
                                            )}
                                            %
                                        </strong>
                                    </div>
                                    <div className={s.subScoreItem}>
                                        <span className={s.subScoreLabel}>
                                            Độ trọn vẹn (Completeness)
                                        </span>
                                        <strong className={s.subScoreVal}>
                                            {Math.round(
                                                analysisResult.component_scores
                                                    ?.completeness ?? 90
                                            )}
                                            %
                                        </strong>
                                    </div>
                                    <div className={s.subScoreItem}>
                                        <span className={s.subScoreLabel}>
                                            Ngữ điệu & Trọng âm
                                        </span>
                                        <strong className={s.subScoreVal}>
                                            {Math.round(
                                                analysisResult.component_scores
                                                    ?.stress ??
                                                    analysisResult
                                                        .component_scores
                                                        ?.prosody ??
                                                    80
                                            )}
                                            %
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* Khối âm vị PhonemeHighlight */}
                            <PhonemeHighlight
                                phonemes={analysisResult.phoneme_results}
                                targetText={analysisResult.target_text}
                                targetIpa={analysisResult.target_ipa}
                                actualIpa={analysisResult.actual_ipa}
                            />

                            {/* Lời khuyên phản hồi của AI */}
                            {analysisResult.feedback_text && (
                                <div className={s.aiFeedbackCard}>
                                    <div className={s.feedbackHeader}>
                                        <span>
                                            🤖 Nhận xét từ AI Chuyên gia:
                                        </span>
                                    </div>
                                    <p className={s.feedbackText}>
                                        {analysisResult.feedback_text}
                                    </p>
                                </div>
                            )}

                            {/* Nút hành động sau khi có kết quả */}
                            <div className={s.actionsRow}>
                                <button
                                    type="button"
                                    className={s.btnNextTarget}
                                    onClick={handleNextWord}
                                >
                                    <span>Từ / Câu tiếp theo →</span>
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Bảng IPA tương tác (hiển thị khi bấm mở) */}
            {showIpaModal && (
                <div className={s.ipaBoardContainer}>
                    <IPABoard
                        onSelectWord={(word) => {
                            setTargetType('word')
                            setTargetText(word)
                            setShowIpaModal(false)
                            setAnalysisResult(null)
                        }}
                    />
                </div>
            )}
        </div>
    )
}
