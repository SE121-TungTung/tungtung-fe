import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import s from './PortalTooltip.module.css'

interface PortalTooltipProps {
    children: React.ReactNode
    parentRef: React.RefObject<HTMLElement | null>
    isOpen: boolean
}

export const PortalTooltip = ({
    children,
    parentRef,
    isOpen,
}: PortalTooltipProps) => {
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const [placement, setPlacement] = useState<'left' | 'right'>('right')

    useEffect(() => {
        if (isOpen && parentRef.current) {
            const updatePosition = () => {
                const rect = parentRef.current!.getBoundingClientRect()
                const TOOLTIP_WIDTH = 250 // Ước lượng chiều rộng tooltip
                const GAP = 10 // Khoảng cách giữa thẻ và tooltip

                let left = rect.right + GAP
                const top = rect.top
                let place: 'left' | 'right' = 'right'

                // Logic thông minh: Kiểm tra nếu bên phải hết chỗ thì lật sang trái
                if (left + TOOLTIP_WIDTH > window.innerWidth) {
                    left = rect.left - TOOLTIP_WIDTH - GAP
                    place = 'left'
                }

                // Kiểm tra nếu bên dưới hết chỗ thì đẩy lên trên (tuỳ chọn)
                // if (top + rect.height > window.innerHeight) ...

                setCoords({ top, left })
                setPlacement(place)
            }

            updatePosition()

            // Cập nhật lại vị trí khi scroll hoặc resize (nếu cần thiết)
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)

            return () => {
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
            }
        }
    }, [isOpen, parentRef])

    if (!isOpen) return null

    return createPortal(
        <div
            className={`${s.portalTooltip} ${placement === 'left' ? s.placeLeft : s.placeRight}`}
            style={{
                top: coords.top,
                left: coords.left,
            }}
        >
            {children}
        </div>,
        document.body
    )
}
