import React, { useRef } from 'react'
import s from './SectionViews.module.css'

import { PassageViewer } from '@/components/feature/exams/MediaViewers/PassageViewer'
import {
    QuestionGroupRenderer,
    type EnhancedSection,
} from '../../QuestionGroupRenderer'

interface ReadingSectionViewProps {
    section: EnhancedSection
    answers: { [key: string]: any }
    onAnswerChange: (id: string, val: any) => void
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    testId: string
    clearHighlightsRef?: React.RefObject<(() => void) | null>
    partIndex?: number
    reviewed?: Set<number>
    onToggleReview?: (num: number) => void
}

const ReadingSectionView: React.FC<ReadingSectionViewProps> = ({
    section,
    answers,
    onAnswerChange,
    registerRef,
    attemptId,
    testId,
    clearHighlightsRef,
    partIndex = 0,
    reviewed,
    onToggleReview,
}) => {
    const internalClearRef = useRef<(() => void) | null>(null)
    const effectiveClearRef = clearHighlightsRef || internalClearRef

    // Use current part passage if available, else first passage found
    const activePart = section.parts[partIndex] || section.parts[0]
    const currentPassage =
        activePart?.passage ||
        section.parts.find((p: any) => p.passage)?.passage ||
        null

    return (
        <main className={s.sectionMain}>
            {/* Passage Viewer */}
            <PassageViewer
                passage={currentPassage}
                sectionId={`${section.id}_part_${partIndex}`}
                testId={testId}
                clearHighlightsRef={effectiveClearRef}
            />

            {/* Questions */}
            <QuestionGroupRenderer
                section={section}
                partIndex={partIndex}
                answers={answers}
                onAnswerChange={onAnswerChange}
                registerRef={registerRef}
                attemptId={attemptId}
                reviewed={reviewed}
                onToggleReview={onToggleReview}
            />
        </main>
    )
}

export default ReadingSectionView
