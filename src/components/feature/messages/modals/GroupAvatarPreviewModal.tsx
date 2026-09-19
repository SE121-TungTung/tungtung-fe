import React from 'react'
import { Modal } from '@/components/core/Modal'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'

interface GroupAvatarPreviewModalProps {
    isOpen: boolean
    avatarPreviewUrl: string | null
    onClose: () => void
    onConfirm: () => void
    isSubmitting: boolean
}

export const GroupAvatarPreviewModal: React.FC<
    GroupAvatarPreviewModalProps
> = ({ isOpen, avatarPreviewUrl, onClose, onConfirm, isSubmitting }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xem trước ảnh đại diện"
            footer={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px',
                    }}
                >
                    <ButtonGhost onClick={onClose}>Hủy</ButtonGhost>
                    <ButtonPrimary onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang tải lên...' : 'Lưu thay đổi'}
                    </ButtonPrimary>
                </div>
            }
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px 0',
                }}
            >
                <div
                    style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '4px solid var(--color-surface-raised)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                >
                    {avatarPreviewUrl && (
                        <img
                            src={avatarPreviewUrl}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </div>
                <p
                    style={{
                        marginTop: '16px',
                        color: 'var(--color-text-secondary)',
                        textAlign: 'center',
                    }}
                >
                    Ảnh đại diện nhóm sẽ hiển thị như thế này với mọi thành
                    viên.
                </p>
            </div>
        </Modal>
    )
}
