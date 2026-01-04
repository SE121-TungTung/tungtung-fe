import React from 'react'
import s from './do/ReadingTestPage.module.css'

// --- Question Components ---
import SentenceCompletionQuestion from '@/components/feature/exams/SentenceCompletionQuestion'
import TrueFalseNotGivenQuestion from '@/components/feature/exams/TrueFalseNotGivenQuestion'
import MultipleChoiceQuestion from '@/components/feature/exams/MultipleChoiceQuestion'
import { SpeakingQuestion } from '@/components/feature/exams/SpeakingQuestion'
import { EssayQuestion } from '@/components/feature/exams/EssayQuestion'

// --- Types ---
import {
    type Question,
    type QuestionGroup,
    type TestSectionPart,
    type TestSection,
    QuestionType,
} from '@/types/test.types'
import SummaryCompletionGroup from '@/components/feature/exams/SummaryCompletionGroup'
import MatchingQuestion from '@/components/feature/exams/MatchingQuestion'
import MatchingHeadingsQuestion from '@/components/feature/exams/MatchingHeadingsQuestion'
import YesNoNotGivenQuestion from '@/components/feature/exams/YesNoNotGivenQuestion'
import DiagramLabelingQuestion from '@/components/feature/exams/DiagramLabelingQuestion'

// Enhanced Types
export interface EnhancedQuestion extends Question {
    globalNumber: number
}

export interface EnhancedQuestionGroup
    extends Omit<QuestionGroup, 'questions'> {
    questions: EnhancedQuestion[]
}

export interface EnhancedPart extends Omit<TestSectionPart, 'questionGroups'> {
    questionGroups: EnhancedQuestionGroup[]
}

export interface EnhancedSection extends Omit<TestSection, 'parts'> {
    parts: EnhancedPart[]
}

// ============================================
// UNIVERSAL QUESTION RENDERER
// ============================================
interface UniversalQuestionRendererProps {
    group: EnhancedQuestionGroup
    answers: { [key: string]: any }
    onAnswerChange: (id: string, val: any) => void
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
    onUploadSpeaking?: (qid: string, blob: Blob, dur: number) => Promise<void>
}

export const UniversalQuestionRenderer =
    React.memo<UniversalQuestionRendererProps>(
        ({ group, answers, onAnswerChange, registerRef, onUploadSpeaking }) => {
            if (!group.questions.length) return null

            const groupType: QuestionType = group.questions[0].questionType

            if (
                groupType === QuestionType.MATCHING_INFORMATION ||
                groupType === QuestionType.MATCHING_FEATURES
            ) {
                return (
                    <MatchingQuestion
                        key={group.id}
                        group={group}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                        registerRef={registerRef}
                    />
                )
            }

            if (groupType === QuestionType.MATCHING_HEADINGS) {
                return (
                    <MatchingHeadingsQuestion
                        key={group.id}
                        group={group}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                        registerRef={registerRef}
                    />
                )
            }

            if (
                [
                    QuestionType.SUMMARY_COMPLETION,
                    QuestionType.NOTE_COMPLETION,
                ].includes(groupType)
            ) {
                return (
                    <SummaryCompletionGroup
                        key={group.id}
                        group={group}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                        registerRef={registerRef}
                    />
                )
            }

            if (groupType === QuestionType.DIAGRAM_LABELING) {
                return (
                    <DiagramLabelingQuestion
                        key={group.id}
                        group={group}
                        answers={answers}
                        onAnswerChange={onAnswerChange}
                        registerRef={registerRef}
                    />
                )
            }
            return (
                <>
                    {group.questions.map((q) => {
                        const commonProps = {
                            key: q.id,
                            question: { ...q, number: q.globalNumber } as any,
                            registerRef: registerRef,
                        }

                        switch (q.questionType) {
                            case QuestionType.TRUE_FALSE_NOT_GIVEN:
                                return (
                                    <TrueFalseNotGivenQuestion
                                        {...commonProps}
                                        selectedValue={answers[q.id] || null}
                                        onChange={(v) =>
                                            onAnswerChange(q.id, v)
                                        }
                                    />
                                )

                            case QuestionType.YES_NO_NOT_GIVEN:
                                return (
                                    <YesNoNotGivenQuestion
                                        {...commonProps}
                                        selectedValue={answers[q.id] || null}
                                        onChange={(v) =>
                                            onAnswerChange(q.id, v)
                                        }
                                    />
                                )

                            case QuestionType.MULTIPLE_CHOICE:
                                return (
                                    <MultipleChoiceQuestion
                                        {...commonProps}
                                        selectedValue={
                                            answers[q.id]
                                                ? String(answers[q.id])
                                                : null
                                        }
                                        onChange={(v) =>
                                            onAnswerChange(q.id, v)
                                        }
                                    />
                                )

                            case QuestionType.SHORT_ANSWER:
                            case QuestionType.SENTENCE_COMPLETION:
                                return (
                                    <SentenceCompletionQuestion
                                        {...commonProps}
                                        value={answers[q.id] || ''}
                                        onChange={(v) =>
                                            onAnswerChange(q.id, v)
                                        }
                                    />
                                )

                            case QuestionType.WRITING_TASK_1:
                            case QuestionType.WRITING_TASK_2:
                                return (
                                    <EssayQuestion
                                        key={q.id}
                                        questionId={q.id}
                                        questionNumber={q.globalNumber}
                                        questionText={q.questionText || ''}
                                        value={answers[q.id] || ''}
                                        onChange={(v: any) =>
                                            onAnswerChange(q.id, v)
                                        }
                                        registerRef={registerRef}
                                    />
                                )

                            case QuestionType.SPEAKING_PART_1:
                            case QuestionType.SPEAKING_PART_2:
                            case QuestionType.SPEAKING_PART_3:
                                return (
                                    <SpeakingQuestion
                                        key={q.id}
                                        questionId={q.id}
                                        globalNumber={q.globalNumber}
                                        questionText={q.questionText || ''}
                                        registerRef={registerRef}
                                        onUpload={onUploadSpeaking}
                                    />
                                )

                            default:
                                return (
                                    <div
                                        key={q.id}
                                        className={s.unsupportedQuestion}
                                    >
                                        Type {q.questionType} not supported
                                    </div>
                                )
                        }
                    })}
                </>
            )
        }
    )

UniversalQuestionRenderer.displayName = 'UniversalQuestionRenderer'

// ============================================
// QUESTION GROUP RENDERER
// ============================================
interface QuestionGroupRendererProps {
    section: EnhancedSection
    answers: { [key: string]: any }
    onAnswerChange: (id: string, val: any) => void
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
}

export const QuestionGroupRenderer = React.memo<QuestionGroupRendererProps>(
    ({ section, answers, onAnswerChange, registerRef, attemptId }) => (
        <div className={s.questionContainer}>
            <div className={s.questionScrollArea}>
                {section.parts.map((part) => (
                    <React.Fragment key={part.id}>
                        {/* Part Instructions */}
                        {part.instructions && (
                            <div className={s.partInstructions}>
                                {part.instructions}
                            </div>
                        )}

                        {/* Part Audio */}
                        {part.audioUrl && (
                            <audio
                                src={part.audioUrl}
                                controls
                                className={s.partAudio}
                            />
                        )}

                        {/* Part Image */}
                        {part.imageUrl && (
                            <img
                                src={part.imageUrl}
                                alt="Visual"
                                className={s.partImage}
                            />
                        )}

                        {/* Question Groups */}
                        {part.questionGroups.map((group) => (
                            <div
                                key={group.id}
                                className={s.questionGroupBlock}
                            >
                                {/* Group Instructions */}
                                {group.instructions && (
                                    <div className={s.questionInstruction}>
                                        {group.instructions}
                                    </div>
                                )}

                                {/* Group Image */}
                                {group.imageUrl && (
                                    <img
                                        src={group.imageUrl}
                                        alt="Group visual"
                                        className={s.groupImage}
                                    />
                                )}

                                {/* Questions */}
                                <UniversalQuestionRenderer
                                    group={group}
                                    answers={answers}
                                    onAnswerChange={onAnswerChange}
                                    registerRef={registerRef}
                                    attemptId={attemptId}
                                />
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
)

QuestionGroupRenderer.displayName = 'QuestionGroupRenderer'
