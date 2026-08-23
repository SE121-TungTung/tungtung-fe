import { describe, it, expect } from 'vitest'
import { queryKeys } from './queryKeys'

describe('Query Key Factory', () => {
    it('generates consistent auth keys', () => {
        expect(queryKeys.auth.me).toEqual(['me'])
    })

    it('generates parameterized finance keys', () => {
        expect(queryKeys.finance.walletBalance()).toEqual([
            'finance',
            'wallet-balance',
        ])
        expect(queryKeys.finance.walletTransactions(1, 10)).toEqual([
            'finance',
            'wallet-transactions',
            1,
            10,
        ])
        expect(queryKeys.finance.invoiceDetail('inv-123')).toEqual([
            'finance',
            'invoice',
            'inv-123',
        ])
    })

    it('generates parameterized class keys', () => {
        expect(queryKeys.classes.detail('cls-1')).toEqual([
            'classes',
            'detail',
            'cls-1',
        ])
        expect(queryKeys.classes.posts('cls-1')).toEqual([
            'classes',
            'posts',
            'cls-1',
        ])
        expect(queryKeys.classes.attendance('cls-1', 'session-10')).toEqual([
            'classes',
            'attendance',
            'cls-1',
            'session-10',
        ])
    })

    it('generates parameterized schedule keys', () => {
        expect(queryKeys.schedule.gaRunDetail('run-456')).toEqual([
            'schedule',
            'ga-run',
            'run-456',
        ])
        expect(queryKeys.schedule.teacherUnavailability('t-1')).toEqual([
            'schedule',
            'teacher-unavailability',
            't-1',
        ])
    })
})
