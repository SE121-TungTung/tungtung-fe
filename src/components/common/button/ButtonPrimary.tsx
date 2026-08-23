import React from 'react'
import Button, {
    type ButtonProps,
    type ButtonVariant,
    type ButtonTone,
    type ButtonSize,
    type ButtonShape,
} from './Button'

export type { ButtonVariant, ButtonTone, ButtonSize, ButtonShape }

export type ButtonPrimaryProps = ButtonProps

export const ButtonPrimary = React.forwardRef<
    HTMLButtonElement,
    ButtonPrimaryProps
>(({ variant = 'solid', tone = 'brand', ...props }, ref) => {
    return <Button ref={ref} variant={variant} tone={tone} {...props} />
})

ButtonPrimary.displayName = 'ButtonPrimary'

export default ButtonPrimary
