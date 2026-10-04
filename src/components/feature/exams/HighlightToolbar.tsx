import s from './HighlightToolbar.module.css'
import EraserIcon from '@/assets/Attachment Delete.svg'

interface ToolbarProps {
    state:
        | {
              top: number
              left: number
              mode: 'add'
              range: Range
          }
        | {
              top: number
              left: number
              mode: 'remove'
              highlightId: string
          }
    onAdd: (color: string) => void
    onRemove: (id: string) => void
    onSaveWord?: () => void
}

const HIGHLIGHT_COLORS = [
    { name: 'yellow', hex: '#fef08a', className: s.yellow },
    { name: 'pink', hex: '#fbcfe8', className: s.pink },
    { name: 'blue', hex: '#bfdbfe', className: s.blue },
]

export default function HighlightToolbar({
    state,
    onAdd,
    onRemove,
    onSaveWord,
}: ToolbarProps) {
    return (
        <div className={s.toolbar} style={{ top: state.top, left: state.left }}>
            {state.mode === 'add' ? (
                HIGHLIGHT_COLORS.map((color) => (
                    <button
                        key={color.name}
                        className={`${s.colorButton} ${color.className}`}
                        onClick={() => onAdd(color.hex)}
                        aria-label={`Highlight ${color.name}`}
                        title={`Highlight ${color.name}`}
                    />
                )).concat(
                    onSaveWord ? (
                        <button
                            key="save-word"
                            className={s.saveWordBtn}
                            onClick={onSaveWord}
                            aria-label="Lưu từ vựng"
                            title="Lưu từ vựng vào Flashcard"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                        </button>
                    ) : (
                        []
                    )
                )
            ) : (
                <button
                    className={`${s.colorButton} ${s.remove}`}
                    onClick={() => onRemove(state.highlightId)}
                    aria-label="Remove highlight"
                    title="Remove highlight"
                >
                    <img src={EraserIcon} alt="Remove" />
                </button>
            )}
        </div>
    )
}
