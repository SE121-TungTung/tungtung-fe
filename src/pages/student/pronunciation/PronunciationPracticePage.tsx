import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MicRecorder } from '@/components/feature/pronunciation/MicRecorder'
import { PhonemeHighlight } from '@/components/feature/pronunciation/PhonemeHighlight'
import { IPABoard } from '@/components/feature/pronunciation/IPABoard'
import { AIFeedbackMarkdown } from '@/components/feature/pronunciation/AIFeedbackMarkdown'
import {
    VolumeIcon,
    HistoryIcon,
    BookOpenIcon,
    TargetIcon,
    ZapIcon,
    EditIcon,
    RefreshIcon,
    SparklesIcon,
    AlertTriangleIcon,
    ShuffleIcon,
    RoadmapIcon,
    CalendarIcon,
    CheckCircleIcon,
} from '@/components/feature/pronunciation/PronunciationIcons'
import {
    ROADMAP_LEVELS,
    PHONEME_GROUPS,
    getDailyChallenge,
} from '@/data/pronunciationPracticeData'
import {
    submitPronunciationPractice,
    getDrillSuggestions,
} from '@/lib/pronunciation'
import type {
    TargetType,
    PronunciationPracticeResponse,
} from '@/types/pronunciation.types'
import s from './PronunciationPracticePage.module.css'

// Danh sách các từ/câu gợi ý luyện tập tiêu chuẩn theo nhóm
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
    { key: 'environment', label: 'Môi trường' },
    { key: 'technology', label: 'Công nghệ' },
    { key: 'health', label: 'Sức khỏe' },
    { key: 'education', label: 'Giáo dục' },
    { key: 'travel', label: 'Du lịch' },
    { key: 'culture', label: 'Văn hóa' },
]

type SidebarTab = 'roadmap' | 'phonemes' | 'daily' | 'presets' | 'drill'

export default function PronunciationPracticePage() {
    const [targetType, setTargetType] = useState<TargetType>('word')
    const [targetText, setTargetText] = useState('architecture')
    const [customInput, setCustomInput] = useState('')
    const [isCustomMode, setIsCustomMode] = useState(false)

    // Sidebar Tab state
    const [activeSidebarTab, setActiveSidebarTab] =
        useState<SidebarTab>('roadmap')

    // Roadmap state
    const [selectedRoadmapLevel, setSelectedRoadmapLevel] = useState<number>(1)

    // Phoneme Practice state
    const [selectedPhonemeSymbol, setSelectedPhonemeSymbol] =
        useState<string>('/θ/')

    // Daily Challenge state
    const [dailySeed, setDailySeed] = useState<number>(0)
    const dailyChallenges = useMemo(
        () => getDailyChallenge(dailySeed),
        [dailySeed]
    )
    const [completedDailyTasks, setCompletedDailyTasks] = useState<string[]>([])

    // Drill Mode state
    const [selectedDrillTopic, setSelectedDrillTopic] = useState('environment')
    const [drillItems, setDrillItems] = useState<string[]>([])
    const [isLoadingDrill, setIsLoadingDrill] = useState(false)

    // AI Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] =
        useState<PronunciationPracticeResponse | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [showIpaModal, setShowIpaModal] = useState(false)

    // Load drill suggestions khi chọn topic
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

    // Đánh dấu hoàn thành bài tập Daily Challenge nếu đạt điểm >= 50
    useEffect(() => {
        if (analysisResult && analysisResult.overall_score >= 50) {
            const matchedChallenge = dailyChallenges.find(
                (c) => c.text.toLowerCase() === targetText.toLowerCase()
            )
            if (
                matchedChallenge &&
                !completedDailyTasks.includes(matchedChallenge.id)
            ) {
                setCompletedDailyTasks((prev) => [...prev, matchedChallenge.id])
            }
        }
    }, [analysisResult, targetText, dailyChallenges, completedDailyTasks])

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

    const handleSelectTarget = (text: string, type?: TargetType) => {
        setTargetText(text)
        if (type) {
            setTargetType(type)
        } else {
            // Tự động phân loại theo số từ
            const wordCount = text.trim().split(/\s+/).length
            if (wordCount > 15) {
                setTargetType('paragraph')
            } else if (wordCount > 3) {
                setTargetType('sentence')
            } else {
                setTargetType('word')
            }
        }
        setIsCustomMode(false)
        setAnalysisResult(null)
        setErrorMsg(null)
    }

    const handleApplyCustom = (e: React.FormEvent) => {
        e.preventDefault()
        if (!customInput.trim()) return
        handleSelectTarget(customInput.trim(), targetType)
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

    // Shuffle ngẫu nhiên bài tập theo ngữ cảnh tab đang hoạt động
    const handleShuffleRandom = () => {
        if (activeSidebarTab === 'phonemes') {
            const currentGroup = PHONEME_GROUPS.find(
                (g) => g.symbol === selectedPhonemeSymbol
            )
            if (currentGroup && currentGroup.words.length > 0) {
                const candidates = currentGroup.words.filter(
                    (w) => w !== targetText
                )
                const picked =
                    candidates[Math.floor(Math.random() * candidates.length)] ||
                    currentGroup.words[0]
                handleSelectTarget(picked, 'word')
                return
            }
        }

        if (activeSidebarTab === 'roadmap') {
            const currentLevel = ROADMAP_LEVELS.find(
                (lvl) => lvl.id === selectedRoadmapLevel
            )
            if (currentLevel) {
                const allItems = currentLevel.groups.flatMap((g) =>
                    g.items.map((item) => ({ item, type: g.targetType }))
                )
                const candidates = allItems.filter(
                    (cand) => cand.item !== targetText
                )
                const picked =
                    candidates[Math.floor(Math.random() * candidates.length)] ||
                    allItems[0]
                if (picked) {
                    handleSelectTarget(picked.item, picked.type)
                    return
                }
            }
        }

        if (activeSidebarTab === 'daily') {
            const candidates = dailyChallenges.filter(
                (c) => c.text !== targetText
            )
            const picked =
                candidates[Math.floor(Math.random() * candidates.length)] ||
                dailyChallenges[0]
            if (picked) {
                handleSelectTarget(picked.text, picked.type)
                return
            }
        }

        if (activeSidebarTab === 'drill' && drillItems.length > 0) {
            const candidates = drillItems.filter((w) => w !== targetText)
            const picked =
                candidates[Math.floor(Math.random() * candidates.length)] ||
                drillItems[0]
            handleSelectTarget(picked)
            return
        }

        // Mặc định: Shuffle trong SUGGESTED_TARGETS
        const currentGroup = SUGGESTED_TARGETS[targetType]
        const allItems = currentGroup.flatMap((g) => g.items)
        const candidates = allItems.filter((w) => w !== targetText)
        const picked =
            candidates[Math.floor(Math.random() * candidates.length)] ||
            allItems[0]
        handleSelectTarget(picked, targetType)
    }

    const handleNextWord = () => {
        handleShuffleRandom()
    }

    // Tính toán ước tính IELTS Band và nhãn CEFR tương ứng
    const getBandEstimate = (score: number) => {
        if (score >= 90) return { band: '8.5 - 9.0', cefr: 'C2 Proficient' }
        if (score >= 80) return { band: '7.5 - 8.0', cefr: 'C1 Advanced' }
        if (score >= 70) return { band: '6.5 - 7.0', cefr: 'B2 Upper-Int' }
        if (score >= 55) return { band: '5.5 - 6.0', cefr: 'B1 Intermediate' }
        return { band: '4.0 - 5.0', cefr: 'A2 Elementary' }
    }

    // Lấy nhóm âm hiện tại đang chọn
    const activePhonemeGroup = useMemo(
        () =>
            PHONEME_GROUPS.find((g) => g.symbol === selectedPhonemeSymbol) ||
            PHONEME_GROUPS[0],
        [selectedPhonemeSymbol]
    )

    // Lấy lộ trình hiện tại đang chọn
    const activeRoadmapLevel = useMemo(
        () =>
            ROADMAP_LEVELS.find((l) => l.id === selectedRoadmapLevel) ||
            ROADMAP_LEVELS[0],
        [selectedRoadmapLevel]
    )

    return (
        <div className={s.pageWrapper}>
            {/* Header trang */}
            <div className={s.pageHeader}>
                <div className={s.headerContent}>
                    <div className={s.badgeLabel}>
                        <SparklesIcon size={14} />
                        <span>AI IELTS Speech Lab</span>
                    </div>
                    <h1 className={s.pageTitle}>
                        Phòng Luyện Phát Âm Trực Quan
                    </h1>
                    <p className={s.pageDescription}>
                        Luyện khẩu hình chuẩn xác, chọn theo lộ trình bài tập
                        hoặc chuyên sâu theo từng âm vị IPA, ghi âm và nhận đánh
                        giá chi tiết từ AI.
                    </p>
                </div>

                <div className={s.headerActions}>
                    <Link
                        to="/student/pronunciation/history"
                        className={s.btnHistoryLink}
                        title="Xem chuỗi streak và lịch sử luyện tập"
                    >
                        <HistoryIcon size={16} />
                        <span>Lịch sử & Streak</span>
                    </Link>

                    <button
                        type="button"
                        className={s.btnOpenIpa}
                        onClick={() => setShowIpaModal(!showIpaModal)}
                    >
                        <BookOpenIcon size={16} />
                        <span>
                            {showIpaModal ? 'Ẩn Bảng IPA' : 'Bảng 44 Âm IPA'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Layout chính: 2 cột */}
            <div className={s.mainLayout}>
                {/* Cột trái: Lựa chọn chế độ & Ngân hàng bài tập */}
                <aside className={s.sidebar}>
                    <div className={s.sidebarCard}>
                        {/* Thanh Tab chính */}
                        <div className={s.tabSwitcher}>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'roadmap' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('roadmap')}
                                title="Lộ trình luyện phát âm từ cơ bản đến nâng cao"
                            >
                                <RoadmapIcon size={14} />
                                <span>Lộ trình</span>
                            </button>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'phonemes' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('phonemes')}
                                title="Luyện theo từng âm vị IPA & Shuffle theo âm"
                            >
                                <SparklesIcon size={14} />
                                <span>Theo Âm</span>
                            </button>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'daily' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('daily')}
                                title="Thử thách luyện phát âm hàng ngày"
                            >
                                <CalendarIcon size={14} />
                                <span>Hôm nay</span>
                            </button>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'presets' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('presets')}
                                title="Danh mục bài tập theo định dạng"
                            >
                                <TargetIcon size={14} />
                                <span>Kho từ</span>
                            </button>
                            <button
                                type="button"
                                className={`${s.tabSwitchBtn} ${activeSidebarTab === 'drill' ? s.tabSwitchActive : ''}`}
                                onClick={() => setActiveSidebarTab('drill')}
                                title="Drill bài tập IELTS theo chủ đề"
                            >
                                <ZapIcon size={14} />
                                <span>Drill</span>
                            </button>
                        </div>

                        {/* TAB 1: LỘ TRÌNH BÀI TẬP PHÁT ÂM (ROADMAP) */}
                        {activeSidebarTab === 'roadmap' && (
                            <div className={s.roadmapSection}>
                                <div className={s.sectionHeaderRow}>
                                    <h3 className={s.sidebarTitle}>
                                        Lộ trình 4 Cấp độ
                                    </h3>
                                    <button
                                        type="button"
                                        className={s.btnMiniShuffle}
                                        onClick={handleShuffleRandom}
                                        title="Lấy ngẫu nhiên từ trong cấp độ này"
                                    >
                                        <ShuffleIcon size={13} />
                                        <span>Shuffle cấp độ</span>
                                    </button>
                                </div>

                                {/* Thanh chọn cấp độ */}
                                <div className={s.levelPillList}>
                                    {ROADMAP_LEVELS.map((lvl) => (
                                        <button
                                            key={lvl.id}
                                            type="button"
                                            className={`${s.levelPillBtn} ${selectedRoadmapLevel === lvl.id ? s.levelPillActive : ''}`}
                                            onClick={() =>
                                                setSelectedRoadmapLevel(lvl.id)
                                            }
                                        >
                                            <span className={s.levelBadgeNum}>
                                                Cấp {lvl.id}
                                            </span>
                                            <span className={s.levelTitleText}>
                                                {lvl.title.replace(
                                                    `Cấp ${lvl.id}: `,
                                                    ''
                                                )}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className={s.levelDescCard}>
                                    <p className={s.levelDescText}>
                                        {activeRoadmapLevel.description}
                                    </p>
                                </div>

                                {/* Danh sách các bài tập trong cấp độ */}
                                <div className={s.presetsList}>
                                    {activeRoadmapLevel.groups.map(
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
                                                                    handleSelectTarget(
                                                                        item,
                                                                        group.targetType
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
                            </div>
                        )}

                        {/* TAB 2: LUYỆN THEO ÂM VỊ & SHUFFLE THEO ÂM */}
                        {activeSidebarTab === 'phonemes' && (
                            <div className={s.phonemeSection}>
                                <div className={s.sectionHeaderRow}>
                                    <h3 className={s.sidebarTitle}>
                                        Chọn âm vị để luyện
                                    </h3>
                                    <button
                                        type="button"
                                        className={s.btnMiniShuffle}
                                        onClick={handleShuffleRandom}
                                        title="Lấy ngẫu nhiên từ chứa âm này"
                                    >
                                        <ShuffleIcon size={13} />
                                        <span>Shuffle âm này</span>
                                    </button>
                                </div>

                                {/* Lưới các âm vị IPA phổ biến */}
                                <div className={s.phonemeGrid}>
                                    {PHONEME_GROUPS.map((g) => (
                                        <button
                                            key={g.symbol}
                                            type="button"
                                            className={`${s.phonemeGridBtn} ${selectedPhonemeSymbol === g.symbol ? s.phonemeGridActive : ''}`}
                                            onClick={() => {
                                                setSelectedPhonemeSymbol(
                                                    g.symbol
                                                )
                                                handleSelectTarget(
                                                    g.words[0],
                                                    'word'
                                                )
                                            }}
                                        >
                                            <strong className={s.phonemeSym}>
                                                {g.symbol}
                                            </strong>
                                            <span className={s.phonemeSample}>
                                                {g.exampleWord}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Chi tiết âm vị đang chọn */}
                                <div className={s.activePhonemeCard}>
                                    <div className={s.activePhonemeHeader}>
                                        <span className={s.activePhonemeBadge}>
                                            {activePhonemeGroup.symbol}
                                        </span>
                                        <div className={s.activePhonemeMeta}>
                                            <strong
                                                className={s.activePhonemeName}
                                            >
                                                {activePhonemeGroup.name}
                                            </strong>
                                            <span
                                                className={s.activePhonemeType}
                                            >
                                                {activePhonemeGroup.type ===
                                                'vowel'
                                                    ? 'Nguyên âm'
                                                    : 'Phụ âm'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={s.activePhonemeTip}>
                                        {activePhonemeGroup.description}
                                    </p>
                                </div>

                                {/* Danh sách từ chứa âm */}
                                <div className={s.phonemeWordsList}>
                                    <span className={s.groupHeader}>
                                        Kho từ chứa âm{' '}
                                        {activePhonemeGroup.symbol} (
                                        {activePhonemeGroup.words.length} từ):
                                    </span>
                                    <div className={s.itemsPillContainer}>
                                        {activePhonemeGroup.words.map(
                                            (w, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`${s.presetPill} ${targetText === w ? s.pillActive : ''}`}
                                                    onClick={() =>
                                                        handleSelectTarget(
                                                            w,
                                                            'word'
                                                        )
                                                    }
                                                >
                                                    {w}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: THỬ THÁCH HÀNG NGÀY (DAILY PRACTICE) */}
                        {activeSidebarTab === 'daily' && (
                            <div className={s.dailySection}>
                                <div className={s.sectionHeaderRow}>
                                    <h3 className={s.sidebarTitle}>
                                        Thử thách hôm nay
                                    </h3>
                                    <button
                                        type="button"
                                        className={s.btnMiniShuffle}
                                        onClick={() =>
                                            setDailySeed((prev) => prev + 1)
                                        }
                                        title="Đổi bộ bài tập hôm nay"
                                    >
                                        <RefreshIcon size={13} />
                                        <span>Đổi bộ mới</span>
                                    </button>
                                </div>

                                <div className={s.dailyProgressCard}>
                                    <div className={s.dailyProgressInfo}>
                                        <span className={s.dailyProgressLabel}>
                                            Tiến độ hoàn thành:
                                        </span>
                                        <strong className={s.dailyProgressVal}>
                                            {completedDailyTasks.length} /{' '}
                                            {dailyChallenges.length}
                                        </strong>
                                    </div>
                                    <div className={s.progressBarTrack}>
                                        <div
                                            className={s.progressBarFill}
                                            style={{
                                                width: `${(completedDailyTasks.length / dailyChallenges.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={s.dailyTaskList}>
                                    {dailyChallenges.map((task) => {
                                        const isDone =
                                            completedDailyTasks.includes(
                                                task.id
                                            )
                                        const isCurrent =
                                            targetText.toLowerCase() ===
                                            task.text.toLowerCase()

                                        return (
                                            <button
                                                key={task.id}
                                                type="button"
                                                className={`${s.dailyTaskCard} ${isCurrent ? s.dailyTaskCurrent : ''} ${isDone ? s.dailyTaskDone : ''}`}
                                                onClick={() =>
                                                    handleSelectTarget(
                                                        task.text,
                                                        task.type
                                                    )
                                                }
                                            >
                                                <div
                                                    className={
                                                        s.dailyTaskHeader
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            s.dailyTaskBadge
                                                        }
                                                    >
                                                        {task.label}
                                                    </span>
                                                    {isDone && (
                                                        <span
                                                            className={
                                                                s.doneCheck
                                                            }
                                                        >
                                                            <CheckCircleIcon
                                                                size={16}
                                                            />
                                                            <span>Đã đạt</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <strong
                                                    className={s.dailyTaskText}
                                                >
                                                    &ldquo;{task.text}&rdquo;
                                                </strong>
                                                <span
                                                    className={s.dailyTaskHint}
                                                >
                                                    {task.hint}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* TAB 4: KHO TỪ TIÊU CHUẨN (PRESETS) */}
                        {activeSidebarTab === 'presets' && (
                            <>
                                <h3 className={s.sidebarTitle}>
                                    Chế độ luyện tập
                                </h3>
                                <div className={s.modeSelector}>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'word' ? s.modeActive : ''}`}
                                        onClick={() =>
                                            handleSelectTarget(
                                                'architecture',
                                                'word'
                                            )
                                        }
                                    >
                                        Từ đơn
                                    </button>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'sentence' ? s.modeActive : ''}`}
                                        onClick={() =>
                                            handleSelectTarget(
                                                'Could you please tell me how to get to the station?',
                                                'sentence'
                                            )
                                        }
                                    >
                                        Câu ngắn
                                    </button>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'paragraph' ? s.modeActive : ''}`}
                                        onClick={() =>
                                            handleSelectTarget(
                                                SUGGESTED_TARGETS.paragraph[0]
                                                    .items[0],
                                                'paragraph'
                                            )
                                        }
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
                                            onClick={() =>
                                                setIsCustomMode(true)
                                            }
                                        >
                                            <EditIcon size={14} />
                                            <span>
                                                Nhập câu / từ tùy chỉnh...
                                            </span>
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={handleApplyCustom}
                                            className={s.customForm}
                                        >
                                            <textarea
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
                                                                    handleSelectTarget(
                                                                        item,
                                                                        targetType
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
                        )}

                        {/* TAB 5: DRILL MODE - 6 IELTS TOPICS */}
                        {activeSidebarTab === 'drill' && (
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
                                            Danh sách gợi ý theo chủ đề
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
                                        >
                                            <RefreshIcon size={12} />
                                            <span>Lấy bộ khác</span>
                                        </button>
                                    </div>

                                    {isLoadingDrill ? (
                                        <div className={s.loadingDrill}>
                                            Đang tạo bài tập theo chủ đề...
                                        </div>
                                    ) : (
                                        <div className={s.drillList}>
                                            {drillItems.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    className={`${s.drillPill} ${targetText === item ? s.pillActive : ''}`}
                                                    onClick={() =>
                                                        handleSelectTarget(item)
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

                            <div className={s.targetHeaderActions}>
                                <button
                                    type="button"
                                    className={s.btnShuffleTarget}
                                    onClick={handleShuffleRandom}
                                    title="Đổi từ / câu ngẫu nhiên"
                                >
                                    <ShuffleIcon size={15} />
                                    <span>Đổi ngẫu nhiên</span>
                                </button>

                                <button
                                    type="button"
                                    className={s.btnListenNative}
                                    onClick={speakTargetText}
                                    title="Nghe giọng đọc bản xứ"
                                >
                                    <VolumeIcon size={15} />
                                    <span>Nghe mẫu</span>
                                </button>
                            </div>
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

                    {/* Bộ ghi âm tích hợp Waveform (key={targetText} và resetKey={targetText} bảo đảm reset triệt để khi đổi từ) */}
                    <MicRecorder
                        key={targetText}
                        resetKey={targetText}
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
                            <AlertTriangleIcon size={16} />
                            <span>{errorMsg}</span>
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
                                                    ?.prosody ?? 80
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

                            {/* Nhận xét AI định dạng Markdown chuẩn đẹp */}
                            {analysisResult.feedback_text && (
                                <AIFeedbackMarkdown
                                    content={analysisResult.feedback_text}
                                />
                            )}

                            {/* Nút hành động sau khi có kết quả */}
                            <div className={s.actionsRow}>
                                <button
                                    type="button"
                                    className={s.btnNextTarget}
                                    onClick={handleNextWord}
                                >
                                    <ShuffleIcon size={16} />
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
                        onSelectPhoneme={(symbol) => {
                            setSelectedPhonemeSymbol(symbol)
                            setActiveSidebarTab('phonemes')
                            setShowIpaModal(false)
                        }}
                    />
                </div>
            )}
        </div>
    )
}
