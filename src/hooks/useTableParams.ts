import { useState } from 'react'

export const useTableParams = <TFilter>(initialFilter: TFilter) => {
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(10)
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<{ field: string; order: 'asc' | 'desc' }>({
        field: 'createdAt',
        order: 'desc',
    })
    const [filters, setFilters] = useState<TFilter>(initialFilter)

    const handlePageChange = (newPage: number) => setPage(newPage)

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(0)
    }

    const handleFilterChange = (newFilters: Partial<TFilter>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }))
        setPage(0)
    }

    return {
        page,
        pageSize,
        search,
        sort,
        filters,
        apiParams: {
            skip: page * pageSize,
            limit: pageSize,
            search,
            sortBy: sort.field,
            sortOrder: sort.order,
            ...filters,
        },
        // Handlers
        setPage: handlePageChange,
        setSearch: handleSearchChange,
        setSort,
        setFilters: handleFilterChange,
    }
}
