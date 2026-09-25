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
    DICTIONARY_WORDS,
    DICTIONARY_SENTENCES,
    getDailyChallenge,
    findIpaForText,
    getRandomDictionaryBatch,
    getRandomPhonemeWords,
    type PracticeItem,
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
    const [targetText, setTargetText] = useState('comfortable')
    const [customInput, setCustomInput] = useState('')
    const [isCustomMode, setIsCustomMode] = useState(false)

    // Chuẩn giọng đánh giá: US (Mỹ) hoặc UK (Anh)
    const [accent, setAccent] = useState<'US' | 'UK'>('US')

    // Sidebar Tab state
    const [activeSidebarTab, setActiveSidebarTab] =
        useState<SidebarTab>('roadmap')

    // Roadmap state
    const [selectedRoadmapLevel, setSelectedRoadmapLevel] = useState<number>(1)

    // Phoneme Practice state
    const [selectedPhonemeSymbol, setSelectedPhonemeSymbol] =
        useState<string>('/θ/')

    // Kho từ / câu động khi học viên bấm "Shuffle cả danh sách từ điển"
    const [currentWordList, setCurrentWordList] = useState<PracticeItem[]>(() =>
        DICTIONARY_WORDS.slice(0, 12)
    )
    const [currentSentenceList, setCurrentSentenceList] = useState<
        PracticeItem[]
    >(() => DICTIONARY_SENTENCES.slice(0, 8))

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

    // Tra cứu phiên âm US & UK cho từ/câu đang chọn
    const activeIpaData = useMemo(() => {
        return findIpaForText(targetText)
    }, [targetText])

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

    // Phát âm mẫu câu/từ đang chọn bằng Web Speech API theo đúng chuẩn US hoặc UK
    const speakTargetText = () => {
        if ('speechSynthesis' in window && targetText) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(targetText)
            utterance.lang = accent === 'UK' ? 'en-GB' : 'en-US'
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

    // Nhận blob ghi âm từ MicRecorder và gửi lên API Backend kèm giọng accent
    const handleRecordingComplete = async (blob: Blob) => {
        setIsAnalyzing(true)
        setErrorMsg(null)

        try {
            const res = await submitPronunciationPractice(
                blob,
                targetText,
                targetType,
                accent
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

    // SHUFFLE CẢ DANH SÁCH TỪ ĐIỂN (Đổi toàn bộ danh sách sidebar)
    const handleShuffleEntireList = () => {
        if (activeSidebarTab === 'phonemes') {
            const fresh = getRandomPhonemeWords(selectedPhonemeSymbol, 12)
            if (fresh.length > 0) {
                handleSelectTarget(fresh[0].text, 'word')
            }
            return
        }

        if (targetType === 'sentence') {
            const fresh = getRandomDictionaryBatch('sentence', 8)
            setCurrentSentenceList(fresh)
            if (fresh.length > 0) {
                handleSelectTarget(fresh[0].text, 'sentence')
            }
        } else {
            const fresh = getRandomDictionaryBatch('word', 12)
            setCurrentWordList(fresh)
            if (fresh.length > 0) {
                handleSelectTarget(fresh[0].text, 'word')
            }
        }
    }

    // Shuffle ngẫu nhiên 1 từ/câu tiếp theo
    const handleShuffleRandom = () => {
        if (activeSidebarTab === 'phonemes') {
            const currentGroup = PHONEME_GROUPS.find(
                (g) => g.symbol === selectedPhonemeSymbol
            )
            if (currentGroup && currentGroup.words.length > 0) {
                const candidates = currentGroup.words.filter(
                    (w) => w.text !== targetText
                )
                const picked =
                    candidates[Math.floor(Math.random() * candidates.length)] ||
                    currentGroup.words[0]
                handleSelectTarget(picked.text, 'word')
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
                    (cand) => cand.item.text !== targetText
                )
                const picked =
                    candidates[Math.floor(Math.random() * candidates.length)] ||
                    allItems[0]
                if (picked) {
                    handleSelectTarget(picked.item.text, picked.type)
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

        // Mặc định: Shuffle trong currentWordList hoặc currentSentenceList
        const pool =
            targetType === 'sentence' ? currentSentenceList : currentWordList
        const candidates = pool.filter((w) => w.text !== targetText)
        const picked =
            candidates[Math.floor(Math.random() * candidates.length)] || pool[0]
        if (picked) {
            handleSelectTarget(picked.text, targetType)
        }
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
                        Luyện khẩu hình chuẩn xác theo giọng Anh (UK) hoặc Mỹ
                        (US), chọn theo lộ trình 4 cấp độ hoặc chuyên sâu từng
                        âm vị IPA.
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
                                title="Kho từ điển phong phú"
                            >
                                <TargetIcon size={14} />
                                <span>Từ điển</span>
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
                                        title="Lấy ngẫu nhiên bài tập trong cấp độ này"
                                    >
                                        <ShuffleIcon size={13} />
                                        <span>Shuffle bài</span>
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
                                                                className={`${s.presetPill} ${targetText === item.text ? s.pillActive : ''}`}
                                                                onClick={() =>
                                                                    handleSelectTarget(
                                                                        item.text,
                                                                        group.targetType
                                                                    )
                                                                }
                                                            >
                                                                {item.text}
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
                                        <span>Shuffle từ</span>
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
                                                    g.words[0].text,
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
                                                    className={`${s.presetPill} ${targetText === w.text ? s.pillActive : ''}`}
                                                    onClick={() =>
                                                        handleSelectTarget(
                                                            w.text,
                                                            'word'
                                                        )
                                                    }
                                                >
                                                    {w.text}
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

                        {/* TAB 4: KHO TỪ ĐIỂN & SHUFFLE CẢ DANH SÁCH (PRESETS) */}
                        {activeSidebarTab === 'presets' && (
                            <>
                                <div className={s.sectionHeaderRow}>
                                    <h3 className={s.sidebarTitle}>
                                        Kho từ điển
                                    </h3>
                                    {/* Nút Shuffle đổi toàn bộ danh sách */}
                                    <button
                                        type="button"
                                        className={s.btnMiniShuffle}
                                        onClick={handleShuffleEntireList}
                                        title="Đổi toàn bộ danh sách từ vựng/câu ngẫu nhiên từ ngân hàng từ điển"
                                    >
                                        <ShuffleIcon size={13} />
                                        <span>Shuffle cả list</span>
                                    </button>
                                </div>

                                <div className={s.modeSelector}>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'word' ? s.modeActive : ''}`}
                                        onClick={() => {
                                            setTargetType('word')
                                            if (currentWordList.length > 0) {
                                                handleSelectTarget(
                                                    currentWordList[0].text,
                                                    'word'
                                                )
                                            }
                                        }}
                                    >
                                        Từ vựng
                                    </button>
                                    <button
                                        type="button"
                                        className={`${s.modeBtn} ${targetType === 'sentence' ? s.modeActive : ''}`}
                                        onClick={() => {
                                            setTargetType('sentence')
                                            if (
                                                currentSentenceList.length > 0
                                            ) {
                                                handleSelectTarget(
                                                    currentSentenceList[0].text,
                                                    'sentence'
                                                )
                                            }
                                        }}
                                    >
                                        Câu nói
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
                                                placeholder={`Nhập ${targetType === 'word' ? 'từ' : 'câu'} tiếng Anh bạn muốn luyện...`}
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

                                {/* Danh sách từ vựng / câu hiển thị */}
                                <div className={s.presetsList}>
                                    <div className={s.presetGroup}>
                                        <span className={s.groupHeader}>
                                            {targetType === 'word'
                                                ? `Danh sách từ vựng (${currentWordList.length} từ ngẫu nhiên)`
                                                : `Danh sách câu luyện tập (${currentSentenceList.length} câu ngẫu nhiên)`}
                                        </span>
                                        <div className={s.itemsPillContainer}>
                                            {(targetType === 'word'
                                                ? currentWordList
                                                : currentSentenceList
                                            ).map((item, iIdx) => (
                                                <button
                                                    key={iIdx}
                                                    type="button"
                                                    className={`${s.presetPill} ${targetText === item.text ? s.pillActive : ''}`}
                                                    onClick={() =>
                                                        handleSelectTarget(
                                                            item.text,
                                                            item.targetType
                                                        )
                                                    }
                                                >
                                                    {item.text}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
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
                            <div className={s.headerBadgesRow}>
                                <span className={s.targetTypeBadge}>
                                    {targetType === 'word'
                                        ? 'Target Word'
                                        : targetType === 'sentence'
                                          ? 'Target Sentence'
                                          : 'Target Paragraph'}
                                </span>

                                {/* Bộ chọn chuẩn giọng UK vs US (Point 5) */}
                                <div className={s.accentSwitcher}>
                                    <button
                                        type="button"
                                        className={`${s.accentBtn} ${accent === 'US' ? s.accentActive : ''}`}
                                        onClick={() => setAccent('US')}
                                        title="Chuyển sang chuẩn giọng Mỹ (General American)"
                                    >
                                        <span className={s.accentTag}>US</span>
                                        <span>Giọng Mỹ</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`${s.accentBtn} ${accent === 'UK' ? s.accentActive : ''}`}
                                        onClick={() => setAccent('UK')}
                                        title="Chuyển sang chuẩn giọng Anh (Received Pronunciation)"
                                    >
                                        <span className={s.accentTag}>UK</span>
                                        <span>Giọng Anh</span>
                                    </button>
                                </div>
                            </div>

                            <div className={s.targetHeaderActions}>
                                <button
                                    type="button"
                                    className={s.btnShuffleTarget}
                                    onClick={handleShuffleRandom}
                                    title="Đổi 1 từ / câu ngẫu nhiên"
                                >
                                    <ShuffleIcon size={15} />
                                    <span>Đổi 1 bài</span>
                                </button>

                                <button
                                    type="button"
                                    className={s.btnListenNative}
                                    onClick={speakTargetText}
                                    title={`Nghe giọng đọc bản xứ (${accent})`}
                                >
                                    <VolumeIcon size={15} />
                                    <span>Nghe mẫu ({accent})</span>
                                </button>
                            </div>
                        </div>

                        <div className={s.targetTextDisplay}>
                            &ldquo;{targetText}&rdquo;
                        </div>

                        {/* Hiển thị cả US và UK IPA cho cả từ và câu (Point 7) */}
                        <div className={s.ipaDualContainer}>
                            <div
                                className={`${s.ipaBadgeCol} ${accent === 'US' ? s.ipaBadgeActive : ''}`}
                                onClick={() => setAccent('US')}
                                title="Nhấp để chọn chuẩn giọng Mỹ"
                            >
                                <span className={s.ipaColLabel}>US (Mỹ):</span>
                                <strong className={s.ipaColCode}>
                                    /
                                    {analysisResult &&
                                    accent === 'US' &&
                                    analysisResult.target_ipa
                                        ? analysisResult.target_ipa
                                        : activeIpaData.us}
                                    /
                                </strong>
                            </div>

                            <div
                                className={`${s.ipaBadgeCol} ${accent === 'UK' ? s.ipaBadgeActive : ''}`}
                                onClick={() => setAccent('UK')}
                                title="Nhấp để chọn chuẩn giọng Anh"
                            >
                                <span className={s.ipaColLabel}>UK (Anh):</span>
                                <strong className={s.ipaColCode}>
                                    /
                                    {analysisResult &&
                                    accent === 'UK' &&
                                    analysisResult.target_ipa
                                        ? analysisResult.target_ipa
                                        : activeIpaData.uk}
                                    /
                                </strong>
                            </div>
                        </div>
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

                            {/* Nhận xét AI chuyên gia định dạng thẻ chuẩn đẹp (Point 4) */}
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
