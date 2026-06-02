import { useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatbotApi } from '@/lib/chatbot'

import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import Card from '@/components/common/card/Card'

import s from './ChatbotUploadPage.module.css'
import UploadIcon from '@/assets/File Add.svg'
import FileIcon from '@/assets/File.svg'
import { useDialog } from '@/hooks/useDialog'

export default function ChatbotUploadPage() {
    // Navigation Setup
    const { alert: showAlert } = useDialog()
    const queryClient = useQueryClient()

    // State
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [docCategory, setDocCategory] = useState<string>('business')
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Edit state
    const replaceInputRef = useRef<HTMLInputElement>(null)
    const [editingDocId, setEditingDocId] = useState<string | null>(null)

    // Fetch documents
    const { data: documentsData, isLoading } = useQuery({
        queryKey: ['chatbotDocuments'],
        queryFn: () => chatbotApi.getDocuments(),
    })
    const documents = documentsData?.data || []

    // API Mutations
    const uploadMutation = useMutation({
        mutationFn: (file: File) =>
            chatbotApi.uploadDocument(file, docCategory),
        onSuccess: () => {
            showAlert(
                'Tải tài liệu thành công! Chatbot sẽ sớm học được kiến thức này.',
                'Thành công'
            )
            setSelectedFile(null)
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
        },
        onError: (error: any) => {
            console.error(error)
            showAlert('Có lỗi xảy ra khi tải tài liệu: ' + error.message, 'Lỗi')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (docId: string) => chatbotApi.deleteDocument(docId),
        onSuccess: () => {
            showAlert('Đã xóa tài liệu thành công.', 'Thành công')
            queryClient.invalidateQueries({ queryKey: ['chatbotDocuments'] })
        },
        onError: (error: any) => {
            console.error(error)
            showAlert('Có lỗi xảy ra khi xóa: ' + error.message, 'Lỗi')
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
        onError: (error: any) => {
            console.error(error)
            showAlert('Có lỗi xảy ra khi cập nhật: ' + error.message, 'Lỗi')
            setEditingDocId(null)
        },
    })

    // Handlers
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
            // Reset input
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
        if (selectedFile) {
            uploadMutation.mutate(selectedFile)
        }
    }

    const handleDelete = (docId: string) => {
        if (
            window.confirm(
                'Bạn có chắc chắn muốn xóa tài liệu này? Chatbot sẽ không thể trả lời dựa trên tài liệu này nữa.'
            )
        ) {
            deleteMutation.mutate(docId)
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
        updateMutation.isPending

    return (
        <div className={s.pageWrapperWithoutHeader}>
            <main className={s.mainContent}>
                <h1 className={s.pageTitle}>Quản lý Kiến thức Chatbot</h1>

                <Card className={s.uploadCard}>
                    {/* Upload Area */}
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

                    {/* Category Selection */}
                    {selectedFile && (
                        <div
                            style={{
                                marginTop: 24,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            }}
                        >
                            <label style={{ fontWeight: 600, fontSize: 14 }}>
                                Phân loại tài liệu:
                            </label>
                            <select
                                value={docCategory}
                                onChange={(e) => setDocCategory(e.target.value)}
                                disabled={isPending}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#fff',
                                    fontSize: 14,
                                }}
                            >
                                <option value="business">
                                    Tài liệu Nghiệp vụ (Nội quy, Học phí, Lịch
                                    trình, HDSD...)
                                </option>
                                <option value="learning">
                                    Tài liệu Học tập (Kiến thức tiếng Anh, Ngữ
                                    pháp, IELTS...)
                                </option>
                            </select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className={s.actions}>
                        <ButtonGhost
                            onClick={() => setSelectedFile(null)}
                            disabled={!selectedFile || isPending}
                        >
                            Hủy bỏ
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleUpload}
                            disabled={!selectedFile || isPending}
                        >
                            {uploadMutation.isPending
                                ? 'Đang tải lên...'
                                : 'Xác nhận tải lên'}
                        </ButtonPrimary>
                    </div>
                </Card>

                <Card className={s.uploadCard} style={{ marginTop: 0 }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                        Lịch sử tài liệu
                    </h2>
                    <p className={s.uploadSubText}>
                        Danh sách các tài liệu Chatbot đã học
                    </p>

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
                                        <th>Tên file</th>
                                        <th>Phân loại</th>
                                        <th>Người tải lên</th>
                                        <th>Ngày tải</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc: any) => (
                                        <tr key={doc.doc_id}>
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
                                            <td>{doc.uploaded_by_name}</td>
                                            <td style={{ color: '#64748b' }}>
                                                {formatDate(doc.created_at)}
                                            </td>
                                            <td>
                                                <div className={s.tableActions}>
                                                    <button
                                                        className={s.btnText}
                                                        onClick={() =>
                                                            triggerReplace(
                                                                doc.doc_id
                                                            )
                                                        }
                                                        disabled={isPending}
                                                    >
                                                        {updateMutation.isPending &&
                                                        editingDocId ===
                                                            doc.doc_id
                                                            ? 'Đang tải...'
                                                            : 'Thay thế'}
                                                    </button>
                                                    <button
                                                        className={`${s.btnText} ${s.btnTextDanger}`}
                                                        onClick={() =>
                                                            handleDelete(
                                                                doc.doc_id
                                                            )
                                                        }
                                                        disabled={isPending}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    )
}
