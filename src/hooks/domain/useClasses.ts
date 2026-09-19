import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    listClasses,
    deleteClass,
    updateClass,
    type ListClassesParams,
    type UpdateClassDto,
} from '@/lib/classes'

export const useClasses = (params: ListClassesParams) => {
    return useQuery({
        queryKey: ['classes', params],
        queryFn: () => listClasses(params),
        placeholderData: keepPreviousData,
    })
}

export const useDeleteClass = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteClass,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] })
        },
    })
}

export const useUpdateClass = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateClassDto }) =>
            updateClass(id, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classes'] })
        },
    })
}
