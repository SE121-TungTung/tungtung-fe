import React, { useState, useCallback } from 'react'
import s from './SectionViews.module.css'

import { CueCardViewer } from '@/components/feature/exams/MediaViewers/CueCardViewer'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import { useSpeakingUpload } from '@/hooks/useSpeakingUpload'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import type { EnhancedSection } from '../../QuestionGroupRenderer'
import type { BatchSubmitSpeakingResponse, Question } from '@/types/test.types'
import { useDialog } from '@/hooks/useDialog'

interface SpeakingSectionViewProps {
    section: EnhancedSection
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    partIndex: number
    onSpeakingProgress: (results: BatchSubmitSpeakingResponse) => void
}

const SpeakingSectionView: React.FC<SpeakingSectionViewProps> = ({
    section,
    registerRef,
    attemptId,
    partIndex,
    onSpeakingProgress,
}) => {
    const currentPart = section.parts[partIndex] || section.parts[0]
    const currentQuestions =
        currentPart?.questionGroups?.flatMap((g) => g.questions) || []
    const partNumber = (partIndex + 1) as 1 | 2 | 3
    const { alert } = useDialog()

    // Upload management
    const {
        uploadState,
        isSubmitting,
        uploadAudio,
        batchSubmit,
        getProgress,
        isReadyToSubmit,
    } = useSpeakingUpload(attemptId)

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

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
    // HANDLE SAVE RECORDINGS (Step 2)
    // ============================================
    const handleSaveRecordings = async () => {
        try {
            const results = await batchSubmit()

            // Pass results to parent
            onSpeakingProgress(results)

            // Show success message
            setShowSuccessMessage(true)
            setTimeout(() => setShowSuccessMessage(false), 3000)
        } catch (error) {
            console.error('Save error:', error)
            alert('Lỗi lưu bản ghi âm: ' + (error as Error).message)
        }
    }

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
        <main className={s.sectionMain}>
            {/* Left: Cue Card */}
            <CueCardViewer
                partNumber={partNumber}
                title={currentPart?.name || `Part ${partNumber}`}
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
                            Tiến độ thu âm: {progress.uploaded} /{' '}
                            {progress.total}
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

                {/* Save Section */}
                <div className={s.saveSection}>
                    <ButtonPrimary
                        onClick={handleSaveRecordings}
                        loading={isSubmitting}
                        disabled={!canSubmit}
                        size="lg"
                    >
                        Lưu bản ghi âm
                    </ButtonPrimary>

                    {showSuccessMessage && (
                        <div className={s.successMessage}>
                            Đã lưu tất cả bản ghi âm thành công. Bạn có thể tiếp
                            tục làm các phần khác hoặc nộp bài.
                        </div>
                    )}

                    {!showSuccessMessage && (
                        <p className={s.hint}>
                            Bản ghi âm được lưu an toàn. Bạn có thể thu âm lại
                            bất cứ lúc nào trước khi nộp bài chính thức.
                        </p>
                    )}
                </div>
            </div>
        </main>
    )
}

export default SpeakingSectionView
