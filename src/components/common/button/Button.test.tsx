import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'
import ButtonPrimary from './ButtonPrimary'
import ButtonGhost from './ButtonGhost'

describe('Button Components', () => {
    it('renders base Button with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole('button', { name: /click me/i })).toBeDefined()
    })

    it('renders ButtonPrimary with brand solid default', () => {
        render(<ButtonPrimary>Primary Action</ButtonPrimary>)
        const btn = screen.getByRole('button', { name: /primary action/i })
        expect(btn).toBeDefined()
    })

    it('renders ButtonGhost with ghost variant', () => {
        render(<ButtonGhost>Ghost Action</ButtonGhost>)
        const btn = screen.getByRole('button', { name: /ghost action/i })
        expect(btn).toBeDefined()
    })

    it('renders loading state properly', () => {
        render(<Button loading>Saving</Button>)
        const btn = screen.getByRole('button')
        expect(btn.getAttribute('disabled')).not.toBeNull()
        expect(btn.getAttribute('aria-busy')).toBe('true')
    })
})
