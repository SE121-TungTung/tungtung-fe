import React, { useEffect, useState } from 'react'
import { adaptiveQuizApi } from '@/lib/adaptive-quiz'
import type { CalibrationStats, QuestionIRT } from '@/types/adaptive-quiz'
import {
    CheckCircleIcon,
    XCircleIcon,
    LoaderIcon,
    SparklesIcon,
} from '@/components/feature/adaptive-quiz/AdaptiveIcons'
import styles from './CalibrationDashboardPage.module.css'

export const CalibrationDashboardPage: React.FC = () => {
    const [stats, setStats] = useState<CalibrationStats | null>(null)
    const [questions, setQuestions] = useState<QuestionIRT[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [isCalibrating, setIsCalibrating] = useState<boolean>(false)

    // Filters
    const [skillFilter, setSkillFilter] = useState<string>('')
    const [calibratedFilter, setCalibratedFilter] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [page, setPage] = useState<number>(1)

    // Edit modal
    const [selectedQuestion, setSelectedQuestion] =
        useState<QuestionIRT | null>(null)
    const [editA, setEditA] = useState<number>(1.0)
    const [editB, setEditB] = useState<number>(0.0)
    const [editC, setEditC] = useState<number>(0.2)
    const [editEligible, setEditEligible] = useState<boolean>(true)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [statsRes, questionsRes] = await Promise.all([
                adaptiveQuizApi.getCalibrationStats().catch(() => null),
                adaptiveQuizApi.listQuestions({
                    skillArea: skillFilter || undefined,
                    calibrated: calibratedFilter
                        ? calibratedFilter === 'true'
                        : undefined,
                    search: searchQuery || undefined,
                    page,
                    pageSize: 15,
                }),
            ])

            if (statsRes) setStats(statsRes)
            if (questionsRes && questionsRes.data) {
                setQuestions(questionsRes.data)
            }
        } catch (err) {
            console.error('Failed to load calibration data', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [skillFilter, calibratedFilter, searchQuery, page])

    const handleTriggerBatchCalibration = async () => {
        const confirmed = window.confirm(
            'Hệ thống sẽ chạy thuật toán EM / Joint Maximum Likelihood để hiệu chỉnh lại toàn bộ câu hỏi có tối thiểu 30 lượt làm bài. Bạn có muốn tiếp tục?'
        )
        if (!confirmed) return

        setIsCalibrating(true)
        try {
            await adaptiveQuizApi.triggerBatchCalibration(30)
            alert('Khởi chạy tiến trình hiệu chuẩn IRT thành công!')
            loadData()
        } catch (err) {
            console.error('Calibration failed', err)
            alert('Lỗi khi kích hoạt hiệu chuẩn')
        } finally {
            setIsCalibrating(false)
        }
    }

    const handleOpenEdit = (q: QuestionIRT) => {
        setSelectedQuestion(q)
        setEditA(q.irt_discrimination)
        setEditB(q.irt_difficulty)
        setEditC(q.irt_guessing)
        setEditEligible(q.is_cat_eligible)
    }

    const handleSaveEdit = async () => {
        if (!selectedQuestion) return
        setIsSaving(true)
        try {
            await adaptiveQuizApi.updateQuestionIRT(selectedQuestion.id, {
                irt_discrimination: Number(editA),
                irt_difficulty: Number(editB),
                irt_guessing: Number(editC),
                is_cat_eligible: editEligible,
            })
            setSelectedQuestion(null)
            loadData()
        } catch (err) {
            console.error('Failed to update question IRT', err)
            alert('Không thể lưu tham số IRT')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        Quản Lý Đo Lường Tâm Lý Học &amp; IRT Calibration
                    </h1>
                    <p className={styles.subtitle}>
                        Hiệu chỉnh và giám sát các thông số 3-Parameter Logistic
                        (3PL) của ngân hàng câu hỏi thích ứng CAT.
                    </p>
                </div>
                <button
                    type="button"
                    className={styles.calibrateBtn}
                    onClick={handleTriggerBatchCalibration}
                    disabled={isCalibrating}
                >
                    {isCalibrating ? (
                        <>
                            <LoaderIcon size={16} />
                            Đang chạy hiệu chuẩn...
                        </>
                    ) : (
                        <>
                            <SparklesIcon size={16} />
                            Hiệu Chuẩn Hàng Loạt (EM Batch)
                        </>
                    )}
                </button>
            </div>

            {/* Metrics Overview */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Tổng Câu Hỏi Đủ Chuẩn CAT
                        </div>
                        <div className={styles.statValue}>
                            {stats.cat_eligible_count}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Đã Hiệu Chuẩn Dữ Liệu Thực Tế
                        </div>
                        <div
                            className={styles.statValue}
                            style={{ color: '#16a34a' }}
                        >
                            {stats.calibrated_count} (
                            {((stats.calibration_rate || 0) * 100).toFixed(0)}%)
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Độ Phân Biệt Trung Bình (a)
                        </div>
                        <div
                            className={styles.statValue}
                            style={{ color: '#0284c7' }}
                        >
                            {stats.avg_discrimination.toFixed(2)}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>
                            Độ Khó Trung Bình (b)
                        </div>
                        <div
                            className={styles.statValue}
                            style={{ color: '#64748b' }}
                        >
                            {stats.avg_difficulty.toFixed(2)}
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className={styles.filterCard}>
                <div className={styles.filterGroup}>
                    <label className={styles.statLabel}>Kỹ năng:</label>
                    <select
                        className={styles.select}
                        value={skillFilter}
                        onChange={(e) => {
                            setSkillFilter(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">Tất cả kỹ năng</option>
                        <option value="reading">Reading</option>
                        <option value="listening">Listening</option>
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.statLabel}>Trạng thái:</label>
                    <select
                        className={styles.select}
                        value={calibratedFilter}
                        onChange={(e) => {
                            setCalibratedFilter(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="true">Đã hiệu chuẩn (Calibrated)</option>
                        <option value="false">Chưa hiệu chuẩn</option>
                    </select>
                </div>

                <div
                    className={styles.filterGroup}
                    style={{ flex: 1, minWidth: 200 }}
                >
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề hoặc nội dung câu hỏi..."
                        className={styles.input}
                        style={{ width: '100%' }}
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>
            </div>

            {/* Question Table */}
            <div className={styles.tableCard}>
                {isLoading ? (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '3rem',
                        }}
                    >
                        <LoaderIcon size={32} />
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Tiêu Đề Câu Hỏi</th>
                                <th>Kỹ Năng</th>
                                <th>Độ Phân Biệt (a)</th>
                                <th>Độ Khó (b)</th>
                                <th>Đoán Mò (c)</th>
                                <th>Trạng Thái</th>
                                <th>CAT Pool</th>
                                <th>Lượt Dùng</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.map((q) => (
                                <tr key={q.id}>
                                    <td
                                        style={{
                                            maxWidth: 300,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {q.title}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {q.skill_area}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>
                                            {q.irt_discrimination.toFixed(2)}
                                        </strong>
                                    </td>
                                    <td>
                                        <span>
                                            {q.irt_difficulty.toFixed(2)}
                                        </span>
                                    </td>
                                    <td>
                                        <span>{q.irt_guessing.toFixed(2)}</span>
                                    </td>
                                    <td>
                                        {q.irt_calibrated ? (
                                            <span
                                                className={
                                                    styles.calibratedBadge
                                                }
                                            >
                                                <CheckCircleIcon size={12} /> Đã
                                                hiệu chuẩn
                                            </span>
                                        ) : (
                                            <span
                                                className={
                                                    styles.uncalibratedBadge
                                                }
                                            >
                                                <XCircleIcon size={12} /> Ước
                                                lượng thô
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {q.is_cat_eligible ? (
                                            <span className={styles.catBadge}>
                                                Eligible
                                            </span>
                                        ) : (
                                            <span
                                                style={{
                                                    color: '#94a3b8',
                                                    fontSize: 12,
                                                }}
                                            >
                                                Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td>{q.usage_count}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className={styles.editBtn}
                                            onClick={() => handleOpenEdit(q)}
                                        >
                                            Hiệu chỉnh
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Modal */}
            {selectedQuestion && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>
                            Hiệu Chỉnh Tham Số IRT (3PL)
                        </h3>
                        <p className={styles.modalDesc}>
                            Câu hỏi: <strong>{selectedQuestion.title}</strong>
                        </p>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Độ phân biệt (a): Slope của đường cong [0.1 -
                                4.0]
                            </label>
                            <input
                                type="number"
                                step="0.05"
                                min="0.1"
                                max="4.0"
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={editA}
                                onChange={(e) =>
                                    setEditA(parseFloat(e.target.value))
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Độ khó (b): Vị trí trung tâm trên thang theta
                                [-4.0 - 4.0]
                            </label>
                            <input
                                type="number"
                                step="0.05"
                                min="-4.0"
                                max="4.0"
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={editB}
                                onChange={(e) =>
                                    setEditB(parseFloat(e.target.value))
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>
                                Đoán mò (c): Giới hạn dưới xác suất đoán mò [0.0
                                - 0.5]
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.0"
                                max="0.5"
                                className={styles.input}
                                style={{ width: '100%' }}
                                value={editC}
                                onChange={(e) =>
                                    setEditC(parseFloat(e.target.value))
                                }
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={editEligible}
                                    onChange={(e) =>
                                        setEditEligible(e.target.checked)
                                    }
                                />
                                <span
                                    className={styles.formLabel}
                                    style={{ margin: 0 }}
                                >
                                    Đủ điều kiện đưa vào thuật toán chọn lọc CAT
                                    (is_cat_eligible)
                                </span>
                            </label>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.editBtn}
                                onClick={() => setSelectedQuestion(null)}
                                disabled={isSaving}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className={styles.calibrateBtn}
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CalibrationDashboardPage
