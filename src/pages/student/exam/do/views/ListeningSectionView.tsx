import React, { useRef } from 'react'
import s from './SectionViews.module.css'

import { AudioPlayer } from '@/components/feature/exams/AudioPlayer'
import {
    QuestionGroupRenderer,
    type EnhancedSection,
} from '../../QuestionGroupRenderer'
import { PassageViewer } from '@/components/feature/exams/MediaViewers/PassageViewer'
import type { Passage } from '@/types/test.types'

import ChevronDown from '@/assets/Chevron Down.svg'

interface ListeningSectionViewProps {
    section: EnhancedSection
    answers: { [key: string]: any }
    onAnswerChange: (id: string, val: any) => void
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    testId: string
    clearHighlightsRef?: React.RefObject<(() => void) | null>
}

const ListeningSectionView: React.FC<ListeningSectionViewProps> = ({
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

    const [showTranscript, setShowTranscript] = React.useState(false)
    const toggleTranscript = () => {
        setShowTranscript((prev) => !prev)
    }

    const audioUrl =
        section.parts.find((p) => p.passage)?.passage?.audioUrl ||
        section.parts.find((p) => p.audioUrl)?.audioUrl ||
        null

    const transcript =
        (section.parts.find((p: any) => p.passage)?.passage as Passage) || null

    return (
        <main className={s.sectionMain}>
            {/* Left Side: Audio Player + Transcript (nếu có) */}
            <div className={s.mediaContainer}>
                {/* Audio Player */}
                <AudioPlayer audioUrl={audioUrl} showTranscript={false} />

                {/* Transcript với Highlight*/}
                {transcript && (
                    <button
                        className={`${s.transcriptToggle} ${showTranscript ? s.active : ''}`}
                        onClick={toggleTranscript}
                    >
                        {showTranscript ? 'Ẩn Transcript' : 'Hiện Transcript'}
                        <img
                            src={ChevronDown}
                            alt="Toggle Transcript"
                            className={s.toggleIcon}
                        />
                    </button>
                )}

                {transcript && (
                    <div
                        className={`${s.transcriptWrapper} ${showTranscript ? s.expanded : ''}`}
                    >
                        <div className={s.transcriptInner}>
                            <div className={s.transcriptSection}>
                                <h3 className={s.transcriptTitle}>
                                    Transcript
                                </h3>
                                <PassageViewer
                                    passage={transcript}
                                    sectionId={section.id}
                                    testId={testId}
                                    clearHighlightsRef={effectiveClearRef}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Questions */}
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

export default ListeningSectionView
