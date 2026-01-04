import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import { listClasses, deleteClass, type ListClassesParams } from '@/lib/classes'

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
