import React from 'react'
import Button, { type ButtonProps, type ButtonSize } from './Button'

type Mode = 'light' | 'dark'

export interface ButtonGhostProps extends Omit<
    ButtonProps,
    'variant' | 'tone'
> {
    mode?: Mode
    size?: ButtonSize
    selected?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    block?: boolean
}

export const ButtonGhost = React.forwardRef<
    HTMLButtonElement,
    ButtonGhostProps
>(({ mode = 'light', size = 'md', ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant="ghost"
            tone={mode === 'dark' ? 'brand' : 'neutral'}
            size={size}
            {...props}
        />
    )
})

ButtonGhost.displayName = 'ButtonGhost'

export default ButtonGhost
