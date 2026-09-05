import React from 'react'
import { Modal } from '@/components/core/Modal'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

interface DeleteConversationModalProps {
    isOpen: boolean
    isGroup: boolean
    titleName?: string
    onClose: () => void
    onConfirm: () => void
    isSubmitting: boolean
}

export const DeleteConversationModal: React.FC<
    DeleteConversationModalProps
> = ({ isOpen, isGroup, titleName, onClose, onConfirm, isSubmitting }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isGroup ? 'Xóa nhóm?' : 'Xóa cuộc trò chuyện?'}
            footer={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                    }}
                >
                    <ButtonGhost onClick={onClose}>Hủy</ButtonGhost>
                    <ButtonPrimary
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        style={{
                            backgroundColor: 'var(--color-status-danger)',
                            borderColor: 'var(--color-status-danger)',
                        }}
                    >
                        {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                    </ButtonPrimary>
                </div>
            }
        >
            <p
                style={{
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                }}
            >
                {isGroup
                    ? `Bạn có chắc muốn xóa nhóm "${titleName}"?`
                    : `Bạn có chắc muốn xóa cuộc trò chuyện với ${titleName}?`}
            </p>
        </Modal>
    )
}
