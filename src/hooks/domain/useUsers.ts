import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query'
import {
    listUsers,
    deleteUser,
    createUser,
    updateUser,
    type ListUsersParams,
} from '@/lib/users'

// 1. Hook lấy danh sách (Read)
export const useUsers = (params: ListUsersParams) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => listUsers(params),
        placeholderData: keepPreviousData,
    })
}

// 2. Hook xóa (Delete)
export const useDeleteUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            // Tự động invalidate query, component không cần lo việc này
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}

// 3. Hook cập nhật/tạo (Write)
// Bạn có thể gộp create/update hoặc tách riêng tùy độ phức tạp
export const useSaveUser = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: any) =>
            data.id ? updateUser(data.id, data) : createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        },
    })
}
