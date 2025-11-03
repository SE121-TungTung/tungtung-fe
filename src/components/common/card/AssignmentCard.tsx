// src/components/common/card/AssignmentCard.tsx
import React from 'react'
import Card from '@/components/common/card/Card'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import s from './AssignmentCard.module.css'

import ExamIcon from '@/assets/Card Question.svg'
import HistoryIcon from '@/assets/History.svg'

export interface Assignment {
    id: string
    title: string
    dueDate: string
    type: 'quiz' | 'essay' | 'test'
    icon?: React.ReactNode
}

function AssignmentItem({ assignment }: { assignment: Assignment }) {
    const getIcon = () => {
        if (assignment.icon) return assignment.icon
        return <img src={ExamIcon} alt="assignment icon" />
    }

    return (
        <li className={s.item}>
            <div className={s.iconWrapper}>{getIcon()}</div>
            <div className={s.content}>
                <h5 className={s.title}>{assignment.title}</h5>
                <p className={s.meta}>{assignment.dueDate}</p>
            </div>
        </li>
    )
}

interface AssignmentCardProps {
    assignments: Assignment[]
    onShowOld?: () => void
}

export default function AssignmentCard({
    assignments,
    onShowOld,
}: AssignmentCardProps) {
    return (
        <Card
            title="Bài tập cần làm"
            variant="outline"
            mode="light"
            controls={
                <ButtonGhost
                    size="sm"
                    mode="light"
                    leftIcon={<img src={HistoryIcon} alt="history icon" />}
                    onClick={onShowOld}
                >
                    Bài tập cũ
                </ButtonGhost>
            }
        >
            <div className={s.cardBody}>
                {assignments.length > 0 ? (
                    <ul className={s.assignmentList}>
                        {assignments.map((asm) => (
                            <AssignmentItem key={asm.id} assignment={asm} />
                        ))}
                    </ul>
                ) : (
                    <div className={s.emptyState}>
                        Bạn đã hoàn thành tất cả bài tập.
                    </div>
                )}
            </div>
        </Card>
    )
}
