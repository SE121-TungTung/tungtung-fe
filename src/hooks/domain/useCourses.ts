import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    listCourses,
    deleteCourse,
    type ListCoursesParams,
} from '@/lib/courses'

export const useCourses = (params: ListCoursesParams) => {
    return useQuery({
        queryKey: ['courses', params],
        queryFn: () => listCourses(params),
        placeholderData: keepPreviousData,
    })
}

export const useDeleteCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
    })
}
