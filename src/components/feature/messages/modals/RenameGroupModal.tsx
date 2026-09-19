import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/core/Modal'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import InputField from '@/components/common/input/InputField'

interface RenameGroupModalProps {
    isOpen: boolean
    currentName?: string
    onClose: () => void
    onSubmit: (newName: string) => void
    isSubmitting: boolean
}

export const RenameGroupModal: React.FC<RenameGroupModalProps> = ({
    isOpen,
    currentName = '',
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    const [name, setName] = useState(currentName)

    useEffect(() => {
        if (isOpen) {
            setName(currentName)
        }
    }, [isOpen, currentName])

    const handleSubmit = () => {
        if (name && name.trim() !== currentName) {
            onSubmit(name.trim())
        } else {
            onClose()
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Đổi tên nhóm"
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
                        onClick={handleSubmit}
                        disabled={!name.trim() || isSubmitting}
                    >
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </ButtonPrimary>
                </div>
            }
        >
            <div style={{ paddingTop: '10px' }}>
                <InputField
                    label="Tên nhóm mới"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên nhóm..."
                    fullWidth
                    autoFocus
                />
            </div>
        </Modal>
    )
}
