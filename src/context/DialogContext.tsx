import React, { useState, useCallback, useRef } from 'react'
import { Modal } from '@/components/core/Modal'
import { ButtonPrimary } from '@/components/common/button/ButtonPrimary'
import ButtonGhost from '@/components/common/button/ButtonGhost'
import { DialogContext, type DialogOptions } from './dialog.constants'

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState<DialogOptions>({ message: '' })

    // Dùng useRef để giữ hàm resolve của Promise
    const awaiter = useRef<(value: boolean) => void>(() => {})

    const close = () => {
        setIsOpen(false)
        awaiter.current(false) // Mặc định trả về false nếu đóng
    }

    const handleConfirm = () => {
        setIsOpen(false)
        awaiter.current(true) // Trả về true nếu bấm confirm
    }

    const handleCancel = () => {
        setIsOpen(false)
        awaiter.current(false)
    }

    const alert = useCallback((message: string, title = 'Thông báo') => {
        return new Promise<void>((resolve) => {
            setConfig({
                title,
                message,
                type: 'info',
                confirmText: 'Đóng',
            })
            awaiter.current = () => resolve()
            setIsOpen(true)
        })
    }, [])

    const confirm = useCallback((options: DialogOptions | string) => {
        return new Promise<boolean>((resolve) => {
            if (typeof options === 'string') {
                setConfig({
                    title: 'Xác nhận',
                    message: options,
                    type: 'confirm',
                })
            } else {
                setConfig({
                    title: options.title || 'Xác nhận',
                    message: options.message,
                    confirmText: options.confirmText,
                    cancelText: options.cancelText,
                    type: options.type || 'confirm',
                })
            }
            awaiter.current = resolve
            setIsOpen(true)
        })
    }, [])

    return (
        <DialogContext.Provider value={{ alert, confirm }}>
            {children}

            {/* GLOBAL MODAL RENDER Ở ĐÂY */}
            <Modal
                isOpen={isOpen}
                onClose={close}
                title={config.title || 'Thông báo'}
                footer={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px',
                        }}
                    >
                        {config.type !== 'info' && (
                            <ButtonGhost onClick={handleCancel}>
                                {config.cancelText || 'Hủy bỏ'}
                            </ButtonGhost>
                        )}
                        <ButtonPrimary
                            onClick={handleConfirm}
                            style={
                                config.type === 'danger'
                                    ? {
                                          backgroundColor:
                                              'var(--status-danger-500-light)',
                                          borderColor:
                                              'var(--status-danger-500-light)',
                                      }
                                    : {}
                            }
                        >
                            {config.confirmText || 'Đồng ý'}
                        </ButtonPrimary>
                    </div>
                }
            >
                <p
                    style={{
                        color: 'var(--text-secondary-light)',
                        lineHeight: 1.5,
                    }}
                >
                    {config.message}
                </p>
            </Modal>
        </DialogContext.Provider>
    )
}
