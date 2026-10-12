import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    GraduationCapIcon,
    ClockIcon,
    ShieldAlertIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    LoaderIcon,
    CalendarIcon,
} from '@/components/feature/adaptive-quiz/AdaptiveIcons'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import type { AdaptiveSession } from '@/types/adaptive-quiz'
import styles from './PlacementTestPage.module.css'

export const PlacementTestPage: React.FC = () => {
    const navigate = useNavigate()
    const [recentSession, setRecentSession] = useState<AdaptiveSession | null>(
        null
    )
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isStarting, setIsStarting] = useState<boolean>(false)

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const res = await adaptiveQuizApi.listSessions('reading', 1, 1)
                if (res.data && res.data.length > 0) {
                    const latest = res.data[0]
                    const daysAgo =
                        (Date.now() - new Date(latest.started_at).getTime()) /
                        (1000 * 3600 * 24)
                    if (daysAgo < 30) {
                        setRecentSession(latest)
                    }
                }
            } catch (err) {
                console.error('Failed to check placement eligibility', err)
            } finally {
                setIsLoading(false)
            }
        }
        checkEligibility()
    }, [])

    const handleStartPlacement = async () => {
        setIsStarting(true)
        try {
            const session = await adaptiveQuizApi.startSession('reading', 20)
            navigate(`/student/adaptive-quiz/${session.id}`)
        } catch (err) {
            console.error('Failed to start placement test', err)
        } finally {
            setIsStarting(false)
        }
    }

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                }}
            >
                <LoaderIcon size={32} />
            </div>
        )
    }

    const isLocked =
        recentSession !== null && recentSession.status === 'completed'
    const daysRemaining = recentSession
        ? Math.max(
              0,
              30 -
                  Math.floor(
                      (Date.now() -
                          new Date(recentSession.started_at).getTime()) /
                          (1000 * 3600 * 24)
                  )
          )
        : 0

    return (
        <div className={styles.container}>
            {/* Hero Header */}
            <div className={styles.hero}>
                <div className={styles.badge}>
                    <GraduationCapIcon size={16} />
                    Bài Kiểm Tra Đầu Vào Chính Thức
                </div>
                <h1 className={styles.title}>
                    Placement Test Thích Ứng Năng Lực
                </h1>
                <p className={styles.subtitle}>
                    Bài thi đầu vào ứng dụng mô hình Item Response Theory để xác
                    định chuẩn xác trình độ IELTS hiện tại của bạn, phục vụ xếp
                    lớp tối ưu tại Lotus English Center.
                </p>
            </div>

            {/* Content Card */}
            <div className={styles.card}>
                {isLocked ? (
                    <div className={styles.limitAlert}>
                        <ShieldAlertIcon size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <div className={styles.limitTitle}>
                                Bạn đã hoàn thành Placement Test gần đây
                            </div>
                            <p className={styles.limitText}>
                                Kết quả ngày{' '}
                                {new Date(
                                    recentSession.started_at
                                ).toLocaleDateString('vi-VN')}{' '}
                                của bạn đạt{' '}
                                <strong>
                                    IELTS Band{' '}
                                    {recentSession.estimated_band?.toFixed(1) ||
                                        'N/A'}
                                </strong>
                                . Theo quy định học vụ, mỗi học viên chỉ được
                                làm lại bài kiểm tra xếp lớp sau 30 ngày (còn{' '}
                                {daysRemaining} ngày).
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.rulesSection}>
                        <div className={styles.ruleBox}>
                            <div className={styles.ruleHeader}>
                                <ClockIcon size={18} color="#0d9488" />
                                15–20 Phút
                            </div>
                            <p className={styles.ruleText}>
                                Số lượng câu hỏi tự động rút ngắn dựa trên tốc
                                độ hội tụ độ tin cậy năng lực của bạn.
                            </p>
                        </div>

                        <div className={styles.ruleBox}>
                            <div className={styles.ruleHeader}>
                                <CheckCircleIcon size={18} color="#0d9488" />
                                Đánh Giá Khách Quan
                            </div>
                            <p className={styles.ruleText}>
                                Ngân hàng câu hỏi chuẩn học thuật 3PL IRT đo
                                lường chính xác từ Band 3.5 đến 9.0.
                            </p>
                        </div>

                        <div className={styles.ruleBox}>
                            <div className={styles.ruleHeader}>
                                <CalendarIcon size={18} color="#0d9488" />
                                Giới Hạn 30 Ngày
                            </div>
                            <p className={styles.ruleText}>
                                Kết quả được gửi trực tiếp đến Office Admin để
                                đề xuất lộ trình và xếp lớp học phù hợp.
                            </p>
                        </div>
                    </div>
                )}

                <div className={styles.actionRow}>
                    {isLocked ? (
                        <button
                            type="button"
                            className={styles.startBtn}
                            onClick={() =>
                                navigate(
                                    `/student/adaptive-quiz/${recentSession.id}/result`
                                )
                            }
                        >
                            Xem lại báo cáo Placement Test
                            <ArrowRightIcon size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.startBtn}
                            onClick={handleStartPlacement}
                            disabled={isStarting}
                        >
                            {isStarting ? (
                                <>
                                    <LoaderIcon size={18} />
                                    Đang mở đề thi...
                                </>
                            ) : (
                                <>
                                    Bắt đầu làm bài Placement Test
                                    <ArrowRightIcon size={18} />
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className={styles.contactAdvisorBox}>
                    Cần hỗ trợ tư vấn lộ trình học hoặc xếp lớp đặc biệt? Vui
                    lòng liên hệ Văn phòng ghi danh (Office Admin) qua Hotline:
                    1900 8888 hoặc phòng học vụ tại cơ sở.
                </div>
            </div>
        </div>
    )
}

export default PlacementTestPage
