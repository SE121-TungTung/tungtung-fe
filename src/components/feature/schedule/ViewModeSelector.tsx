import s from './views/ScheduleViews.module.css'

export type ViewMode = 'time-grid' | 'room-grid' | 'list'

interface ViewModeSelectorProps {
    currentMode: ViewMode
    onModeChange: (mode: ViewMode) => void
}

const VIEW_OPTIONS: Array<{ value: ViewMode; label: string; desc: string }> = [
    { value: 'time-grid', label: 'Theo giờ', desc: 'Grid view by time' },
    { value: 'room-grid', label: 'Theo phòng', desc: 'Grid view by room' },
    { value: 'list', label: 'Danh sách', desc: 'Simple list view' },
]

export default function ViewModeSelector({
    currentMode,
    onModeChange,
}: ViewModeSelectorProps) {
    return (
        <div className={s.viewSelector}>
            {VIEW_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    className={`${s.viewButton} ${
                        currentMode === option.value ? s.active : ''
                    }`}
                    onClick={() => onModeChange(option.value)}
                    title={option.desc}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
