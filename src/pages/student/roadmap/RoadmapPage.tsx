import { useMemo } from 'react'
import s from './RoadmapPage.module.css'
import { useQuery } from '@tanstack/react-query'
import { getTodayRecommendation } from '@/lib/recommendations'
import Skeleton from '@/components/effect/Skeleton'

import Card from '@/components/common/card/Card'
import {
    RoadmapStageItem,
    type RoadmapStage,
} from '@/components/feature/roadmap/RoadmapStageItem'

export default function RoadmapPage() {
    const { data: recData, isLoading: recLoading } = useQuery({
        queryKey: ['today-recommendation'],
        queryFn: () => getTodayRecommendation(),
    })

    const roadmapStages = useMemo(() => {
        if (!recData?.learning_path?.milestones) return []
        return recData.learning_path.milestones.map((m: any) => ({
            id: `milestone_${m.month}`,
            stage_order: m.month,
            title: `Tháng ${m.month}: Mục tiêu Band ${m.target_band} (${m.target_cefr})`,
            description: m.focus,
            focus_skills: [m.focus],
            status: (m.month === 1 ? 'in_progress' : 'pending') as
                | 'completed'
                | 'in_progress'
                | 'pending',
            rationale: m.rationale,
            tasks: m.tasks,
        })) as RoadmapStage[]
    }, [recData])

    return (
        <div className={s.pageWrapper}>
            {/* --- Main Content --- */}
            <main className={s.mainContent}>
                {/* Tiêu đề trang */}
                <h1 className={s.pageTitle}>
                    Lộ trình <span className={s.gradientText}>của bạn</span>
                </h1>

                {/* --- Card Lộ trình --- */}
                <Card
                    title="Lộ trình cá nhân hóa"
                    variant="flat"
                    mode="light"
                    className={s.roadmapCard}
                >
                    <div className={s.cardIntro}>
                        {recLoading ? (
                            <Skeleton height={20} width="80%" />
                        ) : (
                            <p
                                style={{
                                    fontStyle: 'italic',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                {recData?.learning_path?.narrative ||
                                    'Dựa trên kết quả học tập và các bài thi gần đây, đây là lộ trình AI đề xuất để bạn đạt được mục tiêu.'}
                            </p>
                        )}
                    </div>

                    <ul className={s.timeline}>
                        {recLoading ? (
                            <Skeleton height={80} variant="rect" count={3} />
                        ) : roadmapStages.length > 0 ? (
                            roadmapStages.map((stage) => (
                                <RoadmapStageItem
                                    key={stage.id}
                                    stage={stage}
                                />
                            ))
                        ) : (
                            <p
                                style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Chưa có lộ trình học tập được tạo. Hãy hoàn
                                thành ít nhất một bài kiểm tra để hệ thống phân
                                tích.
                            </p>
                        )}
                    </ul>
                </Card>
            </main>
        </div>
    )
}
