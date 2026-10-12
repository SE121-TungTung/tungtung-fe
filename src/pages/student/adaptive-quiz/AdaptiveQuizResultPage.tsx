import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import type {
    AdaptiveSession,
    SessionResponseDetail,
} from '@/types/adaptive-quiz'
import { AbilityHistoryChart } from '@/components/feature/adaptive-quiz/AbilityHistoryChart'
import { ItemCharacteristicCurve } from '@/components/feature/adaptive-quiz/ItemCharacteristicCurve'
import {
    SparklesIcon,
    ArrowRightIcon,
    ActivityIcon,
    LoaderIcon,
} from '@/components/feature/adaptive-quiz/AdaptiveIcons'
import styles from './AdaptiveQuizResultPage.module.css'

export const AdaptiveQuizResultPage: React.FC = () => {
    const { id: sessionId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [session, setSession] = useState<AdaptiveSession | null>(null)
    const [responses, setResponses] = useState<SessionResponseDetail[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!sessionId) return

        const fetchResults = async () => {
            try {
                const [sessionData, responseList] = await Promise.all([
                    adaptiveQuizApi.getSession(sessionId),
                    adaptiveQuizApi
                        .getSessionResponses(sessionId)
                        .catch(() => []),
                ])
                setSession(sessionData)
                setResponses(responseList)
            } catch (err) {
                console.error('Failed to load session results', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchResults()
    }, [sessionId])

    if (isLoading || !session) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    gap: '1rem',
                }}
            >
                <LoaderIcon size={36} />
                <span style={{ color: '#64748b' }}>
                    Đang tính toán và tải báo cáo năng lực...
                </span>
            </div>
        )
    }

    const correctCount = responses.filter((r) => r.is_correct).length
    const totalCount = responses.length || session.items_administered
    const accuracyPercent =
        totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    const finalTheta = session.theta_final ?? session.theta_current
    const finalSE = session.se_final ?? session.se_current

    // Prepare history points for AbilityHistoryChart
    const historyData = (session.theta_history || []).map((h, idx) => ({
        item_sequence: h.item_position || idx + 1,
        theta_after: h.theta,
        se_after: h.se,
        is_correct: h.is_correct,
    }))

    return (
        <div className={styles.container}>
            {/* Centered Hero Header */}
            <div className={styles.hero}>
                <div className={styles.badge}>
                    <SparklesIcon size={16} />
                    Báo Cáo Phân Tích Năng Lực CAT &amp; IRT
                </div>
                <h1 className={styles.title}>
                    Kết Quả Đánh Giá Năng Lực IELTS
                </h1>
                <p className={styles.subtitle}>
                    Bài kiểm tra thích ứng đã hội tụ sai số chuẩn SE = &plusmn;
                    {finalSE.toFixed(2)} sau {totalCount} câu hỏi, xác thực
                    chuẩn xác trình độ học thuật hiện tại của bạn.
                </p>
            </div>

            {/* KPI Score Cards */}
            <div className={styles.scoreBanner}>
                <div className={styles.scoreCard}>
                    <span className={styles.scoreLabel}>
                        Ước Lượng IELTS Band
                    </span>
                    <span
                        className={`${styles.scoreVal} ${styles.bandPrimary}`}
                    >
                        {session.estimated_band
                            ? session.estimated_band.toFixed(1)
                            : '--'}
                    </span>
                    <span className={styles.scoreSub}>
                        {session.estimated_band && session.estimated_band >= 7.0
                            ? 'Trình độ Cao Cấp (C1/C2)'
                            : session.estimated_band &&
                                session.estimated_band >= 5.5
                              ? 'Trình độ Trung Cấp (B2)'
                              : 'Trình độ Cơ Bản (A2/B1)'}
                    </span>
                </div>

                <div className={styles.scoreCard}>
                    <span className={styles.scoreLabel}>
                        Chỉ Số Năng Lực (&theta;)
                    </span>
                    <span className={`${styles.scoreVal} ${styles.bandGreen}`}>
                        {finalTheta > 0
                            ? `+${finalTheta.toFixed(2)}`
                            : finalTheta.toFixed(2)}
                    </span>
                    <span className={styles.scoreSub}>
                        Thang đo latent trait [-4.0, +4.0]
                    </span>
                </div>

                <div className={styles.scoreCard}>
                    <span className={styles.scoreLabel}>Độ Chính Xác</span>
                    <span className={`${styles.scoreVal} ${styles.bandAmber}`}>
                        {accuracyPercent}%
                    </span>
                    <span className={styles.scoreSub}>
                        {correctCount}/{totalCount} câu đúng
                    </span>
                </div>

                <div className={styles.scoreCard}>
                    <span className={styles.scoreLabel}>Sai Số Chuẩn (SE)</span>
                    <span
                        className={styles.scoreVal}
                        style={{ color: '#475569' }}
                    >
                        &plusmn;{finalSE.toFixed(2)}
                    </span>
                    <span className={styles.scoreSub}>
                        {session.stop_reason === 'se_threshold'
                            ? 'Dừng do hội tụ SE <= 0.3'
                            : 'Dừng do đạt giới hạn câu'}
                    </span>
                </div>
            </div>

            {/* Ability Progression Chart */}
            <div className={styles.section}>
                <AbilityHistoryChart history={historyData} />
            </div>

            {/* Item Characteristic Curves (ICC) */}
            {responses.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <ActivityIcon size={20} />
                        Đặc Tuyến Trắc Lượng Từng Câu Hỏi (Item Characteristic
                        Curves - 3PL IRT)
                    </h3>
                    <div className={styles.iccGrid}>
                        {responses.map((resp) => (
                            <ItemCharacteristicCurve
                                key={resp.id}
                                title={
                                    resp.question_title ||
                                    `Câu hỏi #${resp.item_position}`
                                }
                                a={resp.irt_a_used}
                                b={resp.irt_b_used}
                                c={resp.irt_c_used}
                                isCorrect={resp.is_correct}
                                thetaFinal={finalTheta}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actionRow}>
                <Link
                    to="/student/adaptive-quiz"
                    className={styles.secondaryBtn}
                >
                    Quay lại danh sách bài thi
                </Link>
                <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => navigate('/student/adaptive-quiz')}
                >
                    Đánh giá kỹ năng khác
                    <ArrowRightIcon size={16} />
                </button>
            </div>
        </div>
    )
}

export default AdaptiveQuizResultPage
