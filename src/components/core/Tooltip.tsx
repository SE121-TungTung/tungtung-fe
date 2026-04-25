import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'

interface TooltipProps {
    children: React.ReactNode
    content: React.ReactNode
}

export function Tooltip({ children, content }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLDivElement>(null)

    const showTooltip = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setCoords({
                left: rect.left + rect.width / 2,
                top: rect.top - 8,
            })
            setIsVisible(true)
        }
    }

    const hideTooltip = () => {
        setIsVisible(false)
    }

    useEffect(() => {
        const handleScroll = () => setIsVisible(false)
        window.addEventListener('scroll', handleScroll, true)
        return () => window.removeEventListener('scroll', handleScroll, true)
    }, [])

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                className={styles.triggerWrapper}
            >
                {children}
            </div>
            {isVisible &&
                createPortal(
                    <div
                        className={styles.tooltipRoot}
                        style={{ top: coords.top, left: coords.left }}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    )
}
