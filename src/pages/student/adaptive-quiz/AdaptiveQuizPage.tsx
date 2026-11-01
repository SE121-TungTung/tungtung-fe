import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    SparklesIcon,
    BookOpenIcon,
    HeadphonesIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    HistoryIcon,
    LoaderIcon,
    CalendarIcon,
    TargetIcon,
    GraduationCapIcon,
} from '@/components/feature/adaptive-quiz/AdaptiveIcons'
import { AdaptiveHelpButton } from '@/components/feature/adaptive-quiz/AdaptiveExplanationModal'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import { getMyClasses } from '@/lib/users'
import { useSession } from '@/stores/session.store'
import type { AdaptiveSession, AdaptiveSkillArea } from '@/types/adaptive-quiz'
import styles from './AdaptiveQuizPage.module.css'

export const AdaptiveQuizPage: React.FC = () => {
    const navigate = useNavigate()
    const user = useSession((state) => state.user)
    const [history, setHistory] = useState<AdaptiveSession[]>([])
    const [canTakePlacement, setCanTakePlacement] = useState<boolean>(false)
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true)
    const [isStarting, setIsStarting] = useState<AdaptiveSkillArea | null>(null)

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [res, classes] = await Promise.all([
                    adaptiveQuizApi.listSessions(undefined, 1, 10),
                    getMyClasses().catch(() => []),
                ])
                setHistory(res.data || [])
                const isAdminAssigned = Boolean(
                    user?.preferences?.placement_test_assigned ||
                        user?.preferences?.require_placement_test
                )
                const hasNoClass = !Array.isArray(classes) || classes.length === 0
                setCanTakePlacement(hasNoClass || isAdminAssigned)
            } catch (err) {
                console.error('Failed to load adaptive quiz sessions', err)
            } finally {
                setIsLoadingHistory(false)
            }
        }
        fetchInitialData()
    }, [user])

    const handleStartSession = async (skill: AdaptiveSkillArea) => {
        setIsStarting(skill)
        try {
            const session = await adaptiveQuizApi.startSession(skill, 20)
            if (session && session.id) {
                navigate(`/student/adaptive-quiz/${session.id}`)
            }
        } catch (err) {
            console.error('Failed to start session', err)
        } finally {
            setIsStarting(null)
        }
    }

    return (
        <div className={styles.container}>
            {/* Centered Hero Header as per TungTung UI Guidelines */}
            <div className={styles.hero}>
                <div className={styles.heroBadge}>
                    <SparklesIcon size={14} />
                    Hệ Thống Đánh Giá Năng Lực Thông Minh
                </div>
                <h1
                    className={styles.heroTitle}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.625rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <span>Kiểm Tra Năng Lực IELTS Thích Ứng</span>
                    <AdaptiveHelpButton />
                </h1>
                <p className={styles.heroSubtitle}>
                    Hệ thống tự động điều chỉnh độ khó từng câu hỏi theo năng
                    lực thực tế của bạn ngay trong lúc làm bài. Xác định chính
                    xác Band điểm IELTS chỉ sau 15–20 câu hỏi thay vì 40 câu
                    truyền thống.
                </p>
            </div>

            {canTakePlacement && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        padding: '1rem 1.25rem',
                        marginBottom: '1.5rem',
                        borderRadius: '12px',
                        background: 'rgba(36, 132, 181, 0.08)',
                        border: '1px solid rgba(36, 132, 181, 0.25)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                        }}
                    >
                        <GraduationCapIcon
                            size={22}
                            color="var(--color-brand-primary, #2484b5)"
                        />
                        <div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary, #0f172a)',
                                }}
                            >
                                Kiểm tra xếp lớp đầu vào dành cho học viên mới
                            </div>
                            <div
                                style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-secondary, #475569)',
                                }}
                            >
                                Bạn chưa có lớp học hoặc được học vụ chỉ định
                                kiểm tra trình độ đầu vào để xếp lớp phù hợp.
                            </div>
                        </div>
                    </div>
                    <Link
                        to="/student/placement-test"
                        className={styles.actionLink}
                        style={{ fontWeight: 600 }}
                    >
                        Làm bài kiểm tra xếp lớp
                        <ArrowRightIcon size={16} />
                    </Link>
                </div>
            )}

            {/* Assessment Skill Cards */}
            <div className={styles.skillCardsGrid}>
                {/* Reading Card */}
                <div className={styles.skillCard}>
                    <div className={styles.cardIconHeader}>
                        <BookOpenIcon size={24} />
                    </div>
                    <div>
                        <h2 className={styles.cardTitle}>
                            Đánh Giá Kỹ Năng Đọc (IELTS Reading)
                        </h2>
                        <p className={styles.cardDescription}>
                            Đánh giá khả năng đọc hiểu học thuật, suy luận và
                            nhận diện thông tin với độ khó câu hỏi tự động điều
                            chỉnh theo trình độ của bạn.
                        </p>
                    </div>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>
                                15–20 câu hỏi tự động tăng/giảm độ khó theo câu
                                trả lời
                            </span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>
                                Tự động hoàn thành sớm khi đã xác định rõ trình
                                độ
                            </span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>Thời gian trung bình: 15–20 phút</span>
                        </div>
                    </div>

                    <button
                        className={styles.startBtn}
                        onClick={() => handleStartSession('reading')}
                        disabled={isStarting !== null}
                    >
                        {isStarting === 'reading' ? (
                            <>
                                <LoaderIcon size={18} />
                                Đang khởi tạo phòng thi...
                            </>
                        ) : (
                            <>
                                Bắt đầu bài kiểm tra Reading
                                <ArrowRightIcon size={18} />
                            </>
                        )}
                    </button>
                </div>

                {/* Listening Card */}
                <div className={styles.skillCard}>
                    <div
                        className={`${styles.cardIconHeader} ${styles.cardIconListening}`}
                    >
                        <HeadphonesIcon size={24} />
                    </div>
                    <div>
                        <h2 className={styles.cardTitle}>
                            Đánh Giá Kỹ Năng Nghe (IELTS Listening)
                        </h2>
                        <p className={styles.cardDescription}>
                            Kiểm tra khả năng nghe hiểu, nắm bắt ý chính và phân
                            tích ngữ điệu qua ngân hàng bài nghe theo từng cấp
                            độ.
                        </p>
                    </div>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>Audio bản xứ chuẩn định dạng thi IELTS</span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>
                                Cập nhật ước lượng Band điểm ngay sau từng câu
                            </span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>Thời gian trung bình: 15–20 phút</span>
                        </div>
                    </div>

                    <button
                        className={`${styles.startBtn} ${styles.startBtnListening}`}
                        onClick={() => handleStartSession('listening')}
                        disabled={isStarting !== null}
                    >
                        {isStarting === 'listening' ? (
                            <>
                                <LoaderIcon size={18} />
                                Đang khởi tạo phòng thi...
                            </>
                        ) : (
                            <>
                                Bắt đầu bài kiểm tra Listening
                                <ArrowRightIcon size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Test History Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <HistoryIcon size={20} />
                        Lịch Sử Đánh Giá Năng Lực
                    </h2>
                </div>

                <div className={styles.historyTableCard}>
                    {isLoadingHistory ? (
                        <div className={styles.emptyState}>
                            <LoaderIcon size={24} />
                            <span>Đang tải lịch sử bài thi...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className={styles.emptyState}>
                            <TargetIcon size={32} />
                            <p>
                                Bạn chưa thực hiện bài kiểm tra thích ứng nào.
                            </p>
                            <span>
                                Chọn một kỹ năng ở trên để bắt đầu đánh giá năng
                                lực đầu tiên của bạn!
                            </span>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Kỹ Năng</th>
                                    <th>Ngày Thi</th>
                                    <th>Số Câu Đã Làm</th>
                                    <th>Trạng Thái</th>
                                    <th>Ước Lượng Band</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize',
                                                }}
                                            >
                                                {s.skill_area}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.375rem',
                                                }}
                                            >
                                                <CalendarIcon size={14} />
                                                {new Date(
                                                    s.started_at
                                                ).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td>
                                            {s.items_administered} /{' '}
                                            {s.max_items} câu
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.statusPill} ${
                                                    s.status === 'completed'
                                                        ? styles.statusCompleted
                                                        : styles.statusInProgress
                                                }`}
                                            >
                                                {s.status === 'completed'
                                                    ? 'Hoàn thành'
                                                    : 'Đang làm dở'}
                                            </span>
                                        </td>
                                        <td>
                                            {s.estimated_band ? (
                                                <span
                                                    className={styles.bandBadge}
                                                >
                                                    Band{' '}
                                                    {s.estimated_band.toFixed(
                                                        1
                                                    )}
                                                </span>
                                            ) : (
                                                '--'
                                            )}
                                        </td>
                                        <td>
                                            {s.status === 'in_progress' ? (
                                                <Link
                                                    to={`/student/adaptive-quiz/${s.id}`}
                                                    className={
                                                        styles.actionLink
                                                    }
                                                >
                                                    Tiếp tục làm
                                                    <ArrowRightIcon size={14} />
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/student/adaptive-quiz/${s.id}/result`}
                                                    className={
                                                        styles.actionLink
                                                    }
                                                >
                                                    Xem báo cáo
                                                    <ArrowRightIcon size={14} />
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdaptiveQuizPage
