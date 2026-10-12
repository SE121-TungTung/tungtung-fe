import React, { useState, useEffect } from 'react'
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
    attemptId?: string
    partIndex?: number
    onPartChange?: (index: number) => void
}

const WritingSectionView: React.FC<WritingSectionViewProps> = ({
    section,
    answers,
    onAnswerChange,
    registerRef,
    partIndex = 0,
    onPartChange,
}) => {
    const [localPartIndex, setLocalPartIndex] = useState(partIndex)

    useEffect(() => {
        setLocalPartIndex(partIndex)
    }, [partIndex])

    const handleSwitchPart = (index: number) => {
        setLocalPartIndex(index)
        onPartChange?.(index)
    }

    const currentPart = section.parts[localPartIndex] || section.parts[0]
    const passage = currentPart?.passage
    const questionGroup = currentPart?.questionGroups?.[0]
    const question = questionGroup?.questions?.[0]

    const taskNumber =
        questionGroup?.questionType === QuestionType.WRITING_TASK_2 ||
        localPartIndex === 1
            ? 2
            : 1

    const promptText =
        passage?.textContent ||
        question?.questionText ||
        currentPart?.instructions ||
        'Vui lòng đọc đề bài và hoàn thành bài viết theo yêu cầu.'

    const promptTitle =
        passage?.title || currentPart?.name || `Task ${taskNumber}`

    const imageUrl = passage?.imageUrl || currentPart?.imageUrl || undefined

    const minWords = taskNumber === 1 ? 150 : 250
    const maxWords = taskNumber === 1 ? 250 : 400

    if (!question) {
        return (
            <div className={s.errorMessage}>
                Không tìm thấy câu hỏi bài thi Viết.
            </div>
        )
    }

    return (
        <div className={s.writingWrapper}>
            {/* Top Task Switcher Bar (Tabs) */}
            {section.parts.length > 1 && (
                <div className={s.taskTabBar}>
                    {section.parts.map((p, idx) => {
                        const isCurrent = idx === localPartIndex
                        const wordCount = answers[
                            p.questionGroups?.[0]?.questions?.[0]?.id
                        ]
                            ? String(
                                  answers[p.questionGroups[0].questions[0].id]
                              )
                                  .trim()
                                  .split(/\s+/)
                                  .filter(Boolean).length
                            : 0

                        return (
                            <button
                                key={p.id || idx}
                                type="button"
                                className={`${s.taskTabBtn} ${isCurrent ? s.activeTaskTab : ''}`}
                                onClick={() => handleSwitchPart(idx)}
                            >
                                <span className={s.taskTabName}>
                                    {idx === 0
                                        ? 'Task 1 (Report)'
                                        : 'Task 2 (Essay)'}
                                </span>
                                <span className={s.taskTabBadge}>
                                    {wordCount} từ
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            <main className={s.sectionMain}>
                {/* Task Prompt */}
                <PromptViewer
                    taskNumber={taskNumber as 1 | 2}
                    title={promptTitle}
                    prompt={promptText}
                    imageUrl={imageUrl}
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
        </div>
    )
}

export default WritingSectionView
