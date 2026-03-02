import React, { useEffect, useRef, useState } from 'react'
import './EducationalBackground.css'

interface EducationalBackgroundProps {
    interactive?: boolean
}

// 1. Custom SVG Icons (Sử dụng biến CSS để đồng bộ 1 tông màu)
const Icons = [
    <svg key="book" viewBox="0 0 100 100" fill="none" className="edu-svg-icon">
        <path d="M20 75 L80 75 L80 85 L20 85 Z" fill="var(--c-dark)" />
        <path d="M25 25 L85 25 L85 75 L25 75 Z" fill="#FFFFFF" />
        <path d="M20 30 L25 25 L25 75 L20 80 Z" fill="var(--c-bg)" />
        <path d="M15 25 L75 25 L75 80 L15 80 Z" fill="var(--c-main)" />
        <path
            d="M25 40 L65 40"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <path
            d="M25 55 L55 55"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>,
    <svg key="cap" viewBox="0 0 100 100" fill="none" className="edu-svg-icon">
        <path d="M30 50 L70 50 L70 75 Q50 85 30 75 Z" fill="var(--c-dark)" />
        <path d="M10 40 L50 20 L90 40 L50 60 Z" fill="var(--c-main)" />
        <path d="M80 45 L80 70" stroke="var(--c-light)" strokeWidth="4" />
        <circle cx="80" cy="75" r="5" fill="var(--c-light)" />
    </svg>,
    <svg key="bulb" viewBox="0 0 100 100" fill="none" className="edu-svg-icon">
        <path
            d="M40 70 L60 70 L55 85 L45 85 Z"
            fill="var(--c-dark)"
            opacity="0.6"
        />
        <path d="M42 90 L58 90 L55 95 L45 95 Z" fill="var(--c-dark)" />
        <path
            d="M50 15 C30 15 20 35 30 55 C35 65 38 70 40 70 L60 70 C62 70 65 65 70 55 C80 35 70 15 50 15 Z"
            fill="var(--c-main)"
        />
        <path
            d="M40 25 C30 30 28 45 35 50 C32 40 35 30 40 25 Z"
            fill="var(--c-light)"
            opacity="0.8"
        />
    </svg>,
    <svg
        key="pencil"
        viewBox="0 0 100 100"
        fill="none"
        className="edu-svg-icon"
    >
        <path d="M35 85 L75 45 L80 50 L40 90 Z" fill="var(--c-dark)" />
        <path d="M30 80 L70 40 L75 45 L35 85 Z" fill="var(--c-main)" />
        <path d="M20 90 L30 80 L35 85 Z" fill="var(--c-bg)" />
        <path d="M15 95 L22 88 L25 91 Z" fill="var(--c-dark)" />
        <path d="M70 40 L80 30 L85 35 L75 45 Z" fill="var(--c-light)" />
    </svg>,
    <svg key="flask" viewBox="0 0 100 100" fill="none" className="edu-svg-icon">
        <path
            d="M40 15 L60 15 L60 40 L40 40 Z"
            fill="var(--c-bg)"
            opacity="0.9"
        />
        <path
            d="M35 15 L65 15"
            stroke="var(--c-light)"
            strokeWidth="4"
            strokeLinecap="round"
        />
        <path
            d="M40 40 L20 80 C15 90 25 95 50 95 C75 95 85 90 80 80 L60 40 Z"
            fill="var(--c-bg)"
            opacity="0.9"
        />
        <path
            d="M35 50 L25 70 C20 80 25 85 50 85 C75 85 80 80 75 70 L65 50 Z"
            fill="var(--c-main)"
        />
        <circle cx="45" cy="65" r="4" fill="#FFFFFF" opacity="0.6" />
        <circle cx="55" cy="75" r="6" fill="#FFFFFF" opacity="0.6" />
    </svg>,
]

// 2. Abstract Geometric Shapes (Sử dụng biến màu chung và thêm animation)
// Thay thế toàn bộ biến AbstractShapes
const AbstractShapes = () => (
    <div className="edu-abstract-container">
        <svg
            className="edu-abs-shape abs-ring-1"
            viewBox="0 0 200 200"
            fill="none"
        >
            <circle
                cx="100"
                cy="100"
                r="80"
                stroke="var(--c-main)"
                strokeWidth="8"
                opacity="0.08"
            />
            <circle
                cx="100"
                cy="100"
                r="50"
                stroke="var(--c-dark)"
                strokeWidth="4"
                opacity="0.05"
            />
        </svg>

        <svg
            className="edu-abs-shape abs-cross-cluster"
            viewBox="0 0 100 100"
            fill="none"
        >
            <pattern
                id="crosses"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
            >
                <path
                    d="M10 5 L10 15 M5 10 L15 10"
                    stroke="var(--c-main)"
                    strokeWidth="2.5"
                    opacity="0.08"
                    strokeLinecap="round"
                />
            </pattern>
            <rect width="100" height="100" fill="url(#crosses)" />
        </svg>

        <svg
            className="edu-abs-shape abs-striped-circle"
            viewBox="0 0 100 100"
            fill="none"
        >
            <defs>
                <pattern
                    id="stripes"
                    patternUnits="userSpaceOnUse"
                    width="10"
                    height="10"
                    patternTransform="rotate(45)"
                >
                    <line
                        x1="0"
                        y="0"
                        x2="0"
                        y2="10"
                        stroke="var(--c-light)"
                        strokeWidth="3"
                        opacity="0.1"
                    />
                </pattern>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#stripes)" />
        </svg>

        <svg
            className="edu-abs-shape abs-triangles"
            viewBox="0 0 150 150"
            fill="none"
        >
            <polygon
                className="tri-part tri-1"
                points="75,20 15,130 135,130"
                fill="var(--c-main)"
                opacity="0.15"
            />
            <polygon
                className="tri-part tri-2"
                points="75,20 15,130 135,130"
                fill="var(--c-dark)"
                opacity="0.1"
            />
        </svg>
    </div>
)

export default function EducationalBackground({
    interactive = true,
}: EducationalBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const currentMousePos = useRef<{ x: number; y: number } | null>(null)

    // Quản lý màu ngẫu nhiên (Hue)
    const hueRef = useRef(Math.floor(Math.random() * 360))
    const [themeHue, setThemeHue] = useState(hueRef.current)

    useEffect(() => {
        // Cứ 10s đổi màu 1 lần
        // Tìm và thay thế đoạn colorInterval hiện tại
        const colorInterval = setInterval(() => {
            // Tịnh tiến Hue dần dần để tạo dải màu biến đổi mượt mà (nóng -> lạnh -> nóng)
            setThemeHue((prev) => (prev + 45 + Math.random() * 30) % 360)

            // Cập nhật lại ref dùng cho hạt particle
            setThemeHue((newHue) => {
                hueRef.current = newHue
                return newHue
            })
        }, 10000)

        if (!interactive || !containerRef.current) return

        const container = containerRef.current

        const handleMouseMove = (e: MouseEvent) => {
            currentMousePos.current = { x: e.clientX, y: e.clientY }
        }

        const handleMouseLeave = () => {
            currentMousePos.current = null
        }

        const spawnParticle = (x: number, y: number, parent: HTMLElement) => {
            const shapes = ['circle', 'square', 'triangle']
            const styles = ['solid', 'outline', 'faded']
            const shape = shapes[Math.floor(Math.random() * shapes.length)]
            const style = styles[Math.floor(Math.random() * styles.length)]
            const size = Math.floor(Math.random() * 25) + 20

            // Sử dụng màu theo hue hiện tại, có sai số một chút để sinh động
            const currentHue = hueRef.current + (Math.random() * 20 - 10)
            // Màu sắc sẽ tùy thuộc vào tông màu đang áp dụng
            const color = `hsl(${currentHue}, 85%, ${Math.random() > 0.5 ? '60%' : '75%'})`

            const particle = document.createElement('div')
            particle.className = `edu-particle edu-particle-${shape}`

            const offsetX = (Math.random() - 0.5) * 40
            const offsetY = (Math.random() - 0.5) * 40
            particle.style.left = `${x + offsetX}px`
            particle.style.top = `${y + offsetY}px`

            const driftX = (Math.random() - 0.5) * 120
            particle.style.setProperty('--drift-x', `${driftX}px`)

            let startOpacity = '0.9'

            if (shape === 'triangle') {
                particle.style.borderLeft = `${size / 2}px solid transparent`
                particle.style.borderRight = `${size / 2}px solid transparent`
                particle.style.borderBottom = `${size}px solid ${color}`
                if (style === 'faded' || style === 'outline')
                    startOpacity = '0.3'
            } else {
                particle.style.width = `${size}px`
                particle.style.height = `${size}px`

                if (style === 'solid') {
                    particle.style.backgroundColor = color
                } else if (style === 'outline') {
                    particle.style.border = `2.5px solid ${color}`
                    particle.style.backgroundColor = 'transparent'
                } else if (style === 'faded') {
                    particle.style.backgroundColor = color
                    startOpacity = '0.2'
                }
            }

            particle.style.setProperty('--start-opacity', startOpacity)
            parent.appendChild(particle)

            setTimeout(() => {
                if (parent.contains(particle)) {
                    parent.removeChild(particle)
                }
            }, 10000)
        }

        const particleInterval = setInterval(() => {
            if (currentMousePos.current) {
                spawnParticle(
                    currentMousePos.current.x,
                    currentMousePos.current.y,
                    container
                )
            }
        }, 150)

        container.addEventListener('mousemove', handleMouseMove)
        container.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            clearInterval(colorInterval)
            clearInterval(particleInterval)
            container.removeEventListener('mousemove', handleMouseMove)
            container.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [interactive])

    const iconConfigs = [
        { x: 12, y: 18, size: 140, delay: 0, duration: 15, rotate: -15 },
        { x: 78, y: 15, size: 160, delay: 1.5, duration: 18, rotate: 25 },
        { x: 18, y: 72, size: 130, delay: 0.5, duration: 14, rotate: -25 },
        { x: 82, y: 78, size: 150, delay: 2, duration: 17, rotate: 15 },
        { x: 48, y: 48, size: 180, delay: 1, duration: 20, rotate: 5 },
    ]

    return (
        <div
            ref={containerRef}
            className="edu-bg-container"
            // Truyền biến Hue vào CSS
            style={{ '--theme-hue': themeHue } as React.CSSProperties}
        >
            <div className="edu-gradient-mesh">
                <div className="edu-gradient-orb edu-orb-1"></div>
                <div className="edu-gradient-orb edu-orb-2"></div>
            </div>

            <AbstractShapes />

            <div className="edu-grid-overlay"></div>

            <div className="edu-icons-container">
                {iconConfigs.map((config, index) => (
                    <div
                        key={index}
                        className="edu-static-wrapper"
                        style={{
                            left: `${config.x}%`,
                            top: `${config.y}%`,
                            width: `${config.size}px`,
                            height: `${config.size}px`,
                        }}
                    >
                        <div
                            className="edu-icon-floater"
                            style={{
                                animationDelay: `${config.delay}s`,
                                animationDuration: `${config.duration}s`,
                                transform: `rotate(${config.rotate}deg)`,
                            }}
                        >
                            {Icons[index]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
