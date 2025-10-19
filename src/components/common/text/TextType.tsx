'use client'

import {
    type ElementType,
    useEffect,
    useRef,
    useState,
    createElement,
    useMemo,
    useCallback,
    type ReactNode,
} from 'react'
import { gsap } from 'gsap'
import s from './TextType.module.css'

interface TextTypeProps {
    className?: string
    showCursor?: boolean
    hideCursorWhileTyping?: boolean
    cursorCharacter?: string | React.ReactNode
    cursorBlinkDuration?: number
    cursorClassName?: string
    text: string | string[]
    as?: ElementType
    typingSpeed?: number
    initialDelay?: number
    pauseDuration?: number
    deletingSpeed?: number
    loop?: boolean
    textColors?: string[]
    variableSpeed?: { min: number; max: number }
    onSentenceComplete?: (sentence: string, index: number) => void
    startOnVisible?: boolean
    reverseMode?: boolean
    /** Render function to display typed text with custom elements */
    renderText?: (text: string, isComplete: boolean) => ReactNode
    /** Suffix to show after typed text completes */
    suffix?: ReactNode
    /** Whether to show suffix only after typing completes */
    showSuffixAfterComplete?: boolean
}

const TextType = ({
    text,
    as: Component = 'div',
    typingSpeed = 50,
    initialDelay = 0,
    pauseDuration = 2000,
    deletingSpeed = 30,
    loop = true,
    className = '',
    showCursor = true,
    hideCursorWhileTyping = false,
    cursorCharacter = '|',
    cursorClassName = '',
    cursorBlinkDuration = 0.5,
    textColors = [],
    variableSpeed,
    onSentenceComplete,
    startOnVisible = false,
    reverseMode = false,
    renderText,
    suffix,
    showSuffixAfterComplete = false,
    ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) => {
    const [displayedText, setDisplayedText] = useState('')
    const [currentCharIndex, setCurrentCharIndex] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false)
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(!startOnVisible)
    const [isComplete, setIsComplete] = useState(false)
    const cursorRef = useRef<HTMLSpanElement>(null)
    const containerRef = useRef<HTMLElement>(null)

    const textArray = useMemo(
        () => (Array.isArray(text) ? text : [text]),
        [text]
    )

    const getRandomSpeed = useCallback(() => {
        if (!variableSpeed) return typingSpeed
        const { min, max } = variableSpeed
        return Math.random() * (max - min) + min
    }, [variableSpeed, typingSpeed])

    useEffect(() => {
        if (!startOnVisible || !containerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                    }
                })
            },
            { threshold: 0.1 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [startOnVisible])

    useEffect(() => {
        if (showCursor && cursorRef.current) {
            gsap.set(cursorRef.current, { opacity: 1 })
            gsap.to(cursorRef.current, {
                opacity: 0,
                duration: cursorBlinkDuration,
                repeat: -1,
                yoyo: true,
                ease: 'power2.inOut',
            })
        }
    }, [showCursor, cursorBlinkDuration])

    useEffect(() => {
        if (!isVisible) return

        let timeout: ReturnType<typeof setTimeout>

        const currentText = textArray[currentTextIndex]
        const processedText = reverseMode
            ? currentText.split('').reverse().join('')
            : currentText

        const executeTypingAnimation = () => {
            if (isDeleting) {
                if (displayedText === '') {
                    setIsDeleting(false)
                    if (currentTextIndex === textArray.length - 1 && !loop) {
                        setIsComplete(true)
                        return
                    }

                    if (onSentenceComplete) {
                        onSentenceComplete(
                            textArray[currentTextIndex],
                            currentTextIndex
                        )
                    }

                    setCurrentTextIndex((prev) => (prev + 1) % textArray.length)
                    setCurrentCharIndex(0)
                    timeout = setTimeout(() => {}, pauseDuration)
                } else {
                    timeout = setTimeout(() => {
                        setDisplayedText((prev) => prev.slice(0, -1))
                    }, deletingSpeed)
                }
            } else {
                if (currentCharIndex < processedText.length) {
                    timeout = setTimeout(
                        () => {
                            setDisplayedText(
                                (prev) => prev + processedText[currentCharIndex]
                            )
                            setCurrentCharIndex((prev) => prev + 1)
                        },
                        variableSpeed ? getRandomSpeed() : typingSpeed
                    )
                } else {
                    if (onSentenceComplete) {
                        onSentenceComplete(
                            textArray[currentTextIndex],
                            currentTextIndex
                        )
                    }

                    if (loop && textArray.length > 1) {
                        timeout = setTimeout(() => {
                            setIsDeleting(true)
                        }, pauseDuration)
                    } else {
                        setIsComplete(true)
                    }
                }
            }
        }

        if (currentCharIndex === 0 && !isDeleting && displayedText === '') {
            timeout = setTimeout(executeTypingAnimation, initialDelay)
        } else {
            executeTypingAnimation()
        }

        return () => clearTimeout(timeout)
    }, [
        currentCharIndex,
        displayedText,
        isDeleting,
        typingSpeed,
        deletingSpeed,
        pauseDuration,
        textArray,
        currentTextIndex,
        loop,
        initialDelay,
        isVisible,
        reverseMode,
        variableSpeed,
        onSentenceComplete,
    ])

    const shouldHideCursor =
        hideCursorWhileTyping &&
        (currentCharIndex < textArray[currentTextIndex].length || isDeleting)

    const showSuffix = !showSuffixAfterComplete || isComplete

    return createElement(
        Component,
        {
            ref: containerRef,
            className: `${s['text-type']} ${className}`,
            ...props,
        },
        renderText ? renderText(displayedText, isComplete) : displayedText,
        showSuffix && suffix,
        showCursor && (
            <span
                ref={cursorRef}
                className={`${s.cursor} ${cursorClassName} ${shouldHideCursor ? s.cursorHidden : ''}`}
            >
                {cursorCharacter}
            </span>
        )
    )
}

export default TextType
