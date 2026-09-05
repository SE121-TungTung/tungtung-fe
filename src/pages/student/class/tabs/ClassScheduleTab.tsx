import { useState } from 'react'
import s from '../Class.module.css'
import ScheduleTodayCard from '@/components/common/card/ScheduleToday'
import SessionList from '../SessionList'
import SegmentedControl, {
    type SegItem,
} from '@/components/common/menu/SegmentedControl'
import type { Lesson } from '@/components/common/typography/LessonItem'

interface ClassScheduleTabProps {
    todaySessions: Lesson[]
    allSessions: Lesson[]
    onOpenQrScanner: () => void
    onCheckInToday: () => void
}

const viewModeItems: SegItem[] = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
]

export default function ClassScheduleTab({
    todaySessions,
    allSessions,
    onOpenQrScanner,
    onCheckInToday,
}: ClassScheduleTabProps) {
    const [viewMode, setViewMode] = useState('week')

    return (
        <div className={s.grid}>
            <ScheduleTodayCard
                title="Lịch học hôm nay"
                sessions={todaySessions}
                onCheckIn={onCheckInToday}
                controls={
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                        }}
                    >
                        <button
                            onClick={onOpenQrScanner}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                background:
                                    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                            }}
                        >
                            Quét QR tự điểm danh
                        </button>
                        <SegmentedControl
                            items={viewModeItems}
                            value={viewMode}
                            onChange={setViewMode}
                            size="sm"
                        />
                    </div>
                }
            />
            <SessionList sessions={allSessions} />
        </div>
    )
}
