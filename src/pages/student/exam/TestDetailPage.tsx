import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import s from './TestDetailPage.module.css'

import Card from '@/components/common/card/Card'
import CollapsibleCard from '@/components/common/card/CollapsibleCard'
import ButtonGhost from '@/components/common/button/ButtonGhost'

import {
    testApi,
    getSkillAreaLabel,
    getDifficultyInfo,
    getQuestionTypeLabel,
} from '@/lib/test'
import type {
    TestAttemptSummaryResponse,
    TestTeacher,
} from '@/types/test.types'
import { TestStatus, QuestionType } from '@/types/test.types'
import Skeleton from '@/components/effect/Skeleton'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { useDialog } from '@/hooks/useDialog'

export default function TestDetailPage() {
    const { testId } = useParams<{ testId: string }>()
    const navigate = useNavigate()

    const { alert, confirm } = useDialog()

    const [test, setTest] = useState<TestTeacher | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [attempts, setAttempts] = useState<TestAttemptSummaryResponse[]>([])
    const [loadingAttempts, setLoadingAttempts] = useState(true)

    const pendingCount = attempts.filter((a) => a.status === 'submitted').length
    const totalCount = attempts.length

    const [isPublishing, setIsPublishing] = useState(false)
    const handlePublish = async () => {
        if (
            !confirm(
                'Bạn có chắc muốn xuất bản bài thi này? Học sinh sẽ có thể thấy và làm bài.'
            )
        ) {
            return
        }

        setIsPublishing(true)
        try {
            await testApi.publishTest(testId!)
            alert('Đã xuất bản bài thi thành công!')
            await loadTest()
        } catch (error: any) {
            console.error('Failed to publish test:', error)
            alert('Xuất bản thất bại: ' + (error.message || 'Vui lòng thử lại'))
        } finally {
            setIsPublishing(false)
        }
    }

    const handleGrading = () => {
        navigate(`/teacher/grading/${testId}`)
    }

    const loadTest = useCallback(async () => {
        if (!testId) return

        setLoading(true)
        setError(null)
        try {
            const data = await testApi.getTestTeacher(testId)
            setTest(data)
        } catch (err: any) {
            console.error('Failed to load test:', err)
            setError(err.message || 'Không thể tải bài thi')
        } finally {
            setLoading(false)
        }
    }, [testId])

    const loadAttempts = useCallback(async () => {
        if (!testId) return

        try {
            setLoadingAttempts(true)
            const data = await testApi.listTestAttemptsForTeacher(testId)
            setAttempts(data)
        } catch (error: any) {
            console.error('Failed to load attempts:', error)
        } finally {
            setLoadingAttempts(false)
        }
    }, [testId])

    useEffect(() => {
        if (testId) {
            loadTest()
            loadAttempts()
        }
    }, [testId, loadTest, loadAttempts])

    const getStatusBadge = (status: TestStatus) => {
        const statusConfig = {
            [TestStatus.DRAFT]: {
                label: 'Nháp',
                color: 'var(--status-neutral-500-light)',
            },
            [TestStatus.PUBLISHED]: {
                label: 'Đã xuất bản',
                color: 'var(--status-success-500-dark)',
            },
            [TestStatus.ACTIVE]: {
                label: 'Đang hoạt động',
                color: 'var(--status-info-500-light)',
            },
            [TestStatus.CLOSED]: {
                label: 'Đã đóng',
                color: 'var(--status-warning-500-light)',
            },
            [TestStatus.ARCHIVED]: {
                label: 'Đã lưu trữ',
                color: 'var(--text-secondary-light)',
            },
        }
        const config = statusConfig[status] || statusConfig[TestStatus.DRAFT]
        return (
            <span className={s.badge} style={{ background: config.color }}>
                {config.label}
            </span>
        )
    }

    const getSkillBadge = (skill: string) => {
        return (
            <span className={s.skillBadge}>
                {getSkillAreaLabel(skill as any)}
            </span>
        )
    }

    const getDifficultyBadge = (difficulty: string | null) => {
        if (!difficulty) return null
        const info = getDifficultyInfo(difficulty as any)
        return (
            <span
                className={s.difficultyBadge}
                style={{
                    background: `var(--color-${info.color}-100)`,
                    color: `var(--color-${info.color}-700)`,
                }}
            >
                {info.label}
            </span>
        )
    }

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Không giới hạn'
        return new Date(dateString).toLocaleString('vi-VN')
    }

    if (loading) {
        return (
            <div className={s.pageWrapperWithoutHeader}>
                <div className={s.pageHeader}>
                    <div
                        style={{
                            display: 'flex',
                            gap: 16,
                            alignItems: 'center',
                        }}
                    >
                        <Skeleton width={300} height={40} />
                        <Skeleton width={100} height={30} />
                    </div>
                    <Skeleton
                        variant="text"
                        width="60%"
                        style={{ marginTop: 16 }}
                    />
                </div>

                <div className={s.overviewGrid}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={s.overviewItem}>
                            <Skeleton variant="text" width={80} />
                            <Skeleton height={28} width={120} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error || !test) {
        return (
            <div className={s.pageWrapperuWithoutHeader}>
                <div className={s.errorContainer}>
                    <p className={s.errorMessage}>
                        ❌ {error || 'Không tìm thấy bài thi'}
                    </p>
                    <ButtonGhost onClick={() => navigate('/teacher/tests')}>
                        Quay lại danh sách
                    </ButtonGhost>
                </div>
            </div>
        )
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                {/* HEADER SECTION */}
                <div className={s.pageHeader}>
                    <div className={s.titleRow}>
                        <h1 className={s.pageTitle}>{test.title}</h1>
                        {getStatusBadge(test.status)}
                    </div>
                    {test.description && (
                        <p className={s.description}>{test.description}</p>
                    )}
                    <div className={s.actionBar}>
                        <ButtonGhost onClick={() => navigate('/teacher/tests')}>
                            ← Quay lại
                        </ButtonGhost>
                        <div className={s.actions}>
                            <ButtonPrimary
                                onClick={() =>
                                    navigate(`/teacher/tests/${testId}/edit`)
                                }
                            >
                                Chỉnh sửa
                            </ButtonPrimary>

                            {test.status === TestStatus.DRAFT && (
                                <ButtonPrimary
                                    onClick={handlePublish}
                                    loading={isPublishing}
                                    disabled={isPublishing}
                                    variant="gradient"
                                >
                                    Xuất bản
                                </ButtonPrimary>
                            )}

                            {totalCount > 0 && (
                                <ButtonPrimary
                                    onClick={handleGrading}
                                    variant="outline"
                                >
                                    Chấm điểm
                                    {pendingCount > 0 && ` (${pendingCount})`}
                                </ButtonPrimary>
                            )}
                        </div>
                    </div>
                </div>

                {test.status === TestStatus.DRAFT && (
                    <Card
                        variant="outline"
                        style={{
                            background:
                                'linear-gradient(135deg, #fff3cd 0%, #fff9e6 100%)',
                            border: '2px solid #ffc107',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '8px',
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: '#856404',
                                    }}
                                >
                                    Bài thi đang ở trạng thái Nháp
                                </h3>
                                <p
                                    style={{
                                        margin: '6px 0 0',
                                        fontSize: '14px',
                                        color: '#856404',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    Học sinh chưa thể thấy bài thi này. Nhấn nút{' '}
                                    <strong>"Xuất bản"</strong> phía trên để
                                    công khai bài thi cho học sinh.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ATTEMPTS STATS CARD */}
                {!loadingAttempts && totalCount > 0 && (
                    <Card title="📊 Thống kê bài làm" variant="outline">
                        <div className={s.statsGrid}>
                            <div className={s.statCard}>
                                <span className={s.statValue}>
                                    {totalCount}
                                </span>
                                <span className={s.statLabel}>
                                    Tổng bài nộp
                                </span>
                            </div>

                            <div className={s.statCard}>
                                <span className={`${s.statValue} ${s.pending}`}>
                                    {pendingCount}
                                </span>
                                <span className={s.statLabel}>Chờ chấm</span>
                            </div>

                            <div className={s.statCard}>
                                <span className={`${s.statValue} ${s.graded}`}>
                                    {
                                        attempts.filter(
                                            (a) => a.status === 'graded'
                                        ).length
                                    }
                                </span>
                                <span className={s.statLabel}>Đã chấm</span>
                            </div>

                            <div className={s.statCard}>
                                <span
                                    className={`${s.statValue} ${s.inProgress}`}
                                >
                                    {
                                        attempts.filter(
                                            (a) => a.status === 'in_progress'
                                        ).length
                                    }
                                </span>
                                <span className={s.statLabel}>Đang làm</span>
                            </div>
                        </div>

                        {pendingCount > 0 && (
                            <div className={s.pendingAlert}>
                                <span className={s.alertIcon}>🔔</span>
                                <span className={s.alertText}>
                                    Có <strong>{pendingCount}</strong> bài đang
                                    chờ chấm điểm
                                </span>
                                <ButtonPrimary
                                    size="sm"
                                    onClick={handleGrading}
                                >
                                    Chấm ngay →
                                </ButtonPrimary>
                            </div>
                        )}
                    </Card>
                )}

                {/* OVERVIEW CARD */}
                <Card title="Tổng quan" variant="outline">
                    <div className={s.overviewGrid}>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>
                                Loại bài thi
                            </span>
                            <span className={s.overviewValue}>
                                {test.testType
                                    ?.replace(/_/g, ' ')
                                    .replace(/\b\w/g, (c) => c.toUpperCase()) ||
                                    'Standard'}
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>Thời gian</span>
                            <span className={s.overviewValue}>
                                {test.timeLimitMinutes
                                    ? `${test.timeLimitMinutes} phút`
                                    : 'Không giới hạn'}
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>Tổng điểm</span>
                            <span className={s.overviewValue}>
                                {test.totalPoints}
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>Điểm đạt</span>
                            <span className={s.overviewValue}>
                                {test.passingScore}%
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>Số lần làm</span>
                            <span className={s.overviewValue}>
                                {test.maxAttempts}
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>
                                Xáo trộn câu hỏi
                            </span>
                            <span className={s.overviewValue}>
                                {test.randomizeQuestions ? '✓ Có' : '✗ Không'}
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>
                                Hiển thị kết quả
                            </span>
                            <span className={s.overviewValue}>
                                {test.showResultsImmediately
                                    ? '✓ Ngay lập tức'
                                    : '✗ Sau khi chấm'}
                            </span>
                        </div>
                        <div className={s.overviewItem}>
                            <span className={s.overviewLabel}>Chấm AI</span>
                            <span className={s.overviewValue}>
                                {test.aiGradingEnabled ? '✓ Bật' : '✗ Tắt'}
                            </span>
                        </div>
                        {test.startTime && (
                            <div className={s.overviewItem}>
                                <span className={s.overviewLabel}>
                                    Thời gian mở
                                </span>
                                <span className={s.overviewValue}>
                                    {formatDateTime(test.startTime)}
                                </span>
                            </div>
                        )}
                        {test.endTime && (
                            <div className={s.overviewItem}>
                                <span className={s.overviewLabel}>
                                    Thời gian đóng
                                </span>
                                <span className={s.overviewValue}>
                                    {formatDateTime(test.endTime)}
                                </span>
                            </div>
                        )}
                    </div>

                    {test.instructions && (
                        <div className={s.instructionsSection}>
                            <h3 className={s.sectionSubtitle}>
                                Hướng dẫn chung
                            </h3>
                            <div className={s.instructionsContent}>
                                {test.instructions}
                            </div>
                        </div>
                    )}
                </Card>

                {/* SECTIONS */}
                <div className={s.sectionsContainer}>
                    <h2 className={s.contentTitle}>Nội dung bài thi</h2>
                    {test.sections.map((section, sIdx) => (
                        <CollapsibleCard
                            key={section.id}
                            level="section"
                            title={`Section ${sIdx + 1}: ${section.name}`}
                            defaultOpen={sIdx === 0}
                        >
                            <div className={s.sectionHeader}>
                                {section.skillArea &&
                                    getSkillBadge(section.skillArea)}
                                {section.timeLimitMinutes && (
                                    <span className={s.timeBadge}>
                                        ⏱️ {section.timeLimitMinutes} phút
                                    </span>
                                )}
                            </div>

                            {section.instructions && (
                                <div className={s.sectionInstructions}>
                                    <strong>Hướng dẫn:</strong>{' '}
                                    {section.instructions}
                                </div>
                            )}

                            {/* PARTS */}
                            {section.parts.map((part, pIdx) => (
                                <CollapsibleCard
                                    key={part.id}
                                    level="part"
                                    title={`Part ${pIdx + 1}: ${part.name}`}
                                    defaultOpen={pIdx === 0}
                                >
                                    {/* PASSAGE */}
                                    {part.passage && (
                                        <div className={s.passageSection}>
                                            <h4 className={s.passageTitle}>
                                                📄 {part.passage.title}
                                            </h4>
                                            {part.passage.audioUrl && (
                                                <div className={s.audioPlayer}>
                                                    <audio
                                                        controls
                                                        src={
                                                            part.passage
                                                                .audioUrl
                                                        }
                                                    />
                                                </div>
                                            )}
                                            {part.passage.imageUrl && (
                                                <img
                                                    src={part.passage.imageUrl}
                                                    alt={part.passage.title}
                                                    className={s.passageImage}
                                                />
                                            )}
                                            {part.passage.textContent && (
                                                <div
                                                    className={s.passageContent}
                                                >
                                                    {part.passage.textContent}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {part.instructions && (
                                        <div className={s.partInstructions}>
                                            <strong>Hướng dẫn:</strong>{' '}
                                            {part.instructions}
                                        </div>
                                    )}

                                    {/* QUESTION GROUPS */}
                                    {part.questionGroups.map((group, gIdx) => (
                                        <CollapsibleCard
                                            key={group.id}
                                            level="group"
                                            title={group.name}
                                            defaultOpen={gIdx === 0}
                                        >
                                            <div className={s.groupHeader}>
                                                <span
                                                    className={
                                                        s.questionTypeBadge
                                                    }
                                                >
                                                    {getQuestionTypeLabel(
                                                        group.questionType as QuestionType
                                                    )}
                                                </span>
                                            </div>

                                            {group.instructions && (
                                                <div
                                                    className={
                                                        s.groupInstructions
                                                    }
                                                >
                                                    {group.instructions}
                                                </div>
                                            )}

                                            {group.imageUrl && (
                                                <img
                                                    src={group.imageUrl}
                                                    alt={group.name}
                                                    className={s.groupImage}
                                                />
                                            )}

                                            {/* QUESTIONS */}
                                            <div className={s.questionsList}>
                                                {group.questions.map(
                                                    (q, qIdx) => (
                                                        <div
                                                            key={q.id}
                                                            className={
                                                                s.questionItem
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    s.questionHeader
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        s.questionNumber
                                                                    }
                                                                >
                                                                    Câu{' '}
                                                                    {qIdx + 1}
                                                                </span>
                                                                <span
                                                                    className={
                                                                        s.questionPoints
                                                                    }
                                                                >
                                                                    {q.points}{' '}
                                                                    điểm
                                                                </span>
                                                            </div>

                                                            <div
                                                                className={
                                                                    s.questionText
                                                                }
                                                            >
                                                                {q.questionText}
                                                            </div>

                                                            {q.imageUrl && (
                                                                <img
                                                                    src={
                                                                        q.imageUrl
                                                                    }
                                                                    alt="Question"
                                                                    className={
                                                                        s.questionImage
                                                                    }
                                                                />
                                                            )}

                                                            {q.audioUrl && (
                                                                <audio
                                                                    controls
                                                                    src={
                                                                        q.audioUrl
                                                                    }
                                                                    className={
                                                                        s.questionAudio
                                                                    }
                                                                />
                                                            )}

                                                            {q.options &&
                                                                q.options
                                                                    .length >
                                                                    0 && (
                                                                    <div
                                                                        className={
                                                                            s.optionsList
                                                                        }
                                                                    >
                                                                        {q.options.map(
                                                                            (
                                                                                opt
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        opt.key
                                                                                    }
                                                                                    className={`${s.optionItem} ${opt.isCorrect ? s.correctOption : ''}`}
                                                                                >
                                                                                    <span
                                                                                        className={
                                                                                            s.optionKey
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            opt.key
                                                                                        }

                                                                                        .
                                                                                    </span>
                                                                                    <span
                                                                                        className={
                                                                                            s.optionText
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            opt.text
                                                                                        }
                                                                                    </span>
                                                                                    {opt.isCorrect && (
                                                                                        <span
                                                                                            className={
                                                                                                s.correctMark
                                                                                            }
                                                                                        >
                                                                                            ✓
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                )}

                                                            {q.correctAnswer &&
                                                                !q.options && (
                                                                    <div
                                                                        className={
                                                                            s.answerBox
                                                                        }
                                                                    >
                                                                        <strong>
                                                                            Đáp
                                                                            án:
                                                                        </strong>{' '}
                                                                        {
                                                                            q.correctAnswer
                                                                        }
                                                                    </div>
                                                                )}

                                                            {q.explanation && (
                                                                <div
                                                                    className={
                                                                        s.explanationBox
                                                                    }
                                                                >
                                                                    <strong>
                                                                        Giải
                                                                        thích:
                                                                    </strong>{' '}
                                                                    {
                                                                        q.explanation
                                                                    }
                                                                </div>
                                                            )}

                                                            <div
                                                                className={
                                                                    s.questionMeta
                                                                }
                                                            >
                                                                {q.difficultyLevel &&
                                                                    getDifficultyBadge(
                                                                        q.difficultyLevel
                                                                    )}
                                                                {q.tags &&
                                                                    q.tags
                                                                        .length >
                                                                        0 && (
                                                                        <div
                                                                            className={
                                                                                s.tagsList
                                                                            }
                                                                        >
                                                                            {q.tags.map(
                                                                                (
                                                                                    tag
                                                                                ) => (
                                                                                    <span
                                                                                        key={
                                                                                            tag
                                                                                        }
                                                                                        className={
                                                                                            s.tag
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            tag
                                                                                        }
                                                                                    </span>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </CollapsibleCard>
                                    ))}
                                </CollapsibleCard>
                            ))}
                        </CollapsibleCard>
                    ))}
                </div>

                {/* METADATA */}
                <Card title="Thông tin hệ thống" variant="outline">
                    <div className={s.metadataGrid}>
                        <div className={s.metadataItem}>
                            <span className={s.metadataLabel}>ID</span>
                            <span className={s.metadataValue}>{test.id}</span>
                        </div>
                        <div className={s.metadataItem}>
                            <span className={s.metadataLabel}>Ngày tạo</span>
                            <span className={s.metadataValue}>
                                {test.createdAt
                                    ? formatDateTime(test.createdAt)
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className={s.metadataItem}>
                            <span className={s.metadataLabel}>
                                Cập nhật lần cuối
                            </span>
                            <span className={s.metadataValue}>
                                {test.updatedAt
                                    ? formatDateTime(test.updatedAt)
                                    : 'N/A'}
                            </span>
                        </div>
                        {test.classId && (
                            <div className={s.metadataItem}>
                                <span className={s.metadataLabel}>
                                    Class ID
                                </span>
                                <span className={s.metadataValue}>
                                    {test.classId}
                                </span>
                            </div>
                        )}
                        {test.courseId && (
                            <div className={s.metadataItem}>
                                <span className={s.metadataLabel}>
                                    Course ID
                                </span>
                                <span className={s.metadataValue}>
                                    {test.courseId}
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    )
}
