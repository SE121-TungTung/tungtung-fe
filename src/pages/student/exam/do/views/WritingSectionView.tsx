import React from 'react'
import s from './SectionViews.module.css'

import { PromptViewer } from '@/components/feature/exams/MediaViewers/PromptViewer'
import { EssayQuestion } from '@/components/feature/exams/EssayQuestion'
import { QuestionType } from '@/types/test.types'
import type { EnhancedSection } from '../../QuestionGroupRenderer'

interface WritingSectionViewProps {
    section: EnhancedSection
    answers: { [key: string]: any }
    onAnswerChange: (id: string, val: any) => void
    registerRef: (id: string, el: HTMLElement | null) => void
    attemptId: string
}

const WritingSectionView: React.FC<WritingSectionViewProps> = ({
    section,
    answers,
    onAnswerChange,
    registerRef,
}) => {
    const part = section.parts[0]
    const passage = part?.passage
    const questionGroup = part?.questionGroups?.[0]
    const question = questionGroup?.questions?.[0]

    if (!part || !passage || !questionGroup || !question) {
        return <div className={s.errorMessage}>No writing task found</div>
    }

    const taskNumber =
        questionGroup.questionType === QuestionType.WRITING_TASK_1 ? 1 : 2

    const minWords = taskNumber === 1 ? 150 : 250
    const maxWords = taskNumber === 1 ? 250 : 350

    return (
        <main className={s.sectionMain}>
            {/* Task Prompt */}
            <PromptViewer
                taskNumber={taskNumber}
                title={passage.title || `Task ${taskNumber}`}
                prompt={passage.textContent || ''}
                imageUrl={passage.imageUrl || undefined}
            />

            {/* Essay Editor */}
            <div className={s.editorContainer}>
                <EssayQuestion
                    questionId={question.id}
                    questionNumber={question.globalNumber}
                    questionText=""
                    value={answers[question.id] || ''}
                    onChange={(v: any) => onAnswerChange(question.id, v)}
                    registerRef={registerRef}
                    minWords={minWords}
                    maxWords={maxWords}
                    hideHeader
                />
            </div>
        </main>
    )
}

export default WritingSectionView
