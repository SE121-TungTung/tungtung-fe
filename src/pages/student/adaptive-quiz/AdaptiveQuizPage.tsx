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
} from '@/components/feature/adaptive-quiz/AdaptiveIcons'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import type { AdaptiveSession, AdaptiveSkillArea } from '@/types/adaptive-quiz'
import styles from './AdaptiveQuizPage.module.css'

export const AdaptiveQuizPage: React.FC = () => {
    const navigate = useNavigate()
    const [history, setHistory] = useState<AdaptiveSession[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true)
    const [isStarting, setIsStarting] = useState<AdaptiveSkillArea | null>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await adaptiveQuizApi.listSessions(undefined, 1, 10)
                setHistory(res.data || [])
            } catch (err) {
                console.error('Failed to load adaptive quiz sessions', err)
            } finally {
                setIsLoadingHistory(false)
            }
        }
        fetchHistory()
    }, [])

    const handleStartSession = async (skill: AdaptiveSkillArea) => {
        setIsStarting(skill)
        try {
            const session = await adaptiveQuizApi.startSession(skill, 20)
            navigate(`/student/adaptive-quiz/${session.id}`)
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
                    Hệ Thống Đánh Giá Thích Ứng (CAT & IRT)
                </div>
                <h1 className={styles.heroTitle}>
                    Kiểm Tra Thích Ứng Năng Lực IELTS
                </h1>
                <p className={styles.heroSubtitle}>
                    Thuật toán Item Response Theory (3PL IRT) tối ưu hóa từng
                    câu hỏi theo thời gian thực. Xác định chuẩn xác Band điểm
                    IELTS của bạn chỉ sau 15–20 câu hỏi thay vì 40 câu truyền
                    thống.
                </p>
            </div>

            {/* Assessment Skill Cards */}
            <div className={styles.skillCardsGrid}>
                {/* Reading Card */}
                <div className={styles.skillCard}>
                    <div className={styles.cardIconHeader}>
                        <BookOpenIcon size={24} />
                    </div>
                    <div>
                        <h2 className={styles.cardTitle}>IELTS Reading CAT</h2>
                        <p className={styles.cardDescription}>
                            Đánh giá kỹ năng đọc hiểu học thuật, suy luận và
                            nhận diện thông tin qua thuật toán Fisher
                            Information.
                        </p>
                    </div>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>15–20 câu hỏi tự động thích ứng độ khó</span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>
                                Độ chính xác cao (sai số chuẩn SE &lt; 0.3)
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
                        className={styles.cardIconHeader}
                        style={{
                            background: 'rgba(13, 148, 136, 0.1)',
                            color: '#0d9488',
                        }}
                    >
                        <HeadphonesIcon size={24} />
                    </div>
                    <div>
                        <h2 className={styles.cardTitle}>
                            IELTS Listening CAT
                        </h2>
                        <p className={styles.cardDescription}>
                            Kiểm tra khả năng bắt từ, nắm bắt ý chính và phân
                            tích ngữ điệu qua ngân hàng audio thích ứng.
                        </p>
                    </div>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>Audio bản xứ chuẩn Cambridge IELTS</span>
                        </div>
                        <div className={styles.featureItem}>
                            <CheckCircleIcon
                                size={16}
                                className={styles.featureIcon}
                            />
                            <span>
                                Cập nhật mức năng lực theta sau từng câu
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
                        style={{ background: '#0d9488' }}
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
