import { describe, it, expect } from 'vitest'
import { homePathByRole } from './role'
import type { Role } from '@/types/auth'

describe('homePathByRole', () => {
    it('returns /student for student role', () => {
        expect(homePathByRole('student' as Role)).toBe('/student')
    })

    it('returns /teacher for teacher role', () => {
        expect(homePathByRole('teacher' as Role)).toBe('/teacher')
    })

    it('returns /admin for office_admin role', () => {
        expect(homePathByRole('office_admin' as Role)).toBe('/admin')
    })

    it('returns /admin for center_admin role', () => {
        expect(homePathByRole('center_admin' as Role)).toBe('/admin')
    })

    it('defaults to /admin for other roles', () => {
        expect(homePathByRole('system_admin' as Role)).toBe('/admin')
    })
})
