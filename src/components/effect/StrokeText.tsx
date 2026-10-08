'use client'

import {
    type CSSProperties,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { gsap } from 'gsap'
import './StrokeText.css'

export type StrokeTextTrigger = 'mount' | 'hover' | 'scroll' | 'loop'
export type StrokeTextFillMode = 'wipe' | 'fade' | 'none'

export interface StrokeTextProps {
    text?: string
    strokeColor?: string
    fillColor?: string
    gradient?: { from: string; to: string }
    strokeWidth?: number
    drawDuration?: number
    fillDelay?: number
    stagger?: number
    ease?: string
    trigger?: StrokeTextTrigger
    fillMode?: StrokeTextFillMode
    fontSize?: number
    fontWeight?: number | string
    letterSpacing?: number
    reverse?: boolean
    className?: string
    style?: CSSProperties
}

interface StrokeTextBox {
    x: number
    y: number
    width: number
    height: number
}

const DEFAULT_TEXT = 'TungTung'

const StrokeText = ({
    text = DEFAULT_TEXT,
    strokeColor = '#ef325f',
    fillColor = '#175676',
    gradient,
    strokeWidth = 1.4,
    drawDuration = 1.6,
    fillDelay = 0.2,
    stagger = 0.05,
    ease = 'power2.out',
    trigger = 'mount',
    fillMode = 'wipe',
    fontSize = 72,
    fontWeight = 800,
    letterSpacing = -1,
    reverse = false,
    className = '',
    style = {},
}: StrokeTextProps) => {
    const rootRef = useRef<HTMLSpanElement | null>(null)
    const strokeTextRef = useRef<SVGTextElement | null>(null)
    const wipeRectRef = useRef<SVGRectElement | null>(null)

    const [box, setBox] = useState<StrokeTextBox | null>(null)

    const rawId = useId()
    const wipeId = `stroke-text-wipe-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`

    const characters = useMemo(() => Array.from(String(text ?? '')), [text])

    const dash = Math.max(fontSize * 7, 200)

    const fontStyle = useMemo<CSSProperties>(
        () => ({
            fontSize: `${fontSize}px`,
            fontWeight,
            letterSpacing: `${letterSpacing}px`,
            dominantBaseline: 'alphabetic',
        }),
        [fontSize, fontWeight, letterSpacing]
    )

    useLayoutEffect(() => {
        const node = strokeTextRef.current
        if (!node) return undefined

        let cancelled = false

        const measure = () => {
            if (cancelled || !strokeTextRef.current) return
            let bbox: DOMRect | undefined
            try {
                bbox = strokeTextRef.current.getBBox()
            } catch {
                return
            }
            if (!bbox || !bbox.width) return

            // Generous padding to prevent descender clipping (g, y, p, etc.)
            const padX = Math.max(Number(strokeWidth) || 1, fontSize * 0.1)
            const padY = Math.max(Number(strokeWidth) || 1, fontSize * 0.2)
            const next = {
                x: bbox.x - padX,
                y: bbox.y - padY,
                width: bbox.width + padX * 2,
                height: bbox.height + padY * 2.5,
            }

            setBox((prev) =>
                prev &&
                Math.abs(prev.x - next.x) < 0.5 &&
                Math.abs(prev.width - next.width) < 0.5 &&
                Math.abs(prev.y - next.y) < 0.5 &&
                Math.abs(prev.height - next.height) < 0.5
                    ? prev
                    : next
            )
        }

        measure()
        if (typeof document !== 'undefined' && document.fonts?.ready) {
            document.fonts.ready.then(measure).catch(() => {})
        }

        return () => {
            cancelled = true
        }
    }, [characters, fontSize, fontWeight, letterSpacing, strokeWidth])

    useEffect(() => {
        const root = rootRef.current
        if (typeof window === 'undefined' || !root || !box) return undefined

        const strokes = gsap.utils.toArray(
            root.querySelectorAll('[data-stroke-char]')
        )
        const fills = gsap.utils.toArray(
            root.querySelectorAll('[data-fill-char]')
        )
        const wipe = wipeRectRef.current
        if (!strokes.length) return undefined

        const fillEnabled = fillMode !== 'none'
        const useWipe = fillEnabled && fillMode === 'wipe'
        const fillDuration = Math.max(0.4, drawDuration * 0.5)
        const staggerConfig: number | gsap.StaggerVars = reverse
            ? { each: stagger, from: 'end' as const }
            : stagger
        const targets = [...strokes, ...fills, wipe].filter(Boolean)

        const setStart = () => {
            gsap.killTweensOf(targets)
            gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: dash })
            gsap.set(fills, { opacity: useWipe ? 1 : 0 })
            if (wipe) gsap.set(wipe, { attr: { width: 0 } })
        }

        const setEnd = () => {
            gsap.killTweensOf(targets)
            gsap.set(strokes, { strokeDasharray: dash, strokeDashoffset: 0 })
            gsap.set(fills, { opacity: fillEnabled ? 1 : 0 })
            if (wipe)
                gsap.set(wipe, { attr: { width: fillEnabled ? box.width : 0 } })
        }

        const prefersReducedMotion = window.matchMedia?.(
            '(prefers-reduced-motion: reduce)'
        ).matches
        if (prefersReducedMotion) {
            setEnd()
            return () => gsap.killTweensOf(targets)
        }

        const build = () => {
            setStart()
            const tl = gsap.timeline({
                paused: true,
                repeat: trigger === 'loop' ? -1 : 0,
                repeatDelay: trigger === 'loop' ? 0.9 : 0,
                defaults: { overwrite: 'auto' },
            })

            tl.to(
                strokes,
                {
                    strokeDashoffset: 0,
                    duration: drawDuration,
                    ease,
                    stagger: staggerConfig,
                },
                0
            )

            if (useWipe && wipe) {
                tl.to(
                    wipe,
                    {
                        attr: { width: box.width },
                        duration: fillDuration,
                        ease: 'power2.inOut',
                    },
                    drawDuration + fillDelay
                )
            } else if (fillEnabled) {
                tl.to(
                    fills,
                    {
                        opacity: 1,
                        duration: fillDuration,
                        ease: 'power2.out',
                        stagger: staggerConfig,
                    },
                    drawDuration + fillDelay
                )
            }

            return tl
        }

        let timeline: gsap.core.Timeline | null = null
        let observer: IntersectionObserver | null = null
        let removeHover: (() => void) | null = null

        if (trigger === 'hover') {
            setEnd()
            const play = () => {
                timeline?.kill()
                timeline = build()
                timeline.play(0)
            }
            root.addEventListener('pointerenter', play)
            removeHover = () => root.removeEventListener('pointerenter', play)
        } else if (trigger === 'scroll') {
            timeline = build()
            if (typeof IntersectionObserver !== 'undefined') {
                observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            timeline?.play(0)
                            observer?.disconnect()
                            observer = null
                        }
                    },
                    { threshold: 0.15 }
                )
                observer.observe(root)
            } else {
                timeline.play(0)
            }
        } else {
            timeline = build()
            timeline.play(0)
        }

        return () => {
            removeHover?.()
            observer?.disconnect()
            timeline?.kill()
            gsap.killTweensOf(targets)
        }
    }, [
        box,
        dash,
        drawDuration,
        fillDelay,
        stagger,
        ease,
        trigger,
        fillMode,
        reverse,
    ])

    const viewBox = box
        ? `${box.x} ${box.y} ${box.width} ${box.height}`
        : `0 ${-fontSize} 600 ${fontSize * 1.5}`

    return (
        <span
            ref={rootRef}
            className={`stroke-text ${trigger === 'hover' ? 'stroke-text--hover' : ''} ${className}`.trim()}
            style={
                {
                    ...style,
                    ['--stroke-text-height']: box
                        ? `${Math.round(box.height)}px`
                        : `${Math.round(fontSize * 1.5)}px`,
                } as CSSProperties
            }
            role="img"
            aria-label={String(text ?? '')}
        >
            <svg
                className="stroke-text__svg"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
            >
                <defs>
                    {fillMode === 'wipe' && box && (
                        <clipPath id={wipeId} clipPathUnits="userSpaceOnUse">
                            <rect
                                ref={wipeRectRef}
                                x={box.x}
                                y={box.y}
                                width="0"
                                height={box.height}
                            />
                        </clipPath>
                    )}
                    {gradient && (
                        <linearGradient
                            id={`${wipeId}-grad`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor={gradient.from} />
                            <stop offset="100%" stopColor={gradient.to} />
                        </linearGradient>
                    )}
                </defs>

                <text
                    ref={strokeTextRef}
                    className="stroke-text__stroke"
                    x="0"
                    y="0"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={fontStyle}
                >
                    {characters.map((char, index) => (
                        <tspan data-stroke-char key={`s-${index}`}>
                            {char}
                        </tspan>
                    ))}
                </text>

                <text
                    className="stroke-text__fill"
                    x="0"
                    y="0"
                    fill={gradient ? `url(#${wipeId}-grad)` : fillColor}
                    stroke="none"
                    style={fontStyle}
                    clipPath={
                        fillMode === 'wipe' && box
                            ? `url(#${wipeId})`
                            : undefined
                    }
                >
                    {characters.map((char, index) => (
                        <tspan data-fill-char key={`f-${index}`}>
                            {char}
                        </tspan>
                    ))}
                </text>
            </svg>
        </span>
    )
}

export default StrokeText
