import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MicRecorder } from '@/components/feature/pronunciation/MicRecorder'
import { PhonemeHighlight } from '@/components/feature/pronunciation/PhonemeHighlight'
import Button from '@/components/common/button/Button'
import Card from '@/components/common/card/Card'
import {
    SparklesIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    TargetIcon,
    VolumeIcon,
    RefreshIcon,
} from '@/components/feature/pronunciation/PronunciationIcons'
import {
    getAssessmentItems,
    submitPronunciationPractice,
    submitAssessment,
} from '@/lib/pronunciation'
import type {
    TargetType,
    ComponentScores,
    PhonemeItem,
} from '@/types/pronunciation.types'
import s from './PronunciationAssessmentPage.module.css'

interface AssessmentItem {
    target_text: string
    target_type: string
    ipa?: string
    phonemes?: string[]
}

interface ItemResult {
    target_text: string
    target_type: string
    overall_score: number
    phoneme_results?: unknown[]
}

interface CurrentAnalysis {
    overall_score: number
    target_ipa?: string | null
    actual_ipa?: string | null
    component_scores?: ComponentScores | null
    phoneme_results?: PhonemeItem[] | null
    feedback_text?: string | null
}

type Step = 'intro' | 'testing' | 'submitting' | 'results'

export default function PronunciationAssessmentPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('intro')
    const [items, setItems] = useState<AssessmentItem[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [results, setResults] = useState<ItemResult[]>([])
    const [currentAnalysis, setCurrentAnalysis] =
        useState<CurrentAnalysis | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    // Assessment final result
    const [assessmentResult, setAssessmentResult] = useState<{
        cefr_level: string
        ielts_band_estimate: number
        weak_phonemes: string[]
        strong_phonemes: string[]
    } | null>(null)

    // Load assessment items from API
    useEffect(() => {
        getAssessmentItems()
            .then((data) => setItems(data.items || []))
            .catch(() => setErrorMsg('Không thể tải bài đánh giá.'))
    }, [])

    const currentItem = items[currentIdx]
    const isLastItem = items.length > 0 && currentIdx === items.length - 1
    const progress =
        items.length > 0
            ? ((currentIdx + (currentAnalysis ? 1 : 0)) / items.length) * 100
            : 0

    // Speak target text using browser TTS
    const speakTarget = useCallback(() => {
        if (!currentItem) return
        const utter = new SpeechSynthesisUtterance(currentItem.target_text)
        utter.lang = 'en-US'
        utter.rate = 0.85
        speechSynthesis.speak(utter)
    }, [currentItem])

    // Handle recording complete → send to AI for detailed analysis
    const handleRecordingComplete = useCallback(
        async (blob: Blob) => {
            if (!currentItem) return
            setIsAnalyzing(true)
            setErrorMsg(null)
            try {
                const result = await submitPronunciationPractice(
                    blob,
                    currentItem.target_text,
                    currentItem.target_type as TargetType,
                    'US'
                )

                const analysis: CurrentAnalysis = {
                    overall_score: result.overall_score,
                    target_ipa: result.target_ipa || currentItem.ipa,
                    actual_ipa: result.actual_ipa,
                    component_scores: result.component_scores,
                    phoneme_results: result.phoneme_results,
                    feedback_text: result.feedback_text,
                }
                setCurrentAnalysis(analysis)

                const itemResult: ItemResult = {
                    target_text: currentItem.target_text,
                    target_type: currentItem.target_type,
                    overall_score: result.overall_score,
                    phoneme_results: result.phoneme_results || [],
                }

                // Update or add item result in results array
                setResults((prev) => {
                    const next = [...prev]
                    next[currentIdx] = itemResult
                    return next
                })
            } catch {
                setErrorMsg(
                    'Lỗi khi phân tích bài phát âm. Vui lòng thử nói lại.'
                )
            } finally {
                setIsAnalyzing(false)
            }
        },
        [currentItem, currentIdx]
    )

    // Retry recording for current word
    const handleRetryCurrent = useCallback(() => {
        setCurrentAnalysis(null)
        setErrorMsg(null)
    }, [])

    // Advance to next word or submit full placement test
    const handleNextOrFinish = useCallback(async () => {
        if (!isLastItem) {
            setCurrentIdx((prev) => prev + 1)
            setCurrentAnalysis(null)
            setErrorMsg(null)
            return
        }

        // Final submission of all results
        setStep('submitting')
        try {
            const assessment = await submitAssessment(
                results.map((r) => ({
                    target_text: r.target_text,
                    target_type: r.target_type,
                    overall_score: r.overall_score,
                    phoneme_results: r.phoneme_results as unknown[],
                }))
            )
            setAssessmentResult({
                cefr_level: assessment.cefr_level,
                ielts_band_estimate: assessment.ielts_band_estimate,
                weak_phonemes: assessment.weak_phonemes || [],
                strong_phonemes: assessment.strong_phonemes || [],
            })
            setStep('results')
        } catch {
            setErrorMsg('Không thể xử lý kết quả đánh giá cuối cùng.')
            setStep('results')
        }
    }, [isLastItem, results])

    // Score label & class helper
    const getScoreInfo = (score: number) => {
        if (score >= 80)
            return { label: 'Rất tốt (Excellent)', className: s.scoreExcellent }
        if (score >= 60) return { label: 'Khá (Good)', className: s.scoreGood }
        if (score >= 40)
            return { label: 'Trung bình (Fair)', className: s.scoreFair }
        return { label: 'Cần cải thiện (Poor)', className: s.scorePoor }
    }

    // ── RENDER: Intro Screen ──
    if (step === 'intro') {
        return (
            <div className={s.page}>
                <Card variant="glass" className={s.introCard}>
                    <div className={s.introIcon}>
                        <TargetIcon size={48} />
                    </div>
                    <h1 className={s.introTitle}>Đánh Giá Trình Độ Phát Âm</h1>
                    <p className={s.introDesc}>
                        Bạn sẽ đọc lần lượt <strong>8 từ vựng</strong> và{' '}
                        <strong>2 câu giao tiếp</strong> bao quát 8 nhóm âm IPA
                        trọng điểm. AI sẽ phân tích chi tiết từng âm vị, đối
                        chiếu với phiên âm IPA chuẩn và xác định thang điểm CEFR
                        & IELTS.
                    </p>
                    <ul className={s.introSteps}>
                        <li>
                            <span className={s.stepNum}>1</span>
                            <span>
                                Xem từ vựng, phiên âm IPA chuẩn và nghe âm thanh
                                mẫu
                            </span>
                        </li>
                        <li>
                            <span className={s.stepNum}>2</span>
                            <span>Bấm ghi âm và phát âm rõ ràng vào mic</span>
                        </li>
                        <li>
                            <span className={s.stepNum}>3</span>
                            <span>
                                Xem phân tích điểm, đối chiếu IPA và âm vị trước
                                khi chuyển sang từ tiếp theo
                            </span>
                        </li>
                    </ul>
                    <div className={s.introCta}>
                        <Button
                            variant="gradient"
                            tone="brand"
                            size="lg"
                            shape="pill"
                            leftIcon={<SparklesIcon size={18} />}
                            onClick={() => setStep('testing')}
                            disabled={items.length === 0}
                        >
                            Bắt Đầu Đánh Giá ({items.length || 10} mục)
                        </Button>
                    </div>
                    <Link to="/student/pronunciation" className={s.backLink}>
                        ← Quay lại phòng luyện phát âm
                    </Link>
                </Card>
            </div>
        )
    }

    // ── RENDER: Submitting Screen ──
    if (step === 'submitting') {
        return (
            <div className={s.page}>
                <Card variant="glass" className={s.loadingCard}>
                    <div className={s.spinner} />
                    <h2 className={s.loadingTitle}>
                        Đang tổng hợp & đánh giá trình độ...
                    </h2>
                    <p className={s.loadingDesc}>
                        AI đang phân tích các lỗi âm vị và ước lượng band IELTS.
                    </p>
                </Card>
            </div>
        )
    }

    // ── RENDER: Results Screen ──
    if (step === 'results') {
        return (
            <div className={s.page}>
                <Card variant="glass" className={s.resultsCard}>
                    <h1 className={s.resultsTitle}>
                        <CheckCircleIcon size={28} /> Kết Quả Placement Test
                    </h1>

                    {assessmentResult ? (
                        <>
                            <div className={s.levelGrid}>
                                <div className={s.levelBox}>
                                    <span className={s.levelLabel}>
                                        Ước Lượng Trình Độ CEFR
                                    </span>
                                    <span className={s.levelValue}>
                                        {assessmentResult.cefr_level}
                                    </span>
                                </div>
                                <div className={s.levelBox}>
                                    <span className={s.levelLabel}>
                                        IELTS Speaking Estimate
                                    </span>
                                    <span className={s.levelValue}>
                                        Band{' '}
                                        {assessmentResult.ielts_band_estimate}
                                    </span>
                                </div>
                            </div>

                            {assessmentResult.weak_phonemes.length > 0 && (
                                <div className={s.phonemeSection}>
                                    <h3 className={s.phonemeSectionTitle}>
                                        <AlertTriangleIcon size={16} /> Các âm
                                        vị cần ưu tiên cải thiện:
                                    </h3>
                                    <div className={s.phonemeTags}>
                                        {assessmentResult.weak_phonemes.map(
                                            (ph) => (
                                                <span
                                                    key={ph}
                                                    className={s.tagWeak}
                                                >
                                                    /{ph}/
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {assessmentResult.strong_phonemes.length > 0 && (
                                <div className={s.phonemeSection}>
                                    <h3 className={s.phonemeSectionTitle}>
                                        <CheckCircleIcon size={16} /> Các âm vị
                                        phát âm chuẩn xác:
                                    </h3>
                                    <div className={s.phonemeTags}>
                                        {assessmentResult.strong_phonemes.map(
                                            (ph) => (
                                                <span
                                                    key={ph}
                                                    className={s.tagStrong}
                                                >
                                                    /{ph}/
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <h3 className={s.breakdownTitle}>
                                Chi tiết điểm số từng mục
                            </h3>
                            <div className={s.breakdownList}>
                                {results.map((r, idx) => (
                                    <div key={idx} className={s.breakdownItem}>
                                        <div className={s.breakdownInfo}>
                                            <span className={s.breakdownIdx}>
                                                #{idx + 1}
                                            </span>
                                            <span className={s.breakdownText}>
                                                {r.target_text}
                                            </span>
                                        </div>
                                        <span
                                            className={`${s.breakdownScore} ${getScoreInfo(r.overall_score).className}`}
                                        >
                                            {Math.round(r.overall_score)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={s.errorAlert}>
                            <AlertTriangleIcon size={16} />
                            <span>
                                {errorMsg || 'Không thể tải kết quả đánh giá.'}
                            </span>
                        </div>
                    )}

                    <div className={s.resultsCta}>
                        <Button
                            variant="gradient"
                            tone="brand"
                            size="lg"
                            shape="rounded"
                            onClick={() => navigate('/student/pronunciation')}
                        >
                            Vào Lộ Trình Luyện Tập Cá Nhân Hóa →
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    // ── RENDER: Testing Screen ──
    const scoreInfo = currentAnalysis
        ? getScoreInfo(currentAnalysis.overall_score)
        : null

    return (
        <div className={s.page}>
            {/* Top Progress bar */}
            <div className={s.progressBar}>
                <div
                    className={s.progressFill}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <Card variant="glass" className={s.testCard}>
                {/* Header: Counter & Type */}
                <div className={s.testHeader}>
                    <div className={s.counterBadge}>
                        <span className={s.counterCurrent}>
                            {currentIdx + 1}
                        </span>
                        <span className={s.counterTotal}>
                            {' '}
                            / {items.length}
                        </span>
                    </div>
                    <span className={s.testType}>
                        {currentItem?.target_type === 'sentence'
                            ? '📝 Câu giao tiếp'
                            : '📖 Từ vựng'}
                    </span>
                </div>

                {/* Target word & IPA */}
                <div className={s.targetBlock}>
                    <div className={s.targetRow}>
                        <h2 className={s.targetText}>
                            {currentItem?.target_text}
                        </h2>
                        <button
                            type="button"
                            className={s.btnListen}
                            onClick={speakTarget}
                            title="Nghe phát âm chuẩn US"
                        >
                            <VolumeIcon size={22} />
                        </button>
                    </div>

                    {/* Standard IPA transcription */}
                    {currentItem?.ipa && (
                        <div className={s.targetIpaBadge}>
                            <span className={s.ipaLabel}>IPA chuẩn:</span>
                            <span className={s.ipaValue}>
                                {currentItem.ipa}
                            </span>
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className={s.errorAlert}>
                        <AlertTriangleIcon size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* --- STATE 1: Recording Mode (Before speaking) --- */}
                {!currentAnalysis && (
                    <div className={s.recordSection}>
                        <p className={s.recordPrompt}>
                            Hãy bấm micro bên dưới và đọc to từ/câu mẫu:
                        </p>
                        <MicRecorder
                            onRecordingComplete={handleRecordingComplete}
                            isAnalyzing={isAnalyzing}
                            maxDurationSeconds={
                                currentItem?.target_type === 'sentence'
                                    ? 20
                                    : 10
                            }
                            resetKey={currentIdx}
                        />
                    </div>
                )}

                {/* --- STATE 2: Detailed Word Analysis (After speaking) --- */}
                {currentAnalysis && (
                    <div className={s.analysisSection}>
                        {/* Score Banner */}
                        <div className={s.analysisScoreBanner}>
                            <div className={s.scoreCircle}>
                                <span className={s.scoreNumber}>
                                    {Math.round(currentAnalysis.overall_score)}
                                </span>
                                <span className={s.scorePercent}>%</span>
                            </div>
                            <div className={s.scoreTextGroup}>
                                <span
                                    className={`${s.scoreRating} ${scoreInfo?.className}`}
                                >
                                    {scoreInfo?.label}
                                </span>
                                <span className={s.scoreHint}>
                                    {currentAnalysis.overall_score >= 70
                                        ? 'Phát âm tốt! Giữ vững phong độ cho các câu tiếp theo.'
                                        : 'Lưu ý các âm vị chưa đạt màu đỏ/vàng bên dưới để điều chỉnh khẩu hình.'}
                                </span>
                            </div>
                        </div>

                        {/* Spoken IPA vs Expected IPA Comparison */}
                        <div className={s.ipaComparisonBox}>
                            <div className={s.ipaCompCol}>
                                <span className={s.compLabel}>
                                    Mẫu chuẩn (Expected):
                                </span>
                                <span className={s.compIpaTarget}>
                                    {currentAnalysis.target_ipa ||
                                        currentItem?.ipa ||
                                        '---'}
                                </span>
                            </div>
                            {currentAnalysis.actual_ipa && (
                                <div className={s.ipaCompCol}>
                                    <span className={s.compLabel}>
                                        Bạn đã đọc (Actual):
                                    </span>
                                    <span className={s.compIpaActual}>
                                        /{currentAnalysis.actual_ipa}/
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Detailed Phoneme Highlight Breakdown */}
                        {currentAnalysis.phoneme_results &&
                            currentAnalysis.phoneme_results.length > 0 && (
                                <div className={s.phonemeBlock}>
                                    <div className={s.phonemeHeader}>
                                        <SparklesIcon size={16} />
                                        <span>
                                            Phân tích chi tiết từng âm vị (Bấm
                                            vào âm để xem hướng dẫn khẩu hình):
                                        </span>
                                    </div>
                                    <PhonemeHighlight
                                        phonemes={
                                            currentAnalysis.phoneme_results
                                        }
                                        targetText={
                                            currentItem?.target_text || ''
                                        }
                                        targetIpa={
                                            currentAnalysis.target_ipa ||
                                            currentItem?.ipa
                                        }
                                        actualIpa={currentAnalysis.actual_ipa}
                                    />
                                </div>
                            )}

                        {/* Component Metric Scores */}
                        {currentAnalysis.component_scores && (
                            <div className={s.componentsGrid}>
                                {currentAnalysis.component_scores.accuracy !==
                                    undefined && (
                                    <div className={s.compMetric}>
                                        <span className={s.metricLabel}>
                                            Độ chính xác
                                        </span>
                                        <div className={s.metricBar}>
                                            <div
                                                className={s.metricFill}
                                                style={{
                                                    width: `${Math.min(100, currentAnalysis.component_scores.accuracy)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className={s.metricVal}>
                                            {Math.round(
                                                currentAnalysis.component_scores
                                                    .accuracy
                                            )}
                                            %
                                        </span>
                                    </div>
                                )}
                                {currentAnalysis.component_scores.fluency !==
                                    undefined && (
                                    <div className={s.compMetric}>
                                        <span className={s.metricLabel}>
                                            Độ lưu loát
                                        </span>
                                        <div className={s.metricBar}>
                                            <div
                                                className={s.metricFill}
                                                style={{
                                                    width: `${Math.min(100, currentAnalysis.component_scores.fluency)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className={s.metricVal}>
                                            {Math.round(
                                                currentAnalysis.component_scores
                                                    .fluency
                                            )}
                                            %
                                        </span>
                                    </div>
                                )}
                                {currentAnalysis.component_scores
                                    .completeness !== undefined && (
                                    <div className={s.compMetric}>
                                        <span className={s.metricLabel}>
                                            Độ hoàn thiện
                                        </span>
                                        <div className={s.metricBar}>
                                            <div
                                                className={s.metricFill}
                                                style={{
                                                    width: `${Math.min(100, currentAnalysis.component_scores.completeness)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className={s.metricVal}>
                                            {Math.round(
                                                currentAnalysis.component_scores
                                                    .completeness
                                            )}
                                            %
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action buttons: Retry or Proceed */}
                        <div className={s.actionControls}>
                            <Button
                                variant="outline"
                                tone="neutral"
                                size="md"
                                shape="pill"
                                leftIcon={<RefreshIcon size={16} />}
                                onClick={handleRetryCurrent}
                            >
                                Thử Nói Lại
                            </Button>

                            <Button
                                variant="gradient"
                                tone="brand"
                                size="md"
                                shape="pill"
                                onClick={handleNextOrFinish}
                            >
                                {isLastItem
                                    ? 'Hoàn Thành Bài Đánh Giá →'
                                    : 'Từ Tiếp Theo →'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
