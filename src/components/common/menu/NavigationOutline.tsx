import React from 'react'
import s from './NavigationOutline.module.css'
import ChevronLeftIcon from '@/assets/Arrow Left 2.svg'
import ChevronRightIcon from '@/assets/Arrow Right 2.svg'

export type Mode = 'light' | 'dark'
export type Size = 'sm' | 'md' | 'lg' | 'xl'
export type Active = 'prev' | 'next' | null

export interface NavigationOutlineProps
    extends React.HTMLAttributes<HTMLDivElement> {
    mode?: Mode
    size?: Size
    active?: Active
    onPrev?: (e: React.MouseEvent<HTMLButtonElement>) => void
    onNext?: (e: React.MouseEvent<HTMLButtonElement>) => void
    prevIcon?: React.ReactNode
    nextIcon?: React.ReactNode
    disabledPrev?: boolean
    disabledNext?: boolean
}

export default function NavigationOutline({
    mode = 'light',
    size = 'md',
    active = null,
    onPrev,
    onNext,
    prevIcon,
    nextIcon,
    disabledPrev,
    disabledNext,
    className = '',
    ...rest
}: NavigationOutlineProps) {
    const cls = [s.root, s[mode], s[size], className].filter(Boolean).join(' ')

    return (
        <div role="group" aria-label="Navigation" {...rest} className={cls}>
            <button
                type="button"
                aria-label="Previous"
                className={[
                    s.btn,
                    active === 'prev' ? s.active : '',
                    disabledPrev ? s.isDisabled : '',
                ].join(' ')}
                onClick={onPrev}
                disabled={disabledPrev}
            >
                <span className={s.icon}>
                    {prevIcon ?? <img src={ChevronLeftIcon} alt="Previous" />}
                </span>
            </button>

            <span className={s.sep} aria-hidden="true" />

            <button
                type="button"
                aria-label="Next"
                className={[
                    s.btn,
                    active === 'next' ? s.active : '',
                    disabledNext ? s.isDisabled : '',
                ].join(' ')}
                onClick={onNext}
                disabled={disabledNext}
            >
                <span className={s.icon}>
                    {nextIcon ?? <img src={ChevronRightIcon} alt="Next" />}
                </span>
            </button>
        </div>
    )
}
