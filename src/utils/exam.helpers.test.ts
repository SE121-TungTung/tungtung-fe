import { describe, it, expect } from 'vitest'
import {
    formatTime,
    calculatePercentage,
    getDifficultyInfo,
    getAttemptStatusInfo,
} from './exam.helpers'
import { DifficultyLevel, AttemptStatus } from '@/types/test.types'

describe('Exam Helpers & Calculations', () => {
    describe('formatTime', () => {
        it('formats 0 seconds to 00:00', () => {
            expect(formatTime(0)).toBe('00:00')
        })

        it('formats 90 seconds to 01:30', () => {
            expect(formatTime(90)).toBe('01:30')
        })

        it('formats 3600 seconds to 60:00', () => {
            expect(formatTime(3600)).toBe('60:00')
        })
    })

    describe('calculatePercentage', () => {
        it('calculates percentage accurately', () => {
            expect(calculatePercentage(8, 10)).toBe(80)
            expect(calculatePercentage(1, 3)).toBe(33.33)
        })

        it('handles zero total gracefully without throwing error', () => {
            expect(calculatePercentage(0, 0)).toBe(0)
            expect(calculatePercentage(10, 0)).toBe(0)
        })
    })

    describe('getDifficultyInfo', () => {
        it('returns proper labels and colors', () => {
            expect(getDifficultyInfo(DifficultyLevel.EASY)).toEqual({
                label: 'Easy',
                color: 'blue',
            })
            expect(getDifficultyInfo(DifficultyLevel.HARD)).toEqual({
                label: 'Hard',
                color: 'orange',
            })
        })
    })

    describe('getAttemptStatusInfo', () => {
        it('returns proper status metadata', () => {
            expect(getAttemptStatusInfo(AttemptStatus.SUBMITTED)).toEqual({
                label: 'Submitted',
                color: 'yellow',
            })
            expect(getAttemptStatusInfo(AttemptStatus.GRADED)).toEqual({
                label: 'Graded',
                color: 'green',
            })
        })
    })
})
