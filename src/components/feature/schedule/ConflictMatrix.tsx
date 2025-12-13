import { useMemo } from 'react'
import s from './ConflictMatrix.module.css'
import { format, eachDayOfInterval, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

const ALL_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

interface ConflictMatrixProps {
    title: string
    items: { id: string; name: string }[]
    startDate: string
    endDate: string
    value: Record<string, Record<string, number[]>>
    onChange: (newValue: Record<string, Record<string, number[]>>) => void
}

export default function ConflictMatrix({
    title,
    items,
    startDate,
    endDate,
    value,
    onChange,
}: ConflictMatrixProps) {
    const dates = useMemo(() => {
        if (!startDate || !endDate) return []
        try {
            return eachDayOfInterval({
                start: parseISO(startDate),
                end: parseISO(endDate),
            })
        } catch {
            return []
        }
    }, [startDate, endDate])

    // Helper: Deep copy state để tránh mutation
    const cloneValue = () => JSON.parse(JSON.stringify(value))

    const toggleCell = (itemId: string, dateStr: string) => {
        const nextValue = cloneValue()
        if (!nextValue[itemId]) nextValue[itemId] = {}

        const currentSlots = nextValue[itemId][dateStr] || []

        if (currentSlots.length > 0) {
            delete nextValue[itemId][dateStr] // Uncheck (Sẵn sàng)
        } else {
            nextValue[itemId][dateStr] = [...ALL_SLOTS] // Check (Bận)
        }
        onChange(nextValue)
    }

    const toggleColumn = (dateStr: string) => {
        // Logic: Nếu TẤT CẢ item ở cột này đều đã bị block -> Mở lại.
        // Ngược lại (có ít nhất 1 item chưa block hoặc trống) -> Block hết.
        const allBlocked = items.every((item) => {
            const slots = value[item.id]?.[dateStr] || []
            return slots.length > 0
        })

        const nextValue = cloneValue()

        items.forEach((item) => {
            if (!nextValue[item.id]) nextValue[item.id] = {}

            if (allBlocked) {
                delete nextValue[item.id][dateStr]
            } else {
                nextValue[item.id][dateStr] = [...ALL_SLOTS]
            }
        })
        onChange(nextValue)
    }

    const toggleRow = (itemId: string) => {
        const dateStrings = dates.map((d) => format(d, 'yyyy-MM-dd'))

        const allBlocked = dateStrings.every((d) => {
            const slots = value[itemId]?.[d] || []
            return slots.length > 0
        })

        const nextValue = cloneValue()
        if (!nextValue[itemId]) nextValue[itemId] = {}

        dateStrings.forEach((d) => {
            if (allBlocked) {
                delete nextValue[itemId][d]
            } else {
                nextValue[itemId][d] = [...ALL_SLOTS]
            }
        })
        onChange(nextValue)
    }

    const toggleAll = () => {
        const dateStrings = dates.map((d) => format(d, 'yyyy-MM-dd'))

        const allBlocked = items.every((item) =>
            dateStrings.every((d) => {
                const slots = value[item.id]?.[d] || []
                return slots.length > 0
            })
        )

        const nextValue = cloneValue()

        items.forEach((item) => {
            if (!nextValue[item.id]) nextValue[item.id] = {}

            dateStrings.forEach((d) => {
                if (allBlocked) {
                    delete nextValue[item.id][d]
                } else {
                    nextValue[item.id][d] = [...ALL_SLOTS]
                }
            })
        })
        onChange(nextValue)
    }

    if (items.length === 0 || dates.length === 0) {
        return (
            <div className={s.container}>
                <div className={s.emptyState}>
                    Vui lòng chọn ngày và đối tượng trước.
                </div>
            </div>
        )
    }

    return (
        <div className={s.container}>
            <div className={s.header}>
                <div className={s.title}>{title}</div>
                <div className={s.legend}>
                    <div className={s.legendItem}>
                        <div className={s.dotAvailable}></div>
                        <span>Sẵn sàng</span>
                    </div>
                    <div className={s.legendItem}>
                        <div className={s.dotBlocked}>✕</div>
                        <span>Bận (Conflict)</span>
                    </div>
                </div>
            </div>

            <div className={s.tableWrapper}>
                <table className={s.table}>
                    <thead>
                        <tr>
                            <th
                                className={s.cornerCell}
                                onClick={toggleAll}
                                title="Click để toggle toàn bộ matrix"
                            >
                                Đối tượng \ Ngày
                            </th>
                            {dates.map((date) => {
                                const dStr = format(date, 'yyyy-MM-dd')
                                return (
                                    <th
                                        key={dStr}
                                        className={s.headerCell}
                                        onClick={() => toggleColumn(dStr)}
                                        title="Click để toggle cả cột"
                                    >
                                        <div className={s.headerContent}>
                                            <span className={s.headerDate}>
                                                {format(date, 'dd/MM')}
                                            </span>
                                            <span className={s.headerDay}>
                                                {format(date, 'EEE', {
                                                    locale: vi,
                                                })}
                                            </span>
                                        </div>
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, rowIndex) => (
                            <tr key={item.id}>
                                <td
                                    className={s.firstCol}
                                    onClick={() => toggleRow(item.id)}
                                    title="Click để toggle cả hàng"
                                >
                                    {item.name}
                                </td>
                                {dates.map((date) => {
                                    const dStr = format(date, 'yyyy-MM-dd')
                                    const isBlocked =
                                        (value[item.id]?.[dStr]?.length || 0) >
                                        0

                                    return (
                                        <td
                                            key={dStr}
                                            className={`${s.cell} ${
                                                isBlocked
                                                    ? s.blocked
                                                    : s.available
                                            } ${
                                                rowIndex === items.length - 1
                                                    ? s.lastRow
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                toggleCell(item.id, dStr)
                                            }
                                        >
                                            {isBlocked ? '✕' : ''}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={s.instructions}>
                <strong>Hướng dẫn:</strong> Click vào ô để đánh dấu Bận/Sẵn sàng
                <ul>
                    <li>Click tên lớp để toggle cả hàng</li>
                    <li>Click ngày để toggle cả cột</li>
                    <li>Click góc trái trên để toggle toàn bộ</li>
                </ul>
            </div>
        </div>
    )
}
