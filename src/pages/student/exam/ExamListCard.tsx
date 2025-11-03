import Card from '@/components/common/card/Card'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import ExamItem, { type ExamInfo } from '@/components/common/list/ExamItem'
import s from './ExamListCard.module.css'

import BackIcon from '@/assets/arrow-left.svg'

interface ExamListCardProps {
    title: string
    exams: ExamInfo[]
    onBackClick?: () => void
    onStartExam: (examId: string) => void
    isLoading?: boolean
}

export default function ExamListCard({
    title,
    exams,
    onBackClick,
    onStartExam,
    isLoading = false,
}: ExamListCardProps) {
    const backButton = onBackClick ? (
        <ButtonGhost
            size="sm"
            mode="light"
            leftIcon={<img src={BackIcon} alt="back" />}
            onClick={onBackClick}
        >
            Quay lại
        </ButtonGhost>
    ) : null

    return (
        <Card
            title={title}
            variant="outline"
            mode="light"
            controls={backButton}
        >
            <div className={s.cardBody}>
                {/* TODO: Thêm trạng thái Loading */}
                {isLoading ? (
                    <div className={s.emptyState}>Đang tải danh sách...</div>
                ) : exams.length > 0 ? (
                    <ul className={s.examList}>
                        {exams.map((exam) => (
                            <ExamItem
                                key={exam.id}
                                exam={exam}
                                onStartClick={onStartExam}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className={s.emptyState}>
                        Không tìm thấy bài thi nào phù hợp.
                    </div>
                )}
            </div>
        </Card>
    )
}
