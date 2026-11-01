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
import { AdaptiveHelpButton } from '@/components/feature/adaptive-quiz/AdaptiveExplanationModal'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import { getMyClasses } from '@/lib/users'
import { useSession } from '@/stores/session.store'
import type { AdaptiveSession } from '@/types/adaptive-quiz'
import styles from './PlacementTestPage.module.css'

export const PlacementTestPage: React.FC = () => {
    const navigate = useNavigate()
    const user = useSession((state) => state.user)
    const [recentSession, setRecentSession] = useState<AdaptiveSession | null>(
        null
    )
    const [hasActiveClass, setHasActiveClass] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isStarting, setIsStarting] = useState<boolean>(false)

    const isAdminAssigned = Boolean(
        user?.preferences?.placement_test_assigned ||
            user?.preferences?.require_placement_test
    )

    useEffect(() => {
        const checkEligibility = async () => {
            try {
                const [res, classes] = await Promise.all([
                    adaptiveQuizApi.listSessions('reading', 1, 1),
                    getMyClasses().catch(() => []),
                ])
                if (Array.isArray(classes) && classes.length > 0) {
                    setHasActiveClass(true)
                }
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
            if (session && session.id) {
                navigate(`/student/adaptive-quiz/${session.id}`)
            }
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

    const isAlreadyEnrolledNotAssigned = hasActiveClass && !isAdminAssigned
    const isCooldownLocked =
        !isAdminAssigned &&
        recentSession !== null &&
        recentSession.status === 'completed'
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
                <h1
                    className={styles.title}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.625rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <span>Kiểm Tra Xếp Lớp Đầu Vào</span>
                    <AdaptiveHelpButton />
                </h1>
                <p className={styles.subtitle}>
                    Bài thi đầu vào tự động điều chỉnh độ khó câu hỏi theo từng
                    câu trả lời để xác định chuẩn xác trình độ IELTS hiện tại
                    của bạn, phục vụ xếp lớp tối ưu tại Lotus English Center.
                </p>
            </div>

            {/* Content Card */}
            <div className={styles.card}>
                {isAlreadyEnrolledNotAssigned ? (
                    <div className={styles.limitAlert}>
                        <ShieldAlertIcon size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <div className={styles.limitTitle}>
                                Bài kiểm tra này chỉ dành cho học viên mới chưa
                                xếp lớp
                            </div>
                            <p className={styles.limitText}>
                                Hiện tại bạn đã có lớp học chính thức trên hệ
                                thống và chưa có yêu cầu kiểm tra xếp lớp lại từ
                                Quản trị viên (Office Admin). Để tự đánh giá
                                trình độ và theo dõi tiến bộ định kỳ bất kỳ lúc
                                nào, vui lòng sử dụng tính năng{' '}
                                <strong>Đánh giá năng lực thích ứng</strong>.
                            </p>
                        </div>
                    </div>
                ) : isCooldownLocked ? (
                    <div className={styles.limitAlert}>
                        <ShieldAlertIcon size={24} style={{ flexShrink: 0 }} />
                        <div>
                            <div className={styles.limitTitle}>
                                Bạn đã hoàn thành bài kiểm tra xếp lớp gần đây
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
                                {daysRemaining} ngày) trừ khi được Quản trị viên
                                phân công làm lại.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={styles.rulesSection}>
                        <div className={styles.ruleBox}>
                            <div className={styles.ruleHeader}>
                                <ClockIcon
                                    size={18}
                                    color="var(--color-brand-primary, #2484b5)"
                                />
                                15–20 Phút
                            </div>
                            <p className={styles.ruleText}>
                                Số lượng câu hỏi được tối ưu tự động và hoàn
                                thành sớm ngay khi hệ thống xác định rõ trình độ
                                của bạn.
                            </p>
                        </div>

                        <div className={styles.ruleBox}>
                            <div className={styles.ruleHeader}>
                                <CheckCircleIcon
                                    size={18}
                                    color="var(--color-brand-primary, #2484b5)"
                                />
                                Đánh Giá Khách Quan
                            </div>
                            <p className={styles.ruleText}>
                                Đánh giá dựa trên mức độ khó của từng câu hỏi
                                bạn vượt qua, đo lường chính xác từ Band 3.5 đến
                                9.0.
                            </p>
                        </div>

                        <div className={styles.ruleBox}>
                            <div className={styles.ruleHeader}>
                                <CalendarIcon
                                    size={18}
                                    color="var(--color-brand-primary, #2484b5)"
                                />
                                Dành Cho Học Viên Mới
                            </div>
                            <p className={styles.ruleText}>
                                Dành cho học viên mới chưa có lớp hoặc được
                                Admin chỉ định kiểm tra để tư vấn xếp lớp phù
                                hợp.
                            </p>
                        </div>
                    </div>
                )}

                <div className={styles.actionRow}>
                    {isAlreadyEnrolledNotAssigned ? (
                        <button
                            type="button"
                            className={styles.startBtn}
                            onClick={() => navigate('/student/adaptive-quiz')}
                        >
                            Chuyển đến Đánh giá năng lực thích ứng
                            <ArrowRightIcon size={18} />
                        </button>
                    ) : isCooldownLocked && recentSession ? (
                        <button
                            type="button"
                            className={styles.startBtn}
                            onClick={() =>
                                navigate(
                                    `/student/adaptive-quiz/${recentSession.id}/result`
                                )
                            }
                        >
                            Xem lại báo cáo xếp lớp đầu vào
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
                                    Bắt đầu làm bài kiểm tra xếp lớp
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
