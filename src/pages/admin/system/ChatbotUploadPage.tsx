import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatbotApi } from '@/lib/chatbot'
import type { ChatbotDocument, DocumentAudience } from '@/lib/chatbot'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'

import s from './ChatbotUploadPage.module.css'
import UploadIcon from '@/assets/File Add.svg'
import FileIcon from '@/assets/File.svg'
import { useDialog } from '@/hooks/useDialog'

const AUDIENCE_OPTIONS: ReadonlyArray<{
    value: DocumentAudience
    label: string
    badgeClass: string
}> = [
    { value: 'public', label: 'Công khai (Khách)', badgeClass: s.audPublic },
    { value: 'student', label: 'Học viên', badgeClass: s.audStudent },
    { value: 'teacher', label: 'Giáo viên', badgeClass: s.audTeacher },
    { value: 'staff', label: 'Nhân viên', badgeClass: s.audStaff },
    { value: 'admin', label: 'Quản trị viên', badgeClass: s.audAdmin },
]

const DEFAULT_AUDIENCES: DocumentAudience[] = [
    'student',
    'teacher',
    'staff',
    'admin',
]

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return String(error)
}

export default function ChatbotUploadPage() {
    const { alert: showAlert, confirm } = useDialog()
    const queryClient = useQueryClient()

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [docCategory, setDocCategory] = useState<string>('business')
    const [uploadAudiences, setUploadAudiences] =
        useState<DocumentAudience[]>(DEFAULT_AUDIENCES)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // File replace state
    const replaceInputRef = useRef<HTMLInputElement>(null)
    const [editingDocId, setEditingDocId] = useState<string | null>(null)

    // Bulk selection & Audience modal state
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
    const [audienceModalState, setAudienceModalState] = useState<{
        open: boolean
        mode: 'single' | 'bulk'
        targetDoc: ChatbotDocument | null
        targetIds: string[]
        audiences: DocumentAudience[]
    }>({
        open: false,
        mode: 'single',
        targetDoc: null,
        targetIds: [],
        audiences: DEFAULT_AUDIENCES,
    })

    // Polling state: track docs that are still processing
    const [processingDocIds, setProcessingDocIds] = useState<Set<string>>(
        new Set()
    )

    // Fetch documents
    const { data: documentsData, isLoading } = useQuery({
        queryKey: ['chatbotDocuments'],
        queryFn: () => chatbotApi.getDocuments({ limit: 100 }),
    })
    const documents = useMemo(
        () => documentsData?.data || [],
        [documentsData?.data]
    )

    const unreviewedDocs = useMemo(
        () =>
            documents.filter(
                (doc: ChatbotDocument) => doc.audience_reviewed === false
            ),
        [documents]
    )

    // ─── Polling for processing documents ──────────────────────────
    const pollProcessingDocs = useCallback(async () => {
        if (processingDocIds.size === 0) return

        let anyChanged = false
        for (const docId of processingDocIds) {
            try {
                const updated = await chatbotApi.getDocumentStatus(docId)
                if (updated.status !== 'processing') {
                    anyChanged = true
                    setProcessingDocIds((prev) => {
                        const next = new Set(prev)
                        next.delete(docId)
                        return next
                    })
                }
            } catch {
                // Ignore polling errors
            }
        }
        if (anyChanged) {
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
        }
    }, [processingDocIds, queryClient])

    useEffect(() => {
        if (processingDocIds.size === 0) return
        const interval = setInterval(pollProcessingDocs, 5000)
        return () => clearInterval(interval)
    }, [processingDocIds, pollProcessingDocs])

    // Track processing docs from the documents list
    useEffect(() => {
        const ids = documents
            .filter((doc: ChatbotDocument) => doc.status === 'processing')
            .map((doc: ChatbotDocument) => doc.id)
        if (ids.length > 0) {
            setProcessingDocIds((prev) => {
                const next = new Set(prev)
                ids.forEach((id: string) => next.add(id))
                return next
            })
        }
    }, [documents])

    // ─── API Mutations ─────────────────────────────────────────────
    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            chatbotApi.uploadDocument(file, docCategory, uploadAudiences),
        onSuccess: (data: ChatbotDocument) => {
            showAlert(
                'Tài liệu đang được tải lên AI Server kèm phân quyền truy cập. Bạn sẽ nhận thông báo khi hoàn tất.',
                'Đang xử lý'
            )
            setSelectedFile(null)
            setUploadAudiences(DEFAULT_AUDIENCES)
            setProcessingDocIds((prev) => new Set(prev).add(data.id))
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
        },
        onError: (error: unknown) => {
            console.error(error)
            showAlert(
                'Có lỗi xảy ra khi tải tài liệu: ' + getErrorMessage(error),
                'Lỗi'
            )
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (docId: string) => chatbotApi.deleteDocument(docId),
        onSuccess: () => {
            showAlert('Đã xóa tài liệu thành công.', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
        },
        onError: (error: unknown) => {
            console.error(error)
            showAlert('Có lỗi xảy ra khi xóa: ' + getErrorMessage(error), 'Lỗi')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ docId, file }: { docId: string; file: File }) =>
            chatbotApi.updateDocument(docId, file),
        onSuccess: () => {
            showAlert('Đã thay thế tài liệu thành công.', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
            setEditingDocId(null)
        },
        onError: (error: unknown) => {
            console.error(error)
            showAlert(
                'Có lỗi xảy ra khi cập nhật: ' + getErrorMessage(error),
                'Lỗi'
            )
            setEditingDocId(null)
        },
    })

    const audienceMutation = useMutation({
        mutationFn: async (params: {
            mode: 'single' | 'bulk'
            docId?: string
            documentIds?: string[]
            audience: DocumentAudience[]
        }) => {
            if (params.mode === 'single' && params.docId) {
                return chatbotApi.updateDocumentAudience(
                    params.docId,
                    params.audience,
                    true
                )
            }
            return chatbotApi.bulkUpdateDocumentAudience(
                params.documentIds || [],
                params.audience,
                true
            )
        },
        onSuccess: () => {
            showAlert(
                'Đã cập nhật quyền truy cập (Audience) cho tài liệu ngay lập tức mà không cần nhúng lại vector.',
                'Thành công'
            )
            setAudienceModalState((prev) => ({ ...prev, open: false }))
            setSelectedDocIds(new Set())
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
        },
        onError: (error: unknown) => {
            console.error(error)
            showAlert(
                'Không thể cập nhật phân quyền tài liệu: ' +
                    getErrorMessage(error),
                'Lỗi'
            )
        },
    })

    // ─── Audience Toggle Helpers ───────────────────────────────────
    const toggleAudienceInList = (
        list: DocumentAudience[],
        target: DocumentAudience
    ): DocumentAudience[] => {
        const exists = list.includes(target)
        const next = exists
            ? list.filter((item) => item !== target)
            : [...list, target]
        return AUDIENCE_OPTIONS.map((opt) => opt.value).filter((val) =>
            next.includes(val)
        )
    }

    const handleToggleUploadAudience = (aud: DocumentAudience) => {
        setUploadAudiences((prev) => toggleAudienceInList(prev, aud))
    }

    const handleToggleModalAudience = (aud: DocumentAudience) => {
        setAudienceModalState((prev) => ({
            ...prev,
            audiences: toggleAudienceInList(prev.audiences, aud),
        }))
    }

    // ─── Selection & Modal Handlers ────────────────────────────────
    const handleToggleSelectDoc = (docId: string) => {
        setSelectedDocIds((prev) => {
            const next = new Set(prev)
            if (next.has(docId)) {
                next.delete(docId)
            } else {
                next.add(docId)
            }
            return next
        })
    }

    const handleToggleSelectAll = () => {
        if (selectedDocIds.size === documents.length && documents.length > 0) {
            setSelectedDocIds(new Set())
        } else {
            setSelectedDocIds(new Set(documents.map((d) => d.id)))
        }
    }

    const openSingleAudienceModal = (doc: ChatbotDocument) => {
        const currentAud =
            doc.audience && doc.audience.length > 0
                ? doc.audience
                : DEFAULT_AUDIENCES
        setAudienceModalState({
            open: true,
            mode: 'single',
            targetDoc: doc,
            targetIds: [doc.id],
            audiences: currentAud,
        })
    }

    const openBulkAudienceModal = (idsOverride?: string[]) => {
        const ids = idsOverride || Array.from(selectedDocIds)
        if (ids.length === 0) return
        setAudienceModalState({
            open: true,
            mode: 'bulk',
            targetDoc: null,
            targetIds: ids,
            audiences: DEFAULT_AUDIENCES,
        })
    }

    const handleConfirmAudienceUpdate = () => {
        if (audienceModalState.audiences.length === 0) return
        if (
            audienceModalState.mode === 'single' &&
            audienceModalState.targetDoc
        ) {
            audienceMutation.mutate({
                mode: 'single',
                docId: audienceModalState.targetDoc.id,
                audience: audienceModalState.audiences,
            })
        } else {
            audienceMutation.mutate({
                mode: 'bulk',
                documentIds: audienceModalState.targetIds,
                audience: audienceModalState.audiences,
            })
        }
    }

    // ─── File Upload / Replace / Delete Handlers ───────────────────
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && editingDocId) {
            updateMutation.mutate({
                docId: editingDocId,
                file: e.target.files[0],
            })
            if (replaceInputRef.current) {
                replaceInputRef.current.value = ''
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0])
        }
    }

    const handleUpload = () => {
        if (!selectedFile) return
        if (uploadAudiences.length === 0) {
            showAlert(
                'Vui lòng chọn ít nhất một đối tượng được phép truy cập tài liệu.',
                'Thiếu thông tin phân quyền'
            )
            return
        }
        uploadMutation.mutate(selectedFile)
    }

    const handleDelete = async (doc: ChatbotDocument) => {
        const deleteId =
            doc.status === 'completed' && doc.doc_id ? doc.doc_id : doc.id

        const ok = await confirm({
            title: 'Xác nhận xóa',
            message:
                'Bạn có chắc chắn muốn xóa tài liệu này? Chatbot sẽ không thể trả lời dựa trên tài liệu này nữa.',
            type: 'danger',
            confirmText: 'Xóa',
            cancelText: 'Hủy',
        })

        if (ok) {
            deleteMutation.mutate(deleteId)
        }
    }

    const triggerReplace = (docId: string) => {
        setEditingDocId(docId)
        replaceInputRef.current?.click()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const isPending =
        uploadMutation.isPending ||
        deleteMutation.isPending ||
        updateMutation.isPending ||
        audienceMutation.isPending

    // ─── Render Helpers ────────────────────────────────────────────
    const renderAudienceBadges = (doc: ChatbotDocument) => {
        const audList: DocumentAudience[] =
            doc.audience && doc.audience.length > 0
                ? doc.audience
                : DEFAULT_AUDIENCES

        return (
            <div className={s.audienceBadgeList}>
                {AUDIENCE_OPTIONS.filter((opt) =>
                    audList.includes(opt.value)
                ).map((opt) => (
                    <span
                        key={opt.value}
                        className={`${s.audBadge} ${opt.badgeClass}`}
                    >
                        {opt.label}
                    </span>
                ))}
                {doc.audience_reviewed === false && (
                    <span
                        className={s.audUnreviewedTag}
                        title="Tài liệu cũ được gán quyền mặc định, cần Quản trị viên xác nhận lại."
                    >
                        Chưa rà soát
                    </span>
                )}
            </div>
        )
    }

    const renderStatusBadge = (doc: ChatbotDocument) => {
        switch (doc.status) {
            case 'processing':
                return (
                    <span className={`${s.tag} ${s.tagProcessing}`}>
                        <span className={s.spinner} />
                        Đang tải lên
                    </span>
                )
            case 'failed':
                return (
                    <span
                        className={`${s.tag} ${s.tagFailed}`}
                        title={doc.error_message || 'Unknown error'}
                    >
                        Thất bại
                    </span>
                )
            case 'completed':
            default:
                return (
                    <span className={`${s.tag} ${s.tagCompleted}`}>
                        Hoàn tất
                    </span>
                )
        }
    }

    const renderRowActions = (doc: ChatbotDocument) => {
        if (doc.status === 'processing') {
            return (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    Đang xử lý...
                </span>
            )
        }

        if (doc.status === 'failed') {
            return (
                <div className={s.tableActions}>
                    <button
                        className={`${s.btnText} ${s.btnTextDanger}`}
                        onClick={() => handleDelete(doc)}
                        disabled={isPending}
                    >
                        Xóa
                    </button>
                </div>
            )
        }

        return (
            <div className={s.tableActions}>
                <button
                    className={s.btnText}
                    onClick={() => openSingleAudienceModal(doc)}
                    disabled={isPending}
                >
                    Phân quyền
                </button>
                {doc.doc_id && (
                    <button
                        className={s.btnText}
                        onClick={() => triggerReplace(doc.doc_id!)}
                        disabled={isPending}
                    >
                        {updateMutation.isPending && editingDocId === doc.doc_id
                            ? 'Đang tải...'
                            : 'Thay thế'}
                    </button>
                )}
                <button
                    className={`${s.btnText} ${s.btnTextDanger}`}
                    onClick={() => handleDelete(doc)}
                    disabled={isPending}
                >
                    Xóa
                </button>
            </div>
        )
    }

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý Kiến thức Chatbot</h1>

                {unreviewedDocs.length > 0 && (
                    <div className={s.unreviewedBanner} role="status">
                        <div className={s.unreviewedBannerText}>
                            <span className={s.unreviewedBannerTitle}>
                                Có {unreviewedDocs.length} tài liệu cũ chưa được
                                rà soát quyền truy cập (Audience)
                            </span>
                            <span>
                                Các tài liệu cũ đang được đặt mặc định cho Học
                                viên, Giáo viên, Nhân viên và Quản trị viên (ẩn
                                khỏi Widget công khai của Khách).
                            </span>
                        </div>
                        <button
                            type="button"
                            className={s.unreviewedBannerBtn}
                            onClick={() => {
                                const ids = unreviewedDocs.map((d) => d.id)
                                setSelectedDocIds(new Set(ids))
                                openBulkAudienceModal(ids)
                            }}
                        >
                            Rà soát hàng loạt ({unreviewedDocs.length})
                        </button>
                    </div>
                )}

                <Card className={s.uploadCard}>
                    {!selectedFile ? (
                        <div
                            className={`${s.dropZone} ${isDragOver ? s.dragOver : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                                accept=".pdf,.doc,.docx,.txt,.md"
                            />
                            <img
                                src={UploadIcon}
                                alt=""
                                className={s.uploadIcon}
                            />
                            <p className={s.uploadText}>
                                Kéo thả tài liệu vào đây hoặc bấm để chọn
                            </p>
                            <p className={s.uploadSubText}>
                                Hỗ trợ: PDF, Word, TXT, MD
                            </p>
                        </div>
                    ) : (
                        <div className={s.fileInfo}>
                            <div className={s.fileName}>
                                <img
                                    src={FileIcon}
                                    alt=""
                                    style={{ width: 24, opacity: 0.6 }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600 }}>
                                        {selectedFile.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#64748b',
                                        }}
                                    >
                                        {(
                                            selectedFile.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{' '}
                                        MB
                                    </div>
                                </div>
                            </div>
                            <button
                                className={s.removeBtn}
                                onClick={() => setSelectedFile(null)}
                                disabled={isPending}
                            >
                                Xóa
                            </button>
                        </div>
                    )}

                    {selectedFile && (
                        <>
                            <div className={s.formGroup}>
                                <label className={s.formLabel}>
                                    Phân loại tài liệu:
                                </label>
                                <select
                                    value={docCategory}
                                    onChange={(e) =>
                                        setDocCategory(e.target.value)
                                    }
                                    disabled={isPending}
                                    className={s.selectInput}
                                >
                                    <option value="business">
                                        Tài liệu Nghiệp vụ (Nội quy, Học phí,
                                        Lịch trình, HDSD...)
                                    </option>
                                    <option value="learning">
                                        Tài liệu Học tập (Kiến thức tiếng Anh,
                                        Ngữ pháp, IELTS...)
                                    </option>
                                </select>
                            </div>

                            <div className={s.formGroup}>
                                <label className={s.formLabel}>
                                    Đối tượng được phép truy cập (Bắt buộc chọn
                                    ít nhất 1):
                                </label>
                                <span className={s.formHint}>
                                    Chỉ người dùng thuộc các nhóm được chọn mới
                                    nhận được thông tin trích xuất từ tài liệu
                                    này khi hỏi Chatbot.
                                </span>
                                <div className={s.audienceOptionGrid}>
                                    {AUDIENCE_OPTIONS.map((opt) => {
                                        const checked =
                                            uploadAudiences.includes(opt.value)
                                        return (
                                            <label
                                                key={opt.value}
                                                className={`${s.audienceCheckboxLabel} ${checked ? s.audienceCheckboxLabelActive : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        handleToggleUploadAudience(
                                                            opt.value
                                                        )
                                                    }
                                                    disabled={isPending}
                                                />
                                                <span>{opt.label}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                                {uploadAudiences.length === 0 && (
                                    <span className={s.audienceValidationError}>
                                        Vui lòng chọn ít nhất một nhóm đối tượng
                                        được phép truy cập.
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    <div className={s.actions}>
                        <ButtonGhost
                            onClick={() => setSelectedFile(null)}
                            disabled={!selectedFile || isPending}
                        >
                            Hủy bỏ
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleUpload}
                            disabled={
                                !selectedFile ||
                                uploadAudiences.length === 0 ||
                                isPending
                            }
                        >
                            {uploadMutation.isPending
                                ? 'Đang gửi...'
                                : 'Xác nhận tải lên'}
                        </ButtonPrimary>
                    </div>
                </Card>

                <Card className={s.uploadCard} style={{ marginTop: 0 }}>
                    <div className={s.tableHeaderToolbar}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                                Lịch sử và Phân quyền Tài liệu
                            </h2>
                            <p className={s.uploadSubText}>
                                Danh sách các tài liệu Chatbot đã học và phạm vi
                                vai trò được phép truy xuất
                            </p>
                        </div>
                    </div>

                    {selectedDocIds.size > 0 && (
                        <div className={s.bulkToolbar}>
                            <span>
                                Đã chọn {selectedDocIds.size} tài liệu trong
                                danh sách
                            </span>
                            <div className={s.bulkToolbarActions}>
                                <button
                                    type="button"
                                    className={s.btnText}
                                    onClick={() => setSelectedDocIds(new Set())}
                                >
                                    Bỏ chọn
                                </button>
                                <button
                                    type="button"
                                    className={s.bulkActionBtn}
                                    onClick={() => openBulkAudienceModal()}
                                >
                                    Sửa quyền truy cập hàng loạt
                                </button>
                            </div>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={replaceInputRef}
                        style={{ display: 'none' }}
                        onChange={handleReplaceFile}
                        accept=".pdf,.doc,.docx,.txt,.md"
                    />

                    <div className={s.tableContainer}>
                        {isLoading ? (
                            <div className={s.emptyState}>
                                Đang tải danh sách...
                            </div>
                        ) : documents.length === 0 ? (
                            <div className={s.emptyState}>
                                Chưa có tài liệu nào được tải lên.
                            </div>
                        ) : (
                            <table className={s.documentTable}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 36 }}>
                                            <input
                                                type="checkbox"
                                                checked={
                                                    documents.length > 0 &&
                                                    selectedDocIds.size ===
                                                        documents.length
                                                }
                                                onChange={handleToggleSelectAll}
                                                aria-label="Chọn tất cả tài liệu"
                                            />
                                        </th>
                                        <th>Tên file</th>
                                        <th>Phân loại</th>
                                        <th>Đối tượng (Audience)</th>
                                        <th>Trạng thái</th>
                                        <th>Người tải lên</th>
                                        <th>Ngày tải</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc: ChatbotDocument) => (
                                        <tr
                                            key={doc.id}
                                            className={
                                                doc.status === 'processing'
                                                    ? s.rowProcessing
                                                    : doc.status === 'failed'
                                                      ? s.rowFailed
                                                      : ''
                                            }
                                        >
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocIds.has(
                                                        doc.id
                                                    )}
                                                    onChange={() =>
                                                        handleToggleSelectDoc(
                                                            doc.id
                                                        )
                                                    }
                                                    aria-label={`Chọn ${doc.filename}`}
                                                />
                                            </td>
                                            <td style={{ fontWeight: 500 }}>
                                                {doc.filename}
                                            </td>
                                            <td>
                                                <span
                                                    className={`${s.tag} ${doc.category === 'business' ? s.tagBusiness : s.tagLearning}`}
                                                >
                                                    {doc.category === 'business'
                                                        ? 'Nghiệp vụ'
                                                        : 'Học tập'}
                                                </span>
                                            </td>
                                            <td>{renderAudienceBadges(doc)}</td>
                                            <td>{renderStatusBadge(doc)}</td>
                                            <td>{doc.uploaded_by_name}</td>
                                            <td style={{ color: '#64748b' }}>
                                                {formatDate(doc.created_at)}
                                            </td>
                                            <td>{renderRowActions(doc)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>

                {audienceModalState.open && (
                    <div
                        className={s.modalOverlay}
                        onClick={() =>
                            setAudienceModalState((prev) => ({
                                ...prev,
                                open: false,
                            }))
                        }
                    >
                        <div
                            className={s.modalContent}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                        >
                            <h3 className={s.modalTitle}>
                                {audienceModalState.mode === 'single'
                                    ? 'Phân quyền truy cập tài liệu'
                                    : `Phân quyền hàng loạt (${audienceModalState.targetIds.length} tài liệu)`}
                            </h3>
                            <p className={s.modalSubtitle}>
                                {audienceModalState.mode === 'single' &&
                                audienceModalState.targetDoc
                                    ? `Tài liệu: ${audienceModalState.targetDoc.filename}. Thay đổi có hiệu lực ngay trên Qdrant Vector Store mà không cần nhúng lại.`
                                    : 'Chọn các nhóm vai trò được phép truy xuất nội dung từ các tài liệu đã chọn.'}
                            </p>

                            <div className={s.audienceOptionGrid}>
                                {AUDIENCE_OPTIONS.map((opt) => {
                                    const checked =
                                        audienceModalState.audiences.includes(
                                            opt.value
                                        )
                                    return (
                                        <label
                                            key={opt.value}
                                            className={`${s.audienceCheckboxLabel} ${checked ? s.audienceCheckboxLabelActive : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() =>
                                                    handleToggleModalAudience(
                                                        opt.value
                                                    )
                                                }
                                                disabled={
                                                    audienceMutation.isPending
                                                }
                                            />
                                            <span>{opt.label}</span>
                                        </label>
                                    )
                                })}
                            </div>

                            {audienceModalState.audiences.length === 0 && (
                                <span className={s.audienceValidationError}>
                                    Phải chọn ít nhất một nhóm đối tượng được
                                    phép truy cập.
                                </span>
                            )}

                            <div className={s.modalFooter}>
                                <ButtonGhost
                                    onClick={() =>
                                        setAudienceModalState((prev) => ({
                                            ...prev,
                                            open: false,
                                        }))
                                    }
                                    disabled={audienceMutation.isPending}
                                >
                                    Hủy
                                </ButtonGhost>
                                <ButtonPrimary
                                    onClick={handleConfirmAudienceUpdate}
                                    disabled={
                                        audienceModalState.audiences.length ===
                                            0 || audienceMutation.isPending
                                    }
                                >
                                    {audienceMutation.isPending
                                        ? 'Đang lưu...'
                                        : 'Lưu phân quyền'}
                                </ButtonPrimary>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
