import React, { useState, useCallback } from 'react'
import s from './SectionViews.module.css'

import { CueCardViewer } from '@/components/feature/exams/MediaViewers/CueCardViewer'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import { useSpeakingUpload } from '@/hooks/useSpeakingUpload'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { SpeakingResultsModal } from './SpeakingResultModal'
import type { EnhancedSection } from '../../QuestionGroupRenderer'
import type { BatchSubmitSpeakingResponse } from '@/types/test.types'
import type { Question } from '@/types/test.types'

interface SpeakingSectionViewProps {
    section: EnhancedSection
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    partIndex: number
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

    // Upload management
    const {
        uploadState,
        isSubmitting,
        submitError,
        uploadAudio,
        batchSubmit,
        getProgress,
        isReadyToSubmit,
    } = useSpeakingUpload(attemptId)

    // Results modal
    const [showResults, setShowResults] = useState(false)
    const [submitResults, setSubmitResults] =
        useState<BatchSubmitSpeakingResponse | null>(null)

    // ============================================
    // HANDLE UPLOAD (Step 1)
    // ============================================
    const handleUpload = useCallback(
        async (questionId: string, audioBlob: Blob, duration: number) => {
            try {
                await uploadAudio(questionId, audioBlob, duration)
            } catch (error) {
                console.error('Upload error:', error)
            }
        },
        [uploadAudio]
    )

    // ============================================
    // HANDLE BATCH SUBMIT (Step 2)
    // ============================================
    const handleBatchSubmit = useCallback(async () => {
        if (!window.confirm('Submit all speaking responses for grading?')) {
            return
        }

        try {
            const results = await batchSubmit()
            setSubmitResults(results)
            setShowResults(true)
        } catch (error) {
            console.error('Batch submit error:', error)
            alert('Failed to submit: ' + (error as Error).message)
        }
    }, [batchSubmit])

    // ============================================
    // PROGRESS
    // ============================================
    const progress = getProgress()
    const questionIds = currentQuestions.map((q: Question) => q.id)
    const canSubmit = isReadyToSubmit(questionIds) && !isSubmitting

    // Timing for parts
    const prepTime = partNumber === 2 ? 60 : undefined
    const speakTime = partNumber === 2 ? 120 : 180

    return (
        <>
            <main className={s.sectionMain}>
                {/* Left: Cue Card */}
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

                {/* Right: Recording Controls */}
                <div className={s.recordingContainer}>
                    {/* Progress Bar */}
                    <div className={s.progressSection}>
                        <div className={s.progressHeader}>
                            <span>
                                Progress: {progress.uploaded} / {progress.total}
                            </span>
                            <span>{progress.percentage}%</span>
                        </div>
                        <div className={s.progressBar}>
                            <div
                                className={s.progressFill}
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Questions */}
                    {currentQuestions.map((q: any) => {
                        const state = uploadState[q.id]

                        return (
                            <SpeakingQuestion
                                key={q.id}
                                questionId={q.id}
                                globalNumber={q.globalNumber}
                                questionText={q.questionText || ''}
                                audioUrl={q.audioUrl}
                                onUpload={handleUpload}
                                uploadStatus={state?.status || 'idle'}
                                uploadError={state?.error}
                                uploadedAudioUrl={state?.file?.audioUrl}
                                registerRef={registerRef}
                            />
                        )
                    })}

                    {/* Submit Button */}
                    <div className={s.submitSection}>
                        <ButtonPrimary
                            onClick={handleBatchSubmit}
                            loading={isSubmitting}
                            disabled={!canSubmit}
                            size="lg"
                        >
                            {isSubmitting
                                ? 'Submitting & Grading...'
                                : `Submit ${progress.uploaded} Responses`}
                        </ButtonPrimary>

                        {submitError && (
                            <div className={s.errorMessage}>
                                ❌ {submitError}
                            </div>
                        )}

                        {!canSubmit && progress.uploaded > 0 && (
                            <div className={s.warningMessage}>
                                ⚠️ Please record all questions before submitting
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Results Modal */}
            {showResults && submitResults && (
                <SpeakingResultsModal
                    results={submitResults}
                    onClose={() => {
                        setShowResults(false)
                    }}
                />
            )}
        </>
    )
}

export default SpeakingSectionView
