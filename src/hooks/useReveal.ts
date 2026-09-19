import { useEffect, useRef, useState } from 'react'

export function useReveal(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const currentRef = ref.current
        if (!currentRef) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(currentRef)
                }
            },
            { threshold }
        )

        observer.observe(currentRef)

        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [threshold])

    return { ref, isVisible }
}
