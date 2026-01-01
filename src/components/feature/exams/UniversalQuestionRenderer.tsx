import { QuestionType } from '@/types/test.types'
import type { QuestionGroup, Question } from '@/types/test.types'

// Import all question components
import MultipleChoiceQuestion from './MultipleChoiceQuestion'
import TrueFalseNotGivenQuestion from './TrueFalseNotGivenQuestion'
import YesNoNotGivenQuestion from './YesNoNotGivenQuestion'
import SentenceCompletionQuestion from './SentenceCompletionQuestion'
import ShortAnswerQuestion from './ShortAnswerQuestion'
import MatchingHeadingsQuestion from './MatchingHeadingsQuestion'
import MatchingQuestion from './MatchingQuestion'
import SummaryCompletionGroup from './SummaryCompletionGroup'
import NoteCompletionGroup from './NoteCompletionGroup'
import DiagramLabelingQuestion from './DiagramLabelingQuestion'
import { EssayQuestion } from './EssayQuestion'
import { SpeakingQuestion } from './SpeakingQuestion'

interface UniversalQuestionRendererProps {
    group: QuestionGroup & {
        questions: (Question & { globalNumber: number })[]
    }
    answers: { [key: string]: any }
    onAnswerChange: (questionId: string, value: any) => void
    registerRef: (id: string, element: HTMLElement | null) => void
    attemptId: string
}

export default function UniversalQuestionRenderer({
    group,
    answers,
    onAnswerChange,
    registerRef,
    attemptId,
}: UniversalQuestionRendererProps) {
    const questionType = group.questionType
    const questions = group.questions as Array<
        Question & { globalNumber: number }
    >

    // Render dựa trên question type
    switch (questionType) {
        case QuestionType.MULTIPLE_CHOICE:
            return (
                <>
                    {questions.map((q) => (
                        <MultipleChoiceQuestion
                            key={q.id}
                            question={q}
                            selectedValue={answers[q.id]}
                            onChange={(value) => onAnswerChange(q.id, value)}
                            registerRef={registerRef}
                        />
                    ))}
                </>
            )

        case QuestionType.TRUE_FALSE_NOT_GIVEN:
            return (
                <>
                    {questions.map((q) => (
                        <TrueFalseNotGivenQuestion
                            key={q.id}
                            question={q}
                            selectedValue={answers[q.id] || null}
                            onChange={(value) => onAnswerChange(q.id, value)}
                            registerRef={registerRef}
                        />
                    ))}
                </>
            )

        case QuestionType.YES_NO_NOT_GIVEN:
            return (
                <>
                    {questions.map((q) => (
                        <YesNoNotGivenQuestion
                            key={q.id}
                            question={q}
                            selectedValue={answers[q.id] || null}
                            onChange={(value: any) =>
                                onAnswerChange(q.id, value)
                            }
                            registerRef={registerRef}
                        />
                    ))}
                </>
            )

        case QuestionType.MATCHING_HEADINGS:
            return (
                <MatchingHeadingsQuestion
                    group={group}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={registerRef}
                />
            )

        case QuestionType.MATCHING_INFORMATION:
        case QuestionType.MATCHING_FEATURES:
            return (
                <MatchingQuestion
                    group={group}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={registerRef}
                />
            )

        case QuestionType.SENTENCE_COMPLETION:
            return (
                <>
                    {questions.map((q) => (
                        <SentenceCompletionQuestion
                            key={q.id}
                            question={q}
                            value={answers[q.id] || ''}
                            onChange={(value) => onAnswerChange(q.id, value)}
                            registerRef={registerRef}
                        />
                    ))}
                </>
            )

        case QuestionType.SUMMARY_COMPLETION:
            return (
                <SummaryCompletionGroup
                    group={group}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={registerRef}
                />
            )

        case QuestionType.NOTE_COMPLETION:
            return (
                <NoteCompletionGroup
                    group={group}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={registerRef}
                />
            )

        case QuestionType.SHORT_ANSWER:
            return (
                <>
                    {questions.map((q) => (
                        <ShortAnswerQuestion
                            key={q.id}
                            question={q}
                            value={answers[q.id] || ''}
                            onChange={(value) => onAnswerChange(q.id, value)}
                            registerRef={registerRef}
                        />
                    ))}
                </>
            )

        case QuestionType.DIAGRAM_LABELING:
            return (
                <DiagramLabelingQuestion
                    group={group}
                    answers={answers}
                    onAnswerChange={onAnswerChange}
                    registerRef={registerRef}
                />
            )

        case QuestionType.WRITING_TASK_1:
        case QuestionType.WRITING_TASK_2:
            return (
                <>
                    {questions.map((q) => (
                        <EssayQuestion
                            key={q.id}
                            questionId={q.id}
                            questionNumber={q.globalNumber}
                            questionText={q.questionText || ''}
                            value={answers[q.id] || ''}
                            onChange={(value) => onAnswerChange(q.id, value)}
                            registerRef={registerRef}
                        />
                    ))}
                </>
            )

        case QuestionType.SPEAKING_PART_1:
        case QuestionType.SPEAKING_PART_2:
        case QuestionType.SPEAKING_PART_3:
            return (
                <>
                    {questions.map((q) => (
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
                </>
            )

        default:
            return (
                <div
                    style={{
                        padding: '16px',
                        background: '#fff3cd',
                        borderRadius: '8px',
                        margin: '12px 0',
                    }}
                >
                    <p style={{ margin: 0, color: '#856404' }}>
                        ⚠️ Unsupported question type: {questionType}
                    </p>
                </div>
            )
    }
}
