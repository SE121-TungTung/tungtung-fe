import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { testApi } from '@/lib/test'
import { TestStatus, type TestCreatePayload } from '@/types/test.types'
import { useEditTest } from '@/hooks/useEditTest'
import { useDialog } from '@/hooks/useDialog'
import type { TestBasicInfo } from './builder/types'
import TestBuilderForm from './builder/TestBuilderForm'
import { validateTestForm } from './builder/validateTestForm'

export default function EditTestPage() {
    const { testId } = useParams<{ testId: string }>()
    const navigate = useNavigate()
    const { alert, confirm } = useDialog()

    const {
        sections,
        uploadedFiles,
        loading: loadingTest,
        error: loadError,
        originalTest,
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
    } = useEditTest(testId || '')

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

    const [submittingStatus, setSubmittingStatus] = useState<
        'idle' | 'saving' | 'publishing'
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

    useEffect(() => {
        if (!testId) {
            navigate('/teacher/tests')
        }
    }, [testId, navigate])

    useEffect(() => {
        if (originalTest) {
            setBasicInfo({
                title: originalTest.title,
                description: originalTest.description || '',
                instructions: originalTest.instructions || '',
                testType: originalTest.testType,
                timeLimitMinutes: originalTest.timeLimitMinutes || 60,
                passingScore: originalTest.passingScore,
                maxAttempts: originalTest.maxAttempts,
                randomizeQuestions: originalTest.randomizeQuestions,
                showResultsImmediately: originalTest.showResultsImmediately,
                aiGradingEnabled: originalTest.aiGradingEnabled,
                startTime: originalTest.startTime || '',
                endTime: originalTest.endTime || '',
            })
        }
    }, [originalTest])

    const handleBasicInfoChange = (data: Partial<TestBasicInfo>) => {
        setBasicInfo((prev) => ({ ...prev, ...data }))
    }

    const handleUpdate = async () => {
        if (!validateTestForm(basicInfo, sections, alert)) return

        setSubmittingStatus('saving')
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
                status: originalTest?.status || TestStatus.DRAFT,
                sections,
            }

            await testApi.updateTest(testId!, payload, finalFiles)
            alert('Cập nhật bài thi thành công!')
            navigate(`/teacher/tests/${testId}/view`)
        } catch (error: any) {
            console.error('Failed to update test:', error)
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
                alert(error.message || 'Cập nhật bài thi thất bại')
            }
        } finally {
            setSubmittingStatus('idle')
        }
    }

    const handlePublish = async () => {
        if (!confirm('Bạn có chắc muốn xuất bản bài thi này?')) {
            return
        }

        setSubmittingStatus('publishing')
        try {
            await testApi.publishTest(testId!)
            alert('Đã xuất bản bài thi!')
            navigate(`/teacher/tests/${testId}/view`)
        } catch (error: any) {
            console.error('Failed to publish test:', error)
            alert(error.message || 'Xuất bản thất bại')
        } finally {
            setSubmittingStatus('idle')
        }
    }

    if (!testId) {
        return null
    }

    return (
        <TestBuilderForm
            mode="edit"
            pageTitle="Chỉnh sửa bài thi"
            basicInfo={basicInfo}
            onBasicInfoChange={handleBasicInfoChange}
            sections={sections}
            uploadedFiles={uploadedFiles}
            actions={actions}
            submittingStatus={submittingStatus}
            onSubmitSave={handleUpdate}
            onSubmitPublish={handlePublish}
            onCancel={() => navigate(`/teacher/tests/${testId}/view`)}
            isDraft={originalTest?.status === TestStatus.DRAFT}
            loading={loadingTest}
            loadError={loadError}
        />
    )
}
