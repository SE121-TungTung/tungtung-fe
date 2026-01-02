import React, { useRef, useEffect } from 'react'
import s from './PassageViewer.module.css'
import HighlightToolbar from '../HighlightToolbar'
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
                    />
                )}
            </div>
        )
    }
)
