import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './MessageContextMenu.module.css'
import EditIcon from '@/assets/Edit Pen.svg'
import DeleteIcon from '@/assets/Close X Thin.svg'

interface MessageContextMenuProps {
    x: number
    y: number
    onEdit: () => void
    onDelete: () => void
    onClose: () => void
    canEdit: boolean
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
    x,
    y,
    onEdit,
    onDelete,
    onClose,
    canEdit,
}) => {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                onClose()
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [onClose])

    // Adjust position if menu would go off screen
    useEffect(() => {
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            let adjustedX = x
            let adjustedY = y

            if (x + rect.width > viewportWidth) {
                adjustedX = viewportWidth - rect.width - 10
            }

            if (y + rect.height > viewportHeight) {
                adjustedY = viewportHeight - rect.height - 10
            }

            menuRef.current.style.left = `${adjustedX}px`
            menuRef.current.style.top = `${adjustedY}px`
        }
    }, [x, y])

    return createPortal(
        <div
            ref={menuRef}
            className={styles.menu}
            style={{ left: x, top: y }}
            role="menu"
        >
            {canEdit && (
                <button
                    type="button"
                    className={styles.menuItem}
                    onClick={() => {
                        onEdit()
                        onClose()
                    }}
                    role="menuitem"
                >
                    <img src={EditIcon} alt="" />
                    <span>Chỉnh sửa</span>
                </button>
            )}
            <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => {
                    onDelete()
                    onClose()
                }}
                role="menuitem"
            >
                <img src={DeleteIcon} alt="" />
                <span>Xóa tin nhắn</span>
            </button>
        </div>,
        document.body
    )
}
