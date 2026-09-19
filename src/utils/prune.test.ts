import { describe, it, expect } from 'vitest'
import { prune } from './prune'

describe('prune utility', () => {
    it('removes keys with null, undefined, and empty string values', () => {
        const input = {
            name: 'John',
            age: null,
            email: undefined,
            nickname: '',
            role: 'student',
        }
        const result = prune(input)
        expect(result).toEqual({
            name: 'John',
            role: 'student',
        })
    })

    it('preserves false and zero (0) values', () => {
        const input = {
            isActive: false,
            count: 0,
            score: 0.0,
            emptyField: '',
        }
        const result = prune(input)
        expect(result).toEqual({
            isActive: false,
            count: 0,
            score: 0.0,
        })
    })

    it('preserves empty arrays and nested objects', () => {
        const input = {
            items: [],
            meta: {},
            tag: null,
        }
        const result = prune(input)
        expect(result).toEqual({
            items: [],
            meta: {},
        })
    })

    it('returns an empty object if all values are pruned', () => {
        const input = {
            a: null,
            b: undefined,
            c: '',
        }
        const result = prune(input)
        expect(result).toEqual({})
    })
})
