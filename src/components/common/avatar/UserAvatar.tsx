import React, { useState, useEffect, useMemo } from 'react'
import { Peek, type Expression, type Gaze, type Frame } from '@doan-labs/peek'
import clsx from 'clsx'
import s from './UserAvatar.module.css'

export interface UserAvatarProps {
    /** Unique user ID (UUID, numeric ID) — used for 100% deterministic hash consistency */
    id?: string | number | null
    /** Alias for id */
    userId?: string | number | null
    /** Custom image URL for the avatar */
    src?: string | null
    /** Name/identifier used as fallback seed for Peek and for alt/title text */
    name?: string | null
    /** Accessibility alt text */
    alt?: string
    /** Avatar size in pixels */
    size?: number
    /** Additional CSS classes */
    className?: string
    /** Inline styles */
    style?: React.CSSProperties
    /** Whether to enable Peek breathing/blinking animation */
    animate?: boolean
    /** Peek eye gaze direction or 'pointer' to track cursor */
    gaze?: Gaze | 'pointer'
    /** Peek expression state */
    expression?: Expression
    /** False for round circle, true for square (default: false) */
    square?: boolean
    /** Background frame style for Peek (default: 'none' to allow brand gradient) */
    frame?: Frame
    /** Tooltip title or false to hide */
    title?: string | false
    /** Click event handler */
    onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void
}

/** 6 brand-aligned palettes derived from TungTung colors (Crimson, Lapis, Cyan) */
const BRAND_AVATAR_PALETTES = [
    {
        light: 'linear-gradient(135deg, #fce7eb 0%, #fed7aa 100%)', // Crimson Amber
        dark: 'linear-gradient(135deg, rgba(214, 40, 57, 0.4) 0%, rgba(244, 63, 94, 0.25) 100%)',
        borderLight: 'rgba(214, 40, 57, 0.25)',
        borderDark: 'rgba(244, 63, 94, 0.35)',
    },
    {
        light: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', // Lapis Sky
        dark: 'linear-gradient(135deg, rgba(23, 86, 118, 0.45) 0%, rgba(56, 189, 248, 0.28) 100%)',
        borderLight: 'rgba(23, 86, 118, 0.25)',
        borderDark: 'rgba(56, 189, 248, 0.35)',
    },
    {
        light: 'linear-gradient(135deg, #ffe4e6 0%, #e0f2fe 100%)', // Brand Fusion (Crimson to Lapis)
        dark: 'linear-gradient(135deg, rgba(214, 40, 57, 0.38) 0%, rgba(23, 86, 118, 0.42) 100%)',
        borderLight: 'rgba(214, 40, 57, 0.22)',
        borderDark: 'rgba(255, 255, 255, 0.2)',
    },
    {
        light: 'linear-gradient(135deg, #ccfbf1 0%, #e0f2fe 100%)', // Cyan Ocean
        dark: 'linear-gradient(135deg, rgba(14, 165, 233, 0.38) 0%, rgba(20, 184, 166, 0.3) 100%)',
        borderLight: 'rgba(14, 165, 233, 0.22)',
        borderDark: 'rgba(45, 212, 191, 0.32)',
    },
    {
        light: 'linear-gradient(135deg, #ffedd5 0%, #fecdd3 100%)', // Warm Coral
        dark: 'linear-gradient(135deg, rgba(249, 115, 22, 0.35) 0%, rgba(214, 40, 57, 0.3) 100%)',
        borderLight: 'rgba(249, 115, 22, 0.22)',
        borderDark: 'rgba(251, 146, 60, 0.35)',
    },
    {
        light: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)', // Violet-Lapis
        dark: 'linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(23, 86, 118, 0.4) 100%)',
        borderLight: 'rgba(139, 92, 246, 0.22)',
        borderDark: 'rgba(167, 139, 250, 0.32)',
    },
]

function hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    id,
    userId,
    src,
    name,
    alt,
    size,
    className,
    style,
    animate = false,
    gaze,
    expression,
    square = false,
    frame = 'none', // Default 'none' to reveal brand gradient background
    title,
    onClick,
}) => {
    const [imageError, setImageError] = useState(false)

    // Reset error state if image source updates
    useEffect(() => {
        setImageError(false)
    }, [src])

    // Primary seed: user ID (permanent & immutable) -> fallback to name -> fallback to 'TungTung'
    const effectiveSeed = useMemo(() => {
        const rawId = userId ?? id
        if (rawId !== undefined && rawId !== null && String(rawId).trim()) {
            return String(rawId).trim()
        }
        if (name && name.trim()) {
            return name.trim().toLowerCase()
        }
        return 'TungTung'
    }, [userId, id, name])

    // Human-readable display name for alt/title tooltips
    const displayName = (name || '').trim() || 'User'
    const computedAlt = alt || displayName

    // Deterministic palette based on the effective seed
    const palette = useMemo(() => {
        const index = hashString(effectiveSeed) % BRAND_AVATAR_PALETTES.length
        return BRAND_AVATAR_PALETTES[index]
    }, [effectiveSeed])

    const rootStyle: React.CSSProperties = {
        ...(size ? { width: size, height: size } : {}),
        borderRadius: square ? '12px' : '50%',
        ['--avatar-gradient' as any]: palette.light,
        ['--avatar-gradient-dark' as any]: palette.dark,
        ['--avatar-border' as any]: palette.borderLight,
        ['--avatar-border-dark' as any]: palette.borderDark,
        ...style,
    }

    const hasValidPhoto = Boolean(src && !imageError)

    return (
        <span
            className={clsx(s.avatarRoot, className)}
            style={rootStyle}
            title={title === false ? undefined : title || displayName}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {hasValidPhoto ? (
                <img
                    src={src!}
                    alt={computedAlt}
                    className={s.avatarImg}
                    onError={() => setImageError(true)}
                    loading="lazy"
                />
            ) : (
                <Peek
                    name={effectiveSeed}
                    size={size || 40}
                    square={square}
                    animate={animate}
                    gaze={gaze}
                    expression={expression}
                    frame={frame}
                    title={false}
                    className={s.peekAvatar}
                />
            )}
        </span>
    )
}

export default UserAvatar
