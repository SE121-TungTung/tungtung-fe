import type { TestSectionCreatePayload } from '@/types/test.types'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import { ButtonGhost } from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'
import Skeleton from '@/components/effect/Skeleton'
import TestNavigator from '@/components/feature/exams/TestNavigator'
import type { TestBasicInfo, TestBuilderActions } from './types'
import TestBasicInfoCard from './TestBasicInfoCard'
import TestSectionCard from './TestSectionCard'
import s from '../CreateTestPage.module.css'

export interface TestBuilderFormProps {
    mode: 'create' | 'edit'
    pageTitle: string
    basicInfo: TestBasicInfo
    onBasicInfoChange: (data: Partial<TestBasicInfo>) => void
    sections: TestSectionCreatePayload[]
    uploadedFiles: Record<string, File>
    actions: TestBuilderActions
    submittingStatus: 'idle' | 'draft' | 'published' | 'saving' | 'publishing'
    onSubmitPublish?: () => void
    onSubmitDraft?: () => void
    onSubmitSave?: () => void
    onCancel: () => void
    isDraft?: boolean
    loading?: boolean
    loadError?: string | null
}

export default function TestBuilderForm({
    mode,
    pageTitle,
    basicInfo,
    onBasicInfoChange,
    sections,
    uploadedFiles,
    actions,
    submittingStatus,
    onSubmitPublish,
    onSubmitDraft,
    onSubmitSave,
    onCancel,
    isDraft = false,
    loading = false,
    loadError = null,
}: TestBuilderFormProps) {
    const handleNavigate = (sectionIndex: number, partIndex?: number) => {
        const targetId =
            partIndex !== undefined
                ? `section-${sectionIndex}-part-${partIndex}`
                : `section-${sectionIndex}`
        const element = document.getElementById(targetId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    if (loading) {
        return (
            <div className={s.container}>
                <div className={s.layout}>
                    <div className={s.content}>
                        <Skeleton width={300} height={40} />
                        <Card title="Thông tin cơ bản" variant="outline">
                            <div className={s.formGrid}>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className={s.formField}>
                                        <Skeleton variant="text" width={100} />
                                        <Skeleton height={40} />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (loadError) {
        return (
            <div className={s.container}>
                <div className={s.layout}>
                    <div className={s.content}>
                        <Card variant="outline">
                            <div
                                style={{ textAlign: 'center', padding: '40px' }}
                            >
                                <p
                                    style={{
                                        color: 'var(--status-danger-500-light, #dc3545)',
                                        marginBottom: '16px',
                                    }}
                                >
                                    ❌ {loadError}
                                </p>
                                <ButtonGhost onClick={onCancel}>
                                    Quay lại danh sách
                                </ButtonGhost>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={s.container}>
            <div className={s.layout}>
                <TestNavigator
                    sections={sections}
                    onNavigate={handleNavigate}
                />
                <div className={s.content}>
                    <h1 className={s.pageTitle}>{pageTitle}</h1>

                    {/* Basic Info Card */}
                    <TestBasicInfoCard
                        basicInfo={basicInfo}
                        onChange={onBasicInfoChange}
                    />

                    {/* Sections List */}
                    {sections.map((section, sIndex) => (
                        <TestSectionCard
                            key={sIndex}
                            sIndex={sIndex}
                            section={section}
                            uploadedFiles={uploadedFiles}
                            actions={actions}
                        />
                    ))}

                    <ButtonGhost size="md" onClick={actions.handleAddSection}>
                        + Thêm Section
                    </ButtonGhost>

                    {/* Actions */}
                    <div className={s.actions}>
                        <ButtonGhost onClick={onCancel}>Hủy</ButtonGhost>

                        {mode === 'create' && (
                            <>
                                <ButtonPrimary
                                    onClick={onSubmitPublish}
                                    loading={submittingStatus === 'published'}
                                    disabled={submittingStatus !== 'idle'}
                                >
                                    Tạo bài thi
                                </ButtonPrimary>
                                <ButtonPrimary
                                    onClick={onSubmitDraft}
                                    loading={submittingStatus === 'draft'}
                                    disabled={submittingStatus !== 'idle'}
                                    variant="outline"
                                >
                                    Lưu nháp
                                </ButtonPrimary>
                            </>
                        )}

                        {mode === 'edit' && (
                            <>
                                <ButtonPrimary
                                    onClick={onSubmitSave}
                                    loading={submittingStatus === 'saving'}
                                    disabled={submittingStatus !== 'idle'}
                                >
                                    Lưu thay đổi
                                </ButtonPrimary>

                                {isDraft && onSubmitPublish && (
                                    <ButtonPrimary
                                        onClick={onSubmitPublish}
                                        loading={
                                            submittingStatus === 'publishing'
                                        }
                                        disabled={submittingStatus !== 'idle'}
                                        variant="gradient"
                                    >
                                        🚀 Xuất bản
                                    </ButtonPrimary>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
