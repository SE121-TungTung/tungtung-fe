import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import TextType from '@/components/common/text/TextType'
import Card from '@/components/common/card/Card'
import { MicRecorder } from '@/components/feature/pronunciation/MicRecorder'
import { PhonemeHighlight } from '@/components/feature/pronunciation/PhonemeHighlight'
import { IPABoard } from '@/components/feature/pronunciation/IPABoard'
import { AIFeedbackMarkdown } from '@/components/feature/pronunciation/AIFeedbackMarkdown'
import { PronunciationDashboard } from '@/components/feature/pronunciation/PronunciationDashboard'
import { TargetLinkActions } from '@/components/feature/pronunciation/TargetLinkActions'
import { WordListPanel } from '@/components/feature/pronunciation/WordListPanel'
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
    ChevronUpIcon,
    ChevronDownIcon,
    ArrowRightIcon,
} from '@/components/feature/pronunciation/PronunciationIcons'
import {
    ROADMAP_LEVELS,
    DICTIONARY_WORDS,
    DICTIONARY_SENTENCES,
    getDailyChallenge,
    getRandomDictionaryBatch,
    type PracticeItem,
    type RoadmapGroup,
} from '@/data/pronunciationPracticeData'
import { IPA_PHONEMES } from '@/components/feature/pronunciation/ipaData'
import {
    useIpaLookup,
    formatIpa,
} from '@/components/feature/pronunciation/useIpaLookup'
import { Tooltip } from '@/components/core/Tooltip'
import {
    submitPronunciationPractice,
    generatePracticeSet,
    getDrillTopics,
    type DrillTopic,
    type PracticeSetItem,
    type PracticeSetPayload,
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

const AI_ERROR_MESSAGE = 'AI server đang lỗi, hãy thử lại sau.'

type PhonemeFilter = 'all' | 'monophthong' | 'diphthong' | 'consonant'

const PHONEME_FILTERS: { key: PhonemeFilter; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'monophthong', label: 'Nguyên âm đơn' },
    { key: 'diphthong', label: 'Nguyên âm đôi' },
    { key: 'consonant', label: 'Phụ âm' },
]

const PHONEME_CATEGORY_LABEL: Record<string, string> = {
    monophthong: 'Nguyên âm đơn',
    diphthong: 'Nguyên âm đôi',
    voiced_consonant: 'Phụ âm hữu thanh',
    voiceless_consonant: 'Phụ âm vô thanh',
}

function matchPhonemeFilter(category: string, filter: PhonemeFilter): boolean {
    if (filter === 'all') return true
    if (filter === 'consonant') return category.endsWith('consonant')
    return category === filter
}

type SidebarTab =
    'roadmap' | 'phonemes' | 'daily' | 'presets' | 'drill' | 'mylist'

export default function PronunciationPracticePage() {
    const [targetType, setTargetType] = useState<TargetType>('word')
    const [targetText, setTargetText] = useState('comfortable')
    const [customInput, setCustomInput] = useState('')
    const [isCustomMode, setIsCustomMode] = useState(false)

    // Chuẩn giọng đánh giá: US (Mỹ) hoặc UK (Anh)
    const [accent, setAccent] = useState<'US' | 'UK'>('US')

    // Header animated typing state
    const [showGradientName, setShowGradientName] = useState(false)
    const handleGreetingComplete = useCallback(() => {
        setShowGradientName(true)
    }, [])

    // Practice Mode: Guided (lộ trình cá nhân) vs Self-guide (tự chọn tự do)
    const [practiceMode, setPracticeMode] = useState<'guided' | 'self-guide'>(
        'guided'
    )

    // Sidebar Tab state — mặc định "Hôm nay" để user thấy bài tập ngay
    const [activeSidebarTab, setActiveSidebarTab] =
        useState<SidebarTab>('daily')

    // Roadmap state
    const [selectedRoadmapLevel, setSelectedRoadmapLevel] = useState<number>(1)

    // Phoneme Practice state
    const [selectedPhonemeSymbol, setSelectedPhonemeSymbol] = useState<string>(
        IPA_PHONEMES.find((p) => p.symbol === 'θ')?.symbol ??
            IPA_PHONEMES[0].symbol
    )
    const [phonemeFilter, setPhonemeFilter] = useState<PhonemeFilter>('all')
    const [aiPhonemeSets, setAiPhonemeSets] = useState<
        Record<string, PracticeItem[]>
    >({})
    const [aiRoadmap, setAiRoadmap] = useState<Record<number, PracticeItem[]>>(
        {}
    )

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
    const [drillSets, setDrillSets] = useState<Record<string, PracticeItem[]>>(
        {}
    )
    const [drillTopics, setDrillTopics] = useState<DrillTopic[]>(DRILL_TOPICS)
    const [customTopicInput, setCustomTopicInput] = useState('')
    const drillItems = drillSets[selectedDrillTopic] ?? []

    // Trạng thái sinh bộ bài bằng AI (dùng chung cho Lộ trình / Theo âm / Drill)
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const inflightRef = useRef<Set<string>>(new Set())
    const topicsLoadedRef = useRef(false)

    // AI Analysis state
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] =
        useState<PronunciationPracticeResponse | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [showIpaModal, setShowIpaModal] = useState(false)

    // Tra cứu phiên âm US & UK thật qua API từ điển cho từ/câu đang chọn
    const activeIpa = useIpaLookup(targetText)

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

    // Deep link từ Flashcard / nơi khác: /student/pronunciation?text=...&type=word
    const [searchParams, setSearchParams] = useSearchParams()
    const queryClient = useQueryClient()
    useEffect(() => {
        const text = searchParams.get('text')?.trim()
        if (!text) return
        const rawType = searchParams.get('type')
        const type: TargetType | undefined =
            rawType === 'word'
                ? 'word'
                : rawType === 'phrase' || rawType === 'sentence'
                  ? 'sentence'
                  : undefined
        handleSelectTarget(text.slice(0, 500), type)
        setPracticeMode('self-guide')
        setActiveSidebarTab('mylist')
        // Dọn query để F5 / quay lại không reset bài đang luyện
        setSearchParams({}, { replace: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

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
            // Cập nhật điểm trong danh sách luyện cá nhân
            queryClient.invalidateQueries({
                queryKey: ['pronunciation-word-list'],
            })
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

    // ── AI sinh bộ bài mới (kho dùng chung) ──
    const toPracticeItem = (it: PracticeSetItem): PracticeItem => ({
        text: it.text,
        targetType: it.target_type === 'word' ? 'word' : 'sentence',
        ipaUS: it.ipa_us ?? '',
        ipaUK: it.ipa_uk ?? '',
        hint: it.hint ?? undefined,
    })

    const ipaOfItem = (item: PracticeItem): string | null =>
        formatIpa(accent === 'US' ? item.ipaUS : item.ipaUK)

    const renderIpa = (a: 'US' | 'UK') => {
        const fromAnalysis =
            analysisResult && accent === a
                ? formatIpa(analysisResult.target_ipa)
                : null
        const value =
            fromAnalysis ?? formatIpa(a === 'US' ? activeIpa.us : activeIpa.uk)
        if (value) return value
        return (
            <span className={s.ipaMissing}>
                {activeIpa.isLoading
                    ? 'Đang tra phiên âm...'
                    : 'Chưa có phiên âm'}
            </span>
        )
    }

    const runGenerate = async (
        payload: PracticeSetPayload
    ): Promise<PracticeItem[] | null> => {
        setIsGenerating(true)
        setAiError(null)
        try {
            const res = await generatePracticeSet(payload)
            return res.items.map(toPracticeItem)
        } catch (err: unknown) {
            setAiError(
                err instanceof Error && err.message
                    ? err.message
                    : AI_ERROR_MESSAGE
            )
            return null
        } finally {
            setIsGenerating(false)
        }
    }

    const loadRoadmapSet = async (_force: boolean) => {
        const level = selectedRoadmapLevel
        const exclude = roadmapGroups
            .flatMap((g) => g.items.map((i) => i.text))
            .slice(0, 60)
        const items = await runGenerate({
            kind: 'roadmap',
            level,
            count: 12,
            exclude,
        })
        if (items && items.length > 0) {
            setAiRoadmap((prev) => ({ ...prev, [level]: items }))
            handleSelectTarget(items[0].text, items[0].targetType)
        }
    }

    const loadPhonemeWords = async (
        symbol: string,
        force: boolean,
        selectFirst: boolean = force
    ) => {
        const cached = aiPhonemeSets[symbol]
        if (!force && cached && cached.length > 0) {
            if (selectFirst)
                handleSelectTarget(cached[0].text, cached[0].targetType)
            return
        }
        const key = `phoneme:${symbol}`
        if (!force && inflightRef.current.has(key)) return
        inflightRef.current.add(key)
        try {
            const items = await runGenerate({
                kind: 'phoneme',
                phoneme: symbol,
                count: 12,
                exclude: (cached ?? []).map((i) => i.text),
            })
            if (items && items.length > 0) {
                setAiPhonemeSets((prev) => ({ ...prev, [symbol]: items }))
                if (selectFirst)
                    handleSelectTarget(items[0].text, items[0].targetType)
            }
        } finally {
            inflightRef.current.delete(key)
        }
    }

    const loadDrill = async (topic: string, force: boolean) => {
        const cached = drillSets[topic]
        if (!force && cached && cached.length > 0) return
        const key = `drill:${topic}`
        if (!force && inflightRef.current.has(key)) return
        inflightRef.current.add(key)
        try {
            const items = await runGenerate({
                kind: 'drill',
                topic,
                count: 8,
                exclude: (cached ?? []).map((i) => i.text),
            })
            if (items && items.length > 0) {
                setDrillSets((prev) => ({ ...prev, [topic]: items }))
            }
        } finally {
            inflightRef.current.delete(key)
        }
    }

    const handleSelectPhoneme = (symbol: string) => {
        setSelectedPhonemeSymbol(symbol)
        const cached = aiPhonemeSets[symbol]
        if (cached && cached.length > 0) {
            handleSelectTarget(cached[0].text, cached[0].targetType)
        } else {
            loadPhonemeWords(symbol, false, true)
        }
    }

    const handleRandomDrillTopic = () => {
        const candidates = drillTopics.filter(
            (t) => t.key !== selectedDrillTopic
        )
        if (candidates.length === 0) return
        setSelectedDrillTopic(
            candidates[Math.floor(Math.random() * candidates.length)].key
        )
    }

    const handleSubmitCustomTopic = (e: React.FormEvent) => {
        e.preventDefault()
        const topic = customTopicInput.trim()
        if (!topic) return
        setSelectedDrillTopic(topic)
        setCustomTopicInput('')
    }

    useEffect(() => {
        setAiError(null)
    }, [
        activeSidebarTab,
        selectedRoadmapLevel,
        selectedPhonemeSymbol,
        selectedDrillTopic,
    ])

    useEffect(() => {
        if (activeSidebarTab === 'phonemes') {
            loadPhonemeWords(selectedPhonemeSymbol, false, false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSidebarTab, selectedPhonemeSymbol])

    useEffect(() => {
        if (activeSidebarTab === 'drill') {
            loadDrill(selectedDrillTopic, false)
            if (!topicsLoadedRef.current) {
                topicsLoadedRef.current = true
                getDrillTopics()
                    .then((topics) => {
                        if (topics.length > 0) setDrillTopics(topics)
                    })
                    .catch(() => {
                        topicsLoadedRef.current = false
                    })
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSidebarTab, selectedDrillTopic])

    // SHUFFLE CẢ DANH SÁCH TỪ ĐIỂN (Đổi toàn bộ danh sách sidebar)
    const handleShuffleEntireList = () => {
        if (activeSidebarTab === 'phonemes') {
            loadPhonemeWords(selectedPhonemeSymbol, true)
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
            const candidates = phonemeWords.filter((w) => w.text !== targetText)
            if (candidates.length > 0) {
                const picked =
                    candidates[Math.floor(Math.random() * candidates.length)]
                handleSelectTarget(picked.text, picked.targetType)
            } else {
                loadPhonemeWords(selectedPhonemeSymbol, true)
            }
            return
        }

        if (activeSidebarTab === 'roadmap') {
            const currentLevel = { groups: roadmapGroups }
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

    // Lấy âm vị hiện tại đang chọn (đủ 44 âm IPA chuẩn)
    const activePhoneme = useMemo(
        () =>
            IPA_PHONEMES.find((p) => p.symbol === selectedPhonemeSymbol) ||
            IPA_PHONEMES[0],
        [selectedPhonemeSymbol]
    )
    const phonemeWords = aiPhonemeSets[selectedPhonemeSymbol] ?? []
    const filteredPhonemes = useMemo(
        () =>
            IPA_PHONEMES.filter((p) =>
                matchPhonemeFilter(p.category, phonemeFilter)
            ),
        [phonemeFilter]
    )
    const countPhonemes = (f: PhonemeFilter) =>
        IPA_PHONEMES.filter((p) => matchPhonemeFilter(p.category, f)).length

    // Lấy lộ trình hiện tại đang chọn
    const activeRoadmapLevel = useMemo(
        () =>
            ROADMAP_LEVELS.find((l) => l.id === selectedRoadmapLevel) ||
            ROADMAP_LEVELS[0],
        [selectedRoadmapLevel]
    )

    // Nếu đã đổi bộ bài bằng AI thì thay toàn bộ danh sách của cấp độ
    const roadmapGroups: RoadmapGroup[] = useMemo(() => {
        const ai = aiRoadmap[selectedRoadmapLevel]
        if (!ai) return activeRoadmapLevel.groups
        const words = ai.filter((i) => i.targetType === 'word')
        const sentences = ai.filter((i) => i.targetType !== 'word')
        const groups: RoadmapGroup[] = []
        if (words.length)
            groups.push({
                title: 'Từ vựng - bộ bài AI',
                targetType: 'word',
                items: words,
            })
        if (sentences.length)
            groups.push({
                title: 'Câu - bộ bài AI',
                targetType: 'sentence',
                items: sentences,
            })
        return groups
    }, [aiRoadmap, selectedRoadmapLevel, activeRoadmapLevel])

    return (
        <div className={s.pageWrapper}>
            {/* Header trang chuẩn TungTung: Căn giữa với hiệu ứng gõ chữ TextType */}
            <div className={s.pageHeaderCentered}>
                <div className={s.badgeLabel}>
                    <SparklesIcon size={14} />
                    <span>AI IELTS Speech Lab</span>
                </div>
                <h1 className={s.pageTitle}>
                    <TextType
                        text="Luyện phát âm "
                        typingSpeed={50}
                        loop={false}
                        showCursor={!showGradientName}
                        onSentenceComplete={handleGreetingComplete}
                    />
                    {showGradientName && (
                        <TextType
                            as="span"
                            className={s.gradientText}
                            text="chuẩn cùng AI"
                            typingSpeed={70}
                            loop={false}
                        />
                    )}
                </h1>
                <p className={s.pageDescription}>
                    Luyện khẩu hình chuẩn xác theo chuẩn IPA quốc tế, lộ trình
                    AI cá nhân hóa &amp; đối chiếu âm vị thời gian thực.
                </p>
            </div>

            {/* Thanh công cụ phân tầng phân lớp (Chia 2 bên cân đối, không dồn trái) */}
            <div className={s.controlToolbar}>
                {/* Cánh trái: Segmented Pill Switcher (Guided vs Self-guide) */}
                <div
                    className={s.practiceSegmentedControl}
                    role="tablist"
                    aria-label="Chế độ luyện tập"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={practiceMode === 'guided'}
                        className={`${s.practiceSegmentBtn} ${practiceMode === 'guided' ? s.practiceSegmentBtnActive : ''}`}
                        onClick={() => setPracticeMode('guided')}
                    >
                        <TargetIcon size={15} className={s.segmentIcon} />
                        <span>Lộ Trình AI (Guided)</span>
                        {practiceMode === 'guided' && (
                            <span
                                className={s.segmentActivePillDot}
                                aria-hidden="true"
                            />
                        )}
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={practiceMode === 'self-guide'}
                        className={`${s.practiceSegmentBtn} ${practiceMode === 'self-guide' ? s.practiceSegmentBtnActive : ''}`}
                        onClick={() => setPracticeMode('self-guide')}
                    >
                        <EditIcon size={15} className={s.segmentIcon} />
                        <span>Tự Luyện Tập (Self-guide)</span>
                        {practiceMode === 'self-guide' && (
                            <span
                                className={s.segmentActivePillDot}
                                aria-hidden="true"
                            />
                        )}
                    </button>
                </div>

                {/* Cánh phải: Các lối tắt tiện ích */}
                <div className={s.toolbarRight}>
                    <Tooltip content="Bảng 44 âm vị IPA quốc tế">
                        <button
                            type="button"
                            className={`${s.btnIpaToggle} ${showIpaModal ? s.btnIpaToggleActive : ''}`}
                            onClick={() => setShowIpaModal(!showIpaModal)}
                        >
                            <BookOpenIcon size={16} />
                            <span>
                                {showIpaModal
                                    ? 'Thu Gọn Bảng IPA'
                                    : 'Bảng 44 Âm IPA'}
                            </span>
                            <span className={s.toggleChevron}>
                                {showIpaModal ? (
                                    <ChevronUpIcon size={12} />
                                ) : (
                                    <ChevronDownIcon size={12} />
                                )}
                            </span>
                        </button>
                    </Tooltip>

                    <Tooltip content="Đánh giá trình độ phát âm Placement Test">
                        <Link
                            to="/student/pronunciation/assessment"
                            className={s.btnPlacementLink}
                        >
                            <SparklesIcon size={15} />
                            <span>Placement Test</span>
                        </Link>
                    </Tooltip>

                    <Tooltip content="Xem chuỗi streak và lịch sử luyện tập">
                        <Link
                            to="/student/pronunciation/history"
                            className={s.btnHistoryLink}
                        >
                            <HistoryIcon size={15} />
                            <span>Lịch Sử &amp; Streak</span>
                        </Link>
                    </Tooltip>
                </div>
            </div>

            {/* Section mở rộng Bảng 44 Âm IPA (Expand/Collapse tinh tế ngay trên trang) */}
            {showIpaModal && (
                <section className={s.ipaCollapsibleSection}>
                    <Card variant="outline" className={s.ipaCardWrapper}>
                        <div className={s.ipaCardHeader}>
                            <div className={s.ipaCardTitleGroup}>
                                <div className={s.ipaIconBadge}>
                                    <BookOpenIcon size={18} />
                                </div>
                                <div>
                                    <h3 className={s.ipaCardHeading}>
                                        Bảng 44 Âm Vị Quốc Tế (IPA) Chuẩn Oxford
                                    </h3>
                                    <p className={s.ipaCardSubheading}>
                                        Bấm vào từng âm vị để nghe khẩu hình mẫu
                                        và chọn từ vựng thực hành
                                    </p>
                                </div>
                            </div>
                            <Tooltip content="Thu gọn bảng IPA">
                                <button
                                    type="button"
                                    className={s.ipaCardCloseBtn}
                                    onClick={() => setShowIpaModal(false)}
                                >
                                    <span>Thu gọn</span>
                                    <ChevronUpIcon size={14} />
                                </button>
                            </Tooltip>
                        </div>
                        <IPABoard
                            onSelectPhoneme={(phoneme) => {
                                setSelectedPhonemeSymbol(phoneme.symbol)
                                setActiveSidebarTab('phonemes')
                                setShowIpaModal(false)
                                if (practiceMode !== 'self-guide') {
                                    setPracticeMode('self-guide')
                                }
                            }}
                        />
                    </Card>
                </section>
            )}

            {/* Layout chính: Dashboard rộng rãi (Guided) hoặc 2 cột Luyện tập (Self-guide) */}
            {practiceMode === 'guided' ? (
                <div className={s.guidedWrapper}>
                    <PronunciationDashboard
                        onStartPractice={(text, type) => {
                            handleSelectTarget(text, type as TargetType)
                            setPracticeMode('self-guide')
                        }}
                    />
                </div>
            ) : (
                <div className={s.mainLayout}>
                    <aside className={s.sidebar}>
                        <div className={s.sidebarCard}>
                            {/* Thanh Tab chính */}
                            <div className={s.tabSwitcher}>
                                <Tooltip content="Lộ trình luyện phát âm từ cơ bản đến nâng cao">
                                    {' '}
                                    <button
                                        type="button"
                                        className={`${s.tabSwitchBtn} ${activeSidebarTab === 'roadmap' ? s.tabSwitchActive : ''}`}
                                        onClick={() =>
                                            setActiveSidebarTab('roadmap')
                                        }
                                    >
                                        <RoadmapIcon size={14} />
                                        <span>Lộ trình</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Luyện theo từng âm vị IPA & Shuffle theo âm">
                                    {' '}
                                    <button
                                        type="button"
                                        className={`${s.tabSwitchBtn} ${activeSidebarTab === 'phonemes' ? s.tabSwitchActive : ''}`}
                                        onClick={() =>
                                            setActiveSidebarTab('phonemes')
                                        }
                                    >
                                        <SparklesIcon size={14} />
                                        <span>Theo Âm</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Thử thách luyện phát âm hàng ngày">
                                    {' '}
                                    <button
                                        type="button"
                                        className={`${s.tabSwitchBtn} ${activeSidebarTab === 'daily' ? s.tabSwitchActive : ''}`}
                                        onClick={() =>
                                            setActiveSidebarTab('daily')
                                        }
                                    >
                                        <CalendarIcon size={14} />
                                        <span>Hôm nay</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Kho từ điển phong phú">
                                    {' '}
                                    <button
                                        type="button"
                                        className={`${s.tabSwitchBtn} ${activeSidebarTab === 'presets' ? s.tabSwitchActive : ''}`}
                                        onClick={() =>
                                            setActiveSidebarTab('presets')
                                        }
                                    >
                                        <TargetIcon size={14} />
                                        <span>Từ điển</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Drill bài tập IELTS theo chủ đề">
                                    {' '}
                                    <button
                                        type="button"
                                        className={`${s.tabSwitchBtn} ${activeSidebarTab === 'drill' ? s.tabSwitchActive : ''}`}
                                        onClick={() =>
                                            setActiveSidebarTab('drill')
                                        }
                                    >
                                        <ZapIcon size={14} />
                                        <span>Drill</span>
                                    </button>
                                </Tooltip>
                                <Tooltip content="Danh sách luyện cá nhân (kể cả từ Flashcard)">
                                    {' '}
                                    <button
                                        type="button"
                                        className={`${s.tabSwitchBtn} ${activeSidebarTab === 'mylist' ? s.tabSwitchActive : ''}`}
                                        onClick={() =>
                                            setActiveSidebarTab('mylist')
                                        }
                                    >
                                        <BookOpenIcon size={14} />
                                        <span>Của tôi</span>
                                    </button>
                                </Tooltip>
                            </div>

                            {/* TAB 1: LỘ TRÌNH BÀI TẬP PHÁT ÂM (ROADMAP) */}
                            {activeSidebarTab === 'roadmap' && (
                                <div className={s.roadmapSection}>
                                    <div className={s.sectionHeaderRow}>
                                        <h3 className={s.sidebarTitle}>
                                            Lộ trình 4 Cấp độ
                                        </h3>
                                        <Tooltip content="AI tạo bộ bài mới cho cấp độ này (thay toàn bộ danh sách)">
                                            <button
                                                type="button"
                                                className={s.btnMiniShuffle}
                                                onClick={() =>
                                                    loadRoadmapSet(true)
                                                }
                                                disabled={isGenerating}
                                            >
                                                <ShuffleIcon size={13} />
                                                <span>Đổi bộ bài</span>
                                            </button>
                                        </Tooltip>
                                        {aiRoadmap[selectedRoadmapLevel] && (
                                            <Tooltip content="Quay lại bộ bài gốc của cấp độ">
                                                <button
                                                    type="button"
                                                    className={s.btnMiniShuffle}
                                                    onClick={() =>
                                                        setAiRoadmap((prev) => {
                                                            const next = {
                                                                ...prev,
                                                            }
                                                            delete next[
                                                                selectedRoadmapLevel
                                                            ]
                                                            return next
                                                        })
                                                    }
                                                >
                                                    <RefreshIcon size={13} />
                                                    <span>Bộ gốc</span>
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>

                                    {/* Thanh chọn cấp độ */}
                                    <div className={s.levelPillList}>
                                        {ROADMAP_LEVELS.map((lvl) => (
                                            <button
                                                key={lvl.id}
                                                type="button"
                                                className={`${s.levelPillBtn} ${selectedRoadmapLevel === lvl.id ? s.levelPillActive : ''}`}
                                                onClick={() =>
                                                    setSelectedRoadmapLevel(
                                                        lvl.id
                                                    )
                                                }
                                            >
                                                <span
                                                    className={s.levelBadgeNum}
                                                >
                                                    Cấp {lvl.id}
                                                </span>
                                                <span
                                                    className={s.levelTitleText}
                                                >
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

                                    {isGenerating && (
                                        <div className={s.aiLoadingBox}>
                                            Đang tạo bộ bài mới...
                                        </div>
                                    )}
                                    {aiError && !isGenerating && (
                                        <div className={s.aiErrorBox}>
                                            <AlertTriangleIcon size={14} />
                                            <span>{aiError}</span>
                                        </div>
                                    )}

                                    {/* Danh sách các bài tập trong cấp độ */}
                                    <div className={s.presetsList}>
                                        {roadmapGroups.map((group, gIdx) => (
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
                                                                {ipaOfItem(
                                                                    item
                                                                ) && (
                                                                    <span
                                                                        className={
                                                                            s.pillIpa
                                                                        }
                                                                    >
                                                                        {ipaOfItem(
                                                                            item
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: LUYỆN THEO ÂM VỊ - đủ 44 âm IPA, AI sinh bộ từ mới */}
                            {activeSidebarTab === 'phonemes' && (
                                <div className={s.phonemeSection}>
                                    <div className={s.sectionHeaderRow}>
                                        <h3 className={s.sidebarTitle}>
                                            Chọn âm vị để luyện
                                        </h3>
                                        <Tooltip content="AI tạo bộ từ mới chứa âm này">
                                            <button
                                                type="button"
                                                className={s.btnMiniShuffle}
                                                onClick={() =>
                                                    loadPhonemeWords(
                                                        selectedPhonemeSymbol,
                                                        true
                                                    )
                                                }
                                                disabled={isGenerating}
                                            >
                                                <ShuffleIcon size={13} />
                                                <span>Đổi bộ từ</span>
                                            </button>
                                        </Tooltip>
                                    </div>

                                    <div className={s.phonemeFilterRow}>
                                        {PHONEME_FILTERS.map((f) => (
                                            <button
                                                key={f.key}
                                                type="button"
                                                className={`${s.phonemeFilterBtn} ${phonemeFilter === f.key ? s.phonemeFilterActive : ''}`}
                                                onClick={() =>
                                                    setPhonemeFilter(f.key)
                                                }
                                            >
                                                {f.label} (
                                                {countPhonemes(f.key)})
                                            </button>
                                        ))}
                                    </div>

                                    <div className={s.phonemeGrid}>
                                        {filteredPhonemes.map((p) => (
                                            <button
                                                key={p.symbol}
                                                type="button"
                                                className={`${s.phonemeGridBtn} ${selectedPhonemeSymbol === p.symbol ? s.phonemeGridActive : ''}`}
                                                onClick={() =>
                                                    handleSelectPhoneme(
                                                        p.symbol
                                                    )
                                                }
                                            >
                                                <strong
                                                    className={s.phonemeSym}
                                                >
                                                    {p.symbol}
                                                </strong>
                                                <span
                                                    className={s.phonemeSample}
                                                >
                                                    {p.sampleWord}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className={s.activePhonemeCard}>
                                        <div className={s.activePhonemeHeader}>
                                            <span
                                                className={s.activePhonemeBadge}
                                            >
                                                {activePhoneme.symbol}
                                            </span>
                                            <div
                                                className={s.activePhonemeMeta}
                                            >
                                                <strong
                                                    className={
                                                        s.activePhonemeName
                                                    }
                                                >
                                                    {activePhoneme.name}
                                                </strong>
                                                <span
                                                    className={
                                                        s.activePhonemeType
                                                    }
                                                >
                                                    {PHONEME_CATEGORY_LABEL[
                                                        activePhoneme.category
                                                    ] ?? ''}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={s.activePhonemeTip}>
                                            {
                                                activePhoneme.mouthGuide
                                                    ?.technique
                                            }
                                        </p>
                                    </div>

                                    <div className={s.phonemeWordsList}>
                                        <span className={s.groupHeader}>
                                            Bộ từ chứa âm {activePhoneme.symbol}
                                            {phonemeWords.length > 0
                                                ? ` (${phonemeWords.length} từ)`
                                                : ''}
                                            :
                                        </span>
                                        {isGenerating ? (
                                            <div className={s.aiLoadingBox}>
                                                Đang tạo bộ từ mới...
                                            </div>
                                        ) : aiError ? (
                                            <div className={s.aiErrorBox}>
                                                <AlertTriangleIcon size={14} />
                                                <span>{aiError}</span>
                                            </div>
                                        ) : (
                                            <div
                                                className={s.itemsPillContainer}
                                            >
                                                {phonemeWords.map((w, idx) => (
                                                    <button
                                                        key={`${w.text}-${idx}`}
                                                        type="button"
                                                        className={`${s.presetPill} ${targetText === w.text ? s.pillActive : ''}`}
                                                        onClick={() =>
                                                            handleSelectTarget(
                                                                w.text,
                                                                w.targetType
                                                            )
                                                        }
                                                    >
                                                        {w.text}
                                                        {ipaOfItem(w) && (
                                                            <span
                                                                className={
                                                                    s.pillIpa
                                                                }
                                                            >
                                                                {ipaOfItem(w)}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                        <Tooltip content="Đổi bộ bài tập hôm nay">
                                            <button
                                                type="button"
                                                className={s.btnMiniShuffle}
                                                onClick={() =>
                                                    setDailySeed(
                                                        (prev) => prev + 1
                                                    )
                                                }
                                            >
                                                <RefreshIcon size={13} />
                                                <span>Đổi bộ mới</span>
                                            </button>
                                        </Tooltip>
                                    </div>

                                    <div className={s.dailyProgressCard}>
                                        <div className={s.dailyProgressInfo}>
                                            <span
                                                className={s.dailyProgressLabel}
                                            >
                                                Tiến độ hoàn thành:
                                            </span>
                                            <strong
                                                className={s.dailyProgressVal}
                                            >
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
                                                                <span>
                                                                    Đã đạt
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <strong
                                                        className={
                                                            s.dailyTaskText
                                                        }
                                                    >
                                                        &ldquo;{task.text}
                                                        &rdquo;
                                                    </strong>
                                                    <span
                                                        className={
                                                            s.dailyTaskHint
                                                        }
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
                                        <Tooltip content="Đổi toàn bộ danh sách từ vựng/câu ngẫu nhiên từ ngân hàng từ điển">
                                            <button
                                                type="button"
                                                className={s.btnMiniShuffle}
                                                onClick={
                                                    handleShuffleEntireList
                                                }
                                            >
                                                <ShuffleIcon size={13} />
                                                <span>Shuffle cả list</span>
                                            </button>
                                        </Tooltip>
                                    </div>

                                    <div className={s.presetTargetTypeSelector}>
                                        <button
                                            type="button"
                                            className={`${s.presetTargetTypeBtn} ${targetType === 'word' ? s.presetTargetTypeActive : ''}`}
                                            onClick={() => {
                                                setTargetType('word')
                                                if (
                                                    currentWordList.length > 0
                                                ) {
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
                                            className={`${s.presetTargetTypeBtn} ${targetType === 'sentence' ? s.presetTargetTypeActive : ''}`}
                                            onClick={() => {
                                                setTargetType('sentence')
                                                if (
                                                    currentSentenceList.length >
                                                    0
                                                ) {
                                                    handleSelectTarget(
                                                        currentSentenceList[0]
                                                            .text,
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
                                                    className={
                                                        s.customFormActions
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        className={
                                                            s.btnCancelCustom
                                                        }
                                                        onClick={() =>
                                                            setIsCustomMode(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className={
                                                            s.btnApplyCustom
                                                        }
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
                                            <div
                                                className={s.itemsPillContainer}
                                            >
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

                            {/* TAB 6: DANH SÁCH LUYỆN CÁ NHÂN (liên kết Flashcard) */}
                            {activeSidebarTab === 'mylist' && (
                                <div className={s.drillModeSection}>
                                    <div className={s.drillHeader}>
                                        <h3 className={s.sidebarTitle}>
                                            Danh sách của tôi
                                        </h3>
                                    </div>
                                    <WordListPanel
                                        activeText={targetText}
                                        accent={accent}
                                        onSelect={(item) =>
                                            handleSelectTarget(
                                                item.target_text,
                                                item.target_type === 'word'
                                                    ? 'word'
                                                    : 'sentence'
                                            )
                                        }
                                    />
                                </div>
                            )}

                            {/* TAB 5: DRILL MODE - chủ đề IELTS do AI sinh */}
                            {activeSidebarTab === 'drill' && (
                                <div className={s.drillModeSection}>
                                    <div className={s.drillHeader}>
                                        <h3 className={s.sidebarTitle}>
                                            Chọn chủ đề IELTS
                                        </h3>
                                        <Tooltip content="Chọn ngẫu nhiên một chủ đề khác">
                                            <button
                                                type="button"
                                                className={s.btnMiniShuffle}
                                                onClick={handleRandomDrillTopic}
                                                disabled={isGenerating}
                                            >
                                                <ShuffleIcon size={13} />
                                                <span>Chủ đề ngẫu nhiên</span>
                                            </button>
                                        </Tooltip>
                                    </div>

                                    <div className={s.topicsGrid}>
                                        {drillTopics.map((topic) => (
                                            <button
                                                key={topic.key}
                                                type="button"
                                                className={`${s.topicBtn} ${selectedDrillTopic === topic.key ? s.topicActive : ''}`}
                                                onClick={() =>
                                                    setSelectedDrillTopic(
                                                        topic.key
                                                    )
                                                }
                                            >
                                                {topic.label}
                                            </button>
                                        ))}
                                        {!drillTopics.some(
                                            (t) => t.key === selectedDrillTopic
                                        ) && (
                                            <button
                                                type="button"
                                                className={`${s.topicBtn} ${s.topicActive}`}
                                            >
                                                {selectedDrillTopic}
                                            </button>
                                        )}
                                    </div>

                                    <form
                                        className={s.customTopicForm}
                                        onSubmit={handleSubmitCustomTopic}
                                    >
                                        <input
                                            type="text"
                                            value={customTopicInput}
                                            onChange={(e) =>
                                                setCustomTopicInput(
                                                    e.target.value
                                                )
                                            }
                                            maxLength={80}
                                            placeholder="Hoặc nhập chủ đề khác..."
                                            className={s.customTopicInput}
                                            aria-label="Nhập chủ đề tự do"
                                        />
                                        <button
                                            type="submit"
                                            className={s.btnApplyCustom}
                                            disabled={
                                                isGenerating ||
                                                !customTopicInput.trim()
                                            }
                                        >
                                            Tạo
                                        </button>
                                    </form>

                                    <div className={s.drillItemsBox}>
                                        <div className={s.drillItemsHeader}>
                                            <span className={s.drillItemsTitle}>
                                                Danh sách gợi ý theo chủ đề
                                            </span>
                                            <button
                                                type="button"
                                                className={s.btnRefreshDrill}
                                                onClick={() =>
                                                    loadDrill(
                                                        selectedDrillTopic,
                                                        true
                                                    )
                                                }
                                                disabled={isGenerating}
                                            >
                                                <RefreshIcon size={12} />
                                                <span>Đổi bộ từ</span>
                                            </button>
                                        </div>

                                        {isGenerating ? (
                                            <div className={s.loadingDrill}>
                                                Đang tạo bài tập theo chủ đề...
                                            </div>
                                        ) : aiError ? (
                                            <div className={s.aiErrorBox}>
                                                <AlertTriangleIcon size={14} />
                                                <span>{aiError}</span>
                                            </div>
                                        ) : (
                                            <div className={s.drillList}>
                                                {drillItems.map((item, idx) => (
                                                    <button
                                                        key={`${item.text}-${idx}`}
                                                        type="button"
                                                        className={`${s.drillPill} ${targetText === item.text ? s.pillActive : ''}`}
                                                        onClick={() =>
                                                            handleSelectTarget(
                                                                item.text,
                                                                item.targetType
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                s.drillNum
                                                            }
                                                        >
                                                            {idx + 1}.
                                                        </span>
                                                        <span>
                                                            {item.text}
                                                            {ipaOfItem(
                                                                item
                                                            ) && (
                                                                <span
                                                                    className={
                                                                        s.pillIpa
                                                                    }
                                                                >
                                                                    {ipaOfItem(
                                                                        item
                                                                    )}
                                                                </span>
                                                            )}
                                                        </span>
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
                                        <Tooltip content="Chuyển sang chuẩn giọng Mỹ (General American)">
                                            <button
                                                type="button"
                                                className={`${s.accentBtn} ${accent === 'US' ? s.accentActive : ''}`}
                                                onClick={() => setAccent('US')}
                                            >
                                                <span className={s.accentTag}>
                                                    US
                                                </span>
                                                <span>Giọng Mỹ</span>
                                            </button>
                                        </Tooltip>
                                        <Tooltip content="Chuyển sang chuẩn giọng Anh (Received Pronunciation)">
                                            <button
                                                type="button"
                                                className={`${s.accentBtn} ${accent === 'UK' ? s.accentActive : ''}`}
                                                onClick={() => setAccent('UK')}
                                            >
                                                <span className={s.accentTag}>
                                                    UK
                                                </span>
                                                <span>Giọng Anh</span>
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className={s.targetHeaderActions}>
                                    <Tooltip content="Đổi 1 từ / câu ngẫu nhiên">
                                        <button
                                            type="button"
                                            className={s.btnShuffleTarget}
                                            onClick={handleShuffleRandom}
                                        >
                                            <ShuffleIcon size={15} />
                                            <span>Đổi 1 bài</span>
                                        </button>
                                    </Tooltip>

                                    <Tooltip
                                        content={`Nghe giọng đọc bản xứ (${accent})`}
                                    >
                                        <button
                                            type="button"
                                            className={s.btnListenNative}
                                            onClick={speakTargetText}
                                        >
                                            <VolumeIcon size={15} />
                                            <span>Nghe mẫu ({accent})</span>
                                        </button>
                                    </Tooltip>
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
                                >
                                    <span className={s.ipaColLabel}>
                                        US (Mỹ):
                                    </span>
                                    <strong className={s.ipaColCode}>
                                        {renderIpa('US')}
                                    </strong>
                                </div>

                                <div
                                    className={`${s.ipaBadgeCol} ${accent === 'UK' ? s.ipaBadgeActive : ''}`}
                                    onClick={() => setAccent('UK')}
                                >
                                    <span className={s.ipaColLabel}>
                                        UK (Anh):
                                    </span>
                                    <strong className={s.ipaColCode}>
                                        {renderIpa('UK')}
                                    </strong>
                                </div>
                            </div>

                            <TargetLinkActions
                                targetText={targetText}
                                targetType={targetType}
                                ipa={activeIpa.us}
                            />
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

                        {/* Cảnh báo chất lượng thu âm kém */}
                        {analysisResult &&
                            (() => {
                                const phonemes =
                                    analysisResult.phoneme_results || []
                                const avgConf =
                                    phonemes.length > 0
                                        ? phonemes.reduce(
                                              (
                                                  sum: number,
                                                  p: { confidence?: number }
                                              ) => sum + (p.confidence ?? 1),
                                              0
                                          ) / phonemes.length
                                        : 1
                                if (avgConf < 0.3 && phonemes.length > 0) {
                                    return (
                                        <div className={s.errorAlert}>
                                            <AlertTriangleIcon size={16} />
                                            <span>
                                                Chất lượng thu âm thấp
                                                (confidence{' '}
                                                {Math.round(avgConf * 100)}%) —
                                                vui lòng thử lại ở nơi yên tĩnh
                                                hơn. Kết quả dưới đây có thể
                                                chưa chính xác.
                                            </span>
                                        </div>
                                    )
                                }
                                return null
                            })()}

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
                                            <span className={s.scoreMax}>
                                                /100
                                            </span>
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

                                    {/* 4 chỉ số chi tiết — hiển thị "—" nếu AI không trả score */}
                                    <div className={s.subScoresGrid}>
                                        <div className={s.subScoreItem}>
                                            <span className={s.subScoreLabel}>
                                                Âm vị (Individual Sounds)
                                            </span>
                                            <strong className={s.subScoreVal}>
                                                {analysisResult.component_scores
                                                    ?.individual_sounds != null
                                                    ? `${Math.round(analysisResult.component_scores.individual_sounds)}%`
                                                    : '—'}
                                            </strong>
                                        </div>
                                        <div className={s.subScoreItem}>
                                            <span className={s.subScoreLabel}>
                                                Trọng âm từ (Word Stress)
                                            </span>
                                            <strong className={s.subScoreVal}>
                                                {analysisResult.component_scores
                                                    ?.word_stress != null
                                                    ? `${Math.round(analysisResult.component_scores.word_stress)}%`
                                                    : '—'}
                                            </strong>
                                        </div>
                                        <div className={s.subScoreItem}>
                                            <span className={s.subScoreLabel}>
                                                {targetType === 'sentence'
                                                    ? 'Trọng âm câu'
                                                    : 'Nối âm (Linking)'}
                                            </span>
                                            <strong className={s.subScoreVal}>
                                                {targetType === 'sentence'
                                                    ? analysisResult
                                                          .component_scores
                                                          ?.sentence_stress !=
                                                      null
                                                        ? `${Math.round(analysisResult.component_scores.sentence_stress)}%`
                                                        : '—'
                                                    : analysisResult
                                                            .component_scores
                                                            ?.linking != null
                                                      ? `${Math.round(analysisResult.component_scores.linking)}%`
                                                      : '—'}
                                            </strong>
                                        </div>
                                        <div className={s.subScoreItem}>
                                            <span className={s.subScoreLabel}>
                                                Ngữ điệu (Intonation)
                                            </span>
                                            <strong className={s.subScoreVal}>
                                                {analysisResult.component_scores
                                                    ?.intonation != null
                                                    ? `${Math.round(analysisResult.component_scores.intonation)}%`
                                                    : '—'}
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
                                    <Tooltip content="Luyện lại từ/câu hiện tại">
                                        <button
                                            type="button"
                                            className={s.btnNextTarget}
                                            onClick={() => {
                                                setAnalysisResult(null)
                                                setErrorMsg(null)
                                            }}
                                        >
                                            <RefreshIcon size={16} />
                                            <span>Thử lại</span>
                                        </button>
                                    </Tooltip>
                                    <button
                                        type="button"
                                        className={s.btnNextTarget}
                                        onClick={handleNextWord}
                                    >
                                        <ShuffleIcon size={16} />
                                        <span>Từ / Câu tiếp theo</span>
                                        <ArrowRightIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}
        </div>
    )
}
