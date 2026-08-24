import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import { TestStatus, type TestCreatePayload } from '@/types/test.types'
import { useCreateTest } from '@/hooks/useCreateTest'
import { useDialog } from '@/hooks/useDialog'
import type { TestBasicInfo } from './builder/types'
import TestBuilderForm from './builder/TestBuilderForm'
import { validateTestForm } from './builder/validateTestForm'

export default function CreateTestPage() {
    const navigate = useNavigate()
    const { alert } = useDialog()
    const [submittingStatus, setSubmittingStatus] = useState<
        'idle' | 'draft' | 'published'
    >('idle')

    const [basicInfo, setBasicInfo] = useState<TestBasicInfo>({
        title: '',
        description: '',
        instructions: '',
        testType: null,
        timeLimitMinutes: 60,
        passingScore: 60,
        maxAttempts: 1,
        randomizeQuestions: false,
        showResultsImmediately: true,
        aiGradingEnabled: false,
        startTime: '',
        endTime: '',
    })

    const handleBasicInfoChange = (data: Partial<TestBasicInfo>) => {
        setBasicInfo((prev) => ({ ...prev, ...data }))
    }

    const {
        sections,
        uploadedFiles,
        getFileKey,
        handleAddSection,
        handleRemoveSection,
        handleAddPart,
        handleRemovePart,
        updatePartPassage,
        handleAddQuestionGroup,
        handleRemoveQuestionGroup,
        updateQuestionGroup,
        handleAddQuestion,
        updateQuestion,
        handleFileUpload,
        handleRemoveFile,
        handleRemoveQuestion,
        updateSection,
        updatePart,
    } = useCreateTest()

    const actions = {
        getFileKey,
        handleAddSection,
        handleRemoveSection,
        handleAddPart,
        handleRemovePart,
        updatePartPassage,
        handleAddQuestionGroup,
        handleRemoveQuestionGroup,
        updateQuestionGroup,
        handleAddQuestion,
        updateQuestion,
        handleFileUpload,
        handleRemoveFile,
        handleRemoveQuestion,
        updateSection,
        updatePart,
    }

    const handleSubmit = async (status: TestStatus) => {
        if (!validateTestForm(basicInfo, sections, alert)) return

        setSubmittingStatus(status === TestStatus.DRAFT ? 'draft' : 'published')
        try {
            const activeKeys = new Set<string>()
            sections.forEach((s) =>
                s.parts.forEach((p) => {
                    if (p.passage?.audio_url?.startsWith('file:'))
                        activeKeys.add(p.passage.audio_url.replace('file:', ''))
                    if (p.passage?.image_url?.startsWith('file:'))
                        activeKeys.add(p.passage.image_url.replace('file:', ''))
                })
            )

            const finalFiles: Record<string, File> = {}
            Object.entries(uploadedFiles).forEach(([key, file]) => {
                if (activeKeys.has(key)) {
                    finalFiles[key] = file
                }
            })

            const payload: TestCreatePayload = {
                title: basicInfo.title,
                description: basicInfo.description || undefined,
                instructions: basicInfo.instructions || undefined,
                test_type: basicInfo.testType || undefined,
                time_limit_minutes: basicInfo.timeLimitMinutes || undefined,
                passing_score: basicInfo.passingScore,
                max_attempts: basicInfo.maxAttempts,
                randomize_questions: basicInfo.randomizeQuestions,
                show_results_immediately: basicInfo.showResultsImmediately,
                ai_grading_enabled: basicInfo.aiGradingEnabled,
                start_time: basicInfo.startTime || undefined,
                end_time: basicInfo.endTime || undefined,
                status: status || TestStatus.DRAFT,
                sections,
            }

            const result = await testApi.createTest(payload, finalFiles)
            alert('Tạo bài thi thành công!')
            navigate(`/teacher/tests/${result.id}/view`)
        } catch (error: any) {
            console.error('Failed to create test:', error)
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail
                if (Array.isArray(detail)) {
                    const messages = detail
                        .map((err) => `${err.loc.join('.')}: ${err.msg}`)
                        .join('\n')
                    alert(`Validation errors:\n${messages}`)
                } else {
                    alert(`Error: ${detail}`)
                }
            } else {
                alert(error.message || 'Tạo bài thi thất bại')
            }
        } finally {
            setSubmittingStatus('idle')
        }
    }

    return (
        <TestBuilderForm
            mode="create"
            pageTitle="Tạo bài thi mới"
            basicInfo={basicInfo}
            onBasicInfoChange={handleBasicInfoChange}
            sections={sections}
            uploadedFiles={uploadedFiles}
            actions={actions}
            submittingStatus={submittingStatus}
            onSubmitPublish={() => handleSubmit(TestStatus.PUBLISHED)}
            onSubmitDraft={() => handleSubmit(TestStatus.DRAFT)}
            onCancel={() => navigate(-1)}
        />
    )
}
