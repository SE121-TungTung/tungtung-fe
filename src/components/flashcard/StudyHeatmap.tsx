import { useMemo } from 'react'
import {
    format,
    subDays,
    startOfWeek,
    addDays,
    getDay,
    isSameDay,
} from 'date-fns'
import styles from './StudyHeatmap.module.css'
import type { DailyActivity } from '@/types/flashcard'

interface StudyHeatmapProps {
    data: DailyActivity[]
}

const WEEKS = 52
const DAYS_IN_WEEK = 7

function getColorLevel(count: number): number {
    if (count === 0) return 0
    if (count <= 10) return 1
    if (count <= 30) return 2
    if (count <= 50) return 3
    return 4
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
    const activityMap = useMemo(() => {
        const map = new Map<string, number>()
        data.forEach((item) => {
            // Assume date is 'YYYY-MM-DD'
            map.set(item.date, item.count)
        })
        return map
    }, [data])

    // Generate grid data for last 52 weeks (364 days)
    const gridData = useMemo(() => {
        const today = new Date()
        const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday start
        const startDate = subDays(startOfThisWeek, (WEEKS - 1) * DAYS_IN_WEEK)

        const grid: { date: Date; count: number; level: number }[][] = []
        for (let w = 0; w < WEEKS; w++) {
            const weekColumn = []
            for (let d = 0; d < DAYS_IN_WEEK; d++) {
                const currentDate = addDays(startDate, w * DAYS_IN_WEEK + d)
                // skip future days in the last week
                if (currentDate > today) {
                    weekColumn.push(null as any)
                    continue
                }
                const dateStr = format(currentDate, 'yyyy-MM-dd')
                const count = activityMap.get(dateStr) || 0
                weekColumn.push({
                    date: currentDate,
                    count,
                    level: getColorLevel(count),
                })
            }
            grid.push(weekColumn)
        }
        return grid
    }, [activityMap])

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Hoạt động ôn tập (52 tuần)</h3>

            <div className={styles.scrollArea}>
                <div className={styles.grid}>
                    <div className={styles.dayLabels}>
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    <div className={styles.weeks}>
                        {gridData.map((week, wIndex) => (
                            <div
                                key={`week-${wIndex}`}
                                className={styles.weekCol}
                            >
                                {week.map((day, dIndex) => {
                                    if (!day)
                                        return (
                                            <div
                                                key={`empty-${dIndex}`}
                                                className={styles.cellEmpty}
                                            />
                                        )

                                    return (
                                        <div
                                            key={`day-${dIndex}`}
                                            className={`${styles.cell} ${styles[`level${day.level}`]}`}
                                            title={`${day.count} thẻ vào ${format(day.date, 'dd/MM/yyyy')}`}
                                            aria-label={`${day.count} thẻ vào ngày ${format(day.date, 'dd/MM/yyyy')}`}
                                        />
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <span>Ít</span>
                <div className={styles.legend}>
                    <div className={`${styles.cell} ${styles.level0}`} />
                    <div className={`${styles.cell} ${styles.level1}`} />
                    <div className={`${styles.cell} ${styles.level2}`} />
                    <div className={`${styles.cell} ${styles.level3}`} />
                    <div className={`${styles.cell} ${styles.level4}`} />
                </div>
                <span>Nhiều</span>
            </div>
        </div>
    )
}
