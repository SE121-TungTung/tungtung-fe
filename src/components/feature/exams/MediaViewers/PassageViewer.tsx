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
                <div className={s.passageHeader}>
                    <h3 className={s.title}>{passage.title}</h3>
                    <button
                        type="button"
                        className={s.clearAllBtn}
                        onClick={clearAllHighlights}
                        title="Bỏ tất cả highlight trong bài đọc"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                        <span>Bỏ highlight</span>
                    </button>
                </div>
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
