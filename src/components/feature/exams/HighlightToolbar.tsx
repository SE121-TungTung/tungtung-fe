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
                ))
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
