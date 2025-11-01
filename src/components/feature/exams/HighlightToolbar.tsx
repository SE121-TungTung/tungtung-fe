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

const colors = ['yellow', 'pink', 'blue']

export default function HighlightToolbar({
    state,
    onAdd,
    onRemove,
}: ToolbarProps) {
    return (
        <div className={s.toolbar} style={{ top: state.top, left: state.left }}>
            {state.mode === 'add' ? (
                colors.map((color) => (
                    <button
                        key={color}
                        className={`${s.colorButton} ${s[color]}`}
                        onClick={() => onAdd(color)}
                        aria-label={`Highlight ${color}`}
                        title={`Highlight ${color}`}
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
