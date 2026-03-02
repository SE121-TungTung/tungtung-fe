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
}

const ReadingSectionView: React.FC<ReadingSectionViewProps> = ({
    section,
    answers,
    onAnswerChange,
    registerRef,
    attemptId,
    testId,
    clearHighlightsRef,
}) => {
    const internalClearRef = useRef<(() => void) | null>(null)
    const effectiveClearRef = clearHighlightsRef || internalClearRef

    const currentPassage =
        section.parts.find((p: any) => p.passage)?.passage || null

    return (
        <main className={s.sectionMain}>
            {/* Passage Viewer */}
            <PassageViewer
                passage={currentPassage}
                sectionId={section.id}
                testId={testId}
                clearHighlightsRef={effectiveClearRef}
            />

            {/* Questions */}
            <QuestionGroupRenderer
                section={section}
                answers={answers}
                onAnswerChange={onAnswerChange}
                registerRef={registerRef}
                attemptId={attemptId}
            />
        </main>
    )
}

export default ReadingSectionView
