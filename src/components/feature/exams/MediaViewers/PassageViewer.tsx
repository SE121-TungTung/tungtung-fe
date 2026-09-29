import React, { useRef, useEffect } from 'react'
import s from './PassageViewer.module.css'
import HighlightToolbar from '../HighlightToolbar'
import SaveWordModal from '../SaveWordModal'
import { useTextHighlighter } from '@/hooks/useTextHighlighter'
import type { Passage } from '@/types/test.types'

interface PassageViewerProps {
    passage: Passage | null
    sectionId: string
    testId: string
    clearHighlightsRef: React.RefObject<(() => void) | null>
}

export const PassageViewer = React.memo(
    ({
        passage,
        sectionId,
        testId,
        clearHighlightsRef,
    }: PassageViewerProps) => {
        const contentRef = useRef<HTMLDivElement>(null!)
        const [wordToSave, setWordToSave] = React.useState<string | null>(null)

        const {
            toolbarState,
            addHighlight,
            removeHighlight,
            clearAllHighlights,
        } = useTextHighlighter(contentRef, testId, sectionId)

        useEffect(() => {
            clearHighlightsRef.current = clearAllHighlights
        }, [clearAllHighlights, clearHighlightsRef])

        if (!passage) {
            return (
                <div className={s.container}>
                    <p className={s.emptyState}>
                        No passage available for this section.
                    </p>
                </div>
            )
        }

        return (
            <div className={s.container} id={sectionId}>
                <h3 className={s.title}>{passage.title}</h3>
                <div className={s.content} ref={contentRef}>
                    {passage.textContent?.split('\n\n').map((text, idx) => (
                        <p key={idx}>{text}</p>
                    ))}
                </div>
                {toolbarState && (
                    <HighlightToolbar
                        state={toolbarState}
                        onAdd={addHighlight}
                        onRemove={removeHighlight}
                        onSaveWord={() => {
                            const selected = window.getSelection()?.toString()
                            if (selected) setWordToSave(selected)
                        }}
                    />
                )}

                {wordToSave !== null && (
                    <SaveWordModal
                        initialWord={wordToSave}
                        onClose={() => setWordToSave(null)}
                        onSuccess={() => {
                            setWordToSave(null)
                            // could show a toast here
                            alert('Đã lưu từ vựng vào Flashcard!')
                        }}
                    />
                )}
            </div>
        )
    }
)
