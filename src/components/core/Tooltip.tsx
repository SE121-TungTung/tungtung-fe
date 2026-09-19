import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.css'

export type TooltipPlacement =
    'top' | 'bottom' | 'left' | 'right' | 'bottom-end' | 'bottom-start'

interface TooltipProps {
    children: React.ReactNode
    content: React.ReactNode
    placement?: TooltipPlacement
}

export function Tooltip({ children, content, placement }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const [resolvedPlacement, setResolvedPlacement] =
        useState<TooltipPlacement>('top')
    const triggerRef = useRef<HTMLDivElement>(null)

    const showTooltip = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()

            // Determine actual placement (flip to bottom if near top of screen)
            let finalPlacement: TooltipPlacement =
                placement || (rect.top < 60 ? 'bottom' : 'top')

            // If near right edge of viewport and using bottom, use bottom-end to prevent overflow
            if (
                finalPlacement === 'bottom' &&
                rect.right > window.innerWidth - 100
            ) {
                finalPlacement = 'bottom-end'
            }

            setResolvedPlacement(finalPlacement)

            let top = 0
            let left = 0

            switch (finalPlacement) {
                case 'bottom':
                    top = rect.bottom + 8
                    left = rect.left + rect.width / 2
                    break
                case 'bottom-end':
                    top = rect.bottom + 8
                    left = rect.right
                    break
                case 'bottom-start':
                    top = rect.bottom + 8
                    left = rect.left
                    break
                case 'left':
                    top = rect.top + rect.height / 2
                    left = rect.left - 8
                    break
                case 'right':
                    top = rect.top + rect.height / 2
                    left = rect.right + 8
                    break
                case 'top':
                default:
                    top = rect.top - 8
                    left = rect.left + rect.width / 2
                    break
            }

            setCoords({ top, left })
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
                        className={`${styles.tooltipRoot} ${styles[resolvedPlacement]}`}
                        style={{ top: coords.top, left: coords.left }}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    )
}
