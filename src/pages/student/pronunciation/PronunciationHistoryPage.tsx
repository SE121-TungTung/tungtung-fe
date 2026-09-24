import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    getPronunciationHistory,
    getPronunciationStats,
    getPronunciationDetail,
} from '@/lib/pronunciation'
import { StreakCard } from '@/components/feature/pronunciation/StreakCard'
import { PracticeHistoryChart } from '@/components/feature/pronunciation/PracticeHistoryChart'
import { PhonemeHighlight } from '@/components/feature/pronunciation/PhonemeHighlight'
import type {
    PronunciationPracticeResponse,
    TargetType,
} from '@/types/pronunciation.types'
import s from './PronunciationHistoryPage.module.css'

export default function PronunciationHistoryPage() {
    const [page, setPage] = useState(1)
    const [filterType, setFilterType] = useState<TargetType | 'all'>('all')
    const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(
        null
    )

    // Lấy danh sách lịch sử có phân trang
    const { data: historyData, isLoading } = useQuery({
        queryKey: ['pronunciation-history', page, filterType],
        queryFn: () =>
            getPronunciationHistory({
                page,
                limit: 15,
                target_type: filterType === 'all' ? undefined : filterType,
            }),
    })

    // Lấy thống kê tổng hợp (stats trend)
    const { data: statsData } = useQuery({
        queryKey: ['pronunciation-stats'],
        queryFn: () => getPronunciationStats(),
    })

    // Lấy chi tiết bài luyện tập khi click modal
    const { data: detailData, isLoading: isDetailLoading } =
        useQuery<PronunciationPracticeResponse | null>({
            queryKey: ['pronunciation-detail', selectedPracticeId],
            queryFn: () =>
                selectedPracticeId
                    ? getPronunciationDetail(selectedPracticeId)
                    : Promise.resolve(null),
            enabled: Boolean(selectedPracticeId),
        })

    const items = historyData?.items || []
    const total = historyData?.total || 0
    const totalPages = Math.ceil(total / 15)

    const getScoreBadgeClass = (score: number) => {
        if (score >= 80) return s.scoreGreen
        if (score >= 60) return s.scoreYellow
        return s.scoreRed
    }

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return d.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div className={s.pageWrapper}>
            {/* Header */}
            <div className={s.pageHeader}>
                <div>
                    <div className={s.breadcrumb}>
                        <Link
                            to="/student/pronunciation"
                            className={s.backLink}
                        >
                            ← Quay lại Phòng Luyện Phát Âm
                        </Link>
                    </div>
                    <h1 className={s.pageTitle}>
                        📜 Lịch Sử & Tiến Độ Luyện Phát Âm
                    </h1>
                    <p className={s.pageDescription}>
                        Theo dõi sự cải thiện của từng âm vị và lịch sử các lượt
                        ghi âm đã qua của bạn.
                    </p>
                </div>
            </div>

            {/* Layout 2 cột */}
            <div className={s.contentLayout}>
                {/* Cột trái: StreakCard + PracticeHistoryChart */}
                <aside className={s.leftSidebar}>
                    <StreakCard />
                    <PracticeHistoryChart trendData={statsData?.recent_trend} />
                </aside>

                {/* Cột phải: Danh sách lịch sử chi tiết */}
                <main className={s.mainSection}>
                    <div className={s.tableCard}>
                        {/* Thanh lọc theo loại bài tập */}
                        <div className={s.tableToolbar}>
                            <h3 className={s.toolbarTitle}>
                                Danh sách các lượt luyện ({total})
                            </h3>

                            <div className={s.filterTabs}>
                                <button
                                    type="button"
                                    className={`${s.filterBtn} ${filterType === 'all' ? s.filterActive : ''}`}
                                    onClick={() => {
                                        setFilterType('all')
                                        setPage(1)
                                    }}
                                >
                                    Tất cả
                                </button>
                                <button
                                    type="button"
                                    className={`${s.filterBtn} ${filterType === 'word' ? s.filterActive : ''}`}
                                    onClick={() => {
                                        setFilterType('word')
                                        setPage(1)
                                    }}
                                >
                                    Từ đơn
                                </button>
                                <button
                                    type="button"
                                    className={`${s.filterBtn} ${filterType === 'sentence' ? s.filterActive : ''}`}
                                    onClick={() => {
                                        setFilterType('sentence')
                                        setPage(1)
                                    }}
                                >
                                    Câu ngắn
                                </button>
                                <button
                                    type="button"
                                    className={`${s.filterBtn} ${filterType === 'paragraph' ? s.filterActive : ''}`}
                                    onClick={() => {
                                        setFilterType('paragraph')
                                        setPage(1)
                                    }}
                                >
                                    Đoạn văn
                                </button>
                            </div>
                        </div>

                        {/* Bảng danh sách */}
                        {isLoading ? (
                            <div className={s.loadingBox}>
                                <span>⏳ Đang tải lịch sử phát âm...</span>
                            </div>
                        ) : items.length === 0 ? (
                            <div className={s.emptyBox}>
                                <span className={s.emptyIcon}>🎙️</span>
                                <h4>Chưa có lượt luyện phát âm nào</h4>
                                <p>
                                    Hãy sang phòng luyện tập để bắt đầu ghi âm
                                    bài luyện phát âm đầu tiên nhé!
                                </p>
                                <Link
                                    to="/student/pronunciation"
                                    className={s.btnGoPractice}
                                >
                                    Bắt đầu luyện ngay
                                </Link>
                            </div>
                        ) : (
                            <div className={s.listContainer}>
                                {items.map((item) => (
                                    <div key={item.id} className={s.historyRow}>
                                        <div className={s.rowMain}>
                                            <div className={s.rowTop}>
                                                <span className={s.typeBadge}>
                                                    {item.target_type === 'word'
                                                        ? 'Từ đơn'
                                                        : item.target_type ===
                                                            'sentence'
                                                          ? 'Câu'
                                                          : 'Đoạn'}
                                                </span>
                                                <strong
                                                    className={s.targetText}
                                                >
                                                    &ldquo;{item.target_text}
                                                    &rdquo;
                                                </strong>
                                            </div>

                                            <div className={s.rowBottom}>
                                                {item.target_ipa && (
                                                    <span
                                                        className={
                                                            s.targetIpaText
                                                        }
                                                    >
                                                        /{item.target_ipa}/
                                                    </span>
                                                )}
                                                <span className={s.dateText}>
                                                    🕒{' '}
                                                    {formatDate(
                                                        item.created_at
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={s.rowRight}>
                                            <div
                                                className={`${s.scoreCircle} ${getScoreBadgeClass(item.overall_score)}`}
                                            >
                                                <span>
                                                    {Math.round(
                                                        item.overall_score
                                                    )}
                                                </span>
                                                <small>/100</small>
                                            </div>

                                            <button
                                                type="button"
                                                className={s.btnViewDetail}
                                                onClick={() =>
                                                    setSelectedPracticeId(
                                                        item.id
                                                    )
                                                }
                                                title="Xem chi tiết phân tích"
                                            >
                                                👁️ Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className={s.pagination}>
                                <button
                                    type="button"
                                    className={s.pageBtn}
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    ← Trang trước
                                </button>
                                <span className={s.pageInfo}>
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    className={s.pageBtn}
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Trang sau →
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal xem chi tiết phân tích bài luyện tập cũ */}
            {selectedPracticeId && (
                <div
                    className={s.modalBackdrop}
                    onClick={() => setSelectedPracticeId(null)}
                >
                    <div
                        className={s.modalCard}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={s.modalHeader}>
                            <div>
                                <h3 className={s.modalTitle}>
                                    Chi Tiết Phân Tích Lượt Luyện Tập
                                </h3>
                                <span className={s.modalSubtitle}>
                                    {detailData?.created_at &&
                                        formatDate(detailData.created_at)}
                                </span>
                            </div>
                            <button
                                type="button"
                                className={s.btnCloseModal}
                                onClick={() => setSelectedPracticeId(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={s.modalBody}>
                            {isDetailLoading ? (
                                <div className={s.loadingModal}>
                                    <span>⏳ Đang tải kết quả chi tiết...</span>
                                </div>
                            ) : detailData ? (
                                <div className={s.detailContent}>
                                    {/* Điểm tổng quan */}
                                    <div className={s.detailScoreRow}>
                                        <div className={s.detailScoreBox}>
                                            <span className={s.scoreBig}>
                                                {Math.round(
                                                    detailData.overall_score
                                                )}
                                            </span>
                                            <span className={s.scoreDesc}>
                                                Điểm tổng thể
                                            </span>
                                        </div>

                                        <div className={s.detailSubScores}>
                                            <div className={s.detailSubItem}>
                                                <span>Phát âm:</span>
                                                <strong>
                                                    {Math.round(
                                                        detailData
                                                            .component_scores
                                                            ?.accuracy ??
                                                            detailData.overall_score
                                                    )}
                                                    %
                                                </strong>
                                            </div>
                                            <div className={s.detailSubItem}>
                                                <span>Lưu loát:</span>
                                                <strong>
                                                    {Math.round(
                                                        detailData
                                                            .component_scores
                                                            ?.fluency ?? 80
                                                    )}
                                                    %
                                                </strong>
                                            </div>
                                            <div className={s.detailSubItem}>
                                                <span>Hoàn thiện:</span>
                                                <strong>
                                                    {Math.round(
                                                        detailData
                                                            .component_scores
                                                            ?.completeness ?? 85
                                                    )}
                                                    %
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Âm vị PhonemeHighlight */}
                                    <PhonemeHighlight
                                        phonemes={detailData.phoneme_results}
                                        targetText={detailData.target_text}
                                        targetIpa={detailData.target_ipa}
                                        actualIpa={detailData.actual_ipa}
                                    />

                                    {/* Nhận xét AI */}
                                    {detailData.feedback_text && (
                                        <div className={s.aiFeedback}>
                                            <strong>🤖 Nhận xét AI:</strong>
                                            <p>{detailData.feedback_text}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={s.emptyBox}>
                                    Không tìm thấy dữ liệu chi tiết cho lượt
                                    luyện này.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
