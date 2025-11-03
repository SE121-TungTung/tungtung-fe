// src/components/common/card/RecentActivityCard.tsx
import React from 'react'
import Card from '@/components/common/card/Card'
import SegmentedControl, {
    type SegItem,
} from '@/components/common/menu/SegmentedControl'
import s from './RecentActivityCard.module.css'

import DocIcon from '@/assets/File.svg'

export interface Activity {
    id: string
    title: string
    timestamp: string // Ví dụ: "2 giờ trước" hoặc "Hôm qua lúc 15:30"
    type: 'assignment' | 'announcement' | 'material'
    icon?: React.ReactNode
}

function ActivityItem({ activity }: { activity: Activity }) {
    const getIcon = () => {
        if (activity.icon) return activity.icon
        // Logic để chọn icon dựa trên type
        // (Hiện tại dùng 1 icon chung)
        return <img src={DocIcon} alt="activity icon" />
    }

    return (
        <li className={s.item}>
            <div className={s.iconWrapper}>{getIcon()}</div>
            <div className={s.content}>
                <h5 className={s.title}>{activity.title}</h5>
                <p className={s.meta}>{activity.timestamp}</p>
            </div>
        </li>
    )
}

interface RecentActivityCardProps {
    activities: Activity[]
    viewMode: string
    onViewModeChange: (value: string) => void
    viewModeItems: SegItem[]
}

export default function RecentActivityCard({
    activities,
    viewMode,
    onViewModeChange,
    viewModeItems,
}: RecentActivityCardProps) {
    return (
        <Card
            title="Hoạt động gần đây"
            variant="outline"
            mode="light"
            controls={
                <SegmentedControl
                    items={viewModeItems}
                    value={viewMode}
                    onChange={onViewModeChange}
                    size="sm"
                />
            }
        >
            <div className={s.cardBody}>
                {activities.length > 0 ? (
                    <ul className={s.activityList}>
                        {activities.map((act) => (
                            <ActivityItem key={act.id} activity={act} />
                        ))}
                    </ul>
                ) : (
                    <div className={s.emptyState}>
                        Không có hoạt động nào trong{' '}
                        {viewMode === 'week' ? 'tuần' : 'tháng'} này.
                    </div>
                )}
            </div>
        </Card>
    )
}
