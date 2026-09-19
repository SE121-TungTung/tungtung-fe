import Card from '@/components/common/card/Card'
import s from './GradingSummaryPanel.module.css'

interface GradingSummaryPanelProps {
    currentTotal: number
    maxTotal: number
    questionsCount: number
    gradedCount: number
}

export default function GradingSummaryPanel({
    currentTotal,
    maxTotal,
    questionsCount,
    gradedCount,
}: GradingSummaryPanelProps) {
    const percentage =
        maxTotal > 0 ? Math.round((currentTotal / maxTotal) * 100) : 0
    const allGraded = gradedCount === questionsCount

    return (
        <div className={s.sidebar}>
            <Card title="📊 Tổng kết" className={s.summaryCard}>
                <div className={s.summaryContent}>
                    {/* Score */}
                    <div className={s.scoreSection}>
                        <div className={s.scoreDisplay}>
                            <span className={s.currentScore}>
                                {currentTotal.toFixed(1)}
                            </span>
                            <span className={s.separator}>/</span>
                            <span className={s.maxScore}>{maxTotal}</span>
                        </div>
                        <div className={s.percentage}>{percentage}%</div>
                    </div>

                    {/* Progress Bar */}
                    <div className={s.progressSection}>
                        <div className={s.progressLabel}>Tiến độ</div>
                        <div className={s.progressBar}>
                            <div
                                className={s.progressFill}
                                style={{
                                    width: `${(gradedCount / questionsCount) * 100}%`,
                                    background: allGraded
                                        ? 'linear-gradient(90deg, #4caf50 0%, #8bc34a 100%)'
                                        : 'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
                                }}
                            />
                        </div>
                        <div className={s.progressText}>
                            {gradedCount} / {questionsCount} câu
                        </div>
                    </div>

                    {/* Status */}
                    <div className={s.statusSection}>
                        {allGraded ? (
                            <div className={s.statusComplete}>
                                ✓ Đã chấm xong
                            </div>
                        ) : (
                            <div className={s.statusPending}>
                                ⏳ Còn {questionsCount - gradedCount} câu
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* Tips */}
            <Card title="💡 Gợi ý" className={s.tipsCard}>
                <ul className={s.tipsList}>
                    <li>Xem gợi ý AI để tham khảo</li>
                    <li>Band score từ 0-9 (bước nhảy 0.5)</li>
                    <li>Nhận xét chi tiết giúp học sinh hiểu rõ hơn</li>
                    <li>Nhấn "Hoàn tất" khi đã chấm xong tất cả</li>
                </ul>
            </Card>
        </div>
    )
}
