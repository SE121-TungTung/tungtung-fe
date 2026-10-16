import type { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number
}

const base = (size: number) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
})

export function MicIcon({ size = 16, ...props }: IconProps) {
    return (
        <svg {...base(size)} {...props}>
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <line x1="12" y1="18" x2="12" y2="22" />
        </svg>
    )
}

export function PlusIcon({ size = 16, ...props }: IconProps) {
    return (
        <svg {...base(size)} {...props}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    )
}

export function CheckIcon({ size = 16, ...props }: IconProps) {
    return (
        <svg {...base(size)} {...props}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
