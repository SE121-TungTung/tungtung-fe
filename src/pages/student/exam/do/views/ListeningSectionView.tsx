import React from 'react'
import s from './SectionViews.module.css'

import { AudioPlayer } from '@/components/feature/exams/AudioPlayer'
import {
    QuestionGroupRenderer,
    type EnhancedSection,
} from '../../QuestionGroupRenderer'

interface ListeningSectionViewProps {
    section: EnhancedSection
    answers: { [key: string]: any }
    onAnswerChange: (id: string, val: any) => void
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    testId: string
    clearHighlightsRef?: React.RefObject<(() => void) | null>
    partIndex?: number
    onPartChange?: (index: number) => void
    reviewed?: Set<number>
    onToggleReview?: (num: number) => void
    isReviewMode?: boolean
}

const ListeningSectionView: React.FC<ListeningSectionViewProps> = ({
    section,
    answers,
    onAnswerChange,
    registerRef,
    attemptId,
    testId: _testId,
    clearHighlightsRef: _clearHighlightsRef,
    partIndex = 0,
    onPartChange,
    reviewed,
    onToggleReview,
    isReviewMode = false,
}) => {
    const activePartIndex = partIndex ?? 0
    const currentPart = section.parts[activePartIndex] || section.parts[0]
    const audioUrl =
        currentPart?.audioUrl ||
        currentPart?.passage?.audioUrl ||
        section.parts.find((p) => p.audioUrl)?.audioUrl ||
        null

    return (
        <main className={s.sectionMain}>
            {/* Left Side: Audio Hub & Controls */}
            <aside className={s.listeningSidebar}>
                <div className={s.sidebarInner}>
                    {/* Section Header Card */}
                    <div className={s.listeningHeaderCard}>
                        <div className={s.headerBadge}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                            </svg>
                            <span>IELTS Listening Practice</span>
                        </div>
                        <h2 className={s.partTitle}>
                            {currentPart?.name ||
                                section.name ||
                                'Listening Section'}
                        </h2>
                        <p className={s.listeningGuide}>
                            Lắng nghe kỹ đoạn audio để hoàn thành các câu hỏi
                            của phần này.
                        </p>

                        {/* Part Switcher in Sidebar if multiple parts */}
                        {section.parts.length > 1 && onPartChange && (
                            <div className={s.listeningPartTabs}>
                                {section.parts.map((p, idx) => (
                                    <button
                                        key={p.id || idx}
                                        type="button"
                                        className={`${s.listeningPartTab} ${idx === activePartIndex ? s.activeListeningPartTab : ''}`}
                                        onClick={() => onPartChange(idx)}
                                    >
                                        Part {idx + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modern Audio Player */}
                    <div className={s.playerWrapper}>
                        <AudioPlayer
                            key={audioUrl || activePartIndex}
                            audioUrl={audioUrl}
                            showTranscript={false}
                        />
                    </div>

                    {/* Only show transcript if review mode after exam */}
                    {isReviewMode && currentPart?.passage && (
                        <div className={s.transcriptBlock}>
                            <p className={s.transcriptTitle}>Transcript:</p>
                            <div className={s.transcriptContent}>
                                {currentPart.passage.textContent}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Right Side: Questions Area */}
            <section className={s.questionsArea}>
                <QuestionGroupRenderer
                    section={section}
                    partIndex={activePartIndex}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={registerRef}
                    attemptId={attemptId}
                    hidePartAudio={true}
                    reviewed={reviewed}
                    onToggleReview={onToggleReview}
                />
            </section>
        </main>
    )
}

export default ListeningSectionView
