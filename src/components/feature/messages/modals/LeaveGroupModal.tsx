import React from 'react'
import { Modal } from '@/components/core/Modal'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

interface LeaveGroupModalProps {
    isOpen: boolean
    groupName?: string
    onClose: () => void
    onConfirm: () => void
    isSubmitting: boolean
}

export const LeaveGroupModal: React.FC<LeaveGroupModalProps> = ({
    isOpen,
    groupName,
    onClose,
    onConfirm,
    isSubmitting,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Rời khỏi nhóm?"
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
                        {isSubmitting ? 'Đang xử lý...' : 'Rời nhóm'}
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
                Bạn có chắc chắn muốn rời khỏi nhóm{' '}
                <strong>{groupName || 'này'}</strong> không?
            </p>
        </Modal>
    )
}
