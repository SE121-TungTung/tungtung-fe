import { describe, it, expect } from 'vitest'
import { hasPermission } from './permissions.config'

describe('RBAC Permissions: hasPermission', () => {
    describe('system_admin role', () => {
        it('has access to any permission', () => {
            expect(hasPermission('system_admin', 'user:delete')).toBe(true)
            expect(hasPermission('system_admin', 'payroll:run')).toBe(true)
            expect(hasPermission('system_admin', 'class:create')).toBe(true)
            expect(hasPermission('system_admin', 'user:create:admin')).toBe(
                true
            )
        })
    })

    describe('student role', () => {
        it('has read-only access to users, rooms, courses, and classes', () => {
            expect(hasPermission('student', 'user:read')).toBe(true)
            expect(hasPermission('student', 'room:read')).toBe(true)
            expect(hasPermission('student', 'course:read')).toBe(true)
            expect(hasPermission('student', 'class:read')).toBe(true)
        })

        it('denies creation, modification, deletion, and financial access', () => {
            expect(hasPermission('student', 'user:delete')).toBe(false)
            expect(hasPermission('student', 'class:create')).toBe(false)
            expect(hasPermission('student', 'course:update')).toBe(false)
            expect(hasPermission('student', 'salary:read')).toBe(false)
            expect(hasPermission('student', 'payroll:run')).toBe(false)
        })
    })

    describe('teacher role', () => {
        it('has read access to basic entities and personal kpi & salary', () => {
            expect(hasPermission('teacher', 'class:read')).toBe(true)
            expect(hasPermission('teacher', 'kpi:read')).toBe(true)
            expect(hasPermission('teacher', 'salary:read')).toBe(true)
        })

        it('denies administrative management permissions', () => {
            expect(hasPermission('teacher', 'kpi:manage')).toBe(false)
            expect(hasPermission('teacher', 'salary:approve')).toBe(false)
            expect(hasPermission('teacher', 'payroll:run')).toBe(false)
            expect(hasPermission('teacher', 'user:delete')).toBe(false)
        })
    })

    describe('office_admin role', () => {
        it('can create students and teachers, but cannot create admins or delete users', () => {
            expect(hasPermission('office_admin', 'user:create:student')).toBe(
                true
            )
            expect(hasPermission('office_admin', 'user:create:teacher')).toBe(
                true
            )
            expect(hasPermission('office_admin', 'user:create:admin')).toBe(
                false
            )
            expect(hasPermission('office_admin', 'user:delete')).toBe(false)
        })
    })

    describe('center_admin role', () => {
        it('can approve salaries, run payroll, and delete courses/classes', () => {
            expect(hasPermission('center_admin', 'salary:approve')).toBe(true)
            expect(hasPermission('center_admin', 'payroll:run')).toBe(true)
            expect(hasPermission('center_admin', 'course:delete')).toBe(true)
            expect(hasPermission('center_admin', 'class:delete')).toBe(true)
        })

        it('cannot create admin users (only system_admin can)', () => {
            expect(hasPermission('center_admin', 'user:create:admin')).toBe(
                false
            )
        })
    })

    describe('unauthenticated or invalid roles', () => {
        it('returns false when role is undefined', () => {
            expect(hasPermission(undefined, 'user:read')).toBe(false)
            expect(hasPermission(undefined, 'class:read')).toBe(false)
        })

        it('returns false for unknown role cast', () => {
            expect(hasPermission('guest' as any, 'user:read')).toBe(false)
        })
    })
})
