import React from 'react'
import s from './TestHistoryItem.module.css'
// import type { TestAttempt } from '@/types/exam.types'
import ButtonGhost from '@/components/common/button/ButtonGhost'

import ExamIcon from '@/assets/Card Question.svg'
import CalendarIcon from '@/assets/Calendar.svg'
import ScoreIcon from '@/assets/Action Favourite 3.svg'

// Định nghĩa kiểu dữ liệu (bạn nên chuyển vào file types chung)
// Dựa trên bảng 4.1 test_attempts
export interface TestAttempt {
    id: string
    test_title: string // Giả sử chúng ta join để lấy tên
    completed_at: string // (new Date()).toISOString()
    scores: {
        listening: number
        reading: number
        writing: number
        speaking: number
        overall: number
    }
}

interface TestHistoryItemProps {
    attempt: TestAttempt
    onViewDetails: (id: string) => void
}

export const TestHistoryItem: React.FC<TestHistoryItemProps> = ({
    attempt,
    onViewDetails,
}) => {
    const formattedDate = new Date(attempt.completed_at).toLocaleDateString(
        'vi-VN',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }
    )

    return (
        <li className={s.item}>
            <div className={s.iconWrapper}>
                <img src={ExamIcon} alt="Exam" />
            </div>
            <div className={s.content}>
                <h5 className={s.title}>{attempt.test_title}</h5>
                <div className={s.meta}>
                    <span>
                        <img src={CalendarIcon} alt="Date" />
                        {formattedDate}
                    </span>
                    <span>
                        <img src={ScoreIcon} alt="Score" />
                        Overall:{' '}
                        <strong>{attempt.scores.overall.toFixed(1)}</strong>
                    </span>
                </div>
            </div>
            <div className={s.actions}>
                <ButtonGhost
                    size="sm"
                    mode="light"
                    onClick={() => onViewDetails(attempt.id)}
                >
                    Xem chi tiết
                </ButtonGhost>
            </div>
        </li>
    )
}
