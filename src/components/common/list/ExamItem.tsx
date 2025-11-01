import React from 'react'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import s from './ExamItem.module.css'

import ExamIcon from '@/assets/Card Question.svg'
import ClockIcon from '@/assets/History.svg'
import QuestionIcon from '@/assets/Card Question.svg'

export interface ExamInfo {
    id: string
    title: string
    skill?: 'listening' | 'reading' | 'writing' | 'speaking' | 'full'
    durationMinutes: number
    questionCount: number
    icon?: React.ReactNode
}

interface ExamItemProps {
    exam: ExamInfo
    onStartClick: (examId: string) => void
}

export default function ExamItem({ exam, onStartClick }: ExamItemProps) {
    const getIcon = () => {
        if (exam.icon) return exam.icon
        // TODO: Có thể thêm logic chọn icon dựa trên skill
        return <img src={ExamIcon} alt="exam icon" />
    }

    return (
        <li className={s.item}>
            <div className={s.iconWrapper}>{getIcon()}</div>
            <div className={s.content}>
                <h5 className={s.title}>{exam.title}</h5>
                <p className={s.meta}>
                    <span>
                        <img src={ClockIcon} alt="duration" />{' '}
                        {exam.durationMinutes} phút
                    </span>
                    <span>
                        <img src={QuestionIcon} alt="questions" />{' '}
                        {exam.questionCount} câu
                    </span>
                    {/* Có thể thêm thông tin khác như độ khó */}
                </p>
            </div>
            <div className={s.actions}>
                <ButtonPrimary
                    size="md"
                    variant="subtle"
                    shape="rounded"
                    onClick={() => onStartClick(exam.id)}
                >
                    Bắt đầu
                </ButtonPrimary>
            </div>
        </li>
    )
}
