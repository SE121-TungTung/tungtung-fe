export const prune = <T extends Record<string, any>>(o: T): T =>
    Object.fromEntries(
        Object.entries(o).filter(
            ([, v]) => v !== null && v !== undefined && v !== ''
        )
    ) as T
