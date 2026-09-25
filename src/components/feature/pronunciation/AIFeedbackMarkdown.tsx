import React, { useMemo } from 'react'
import {
    CheckCircleIcon,
    AlertTriangleIcon,
    SparklesIcon,
    MicIcon,
    TargetIcon,
    ZapIcon,
    BookOpenIcon,
    FlameIcon,
} from './PronunciationIcons'
import s from './AIFeedbackMarkdown.module.css'

interface AIFeedbackMarkdownProps {
    content: string
}

interface ParsedFeedbackItem {
    id: string
    title: string
    status: 'pass' | 'warning' | 'info'
    scoreText?: string
    feedback: string
}

export const AIFeedbackMarkdown: React.FC<AIFeedbackMarkdownProps> = ({
    content,
}) => {
    // Phân tích chuỗi nhận xét thành các mục đánh giá thành phần riêng biệt
    const items: ParsedFeedbackItem[] = useMemo(() => {
        if (!content) return []

        const cleaned = content
            .replace(/✅/g, '[Đạt]')
            .replace(/❌/g, '[Chưa đạt]')

        const lines = cleaned
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean)

        return lines.map((line, idx) => {
            // Regex khớp: **Tiêu đề** [Điểm]: Nội dung nhận xét
            const match = line.match(
                /^\*{0,2}(.*?)\*{0,2}\s*(\[(\d+\/100|Đạt|Chưa đạt)\])?:\s*(.*)$/
            )

            if (match) {
                const title = match[1].replace(/\*/g, '').trim()
                const scoreTag = match[3] || ''
                const feedback = match[4].trim()

                let status: 'pass' | 'warning' | 'info' = 'info'
                if (scoreTag === 'Đạt' || scoreTag === '100/100') {
                    status = 'pass'
                } else if (scoreTag) {
                    status = 'warning'
                }

                return {
                    id: `fb_${idx}`,
                    title: title || 'Đánh giá chung',
                    status,
                    scoreText: scoreTag ? `[${scoreTag}]` : undefined,
                    feedback: feedback || line,
                }
            }

            return {
                id: `fb_${idx}`,
                title: 'Nhận xét chi tiết',
                status: 'info',
                feedback: line.replace(/\*\*/g, ''),
            }
        })
    }, [content])

    // Lựa chọn icon phù hợp cho từng thành phần
    const getComponentIcon = (title: string) => {
        const lower = title.toLowerCase()
        if (lower.includes('âm vị') || lower.includes('âm')) {
            return <MicIcon size={16} />
        }
        if (lower.includes('trọng âm')) {
            return <TargetIcon size={16} />
        }
        if (lower.includes('nối âm') || lower.includes('liên kết')) {
            return <ZapIcon size={16} />
        }
        if (lower.includes('từ rút gọn') || lower.includes('rút gọn')) {
            return <BookOpenIcon size={16} />
        }
        if (lower.includes('ngữ điệu') || lower.includes('chia đoạn')) {
            return <FlameIcon size={16} />
        }
        return <SparklesIcon size={16} />
    }

    if (!content || items.length === 0) {
        return null
    }

    return (
        <div className={s.aiFeedbackCard}>
            <div className={s.cardHeader}>
                <div className={s.headerTitleGroup}>
                    <span className={s.coachBadge}>
                        <SparklesIcon size={14} />
                        <span>AI IELTS Speech Coach</span>
                    </span>
                    <h3 className={s.cardTitle}>
                        Nhận xét & Lời khuyên cải thiện
                    </h3>
                </div>
            </div>

            <div className={s.feedbackList}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`${s.feedbackItem} ${
                            item.status === 'pass'
                                ? s.statusPass
                                : item.status === 'warning'
                                  ? s.statusWarning
                                  : s.statusInfo
                        }`}
                    >
                        <div className={s.itemHeader}>
                            <div className={s.titleWithIcon}>
                                <span className={s.componentIcon}>
                                    {getComponentIcon(item.title)}
                                </span>
                                <strong className={s.itemTitle}>
                                    {item.title}
                                </strong>
                            </div>

                            {item.scoreText && (
                                <span
                                    className={`${s.statusBadge} ${
                                        item.status === 'pass'
                                            ? s.badgePass
                                            : s.badgeWarning
                                    }`}
                                >
                                    {item.status === 'pass' ? (
                                        <>
                                            <CheckCircleIcon size={13} />
                                            <span>Đạt chuẩn</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangleIcon size={13} />
                                            <span>{item.scoreText}</span>
                                        </>
                                    )}
                                </span>
                            )}
                        </div>

                        <div className={s.itemBody}>
                            <p className={s.feedbackText}>{item.feedback}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={s.coachTipFooter}>
                <SparklesIcon size={15} className={s.tipFooterIcon} />
                <span>
                    <strong>Mẹo cải thiện:</strong> Hãy nghe lại phát âm mẫu bản
                    xứ ở trên và tập nói theo từng âm trước khi ghi âm lại.
                </span>
            </div>
        </div>
    )
}
