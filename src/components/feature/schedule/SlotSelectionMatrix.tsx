import React from 'react'
import styles from './SlotSelectionMatrix.module.css'

const DAYS = [
    { value: 'monday', label: 'T2' },
    { value: 'tuesday', label: 'T3' },
    { value: 'wednesday', label: 'T4' },
    { value: 'thursday', label: 'T5' },
    { value: 'friday', label: 'T6' },
    { value: 'saturday', label: 'T7' },
    { value: 'sunday', label: 'CN' },
]

const SLOTS = [1, 2, 3, 4, 5, 6]

type SlotConfig = { day: string; slots: number[] }

interface Props {
    value?: SlotConfig[]
    onChange?: (value: SlotConfig[]) => void
    readOnly?: boolean
}

export const SlotSelectionMatrix: React.FC<Props> = ({
    value = [],
    onChange,
    readOnly = false,
}) => {
    const handleToggle = (day: string, slot: number) => {
        if (readOnly || !onChange) return
        let newConfig = [...(value || [])]
        let dayObj = newConfig.find((d) => d.day === day)

        if (!dayObj) {
            dayObj = { day, slots: [slot] }
            newConfig.push(dayObj)
        } else {
            if (dayObj.slots.includes(slot)) {
                dayObj.slots = dayObj.slots.filter((s) => s !== slot)
            } else {
                dayObj.slots.push(slot)
                dayObj.slots.sort((a, b) => a - b)
            }
        }

        // Remove days with empty slots
        newConfig = newConfig.filter((d) => d.slots.length > 0)
        onChange(newConfig)
    }

    const isSelected = (day: string, slot: number) => {
        const dayObj = (value || []).find((d) => d.day === day)
        return dayObj ? dayObj.slots.includes(slot) : false
    }

    return (
        <div className={styles.matrix}>
            <div className={styles.headerRow}>
                <div className={styles.cellEmpty}></div>
                {SLOTS.map((slot) => (
                    <div key={slot} className={styles.headerCell}>
                        Tiết {slot}
                    </div>
                ))}
            </div>
            {DAYS.map((day) => (
                <div key={day.value} className={styles.row}>
                    <div className={styles.dayLabel}>{day.label}</div>
                    {SLOTS.map((slot) => (
                        <div
                            key={`${day.value}-${slot}`}
                            className={`${styles.cell} ${isSelected(day.value, slot) ? styles.selected : ''} ${readOnly ? styles.readOnly : ''}`}
                            onClick={() => handleToggle(day.value, slot)}
                        >
                            {isSelected(day.value, slot) && '✓'}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}
