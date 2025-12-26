import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './ConversationContextMenu.module.css'
import MuteIcon from '@/assets/Block.svg'
import CheckIcon from '@/assets/Check.svg'
import DeleteIcon from '@/assets/Close X Thin.svg'

interface ConversationContextMenuProps {
    x: number
    y: number
    isMuted: boolean
    onMuteToggle: () => void
    onMarkAsRead: () => void
    onDelete: () => void
    onClose: () => void
}

export const ConversationContextMenu: React.FC<
    ConversationContextMenuProps
> = ({ x, y, isMuted, onMuteToggle, onMarkAsRead, onDelete, onClose }) => {
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
            <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                    onMuteToggle()
                    onClose()
                }}
                role="menuitem"
            >
                <img src={MuteIcon} alt="" />
                <span>{isMuted ? 'Bỏ tắt tiếng' : 'Tắt tiếng'}</span>
            </button>
            <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                    onMarkAsRead()
                    onClose()
                }}
                role="menuitem"
            >
                <img src={CheckIcon} alt="" />
                <span>Đánh dấu đã đọc</span>
            </button>
            <div className={styles.divider} />
            <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => {
                    if (
                        confirm(
                            'Bạn có chắc chắn muốn xóa cuộc trò chuyện này?'
                        )
                    ) {
                        onDelete()
                        onClose()
                    }
                }}
                role="menuitem"
            >
                <img src={DeleteIcon} alt="" />
                <span>Xóa cuộc trò chuyện</span>
            </button>
        </div>,
        document.body
    )
}
