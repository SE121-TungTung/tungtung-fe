import { useState } from 'react'
import styles from './QuestionBottomNav.module.css'
import { type Passage, type QuestionGroup } from '@/types/exam.types'

/**
 * Lấy nhãn hiển thị cho một nhóm câu hỏi.
 * Ví dụ: "1-5", "6"
 */
function getGroupLabel(group: QuestionGroup): string {
    if (!group.questions || group.questions.length === 0) {
        return '?'
    }
    const numbers = group.questions.map((q) => q.number)
    const min = Math.min(...numbers)
    const max = Math.max(...numbers)

    return min === max ? `${min}` : `${min}–${max}`
}

/**
 * Kiểm tra xem một nhóm câu hỏi đã được trả lời hay chưa
 * Dựa trên RHF `dirtyFields`
 */
function isGroupAttempted(
    group: QuestionGroup,
    dirtyFields: Record<string, boolean>
): boolean {
    return group.questions.some((q) => dirtyFields[q.id])
}

interface QuestionBottomNavProps {
    passages: Passage[]
    dirtyFields: Record<string, boolean> // Truyền trực tiếp `dirtyFields.questions` vào đây
    activeGroupId: string | null // Nhóm câu hỏi đang trong tầm nhìn
    onNavigate: (groupId: string) => void // Callback để cuộn đến câu hỏi
}

export function QuestionBottomNav({
    passages,
    dirtyFields,
    activeGroupId,
    onNavigate,
}: QuestionBottomNavProps) {
    const [activePartIndex, setActivePartIndex] = useState(0)

    // Lấy tất cả question groups từ tất cả passages
    // const allGroups = passages.flatMap((p) => p.questionGroups)

    return (
        <nav className={styles.navContainer}>
            {passages.map((passage, index) => {
                // Lấy groups trực tiếp từ passage
                const partGroups = passage.questionGroups

                const isPartActive = index === activePartIndex

                return (
                    <div key={passage.id} className={styles.partWrapper}>
                        <button
                            type="button"
                            className={`${styles.partButton} ${
                                isPartActive ? styles.activePart : ''
                            }`}
                            onClick={() => setActivePartIndex(index)}
                            aria-label={`Passage ${index + 1}`}
                        >
                            Part {index + 1}
                        </button>

                        {/* Chỉ hiển thị các nút câu hỏi cho Part đang active */}
                        {isPartActive && (
                            <div className={styles.questionWrapper}>
                                {partGroups.map((group: QuestionGroup) => {
                                    const label = getGroupLabel(group)
                                    const isAttempted = isGroupAttempted(
                                        group,
                                        dirtyFields
                                    )
                                    const isActive = group.id === activeGroupId

                                    return (
                                        <button
                                            type="button"
                                            key={group.id}
                                            className={`
                        ${styles.questionButton}
                        ${isActive ? styles.active : ''}
                        ${isAttempted ? styles.attempted : ''}
                      `}
                                            onClick={() => onNavigate(group.id)}
                                            aria-label={`Câu ${label} ${
                                                isAttempted
                                                    ? ' (Đã trả lời)'
                                                    : ''
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
