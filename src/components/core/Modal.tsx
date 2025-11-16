import React, { type PropsWithChildren, useEffect } from 'react'
import styles from './Modal.module.css'
import IconX from '@/assets/X Mark.svg'
import { ButtonPrimary } from '../common/button/ButtonPrimary'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    footer?: React.ReactNode
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => {
            document.removeEventListener('keydown', handleEsc)
        }
    }, [onClose])

    if (!isOpen) {
        return null
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <ButtonPrimary
                        variant="ghost"
                        size="sm"
                        iconOnly
                        onClick={onClose}
                        aria-label="Đóng modal"
                    >
                        <img src={IconX} alt="Đóng" />
                    </ButtonPrimary>
                </header>

                <div className={styles.content}>{children}</div>

                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </div>
    )
}
