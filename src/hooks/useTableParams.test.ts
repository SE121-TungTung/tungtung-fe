import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableParams } from './useTableParams'

describe('useTableParams hook', () => {
    it('initializes with default pagination and given filters', () => {
        const initialFilter = { status: 'active', role: 'student' }
        const { result } = renderHook(() => useTableParams(initialFilter))

        expect(result.current.page).toBe(0)
        expect(result.current.pageSize).toBe(10)
        expect(result.current.search).toBe('')
        expect(result.current.sort).toEqual({
            field: 'createdAt',
            order: 'desc',
        })
        expect(result.current.filters).toEqual(initialFilter)
        expect(result.current.apiParams).toEqual({
            skip: 0,
            limit: 10,
            search: '',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            status: 'active',
            role: 'student',
        })
    })

    it('updates page and calculates skip offset correctly', () => {
        const { result } = renderHook(() => useTableParams({}))

        act(() => {
            result.current.setPage(2)
        })

        expect(result.current.page).toBe(2)
        expect(result.current.apiParams.skip).toBe(20) // 2 * 10
    })

    it('updates pageSize and adjusts skip calculation', () => {
        const { result } = renderHook(() => useTableParams({}))

        act(() => {
            result.current.setPageSize(25)
            result.current.setPage(3)
        })

        expect(result.current.pageSize).toBe(25)
        expect(result.current.page).toBe(3)
        expect(result.current.apiParams.limit).toBe(25)
        expect(result.current.apiParams.skip).toBe(75) // 3 * 25
    })

    it('resets page to 0 when search keyword changes', () => {
        const { result } = renderHook(() => useTableParams({}))

        act(() => {
            result.current.setPage(4)
        })
        expect(result.current.page).toBe(4)

        act(() => {
            result.current.setSearch('IELTS')
        })

        expect(result.current.search).toBe('IELTS')
        expect(result.current.page).toBe(0)
        expect(result.current.apiParams.skip).toBe(0)
        expect(result.current.apiParams.search).toBe('IELTS')
    })

    it('resets page to 0 and merges new filter values', () => {
        const { result } = renderHook(() =>
            useTableParams({ status: 'active', category: 'general' })
        )

        act(() => {
            result.current.setPage(5)
        })
        expect(result.current.page).toBe(5)

        act(() => {
            result.current.setFilters({ status: 'completed' })
        })

        expect(result.current.page).toBe(0)
        expect(result.current.filters).toEqual({
            status: 'completed',
            category: 'general',
        })
        expect(result.current.apiParams.status).toBe('completed')
        expect(result.current.apiParams.category).toBe('general')
    })

    it('updates sorting criteria', () => {
        const { result } = renderHook(() => useTableParams({}))

        act(() => {
            result.current.setSort({ field: 'name', order: 'asc' })
        })

        expect(result.current.sort).toEqual({ field: 'name', order: 'asc' })
        expect(result.current.apiParams.sortBy).toBe('name')
        expect(result.current.apiParams.sortOrder).toBe('asc')
    })
})
