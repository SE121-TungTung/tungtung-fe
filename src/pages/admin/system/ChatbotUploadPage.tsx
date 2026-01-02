import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
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

    // State
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // API Mutation
    const uploadMutation = useMutation({
        mutationFn: (file: File) => chatbotApi.uploadDocument(file),
        onSuccess: () => {
            showAlert(
                'Tải tài liệu thành công! Chatbot sẽ sớm học được kiến thức này.',
                'Thành công'
            )
            setSelectedFile(null)
        },
        onError: (error: any) => {
            console.error(error)
            showAlert('Có lỗi xảy ra khi tải tài liệu: ' + error.message, 'Lỗi')
        },
    })

    // Handlers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
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
                                accept=".pdf,.doc,.docx,.txt"
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
                                Hỗ trợ: PDF, Word, TXT (Tối đa 10MB)
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
                                disabled={uploadMutation.isPending}
                            >
                                Xóa
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className={s.actions}>
                        <ButtonGhost
                            onClick={() => setSelectedFile(null)}
                            disabled={!selectedFile || uploadMutation.isPending}
                        >
                            Hủy bỏ
                        </ButtonGhost>
                        <ButtonPrimary
                            onClick={handleUpload}
                            disabled={!selectedFile || uploadMutation.isPending}
                        >
                            {uploadMutation.isPending
                                ? 'Đang tải lên...'
                                : 'Xác nhận tải lên'}
                        </ButtonPrimary>
                    </div>
                </Card>
            </main>
        </div>
    )
}
