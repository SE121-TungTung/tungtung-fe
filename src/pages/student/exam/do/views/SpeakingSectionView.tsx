import React from 'react'
import s from './SectionViews.module.css'

import { CueCardViewer } from '@/components/feature/exams/MediaViewers/CueCardViewer'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import type { EnhancedSection } from '../../QuestionGroupRenderer'

interface SpeakingSectionViewProps {
    section: EnhancedSection
    answers: { [key: string]: any }
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    partIndex: number // 0, 1, 2 tương ứng Part 1, 2, 3
}

const SpeakingSectionView: React.FC<SpeakingSectionViewProps> = ({
    section,
    registerRef,
    attemptId,
    partIndex,
}) => {
    const currentPart = section.parts[0]
    const currentQuestions = currentPart?.questionGroups[0]?.questions || []
    const partNumber = (partIndex + 1) as 1 | 2 | 3

    // Timing cho từng part
    const prepTime = partNumber === 2 ? 60 : undefined
    const speakTime = partNumber === 2 ? 120 : 180

    return (
        <main className={s.sectionMain}>
            {/* Cue Card - Bên trái */}
            <CueCardViewer
                partNumber={partNumber}
                title={section.name || `Part ${partNumber}`}
                instructions={currentPart?.instructions || ''}
                questions={currentQuestions.map(
                    (q: any) => q.questionText || ''
                )}
                imageUrl={currentPart?.imageUrl}
                prepTime={prepTime}
                speakTime={speakTime}
            />

            {/* Recording Controls - Bên phải */}
            <div className={s.recordingContainer}>
                {currentQuestions.map((q: any) => (
                    <SpeakingQuestion
                        key={q.id}
                        questionId={q.id}
                        globalNumber={q.globalNumber}
                        questionText={q.questionText || ''}
                        audioUrl={q.audioUrl}
                        attemptId={attemptId}
                        registerRef={registerRef}
                    />
                ))}
            </div>
        </main>
    )
}

export default SpeakingSectionView
